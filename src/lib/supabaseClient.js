import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase belum dikonfigurasi. Salin .env.example ke .env.local lalu isi " +
      "VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dengan nilai dari project Supabase kamu."
  );
}

// Saat env belum diisi, tetap buat client dengan nilai placeholder supaya
// aplikasi tidak crash dan bisa menampilkan pesan konfigurasi yang jelas.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
