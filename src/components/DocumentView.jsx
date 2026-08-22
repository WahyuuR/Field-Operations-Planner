/**
 * Tampilan dokumen ROP final — dipakai untuk pratinjau di layar (tab "Dokumen")
 * maupun untuk versi yang dicetak/disimpan sebagai PDF (printMode).
 */
export function DocumentView({ state, printMode = false }) {
  const { trip, timeline, groupGear, personalGear, logistics } = state;
  const groupedTimeline = timeline.reduce((acc, row) => {
    (acc[row.day] = acc[row.day] || []).push(row);
    return acc;
  }, {});

  return (
    <div
      className={`bg-white text-[#20261F] mx-auto ${
        printMode ? "w-full p-10" : "max-w-3xl rounded-lg shadow-sm border border-[#8C9A82]/30 p-8 sm:p-12"
      }`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="text-center border-b-2 border-[#2F4A3B] pb-6 mb-8">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#A6752B] mb-2">
          Rencana Operasional Perjalanan
        </p>
        <h1 className="font-serif text-3xl font-semibold">{trip.title || "Judul Perjalanan"}</h1>
        <p className="text-sm text-[#5B6B54] mt-2">
          {trip.mountain || "—"} {trip.basecamp ? `· ${trip.basecamp}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm mb-10 font-mono">
        <InfoRow label="Tim / Regu" value={trip.team} />
        <InfoRow label="Tanggal" value={trip.dateRange} />
        <InfoRow label="Ketua Tim" value={trip.leader} />
        <InfoRow label="Anggota" value={trip.members} />
      </div>

      <DocSection title="Manajemen Perjalanan">
        <div className="space-y-6">
          {Object.entries(groupedTimeline).map(([day, rows]) => (
            <div key={day}>
              <p className="font-serif font-semibold text-[#2F4A3B] mb-2">
                {day}
                {rows[0]?.date ? ` — ${rows[0].date}` : ""}
              </p>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#8C9A82]/25 last:border-0">
                      <td className="py-1.5 pr-4 font-mono whitespace-nowrap align-top w-28 text-[#A6752B]">
                        {r.time}
                      </td>
                      <td className="py-1.5 align-top">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Peralatan Kelompok">
        <BulletList items={groupGear.map((g) => g.text).filter(Boolean)} />
      </DocSection>

      <DocSection title="Peralatan Pribadi">
        <BulletList items={personalGear.map((g) => g.text).filter(Boolean)} />
      </DocSection>

      <DocSection title="Logistik" last>
        <BulletList
          items={logistics.filter((l) => l.text).map((l) => (l.qty ? `${l.text} (${l.qty})` : l.text))}
        />
      </DocSection>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#8C7A57] uppercase tracking-wide text-[11px] shrink-0 w-24 pt-0.5">{label}</span>
      <span className="text-[#20261F]">{value || "—"}</span>
    </div>
  );
}

function DocSection({ title, children, last = false }) {
  return (
    <div className={last ? "" : "mb-8"}>
      <h2 className="font-serif text-lg font-semibold text-[#2F4A3B] border-b border-[#8C9A82]/40 pb-1.5 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function BulletList({ items }) {
  if (!items.length) return <p className="text-sm text-[#8C7A57] italic">Belum ada item.</p>;
  return (
    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[#A6752B]">▹</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
