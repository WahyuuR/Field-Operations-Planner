import { useEffect, useState } from "react";
import { Mountain, Plus, Download, Trash2, FolderOpen, Loader2, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listTrips, getTrip, deleteTrip } from "../lib/tripsApi";
import { downloadStateAsJson } from "../utils/download";

function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function TripHistory({ onOpenTrip, onNewTrip }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listTrips();
      setTrips(data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat riwayat rencana.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleOpen = async (id) => {
    setBusyId(id);
    try {
      const row = await getTrip(id);
      onOpenTrip(row);
    } catch (err) {
      setError(err.message || "Gagal membuka rencana.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (id, fallbackTitle) => {
    setBusyId(id);
    try {
      const row = await getTrip(id);
      downloadStateAsJson(row.data, row.title || fallbackTitle);
    } catch (err) {
      setError(err.message || "Gagal mengunduh rencana.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus rencana ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setBusyId(id);
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message || "Gagal menghapus rencana.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#A6752B] mb-1">
            Riwayat Tersimpan
          </p>
          <h2 className="font-serif text-2xl font-semibold">Rencana Saya</h2>
        </div>
        <Button onClick={onNewTrip} className="bg-[#A6752B] hover:bg-[#8f6423] text-[#EFEDE7] gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Rencana Baru
        </Button>
      </div>

      {error && (
        <p className="text-xs bg-[#8A3A2E]/10 text-[#8A3A2E] rounded-md p-3 mb-4">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#5B6B54] py-10 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat rencana...
        </div>
      ) : trips.length === 0 ? (
        <Card className="border-[#8C9A82]/40 bg-white/60">
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-3">
            <Mountain className="h-8 w-8 text-[#8C9A82]" />
            <p className="text-sm text-[#5B6B54]">
              Belum ada rencana tersimpan. Buat rencana pertamamu dan simpan lewat tab Dokumen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {trips.map((t) => (
            <Card key={t.id} className="border-[#8C9A82]/40 bg-white/60">
              <CardContent className="pt-5 pb-4">
                <h3 className="font-serif text-lg font-semibold leading-tight mb-1 truncate">
                  {t.title || "Rencana Tanpa Judul"}
                </h3>
                <p className="text-sm text-[#5B6B54] truncate">{t.mountain || "-"}</p>
                <p className="text-xs text-[#8C7A57] font-mono mt-1 flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Diperbarui {formatDate(t.updated_at)}
                </p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button
                    size="sm"
                    disabled={busyId === t.id}
                    onClick={() => handleOpen(t.id)}
                    className="bg-[#2F4A3B] hover:bg-[#25392e] text-[#EFEDE7] gap-1.5"
                  >
                    <FolderOpen className="h-3.5 w-3.5" /> Buka
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === t.id}
                    onClick={() => handleDownload(t.id, t.title)}
                    className="border-[#8C9A82] gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Unduh
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId === t.id}
                    onClick={() => handleDelete(t.id)}
                    className="text-[#8A3A2E] hover:text-[#8A3A2E] hover:bg-[#8A3A2E]/10 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
