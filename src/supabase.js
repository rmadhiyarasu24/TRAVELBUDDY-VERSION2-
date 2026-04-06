import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pizdfopxtvsulvwxtumw.supabase.co";

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpemRmb3B4dHZzdWx2d3h0dW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODM4MTQsImV4cCI6MjA4NzY1OTgxNH0.-gVYHTmnIj0dk7zEW7J5z26qRqpwrJIdUhpSB8i1uDY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);