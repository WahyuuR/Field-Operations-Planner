function slugify(text) {
  return (text || "rencana-rop")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "rencana-rop";
}

/** Unduh state rencana sebagai file .json, supaya bisa dipakai lagi lewat "Impor dari file". */
export function downloadStateAsJson(state, title) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(title)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
