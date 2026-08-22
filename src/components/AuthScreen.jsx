import { useState } from "react";
import { Mountain, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../lib/supabaseClient";

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" {...props}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 7 29.5 5 24 5c-7.7 0-14.4 4.3-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5.3 0 10.2-2 13.8-5.4l-6.4-5.4C29.3 34.6 26.8 35.5 24 35.5c-5.3 0-9.8-3.4-11.4-8.1l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.4-4.3 5.8l6.4 5.4C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      } else {
        const { error, data } = await signUpWithEmail(email, password);
        if (error) throw error;
        if (data?.user && !data.session) {
          setInfo("Akun dibuat. Silakan cek email kamu untuk verifikasi sebelum login.");
        }
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Gagal masuk dengan Google.");
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-full w-full flex items-center justify-center px-5 py-12"
      style={{ fontFamily: "'Inter', sans-serif", background: "#EFEDE7", color: "#20261F" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-full bg-[#2F4A3B] flex items-center justify-center mb-3">
            <Mountain className="h-6 w-6 text-[#EFEDE7]" />
          </div>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#A6752B] mb-1">
            Field Operations Planner
          </p>
          <h1 className="font-serif text-2xl font-semibold leading-tight">
            {mode === "login" ? "Masuk ke akunmu" : "Buat akun baru"}
          </h1>
          <p className="text-sm text-[#5B6B54] mt-1.5">
            Simpan rencana ROP kamu dan buka lagi kapan saja.
          </p>
        </div>

        <Card className="border-[#8C9A82]/40 bg-white/70">
          <CardContent className="pt-6">
            {!isSupabaseConfigured && (
              <p className="text-xs bg-[#8A3A2E]/10 text-[#8A3A2E] rounded-md p-3 mb-4 leading-relaxed">
                Supabase belum dikonfigurasi. Salin <code>.env.example</code> ke{" "}
                <code>.env.local</code>, isi kredensial project Supabase kamu, lalu jalankan ulang
                servernya.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide font-mono text-[#5B6B54]">
                  Email
                </Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide font-mono text-[#5B6B54]">
                  Kata Sandi
                </Label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              {error && <p className="text-xs text-[#8A3A2E]">{error}</p>}
              {info && <p className="text-xs text-[#2F4A3B]">{info}</p>}

              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-[#2F4A3B] hover:bg-[#25392e] text-[#EFEDE7] gap-1.5"
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {mode === "login" ? "Masuk" : "Daftar"}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <Separator className="flex-1 bg-[#8C9A82]/40" />
              <span className="text-[10px] uppercase tracking-wide text-[#8C7A57] font-mono">
                atau
              </span>
              <Separator className="flex-1 bg-[#8C9A82]/40" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={handleGoogle}
              className="w-full border-[#8C9A82] text-[#20261F] hover:bg-[#8C9A82]/10 gap-2"
            >
              <GoogleIcon />
              Lanjut dengan Google
            </Button>

            <p className="text-center text-xs text-[#5B6B54] mt-6">
              {mode === "login" ? (
                <>
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    className="text-[#A6752B] underline underline-offset-2"
                    onClick={() => {
                      setMode("register");
                      setError("");
                      setInfo("");
                    }}
                  >
                    Daftar di sini
                  </button>
                </>
              ) : (
                <>
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    className="text-[#A6752B] underline underline-offset-2"
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setInfo("");
                    }}
                  >
                    Masuk di sini
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
