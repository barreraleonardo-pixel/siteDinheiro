-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.transactions;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.budgets;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  total_income DECIMAL(10,2);
  total_expenses DECIMAL(10,2);
  current_month_income DECIMAL(10,2);
  current_month_expenses DECIMAL(10,2);
  transaction_count INTEGER;
BEGIN
  -- Get total income
  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM public.transactions
  WHERE user_id = user_uuid AND type = 'receita';

  -- Get total expenses
  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM public.transactions
  WHERE user_id = user_uuid AND type = 'despesa';

  -- Get current month income
  SELECT COALESCE(SUM(amount), 0) INTO current_month_income
  FROM public.transactions
  WHERE user_id = user_uuid 
    AND type = 'receita'
    AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Get current month expenses
  SELECT COALESCE(SUM(amount), 0) INTO current_month_expenses
  FROM public.transactions
  WHERE user_id = user_uuid 
    AND type = 'despesa'
    AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Get transaction count
  SELECT COUNT(*) INTO transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid;

  RETURN json_build_object(
    'total_income', total_income,
    'total_expenses', total_expenses,
    'current_month_income', current_month_income,
    'current_month_expenses', current_month_expenses,
    'balance', total_income - total_expenses,
    'current_month_balance', current_month_income - current_month_expenses,
    'transaction_count', transaction_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
