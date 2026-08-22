import { useEffect, useRef, useState } from "react";
import { Download, FileText, FileType, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportStateAsPdf, exportStateAsWord } from "../utils/exportDocument";

/**
 * Tombol "Unduh dokumen" dengan pilihan format: PDF (.pdf) atau Word (.docx).
 */
export function DownloadMenu({ state, title, className = "" }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const runExport = async (fn) => {
    setOpen(false);
    setBusy(true);
    setError("");
    try {
      await fn(state, title);
    } catch (e) {
      setError("Gagal membuat file. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={wrapperRef}>
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
        className="border-[#8C9A82] gap-1.5"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        Unduh dokumen
        <ChevronDown className="h-3 w-3 opacity-60" />
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-52 overflow-hidden rounded-md border border-[#8C9A82]/40 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => runExport(exportStateAsPdf)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#20261F] hover:bg-[#EFEDE7]"
          >
            <FileText className="h-4 w-4 text-[#A6752B]" />
            <span>PDF (.pdf)</span>
          </button>
          <button
            type="button"
            onClick={() => runExport(exportStateAsWord)}
            className="flex w-full items-center gap-2 border-t border-[#8C9A82]/20 px-3 py-2.5 text-left text-sm text-[#20261F] hover:bg-[#EFEDE7]"
          >
            <FileType className="h-4 w-4 text-[#2F4A3B]" />
            <span>Word (.docx)</span>
          </button>
        </div>
      )}

      {error && <p className="absolute right-0 mt-1 w-52 text-[11px] text-[#8A3A2E]">{error}</p>}
    </div>
  );
}
