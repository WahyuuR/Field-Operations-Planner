import { useEffect } from "react";

/**
 * Menyuntikkan Google Fonts (Fraunces, IBM Plex Mono, Inter) ke <head>.
 * Fraunces  -> judul / heading (font-serif-trail)
 * IBM Plex Mono -> data teknis: waktu, label (font-mono-trail)
 * Inter     -> teks isi
 */
export function useFonts() {
  useEffect(() => {
    const id = "rop-fonts-link";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}
