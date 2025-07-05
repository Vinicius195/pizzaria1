-- Script para criar a função de atualização de estatísticas do cliente.
-- Esta função garante que os dados do cliente sejam sempre consistentes.

CREATE OR REPLACE FUNCTION update_customer_stats(p_customer_id UUID)
RETURNS VOID AS $$
DECLARE
    v_order_count INT;
    v_total_spent DECIMAL(10, 2);
    v_last_order_date DATE;
BEGIN
    -- Calcula as novas estatísticas a partir da tabela de pedidos
    SELECT
        COUNT(*),
        SUM(total),
        MAX(created_at::DATE)
    INTO
        v_order_count,
        v_total_spent,
        v_last_order_date
    FROM
        public.orders
    WHERE
        customer_id = p_customer_id;

    -- Atualiza a tabela de clientes com os novos valores calculados
    UPDATE public.customers
    SET
        order_count = v_order_count,
        total_spent = COALESCE(v_total_spent, 0), -- Usa 0 se o total for nulo (ex: sem pedidos)
        last_order_date = v_last_order_date
    WHERE
        id = p_customer_id;
END;
$$ LANGUAGE plpgsql;
