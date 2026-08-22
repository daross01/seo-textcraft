export type CsvRow = { key: string; text: string };

export type CollectionContent = {
  title: string;
  card_title: string;
  subtitle: string;
  intro: string;
  images: Array<{ image_number: number; text: string }>;
  conclusion: string;
  seo_title: string;
  seo_description: string;
};

/** Keys are ALWAYS built in code, never by the AI. */
export function buildRows(content: CollectionContent, imageCount: number): CsvRow[] {
  const byNumber = new Map(content.images.map((i) => [i.image_number, i.text]));
  const rows: CsvRow[] = [
    { key: "title", text: content.title ?? "" },
    { key: "card_title", text: content.card_title ?? "" },
    { key: "subtitle", text: content.subtitle ?? "" },
    { key: "intro", text: content.intro ?? "" },
  ];
  for (let n = 1; n <= imageCount; n++) {
    rows.push({ key: `image_${n}`, text: byNumber.get(n) ?? "" });
  }
  rows.push({ key: "conclusion", text: content.conclusion ?? "" });
  rows.push({ key: "seo_title", text: content.seo_title ?? "" });
  rows.push({ key: "seo_description", text: content.seo_description ?? "" });
  return rows;
}

function escapeCell(value: string) {
  const v = value ?? "";
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function rowsToCsv(rows: CsvRow[]): string {
  const lines = ["key,text", ...rows.map((r) => `${escapeCell(r.key)},${escapeCell(r.text)}`)];
  return lines.join("\r\n");
}

export function downloadCsv(rows: CsvRow[], filename = "wallpaper-content.csv") {
  const blob = new Blob(["\uFEFF" + rowsToCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Generic table export: explicit header row + data rows, same escaping rules. */
export function tableToCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((cells) => cells.map(escapeCell).join(","));
  return lines.join("\r\n");
}

export function downloadCsvTable(headers: string[], rows: string[][], filename: string) {
  const blob = new Blob(["\uFEFF" + tableToCsv(headers, rows)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
