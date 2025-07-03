'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { UserRole, Order, Customer } from '@/types';

// Input schema for the main flow
const AssistantInputSchema = z.object({
  command: z.string(),
  role: z.custom<UserRole>(),
  orders: z.array(z.any()).describe("A lista atual de todos os pedidos no sistema."),
  customers: z.array(z.any()).describe("A lista atual de todos os clientes registrados."),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

// The main flow
const assistantFlow = ai.defineFlow({
  name: 'assistantFlow',
  inputSchema: AssistantInputSchema,
  outputSchema: z.string(),
}, async (input) => {
    const { command, role, orders, customers } = input;

    // Tool to get order information
    const getOrderInfo = ai.defineTool({
        name: 'getOrderInfo',
        description: 'Obtém detalhes de um pedido específico pelo seu ID.',
        inputSchema: z.object({ orderId: z.string() }),
        outputSchema: z.string(),
    }, async ({ orderId }) => {
        const order = (orders as Order[]).find(o => o.id === orderId);
        if (!order) {
            return `Pedido com ID ${orderId} não encontrado.`;
        }
        const items = order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
        return `Detalhes do Pedido #${order.id}:
- Cliente: ${order.customerName}
- Itens: ${items}
- Total: ${order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
- Status: ${order.status}`;
    });

    // Tool to get customer information
    const getCustomerInfo = ai.defineTool({
        name: 'getCustomerInfo',
        description: 'Encontra um cliente pelo nome.',
        inputSchema: z.object({ name: z.string() }),
        outputSchema: z.string(),
    }, async ({ name }) => {
        const customer = (customers as Customer[]).find(c => c.name.toLowerCase().includes(name.toLowerCase()));
        if (!customer) {
            return `Cliente "${name}" não encontrado.`;
        }
        return `Informações de ${customer.name}:
- Telefone: ${customer.phone}
- Total Gasto: ${customer.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
- Pedidos Realizados: ${customer.orderCount}`;
    });

    const prompt = `Você é um assistente virtual de uma pizzaria. Sua função é ajudar o usuário a encontrar informações e entender como usar o sistema.
    - Você tem acesso aos dados em tempo real do sistema. Use as ferramentas para responder a perguntas sobre pedidos e clientes.
    - O usuário atual tem a função de: "${role}".
    - Se o usuário pedir para realizar uma ação (como "criar pedido" ou "cancelar pedido"), explique como ele pode fazer isso na interface do sistema, em vez de fazer por ele. Para administradores, as opções de gerenciamento de usuários estão em "Configurações".
    - Seja conciso e direto.

    Comando do usuário: "${command}"`;

    const llmResponse = await ai.generate({
        prompt,
        tools: [getOrderInfo, getCustomerInfo],
    });

    return llmResponse.text;
});

export async function processAgentCommand(input: AssistantInput): Promise<string> {
    return assistantFlow(input);
}
