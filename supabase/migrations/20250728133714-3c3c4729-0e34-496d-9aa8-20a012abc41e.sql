-- Drop the existing employees table and recreate with correct structure
DROP TABLE IF EXISTS public.employees;

-- Create employees table with the exact fields requested
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  salary NUMERIC(10,2) NOT NULL,
  date_of_joining DATE NOT NULL,
  last_day_of_working DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own employee records" 
ON public.employees 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own employee records" 
ON public.employees 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employee records" 
ON public.employees 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employee records" 
ON public.employees 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_email ON public.employees(email);
CREATE INDEX idx_employees_department ON public.employees(department);