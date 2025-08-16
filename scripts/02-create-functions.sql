-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- Update spent amount for the category and month
  UPDATE budgets 
  SET spent = (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions 
    WHERE user_id = NEW.user_id 
      AND category = NEW.category 
      AND type = 'expense'
      AND TO_CHAR(date, 'YYYY-MM') = TO_CHAR(NEW.date, 'YYYY-MM')
  )
  WHERE user_id = NEW.user_id 
    AND category = NEW.category 
    AND month = TO_CHAR(NEW.date, 'YYYY-MM');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget updates
DROP TRIGGER IF EXISTS trigger_update_budget_spent ON transactions;
CREATE TRIGGER trigger_update_budget_spent
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_spent();

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current amount for goals based on income transactions
  UPDATE goals 
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions 
    WHERE user_id = NEW.user_id 
      AND type = 'income'
      AND description ILIKE '%' || goals.title || '%'
  ),
  completed = (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions 
    WHERE user_id = NEW.user_id 
      AND type = 'income'
      AND description ILIKE '%' || goals.title || '%'
  ) >= target_amount
  WHERE user_id = NEW.user_id;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for goal updates
DROP TRIGGER IF EXISTS trigger_update_goal_progress ON transactions;
CREATE TRIGGER trigger_update_goal_progress
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_progress();
