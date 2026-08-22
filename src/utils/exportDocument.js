import { jsPDF } from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
} from "docx";

/* ---------------------------------------------------------------
   Helper bersama
----------------------------------------------------------------*/
function slugify(text) {
  return (
    (text || "rencana-rop")
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "rencana-rop"
  );
}

function groupTimelineByDay(timeline) {
  return (timeline || []).reduce((acc, row) => {
    (acc[row.day] = acc[row.day] || []).push(row);
    return acc;
  }, {});
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------------
   Warna tema "buku lapangan" (dipakai untuk PDF & Word)
----------------------------------------------------------------*/
const COLORS = {
  ink: [32, 38, 31],
  pine: [47, 74, 59],
  ochre: [166, 117, 43],
  sage: [140, 154, 130],
  muted: [140, 122, 87],
  sub: [91, 107, 84],
};
const HEX = {
  ink: "20261F",
  pine: "2F4A3B",
  ochre: "A6752B",
  sage: "8C9A82",
  muted: "8C7A57",
  sub: "5B6B54",
};

/* ---------------------------------------------------------------
   PDF (vector, teks bisa diseleksi — dibuat dengan jsPDF)
----------------------------------------------------------------*/
export function exportStateAsPdf(state, title) {
  const { trip, timeline, groupGear, personalGear, logistics } = state;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const bottomLimit = pageHeight - 48;
  let y = 56;

  const ensureSpace = (next) => {
    if (y + next > bottomLimit) {
      doc.addPage();
      y = 56;
    }
  };

  const heading = (text) => {
    ensureSpace(30);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.pine);
    doc.text(text, marginX, y);
    y += 8;
    doc.setDrawColor(...COLORS.sage);
    doc.setLineWidth(0.6);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 16;
  };

  // Header
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.ochre);
  doc.text("RENCANA OPERASIONAL PERJALANAN", pageWidth / 2, y, { align: "center" });
  y += 22;

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.ink);
  const titleLines = doc.splitTextToSize(trip.title || "Judul Perjalanan", pageWidth - marginX * 2);
  doc.text(titleLines, pageWidth / 2, y, { align: "center" });
  y += titleLines.length * 22 + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.sub);
  const subtitle = [trip.mountain, trip.basecamp].filter(Boolean).join(" \u00b7 ");
  doc.text(subtitle || "\u2014", pageWidth / 2, y, { align: "center" });
  y += 16;

  doc.setDrawColor(...COLORS.pine);
  doc.setLineWidth(1.2);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 28;

  // Info grid
  const info = [
    ["Tim / Regu", trip.team],
    ["Tanggal", trip.dateRange],
    ["Ketua Tim", trip.leader],
    ["Anggota", trip.members],
  ];
  doc.setFontSize(9.5);
  const colWidth = (pageWidth - marginX * 2) / 2;
  info.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = marginX + col * colWidth;
    const yy = y + row * 16;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.muted);
    doc.text(label.toUpperCase(), x, yy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.ink);
    doc.text(value || "\u2014", x + 82, yy);
  });
  y += Math.ceil(info.length / 2) * 16 + 22;

  // Timeline
  heading("Manajemen Perjalanan");
  const grouped = groupTimelineByDay(timeline);
  const dayEntries = Object.entries(grouped);
  if (!dayEntries.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.muted);
    ensureSpace(14);
    doc.text("Belum ada rencana perjalanan.", marginX, y);
    y += 20;
  }
  dayEntries.forEach(([day, rows]) => {
    ensureSpace(18);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.pine);
    const dayLabel = day + (rows[0]?.date ? ` \u2014 ${rows[0].date}` : "");
    doc.text(dayLabel, marginX, y);
    y += 15;
    doc.setFontSize(9.5);
    rows.forEach((r) => {
      const lines = doc.splitTextToSize(r.note || "", pageWidth - marginX * 2 - 90);
      ensureSpace(Math.max(14, lines.length * 12));
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.ochre);
      doc.text(r.time || "-", marginX, y);
      doc.setTextColor(...COLORS.ink);
      doc.text(lines, marginX + 90, y);
      y += Math.max(14, lines.length * 12);
    });
    y += 8;
  });
  y += 6;

  const bulletSection = (title2, items) => {
    heading(title2);
    if (!items.length) {
      ensureSpace(14);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.muted);
      doc.text("Belum ada item.", marginX, y);
      y += 18;
      return;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.ink);
    items.forEach((it) => {
      const lines = doc.splitTextToSize(`\u2022 ${it}`, pageWidth - marginX * 2);
      ensureSpace(lines.length * 13);
      doc.text(lines, marginX, y);
      y += lines.length * 13;
    });
    y += 10;
  };

  bulletSection("Peralatan Kelompok", groupGear.map((g) => g.text).filter(Boolean));
  bulletSection("Peralatan Pribadi", personalGear.map((g) => g.text).filter(Boolean));
  bulletSection(
    "Logistik",
    logistics.filter((l) => l.text).map((l) => (l.qty ? `${l.text} (${l.qty})` : l.text))
  );

  doc.save(`${slugify(title)}.pdf`);
}

