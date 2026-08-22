import { supabase } from "./supabaseClient";

const TABLE = "trips";

/** Ambil daftar rencana milik user, terbaru dulu. Tidak mengambil kolom `data` yang berat. */
export async function listTrips() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, title, mountain, date_range, updated_at, created_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

/** Ambil satu rencana lengkap (termasuk seluruh isi formulir) untuk dibuka/edit. */
export async function getTrip(id) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

/** Simpan rencana baru, dikaitkan ke user yang sedang login. */
export async function createTrip(userId, state) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      title: state.trip.title || "Rencana Tanpa Judul",
      mountain: state.trip.mountain || "",
      date_range: state.trip.dateRange || "",
      data: state,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Perbarui rencana yang sudah ada (dipakai autosave & tombol Simpan). */
export async function updateTrip(id, state) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      title: state.trip.title || "Rencana Tanpa Judul",
      mountain: state.trip.mountain || "",
      date_range: state.trip.dateRange || "",
      data: state,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTrip(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
