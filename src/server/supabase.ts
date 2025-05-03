import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const SUPABASE_KEY = process.env.SUPABASE_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const supabase = createClient(
  SUPABASE_URL as string,SUPABASE_KEY as string);
export default supabase ;