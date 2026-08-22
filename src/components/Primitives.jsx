import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** Judul tiap bagian formulir, dengan lencana bulat + eyebrow ala label lapangan. */
export function SectionHeading({ icon: Icon, eyebrow, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F4A3B] text-[#EFEDE7] shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#8C7A57]">{eyebrow}</p>
        <h2 className="font-serif text-xl font-semibold text-[#20261F] leading-tight">{title}</h2>
      </div>
    </div>
  );
}

/** Tombol ikon kecil (dipakai untuk aksi hapus baris). */
export function IconButton({ onClick, title, variant = "ghost", children }) {
  return (
    <Button
      type="button"
      size="icon"
      variant={variant}
      onClick={onClick}
      title={title}
      className={
        variant === "ghost"
          ? "h-8 w-8 text-[#8A3A2E] hover:text-[#8A3A2E] hover:bg-[#8A3A2E]/10"
          : "h-8 w-8"
      }
    >
      {children}
    </Button>
  );
}

/** Wrapper label + input untuk formulir Info Umum. */
export function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide font-mono text-[#5B6B54]">{label}</Label>
      {children}
    </div>
  );
}
