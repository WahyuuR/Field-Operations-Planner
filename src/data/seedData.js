import { uid } from "../utils/uid";

export const STORAGE_KEY = "rop-pendakian:trip-v1";

export const seedTrip = {
  title: "CampCer Arjuno Tretes",
  mountain: "Gunung Arjuno (3.339 mdpl)",
  basecamp: "Basecamp Tretes",
  team: "CampCer",
  leader: "",
  members: "",
  dateRange: "6 – 8 Mei",
};

export const seedTimeline = [
  { id: uid(), day: "H-1", date: "6 Mei / Sabtu", time: "21.00 – 23.00", note: "Perjalanan ke BC Tretes, makan malam (opsional)" },
  { id: uid(), day: "H-1", date: "6 Mei / Sabtu", time: "23.00 – 05.30", note: "Istirahat, tidur di pos" },
  { id: uid(), day: "H-2", date: "7 Mei / Minggu", time: "05.30 – 09.00", note: "Aktivitas pagi, sarapan, persiapan/briefing" },
  { id: uid(), day: "H-2", date: "7 Mei / Minggu", time: "09.00", note: "Start pendakian" },
  { id: uid(), day: "H-2", date: "7 Mei / Minggu", time: "13.00", note: "Makan siang (nasi bungkus)" },
  { id: uid(), day: "H-2", date: "7 Mei / Minggu", time: "< 18.00", note: "Sampai Camp Kidang" },
  { id: uid(), day: "H-2", date: "7 Mei / Minggu", time: "19.00", note: "Bangun tenda, bersih-bersih, masak makan malam (sayur sop, lauk tempe nugget)" },
  { id: uid(), day: "H-2", date: "7 Mei / Minggu", time: "23.00", note: "Istirahat untuk summit" },
  { id: uid(), day: "H-3", date: "8 Mei / Senin", time: "03.00", note: "Summit attack" },
  { id: uid(), day: "H-3", date: "8 Mei / Senin", time: "08.00", note: "Coffee break puncak / Taman Dewa" },
  { id: uid(), day: "H-3", date: "8 Mei / Senin", time: "08.20", note: "Turun ke camp" },
  { id: uid(), day: "H-3", date: "8 Mei / Senin", time: "10.30", note: "Sampai camp, makan, persiapan turun (pecel, goreng telur)" },
  { id: uid(), day: "H-3", date: "8 Mei / Senin", time: "12.00", note: "Start turun" },
];

export const seedGroupGear = [
  "Tenda 4P", "Nesting, 2 buah", "Kompor, 2 buah", "Gas, 2 buah",
  "Trashbag", "Tisu", "Jerigen 5L",
].map((text) => ({ id: uid(), text, checked: false }));

export const seedPersonalGear = [
  "Gelas, sendok makan, piring", "Sleeping bag", "Matras",
  "Baju ganti/tidur/summit", "Headlamp/senter", "Jas hujan", "Sandal", "Surat sehat",
].map((text) => ({ id: uid(), text, checked: false }));

export const seedLogistics = [
  { id: uid(), text: "Sayur-sayuran sop", qty: "" },
  { id: uid(), text: "Bumbu-bumbu (royco sapi, bumbu sachet sop, garam, gula)", qty: "" },
  { id: uid(), text: "Tempe", qty: "5k" },
  { id: uid(), text: "Mie goreng", qty: "3 pcs" },
  { id: uid(), text: "Kopi/teh/susu", qty: "" },
  { id: uid(), text: "Jajan manis, gurih", qty: "" },
  { id: uid(), text: "Telur", qty: "4 butir" },
  { id: uid(), text: "Beras", qty: "1 kg" },
  { id: uid(), text: "Nugget", qty: "" },
  { id: uid(), text: "Air mineral 1.5L", qty: "4 pcs" },
];

export const seedState = () => ({
  trip: seedTrip,
  timeline: seedTimeline,
  groupGear: seedGroupGear,
  personalGear: seedPersonalGear,
  logistics: seedLogistics,
});

export const emptyState = () => ({
  trip: { title: "", mountain: "", basecamp: "", team: "", leader: "", members: "", dateRange: "" },
  timeline: [{ id: uid(), day: "H-1", date: "", time: "", note: "" }],
  groupGear: [{ id: uid(), text: "", checked: false }],
  personalGear: [{ id: uid(), text: "", checked: false }],
  logistics: [{ id: uid(), text: "", qty: "" }],
});
