-- Create a function to handle new user signups
-- This function will be called automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if profile data exists in user metadata
  IF new.raw_user_meta_data IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      user_type,
      full_name,
      profession,
      organization_name,
      city
    )
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'user_type', 'veteran'),
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      new.raw_user_meta_data->>'profession',
      new.raw_user_meta_data->>'organization_name',
      new.raw_user_meta_data->>'city'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