/* ---------------------------------------------------------------
   Word (.docx) — dibuat dengan library "docx"
----------------------------------------------------------------*/
export async function exportStateAsWord(state, title) {
  const { trip, timeline, groupGear, personalGear, logistics } = state;
  const grouped = groupTimelineByDay(timeline);
  const children = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: "RENCANA OPERASIONAL PERJALANAN",
          bold: true,
          size: 16,
          color: HEX.ochre,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: trip.title || "Judul Perjalanan",
          bold: true,
          size: 40,
          font: "Georgia",
          color: HEX.ink,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: HEX.pine } },
      children: [
        new TextRun({
          text: [trip.mountain, trip.basecamp].filter(Boolean).join(" \u00b7 ") || "\u2014",
          size: 20,
          color: HEX.sub,
        }),
      ],
    })
  );

  const info = [
    ["Tim / Regu", trip.team],
    ["Tanggal", trip.dateRange],
    ["Ketua Tim", trip.leader],
    ["Anggota", trip.members],
  ];
  info.forEach(([label, value]) => {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${label.toUpperCase()}:  `, bold: true, size: 18, color: HEX.muted }),
          new TextRun({ text: value || "\u2014", size: 18, color: HEX.ink }),
        ],
      })
    );
  });
  children.push(new Paragraph({ text: "", spacing: { after: 100 } }));

  const heading = (text) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: HEX.sage } },
        children: [new TextRun({ text, bold: true, color: HEX.pine, font: "Georgia", size: 26 })],
      })
    );
  };

  heading("Manajemen Perjalanan");
  const dayEntries = Object.entries(grouped);
  if (!dayEntries.length) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Belum ada rencana perjalanan.", italics: true, color: HEX.muted, size: 18 }),
        ],
      })
    );
  }
  dayEntries.forEach(([day, rows]) => {
    const dayLabel = day + (rows[0]?.date ? ` \u2014 ${rows[0].date}` : "");
    children.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [new TextRun({ text: dayLabel, bold: true, color: HEX.pine, font: "Georgia", size: 22 })],
      })
    );
    rows.forEach((r) => {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${r.time || "-"}\u2003`, color: HEX.ochre, size: 18 }),
            new TextRun({ text: r.note || "", size: 18, color: HEX.ink }),
          ],
        })
      );
    });
  });

  const bulletSection = (title2, items) => {
    heading(title2);
    if (!items.length) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "Belum ada item.", italics: true, color: HEX.muted, size: 18 })],
        })
      );
      return;
    }
    items.forEach((it) => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [new TextRun({ text: it, size: 18, color: HEX.ink })],
        })
      );
    });
  };

  bulletSection("Peralatan Kelompok", groupGear.map((g) => g.text).filter(Boolean));
  bulletSection("Peralatan Pribadi", personalGear.map((g) => g.text).filter(Boolean));
  bulletSection(
    "Logistik",
    logistics.filter((l) => l.text).map((l) => (l.qty ? `${l.text} (${l.qty})` : l.text))
  );

  const docx = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(docx);
  triggerBlobDownload(blob, `${slugify(title)}.docx`);
}
