import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mountain, Plus, Trash2, Printer, Copy, Check, Tent, Backpack,
  ClipboardList, MapPin, RotateCcw, FileText, Compass, Save,
  History, LogOut, Download, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useFonts } from "./hooks/useFonts";
import { uid } from "./utils/uid";
import { downloadStateAsJson } from "./utils/download";
import { seedState, emptyState } from "./data/seedData";
import { SectionHeading, IconButton, Field } from "./components/Primitives";
import { GearList } from "./components/GearList";
import { DocumentView } from "./components/DocumentView";
import { AuthScreen } from "./components/AuthScreen";
import { TripHistory } from "./components/TripHistory";
import { useAuth } from "./context/AuthContext";
import { createTrip, updateTrip } from "./lib/tripsApi";

/* ---------------------------------------------------------------
   TOKENS — "buku lapangan" / field-notebook trail dossier
   paper: EFEDE7 | ink: 20261F | pine: 2F4A3B | ochre: A6752B | sage: 8C9A82 | brick: 8A3A2E
----------------------------------------------------------------*/

function ROPPlanner({ initialState, tripId, userId, onTripIdChange, onBackToHistory, onSignOut, userEmail }) {
  useFonts();
  const [state, setState] = useState(initialState || seedState());
  const [tab, setTab] = useState("info");
  const [copyState, setCopyState] = useState("idle"); // idle | ok | fail
  const [saveState, setSaveState] = useState(tripId ? "saved" : "unsaved"); // unsaved | saving | saved | error
  const saveTimer = useRef(null);
  const tripIdRef = useRef(tripId);

  useEffect(() => {
    tripIdRef.current = tripId;
  }, [tripId]);

  const persist = useCallback(
    async (nextState) => {
      setSaveState("saving");
      try {
        if (tripIdRef.current) {
          await updateTrip(tripIdRef.current, nextState);
        } else {
          const row = await createTrip(userId, nextState);
          tripIdRef.current = row.id;
          onTripIdChange(row.id);
        }
        setSaveState("saved");
      } catch (e) {
        setSaveState("error");
      }
    },
    [userId, onTripIdChange]
  );

  // debounced autosave — jalan setelah rencana pernah disimpan sekali (tripId ada),
  // supaya draft kosong tidak otomatis memenuhi riwayat sebelum pengguna menyimpannya.
  useEffect(() => {
    if (!tripIdRef.current) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(state), 700);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleManualSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    persist(state);
  };

  const setTrip = (field, value) =>
    setState((s) => ({ ...s, trip: { ...s.trip, [field]: value } }));

  const updateRow = (listKey, id, field, value) =>
    setState((s) => ({
      ...s,
      [listKey]: s[listKey].map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));

  const addRow = (listKey, template) =>
    setState((s) => ({ ...s, [listKey]: [...s[listKey], { id: uid(), ...template }] }));

  const removeRow = (listKey, id) =>
    setState((s) => ({ ...s, [listKey]: s[listKey].filter((r) => r.id !== id) }));

  const resetTrip = () => {
    if (window.confirm("Mulai perjalanan baru? Data saat ini akan diganti dengan formulir kosong.")) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      tripIdRef.current = null;
      onTripIdChange(null);
      setSaveState("unsaved");
      setState(emptyState());
    }
  };

  const buildPlainText = useCallback(() => {
    const { trip, timeline, groupGear, personalGear, logistics } = state;
    const lines = [];
    lines.push("RENCANA OPERASIONAL PERJALANAN (ROP)");
    lines.push(trip.title || "-");
    lines.push("");
    lines.push(`Gunung/Lokasi : ${trip.mountain || "-"}`);
    lines.push(`Basecamp      : ${trip.basecamp || "-"}`);
    lines.push(`Tim/Regu      : ${trip.team || "-"}`);
    lines.push(`Ketua Tim     : ${trip.leader || "-"}`);
    lines.push(`Anggota       : ${trip.members || "-"}`);
    lines.push(`Tanggal       : ${trip.dateRange || "-"}`);
    lines.push("");
    lines.push("MANAJEMEN PERJALANAN");
    timeline.forEach((r) => lines.push(`${r.day} | ${r.date} | ${r.time} | ${r.note}`));
    lines.push("");
    lines.push("PERALATAN — KELOMPOK");
    groupGear.forEach((g) => lines.push(`- ${g.text}`));
    lines.push("");
    lines.push("PERALATAN — PRIBADI");
    personalGear.forEach((g) => lines.push(`- ${g.text}`));
    lines.push("");
    lines.push("LOGISTIK");
    logistics.forEach((l) => lines.push(`- ${l.text}${l.qty ? ` (${l.qty})` : ""}`));
    return lines.join("\n");
  }, [state]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainText());
      setCopyState("ok");
    } catch (e) {
      setCopyState("fail");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  };

  const handlePrint = () => {
    setTab("dokumen");
    setTimeout(() => window.print(), 150);
  };

  const groupedTimeline = state.timeline.reduce((acc, row) => {
    (acc[row.day] = acc[row.day] || []).push(row);
    return acc;
  }, {});

  const saveLabel =
    saveState === "saving" ? "Menyimpan..." :
    saveState === "saved" ? "Tersimpan" :
    saveState === "error" ? "Gagal menyimpan" : "Belum disimpan";

  return (
    <div
      className="min-h-full w-full"
      style={{ fontFamily: "'Inter', sans-serif", background: "#EFEDE7", color: "#20261F" }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-doc { display: block !important; }
          body, html { background: white !important; }
        }
        .font-serif-trail { font-family: 'Fraunces', serif; }
        .font-mono-trail { font-family: 'IBM Plex Mono', monospace; }
        .topo-bg {
          background-image:
            radial-gradient(circle at 20% 20%, rgba(140,154,130,0.14) 0, transparent 34%),
            radial-gradient(circle at 80% 0%, rgba(166,117,43,0.10) 0, transparent 40%),
            repeating-radial-gradient(circle at 15% 85%, rgba(47,74,59,0.05) 0px, rgba(47,74,59,0.05) 1px, transparent 1px, transparent 14px);
        }
      `}</style>

      <div className="topo-bg">
        {/* HEADER */}
        <header className="no-print border-b border-[#8C9A82]/40 px-5 sm:px-8 py-6">
          <div className="max-w-4xl mx-auto flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[#2F4A3B] flex items-center justify-center shrink-0">
                <Mountain className="h-5 w-5 text-[#EFEDE7]" />
              </div>
              <div>
                <p className="font-mono-trail text-[10px] tracking-[0.25em] uppercase text-[#A6752B]">
                  Field Operations Planner
                </p>
                <h1 className="font-serif-trail text-2xl sm:text-3xl font-semibold leading-tight">
                  Rencana Operasional Perjalanan
                </h1>
                <p className="font-mono-trail text-[10px] uppercase tracking-wide text-[#8C7A57] mt-1">
                  {userEmail} · {saveLabel}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToHistory}
                className="border-[#8C9A82] text-[#20261F] hover:bg-[#8C9A82]/10 gap-1.5"
              >
                <History className="h-3.5 w-3.5" /> Rencana Saya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetTrip}
                className="border-[#8C9A82] text-[#20261F] hover:bg-[#8C9A82]/10 gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Trip baru
              </Button>
              <Button
                size="sm"
                onClick={handleManualSave}
                disabled={saveState === "saving"}
                className="bg-[#2F4A3B] hover:bg-[#25392e] text-[#EFEDE7] gap-1.5"
              >
                {saveState === "saving" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Simpan
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="bg-[#A6752B] hover:bg-[#8f6423] text-[#EFEDE7] gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Cetak dokumen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                title="Keluar"
                className="text-[#8A3A2E] hover:text-[#8A3A2E] hover:bg-[#8A3A2E]/10 gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* TABS */}
        <main className="no-print max-w-4xl mx-auto px-5 sm:px-8 py-8">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-[#E4E1D2] p-1 h-auto flex-wrap gap-1 mb-8">
              {[
                { v: "info", label: "Info Umum", icon: MapPin },
                { v: "jadwal", label: "Jadwal", icon: Compass },
                { v: "peralatan", label: "Peralatan", icon: Backpack },
                { v: "logistik", label: "Logistik", icon: Tent },
                { v: "dokumen", label: "Dokumen", icon: FileText },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="data-[state=active]:bg-[#2F4A3B] data-[state=active]:text-[#EFEDE7] gap-1.5 font-mono-trail text-xs tracking-wide uppercase"
                >
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* INFO */}
            <TabsContent value="info">
              <Card className="border-[#8C9A82]/40 bg-white/60">
                <CardContent className="pt-6">
                  <SectionHeading icon={MapPin} eyebrow="Bagian 1" title="Info Umum Perjalanan" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Judul ROP">
                      <Input value={state.trip.title} onChange={(e) => setTrip("title", e.target.value)} placeholder="cth. CampCer Arjuno Tretes" />
                    </Field>
                    <Field label="Gunung / Lokasi">
                      <Input value={state.trip.mountain} onChange={(e) => setTrip("mountain", e.target.value)} placeholder="cth. Gunung Arjuno (3.339 mdpl)" />
                    </Field>
                    <Field label="Basecamp / Jalur">
                      <Input value={state.trip.basecamp} onChange={(e) => setTrip("basecamp", e.target.value)} placeholder="cth. Basecamp Tretes" />
                    </Field>
                    <Field label="Tim / Regu">
                      <Input value={state.trip.team} onChange={(e) => setTrip("team", e.target.value)} placeholder="cth. CampCer" />
                    </Field>
                    <Field label="Ketua Tim">
                      <Input value={state.trip.leader} onChange={(e) => setTrip("leader", e.target.value)} placeholder="Nama ketua" />
                    </Field>
                    <Field label="Tanggal Perjalanan">
                      <Input value={state.trip.dateRange} onChange={(e) => setTrip("dateRange", e.target.value)} placeholder="cth. 6 – 8 Mei" />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Anggota Tim">
                      <Textarea
                        value={state.trip.members}
                        onChange={(e) => setTrip("members", e.target.value)}
                        placeholder="Nama-nama anggota, pisahkan dengan koma"
                        className="min-h-[80px]"
                      />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* JADWAL — trail log timeline */}
            <TabsContent value="jadwal">
              <Card className="border-[#8C9A82]/40 bg-white/60">
                <CardContent className="pt-6">
                  <SectionHeading icon={Compass} eyebrow="Bagian 2" title="Manajemen Perjalanan" />
                  <div className="space-y-8">
                    {Object.entries(groupedTimeline).map(([day, rows]) => (
                      <div key={day}>
                        <Badge className="bg-[#2F4A3B] text-[#EFEDE7] font-mono-trail mb-3">{day}</Badge>
                        <div className="relative pl-6 border-l-2 border-[#8C9A82]/50 space-y-4">
                          {rows.map((row) => (
                            <div key={row.id} className="relative">
                              <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-[#A6752B] ring-4 ring-[#EFEDE7]" />
                              <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr_auto] gap-2 items-start bg-[#F3F1E9] rounded-md p-3">
                                <Input
                                  value={row.time}
                                  onChange={(e) => updateRow("timeline", row.id, "time", e.target.value)}
                                  placeholder="Waktu"
                                  className="font-mono-trail text-sm h-9"
                                />
                                <Textarea
                                  value={row.note}
                                  onChange={(e) => updateRow("timeline", row.id, "note", e.target.value)}
                                  placeholder="Keterangan kegiatan"
                                  className="min-h-[36px] h-9 py-1.5 resize-none"
                                />
                                <IconButton onClick={() => removeRow("timeline", row.id)} title="Hapus baris">
                                  <Trash2 className="h-4 w-4" />
                                </IconButton>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pl-6 mt-3 flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#8C9A82] gap-1.5"
                            onClick={() =>
                              addRow("timeline", { day, date: rows[0]?.date || "", time: "", note: "" })
                            }
                          >
                            <Plus className="h-3.5 w-3.5" /> Tambah waktu di {day}
                          </Button>
                        </div>
                        <Separator className="mt-6 bg-[#8C9A82]/30" />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#A6752B] text-[#A6752B] hover:bg-[#A6752B]/10 gap-1.5"
                      onClick={() => {
                        const days = state.timeline.map((r) => r.day);
                        const lastDay = days[days.length - 1] || "H-1";
                        const num = parseInt(lastDay.replace(/\D/g, ""), 10) || 0;
                        addRow("timeline", { day: `H-${num + 1}`, date: "", time: "", note: "" });
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah hari baru
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PERALATAN */}
            <TabsContent value="peralatan">
              <div className="grid sm:grid-cols-2 gap-5">
                <Card className="border-[#8C9A82]/40 bg-white/60">
                  <CardContent className="pt-6">
                    <SectionHeading icon={Tent} eyebrow="Bagian 3a" title="Peralatan Kelompok" />
                    <GearList list={state.groupGear} listKey="groupGear" updateRow={updateRow} addRow={addRow} removeRow={removeRow} />
                  </CardContent>
                </Card>
                <Card className="border-[#8C9A82]/40 bg-white/60">
                  <CardContent className="pt-6">
                    <SectionHeading icon={Backpack} eyebrow="Bagian 3b" title="Peralatan Pribadi" />
                    <GearList list={state.personalGear} listKey="personalGear" updateRow={updateRow} addRow={addRow} removeRow={removeRow} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* LOGISTIK */}
            <TabsContent value="logistik">
              <Card className="border-[#8C9A82]/40 bg-white/60">
                <CardContent className="pt-6">
                  <SectionHeading icon={ClipboardList} eyebrow="Bagian 4" title="Logistik" />
                  <div className="space-y-2">
                    {state.logistics.map((row) => (
                      <div key={row.id} className="grid grid-cols-[1fr_110px_auto] gap-2 items-center">
                        <Input
                          value={row.text}
                          onChange={(e) => updateRow("logistics", row.id, "text", e.target.value)}
                          placeholder="Item logistik"
                        />
                        <Input
                          value={row.qty}
                          onChange={(e) => updateRow("logistics", row.id, "qty", e.target.value)}
                          placeholder="Jumlah"
                          className="font-mono-trail text-sm"
                        />
                        <IconButton onClick={() => removeRow("logistics", row.id)} title="Hapus item">
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8C9A82] gap-1.5 mt-4"
                    onClick={() => addRow("logistics", { text: "", qty: "" })}
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah item
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* DOKUMEN PREVIEW (screen only) */}
            <TabsContent value="dokumen">
              <div className="flex justify-end gap-2 mb-4 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleCopy} className="border-[#8C9A82] gap-1.5">
                  {copyState === "ok" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copyState === "ok" ? "Tersalin" : copyState === "fail" ? "Gagal, salin manual" : "Salin teks"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadStateAsJson(state, state.trip.title)}
                  className="border-[#8C9A82] gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Unduh data (.json)
                </Button>
                <Button size="sm" onClick={() => window.print()} className="bg-[#A6752B] hover:bg-[#8f6423] text-[#EFEDE7] gap-1.5">
                  <Printer className="h-3.5 w-3.5" /> Cetak / Simpan PDF
                </Button>
              </div>
              <DocumentView state={state} />
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-[#8C7A57] font-mono-trail mt-10">
            {tripId
              ? "Tersimpan ke akunmu — buka lagi kapan saja lewat \u201cRencana Saya\u201d."
              : "Klik \u201cSimpan\u201d untuk menambahkan rencana ini ke riwayat akunmu."}
          </p>
        </main>
      </div>

      {/* PRINT-ONLY VERSION */}
      <div className="print-doc hidden">
        <DocumentView state={state} printMode />
      </div>
    </div>
  );
}

function Splash() {
  return (
    <div
      className="min-h-full w-full flex items-center justify-center"
      style={{ background: "#EFEDE7", color: "#20261F" }}
    >
      <div className="flex items-center gap-2 text-sm text-[#5B6B54] font-mono">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
      </div>
    </div>
  );
}

export default function AppRoot() {
  const { user, session, loading, signOut } = useAuth();
  const [view, setView] = useState("history"); // history | planner
  const [activeTrip, setActiveTrip] = useState(null); // { id, data } | null
  // Berubah hanya saat pengguna secara sengaja membuka rencana lain atau memulai
  // rencana baru — bukan saat autosave memberi id ke rencana yang baru pertama disimpan.
  // Ini mencegah form ter-remount (dan draft yang sedang diketik hilang) tepat setelah
  // klik "Simpan" pertama kali.
  const [sessionSeed, setSessionSeed] = useState(0);

  if (loading) return <Splash />;
  if (!session || !user) return <AuthScreen />;

  if (view === "planner") {
    return (
      <ROPPlanner
        key={sessionSeed}
        initialState={activeTrip?.data || seedState()}
        tripId={activeTrip?.id || null}
        userId={user.id}
        userEmail={user.email}
        onTripIdChange={(id) => setActiveTrip((t) => (t ? { ...t, id } : { id, data: null }))}
        onBackToHistory={() => setView("history")}
        onSignOut={signOut}
      />
    );
  }

  return (
    <div className="min-h-full w-full" style={{ background: "#EFEDE7", color: "#20261F" }}>
      <header className="border-b border-[#8C9A82]/40 px-5 sm:px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#2F4A3B] flex items-center justify-center shrink-0">
              <Mountain className="h-5 w-5 text-[#EFEDE7]" />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#A6752B]">
                Field Operations Planner
              </p>
              <h1 className="font-serif text-xl font-semibold leading-tight">{user.email}</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-[#8A3A2E] hover:text-[#8A3A2E] hover:bg-[#8A3A2E]/10 gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </Button>
        </div>
      </header>
      <TripHistory
        onOpenTrip={(row) => {
          setActiveTrip({ id: row.id, data: row.data });
          setSessionSeed((s) => s + 1);
          setView("planner");
        }}
        onNewTrip={() => {
          setActiveTrip(null);
          setSessionSeed((s) => s + 1);
          setView("planner");
        }}
      />
    </div>
  );
}
