-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Update budget spent amount when transaction is inserted/updated/deleted
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.budgets 
        SET spent = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.transactions 
            WHERE user_id = NEW.user_id 
            AND category = NEW.category 
            AND type = 'expense'
            AND date >= CASE 
                WHEN budgets.period = 'monthly' THEN date_trunc('month', CURRENT_DATE)
                WHEN budgets.period = 'weekly' THEN date_trunc('week', CURRENT_DATE)
            END
        ),
        updated_at = NOW()
        WHERE user_id = NEW.user_id AND category = NEW.category;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE public.budgets 
        SET spent = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.transactions 
            WHERE user_id = OLD.user_id 
            AND category = OLD.category 
            AND type = 'expense'
            AND date >= CASE 
                WHEN budgets.period = 'monthly' THEN date_trunc('month', CURRENT_DATE)
                WHEN budgets.period = 'weekly' THEN date_trunc('week', CURRENT_DATE)
            END
        ),
        updated_at = NOW()
        WHERE user_id = OLD.user_id AND category = OLD.category;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget updates
DROP TRIGGER IF EXISTS trigger_update_budget_spent ON public.transactions;
CREATE TRIGGER trigger_update_budget_spent
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update goal current_amount when transaction is inserted/updated/deleted
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- This is a simplified version - in practice you might want more complex logic
        -- to determine which transactions contribute to which goals
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp_transactions
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_timestamp_budgets
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_timestamp_goals
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
