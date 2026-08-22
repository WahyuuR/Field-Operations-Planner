import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "./Primitives";

/**
 * Daftar checklist peralatan yang bisa dicentang, diedit inline,
 * ditambah, dan dihapus. Dipakai untuk Peralatan Kelompok & Pribadi.
 */
export function GearList({ list, listKey, updateRow, addRow, removeRow }) {
  return (
    <div>
      <div className="space-y-2">
        {list.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateRow(listKey, item.id, "checked", !item.checked)}
              className={`h-5 w-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                item.checked ? "bg-[#2F4A3B] border-[#2F4A3B]" : "border-[#8C9A82] bg-transparent"
              }`}
              aria-label="Tandai selesai"
            >
              {item.checked && <Check className="h-3 w-3 text-[#EFEDE7]" />}
            </button>
            <Input
              value={item.text}
              onChange={(e) => updateRow(listKey, item.id, "text", e.target.value)}
              placeholder="Nama barang"
              className={item.checked ? "line-through text-[#8C7A57]" : ""}
            />
            <IconButton onClick={() => removeRow(listKey, item.id)} title="Hapus item">
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="border-[#8C9A82] gap-1.5 mt-4"
        onClick={() => addRow(listKey, { text: "", checked: false })}
      >
        <Plus className="h-3.5 w-3.5" /> Tambah item
      </Button>
    </div>
  );
}
