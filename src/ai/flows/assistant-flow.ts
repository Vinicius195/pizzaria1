'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { UserRole, Order, Customer } from '@/types';

const AssistantInputSchema = z.object({
  command: z.string(),
  role: z.custom<UserRole>(),
  orders: z.array(z.any()).describe("A lista atual de todos os pedidos no sistema."),
  customers: z.array(z.any()).describe("A lista atual de todos os clientes registrados."),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const assistantFlow = ai.defineFlow({
  name: 'assistantFlow',
  inputSchema: AssistantInputSchema,
  outputSchema: z.string(),
}, async (input) => {
    const { command, role, orders, customers } = input;

    const ordersSummary = (orders as Order[]).map(o => ({ 
        id: o.id, 
        customerName: o.customerName, 
        status: o.status, 
        total: o.total,
        items: o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')
    }));

    const customersSummary = (customers as Customer[]).map(c => ({
        name: c.name,
        phone: c.phone,
        orderCount: c.orderCount,
        totalSpent: c.totalSpent
    }));

    const prompt = `Você é um assistente virtual de uma pizzaria. Sua função é ajudar o usuário a encontrar informações e entender como usar o sistema.
    - Você tem acesso aos dados em tempo real do sistema. Use os dados JSON abaixo para responder a perguntas sobre pedidos e clientes.
    - O usuário atual tem a função de: "${role}".
    - Se o usuário pedir para realizar uma ação (como "criar pedido" ou "cancelar pedido"), explique como ele pode fazer isso na interface do sistema, em vez de fazer por ele. Para administradores, as opções de gerenciamento de usuários estão em "Configurações".
    - Seja conciso e direto.

    DADOS ATUAIS:
    - Pedidos: ${JSON.stringify(ordersSummary, null, 2)}
    - Clientes: ${JSON.stringify(customersSummary, null, 2)}

    Comando do usuário: "${command}"`;

    const llmResponse = await ai.generate({
        prompt,
    });

    return llmResponse.text;
});

export async function processAgentCommand(input: AssistantInput): Promise<string> {
    return assistantFlow(input);
}
