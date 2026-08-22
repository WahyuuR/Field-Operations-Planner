# ROP Pendakian — Field Operations Planner

Website generator **Rencana Operasional Perjalanan (ROP)** untuk pendakian, dibuat dengan React + shadcn/ui + Tailwind + Supabase (akun pengguna & penyimpanan cloud). Proyek Vite yang lengkap dan siap dijalankan, serta siap di-deploy ke Vercel.

## Fitur

1. **Akun pengguna** — daftar/masuk dengan Email & Password, atau **Masuk dengan Google**.
2. **Rencana Saya (riwayat)** — semua rencana yang pernah disimpan tersimpan di akunmu, tampil sebagai daftar dan bisa dibuka kembali.
3. **Simpan & edit kapan saja** — tombol **Simpan**, lalu perubahan berikutnya otomatis ter-autosave. Bisa dibuka lagi dan diedit dari perangkat mana pun selama login ke akun yang sama.
4. **Unduh** — setiap rencana bisa diunduh sebagai file `.json` (cadangan/edit offline) maupun dicetak/disimpan sebagai PDF dari tab Dokumen.
5. Form lengkap: Info Umum, Jadwal (trail log per hari), Peralatan (kelompok & pribadi), Logistik, dan Dokumen siap cetak.

## Arsitektur singkat

- **Frontend**: React + Vite + Tailwind + shadcn/ui (statis, cocok untuk Vercel).
- **Auth & Database**: [Supabase](https://supabase.com) — Auth (Email/Password + Google OAuth) dan tabel Postgres `trips` dengan Row Level Security, sehingga tiap pengguna hanya bisa mengakses rencananya sendiri.
- Tidak perlu server/back-end sendiri — Supabase diakses langsung dari browser lewat `@supabase/supabase-js`.

## 1. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com) (gratis).
2. Buka **SQL Editor**, tempel isi file [`supabase/schema.sql`](./supabase/schema.sql), lalu jalankan (Run). Ini membuat tabel `trips` beserta aturan keamanannya.
3. Buka **Project Settings > API**, salin nilai **Project URL** dan **anon public key** — kamu butuh ini di langkah 2 bagian berikutnya.
4. (Opsional) Aktifkan/nonaktifkan **Confirm email** di **Authentication > Providers > Email** sesuai kebutuhanmu. Secara default Supabase sudah mengaktifkan login Email/Password.

### Mengaktifkan Login dengan Google

1. Di [Google Cloud Console](https://console.cloud.google.com/apis/credentials), buat **OAuth client ID** bertipe **Web application**.
2. Di Supabase, buka **Authentication > Providers > Google**, salin **Callback URL (for OAuth)** yang ditampilkan di sana (bentuknya `https://<project-ref>.supabase.co/auth/v1/callback`).
3. Tempel Callback URL tadi ke kolom **Authorized redirect URIs** di Google Cloud Console, lalu simpan.
4. Salin **Client ID** dan **Client Secret** dari Google, tempel ke form provider Google di Supabase, lalu aktifkan (Enable) dan simpan.
5. Di Supabase, buka **Authentication > URL Configuration**:
   - **Site URL**: isi dengan URL utama aplikasimu (mis. `http://localhost:5173` saat development, ganti ke domain Vercel setelah deploy).
   - **Redirect URLs**: tambahkan `http://localhost:5173` dan domain Vercel kamu (mis. `https://nama-app.vercel.app`), supaya redirect login Google berhasil kembali ke aplikasi baik saat lokal maupun setelah deploy.

## 2. Menjalankan proyek secara lokal

Butuh [Node.js](https://nodejs.org) versi 18 ke atas.

```bash
npm install
cp .env.example .env.local
# lalu isi .env.local dengan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dari langkah di atas
npm run dev
```

Buka alamat yang ditampilkan di terminal (biasanya `http://localhost:5173`).

Untuk build produksi:

```bash
npm run build
npm run preview
```

## 3. Deploy ke Vercel

1. Push proyek ini ke repository GitHub/GitLab/Bitbucket kamu (pastikan `.env.local` **tidak** ikut ter-commit — sudah otomatis diabaikan lewat `.gitignore`).
2. Di [vercel.com](https://vercel.com), klik **Add New > Project**, pilih repo ini. Vercel akan otomatis mendeteksi ini sebagai proyek Vite (build command `vite build`, output `dist`).
3. Di step **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Klik **Deploy**.
5. Setelah dapat domain Vercel (mis. `https://nama-app.vercel.app`), kembali ke Supabase **Authentication > URL Configuration** dan tambahkan domain tersebut ke **Site URL** / **Redirect URLs** (lihat langkah 1.5 di atas) — kalau ini dilewati, login Google akan gagal redirect setelah deploy.

## Struktur folder

```
rop-pendakian/
├── README.md
├── supabase/
│   └── schema.sql            # Jalankan sekali di Supabase SQL Editor
├── .env.example               # Contoh variabel lingkungan Supabase
└── src/
    ├── App.jsx                 # Shell aplikasi: auth gate, riwayat, dan planner
    ├── context/
    │   └── AuthContext.jsx    # Session Supabase + signUp/signIn/signInWithGoogle/signOut
    ├── lib/
    │   ├── supabaseClient.js  # Inisialisasi client Supabase dari env var
    │   └── tripsApi.js        # CRUD rencana (list/get/create/update/delete)
    ├── components/
    │   ├── AuthScreen.jsx     # Form login/daftar + tombol Google
    │   ├── TripHistory.jsx    # Daftar "Rencana Saya" (buka/unduh/hapus)
    │   ├── Primitives.jsx     # SectionHeading, IconButton, Field
    │   ├── GearList.jsx       # Checklist peralatan (kelompok & pribadi)
    │   └── DocumentView.jsx   # Tampilan dokumen ROP siap cetak / PDF
    ├── data/
    │   └── seedData.js        # Data contoh + state kosong
    ├── hooks/
    │   └── useFonts.js         # Memuat Google Fonts (Fraunces, IBM Plex Mono, Inter)
    └── utils/
        ├── uid.js              # Helper pembuat id unik untuk tiap baris
        └── download.js         # Unduh rencana sebagai file .json
```

## Alur pemakaian

1. Pengguna mendaftar/masuk (Email & Password, atau Google).
2. Setelah login, muncul halaman **Rencana Saya** berisi daftar rencana tersimpan (kosong jika baru pertama kali).
3. Klik **Rencana Baru** untuk membuka formulir kosong, isi seperlunya, lalu klik **Simpan** — rencana masuk ke riwayat dan sejak itu tersimpan otomatis setiap ada perubahan.
4. Dari daftar riwayat, klik **Buka** untuk melanjutkan/mengedit, **Unduh** untuk mengambil file `.json`, atau **Hapus** untuk menghapusnya.
5. Tab **Dokumen** menyediakan **Cetak / Simpan PDF** dan **Salin teks** seperti sebelumnya.

## Menambahkan komponen shadcn/ui lain

Komponen di `src/components/ui/` (button, input, textarea, card, tabs, badge, separator, label) ditulis manual mengikuti gaya resmi shadcn/ui supaya proyek ini mandiri tanpa perlu `npx shadcn init`. Kalau proyek ini nanti disatukan ke proyek shadcn/ui yang sudah ada (dengan CLI resmi), cukup jalankan `npx shadcn@latest add <nama-komponen>` untuk komponen tambahan, dan file-file di folder ini bisa ditimpa dengan versi resmi kapan saja.
