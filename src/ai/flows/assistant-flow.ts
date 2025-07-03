'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { UserRole } from '@/types';
import { mockCustomers, mockOrders, mockProducts } from '@/lib/mock-data';

// Tool to get order information
const getOrderInfo = ai.defineTool({
    name: 'getOrderInfo',
    description: 'Get details for a specific order by its ID.',
    inputSchema: z.object({ orderId: z.string() }),
    outputSchema: z.string(),
}, async ({ orderId }) => {
    const order = mockOrders.find(o => o.id === orderId);
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
    description: 'Find a customer by name.',
    inputSchema: z.object({ name: z.string() }),
    outputSchema: z.string(),
}, async ({ name }) => {
    const customer = mockCustomers.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (!customer) {
        return `Cliente "${name}" não encontrado.`;
    }
    return `Informações de ${customer.name}:
- Telefone: ${customer.phone}
- Total Gasto: ${customer.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
- Pedidos Realizados: ${customer.orderCount}`;
});

// Input schema for the main flow
export const AssistantInputSchema = z.object({
  command: z.string(),
  role: z.custom<UserRole>(),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

// The main flow
const assistantFlow = ai.defineFlow({
  name: 'assistantFlow',
  inputSchema: AssistantInputSchema,
  outputSchema: z.string(),
}, async ({ command, role }) => {
    const prompt = `Você é um assistente virtual de uma pizzaria. Sua função é ajudar o usuário a encontrar informações e entender como usar o sistema.
    - O usuário atual tem a função de: "${role}".
    - Se o usuário pedir para realizar uma ação (como "criar pedido" ou "cancelar pedido"), explique como ele pode fazer isso na interface do sistema, em vez de fazer por ele. Para administradores, as opções de gerenciamento de usuários estão em "Configurações".
    - Use as ferramentas disponíveis para buscar informações sobre pedidos e clientes.
    - Seja conciso e direto.

    Comando do usuário: "${command}"`;

    const llmResponse = await ai.generate({
        prompt,
        model: 'googleai/gemini-2.0-flash',
        tools: [getOrderInfo, getCustomerInfo],
    });

    return llmResponse.text();
});

export async function processAgentCommand(input: AssistantInput): Promise<string> {
    return assistantFlow(input);
}
