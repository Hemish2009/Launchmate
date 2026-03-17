// src/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://vyoqmnkhhuqpmffszihy.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5b3FtbmtoaHVxcG1mZnN6aWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTM3MzcsImV4cCI6MjA4ODQyOTczN30.m8NjC2kHaa3o9jBbP2KDoBQ9EwOJUahaxe0ERJt8M_E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
