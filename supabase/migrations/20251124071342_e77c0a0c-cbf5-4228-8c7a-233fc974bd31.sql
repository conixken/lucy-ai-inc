-- Create app_settings table for feature flags
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view app settings
CREATE POLICY "Admins can view app settings"
ON public.app_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can update app settings
CREATE POLICY "Admins can update app settings"
ON public.app_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert app settings
CREATE POLICY "Admins can insert app settings"
ON public.app_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create function to promote user to admin by email
CREATE OR REPLACE FUNCTION public.promote_admin_by_email(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  existing_role RECORD;
  result JSONB;
BEGIN
  -- Find user by email in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found with email: ' || user_email
    );
  END IF;

  -- Check if user already has admin role
  SELECT * INTO existing_role
  FROM public.user_roles
  WHERE user_id = target_user_id AND role = 'admin';

  IF existing_role IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'User already has admin role',
      'user_id', target_user_id
    );
  END IF;

  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin');

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Admin role granted successfully',
    'user_id', target_user_id
  );
END;
$$;

-- Insert default app settings
INSERT INTO public.app_settings (setting_key, setting_value) VALUES
  ('experimental_tools', '{"enabled": true}'),
  ('public_shares', '{"enabled": true}'),
  ('multi_user_rooms', '{"enabled": true}'),
  ('advanced_effects', '{"particles": true, "backgrounds": true}')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at on app_settings
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();