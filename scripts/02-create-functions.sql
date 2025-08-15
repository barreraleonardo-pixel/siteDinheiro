-- Políticas de segurança para user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas de segurança para transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get monthly statistics
CREATE OR REPLACE FUNCTION public.get_monthly_stats(user_uuid UUID, target_year INTEGER, target_month INTEGER)
RETURNS TABLE (
  total_income DECIMAL,
  total_expenses DECIMAL,
  balance DECIMAL,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance,
    COUNT(*) as transaction_count
  FROM public.transactions
  WHERE user_id = user_uuid
    AND EXTRACT(YEAR FROM date) = target_year
    AND EXTRACT(MONTH FROM date) = target_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get category statistics
CREATE OR REPLACE FUNCTION public.get_category_stats(user_uuid UUID, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE (
  category TEXT,
  amount DECIMAL,
  transaction_count BIGINT,
  percentage DECIMAL
) AS $$
DECLARE
  total_expenses DECIMAL;
BEGIN
  -- Get total expenses for percentage calculation
  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM public.transactions
  WHERE user_id = user_uuid
    AND type = 'expense'
    AND (start_date IS NULL OR date >= start_date)
    AND (end_date IS NULL OR date <= end_date);

  RETURN QUERY
  SELECT 
    t.category,
    SUM(t.amount) as amount,
    COUNT(*) as transaction_count,
    CASE 
      WHEN total_expenses > 0 THEN (SUM(t.amount) / total_expenses * 100)
      ELSE 0
    END as percentage
  FROM public.transactions t
  WHERE t.user_id = user_uuid
    AND t.type = 'expense'
    AND (start_date IS NULL OR t.date >= start_date)
    AND (end_date IS NULL OR t.date <= end_date)
  GROUP BY t.category
  ORDER BY amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
