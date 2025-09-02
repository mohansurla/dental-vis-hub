import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Scan {
  id: string;
  patient_name: string;
  patient_id: string;
  scan_type: string;
  region: string;
  image_url: string;
  upload_date: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'technician' | 'dentist';
  full_name: string;
}