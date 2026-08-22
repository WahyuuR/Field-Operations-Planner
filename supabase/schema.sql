-- Jalankan seluruh file ini sekali di Supabase Dashboard > SQL Editor.
-- Membuat tabel `trips` untuk menyimpan rencana ROP tiap pengguna + Row Level Security
-- supaya setiap pengguna hanya bisa melihat/mengubah rencana miliknya sendiri.

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Rencana Tanpa Judul',
  mountain text,
  date_range text,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_user_id_idx on public.trips (user_id);
create index if not exists trips_updated_at_idx on public.trips (updated_at desc);

alter table public.trips enable row level security;

drop policy if exists "trips_select_own" on public.trips;
create policy "trips_select_own" on public.trips
  for select using (auth.uid() = user_id);

drop policy if exists "trips_insert_own" on public.trips;
create policy "trips_insert_own" on public.trips
  for insert with check (auth.uid() = user_id);

drop policy if exists "trips_update_own" on public.trips;
create policy "trips_update_own" on public.trips
  for update using (auth.uid() = user_id);

drop policy if exists "trips_delete_own" on public.trips;
create policy "trips_delete_own" on public.trips
  for delete using (auth.uid() = user_id);

-- Otomatis perbarui updated_at setiap kali baris diubah, supaya urutan
-- riwayat "terbaru dulu" tetap akurat.
create or replace function public.trips_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trips_updated_at on public.trips;
create trigger trips_updated_at
  before update on public.trips
  for each row execute function public.trips_set_updated_at();
