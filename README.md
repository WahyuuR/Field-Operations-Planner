# ROP Pendakian — Field Operations Planner

Website generator **Rencana Operasional Perjalanan (ROP)** untuk pendakian, dibuat dengan React + shadcn/ui + Tailwind + Supabase.

## Fitur

1. **Akun pengguna** — daftar/masuk dengan Email & Password, atau **Masuk dengan Google**.
2. **Rencana Saya (riwayat)** — semua rencana yang pernah disimpan tersimpan di akunmu, tampil sebagai daftar dan bisa dibuka kembali.
3. **Simpan & edit kapan saja** — tombol **Simpan**, lalu perubahan berikutnya otomatis ter-autosave. Bisa dibuka lagi dan diedit dari perangkat mana pun selama login ke akun yang sama.
4. **Unduh** — setiap rencana bisa diunduh sebagai file `.json` (cadangan/edit offline) maupun dicetak/disimpan sebagai PDF dari tab Dokumen.
5. Form lengkap: Info Umum, Jadwal (trail log per hari), Peralatan (kelompok & pribadi), Logistik, dan Dokumen siap cetak.

## Arsitektur singkat

- **Frontend**: React + Vite + Tailwind + shadcn/ui.
- **Auth & Database**: [Supabase](https://supabase.com) — Auth (Email/Password + Google OAuth) dan tabel Postgres `trips` dengan Row Level Security, sehingga tiap pengguna hanya bisa mengakses rencananya sendiri.
- Tidak perlu server/back-end sendiri — Supabase diakses langsung dari browser lewat `@supabase/supabase-js`.


## Alur pemakaian

1. Pengguna mendaftar/masuk (Email & Password, atau Google).
2. Setelah login, muncul halaman **Rencana Saya** berisi daftar rencana tersimpan (kosong jika baru pertama kali).
3. Klik **Rencana Baru** untuk membuka formulir kosong, isi seperlunya, lalu klik **Simpan** — rencana masuk ke riwayat dan sejak itu tersimpan otomatis setiap ada perubahan.
4. Dari daftar riwayat, klik **Buka** untuk melanjutkan/mengedit, **Unduh** untuk mengambil file `.json`, atau **Hapus** untuk menghapusnya.
5. Tab **Dokumen** menyediakan **Cetak / Simpan PDF** dan **Salin teks** seperti sebelumnya.

## Menambahkan komponen shadcn/ui lain

Komponen di `src/components/ui/` (button, input, textarea, card, tabs, badge, separator, label) ditulis manual mengikuti gaya resmi shadcn/ui supaya proyek ini mandiri tanpa perlu `npx shadcn init`. Kalau proyek ini nanti disatukan ke proyek shadcn/ui yang sudah ada (dengan CLI resmi), cukup jalankan `npx shadcn@latest add <nama-komponen>` untuk komponen tambahan, dan file-file di folder ini bisa ditimpa dengan versi resmi kapan saja.
