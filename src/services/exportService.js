const PDF_PAGE_WIDTH = 612;
const PDF_PAGE_HEIGHT = 792;
const PDF_MARGIN = 40;
const PDF_FONT_SIZE = 8;
const PDF_LINE_HEIGHT = 12;
const PDF_LINES_PER_PAGE = Math.floor(
  (PDF_PAGE_HEIGHT - PDF_MARGIN * 2) / PDF_LINE_HEIGHT,
);

const PDF_COLUMNS = [
  { header: "Date", width: 12 },
  { header: "Start", width: 7 },
  { header: "End", width: 7 },
  { header: "Court", width: 16 },
  { header: "Player", width: 22 },
  { header: "Total", width: 10 },
  { header: "Deposit", width: 10 },
  { header: "Status", width: 12 },
];

const CSV_HEADERS = [
  "Date",
  "Start Time",
  "End Time",
  "Court",
  "Player",
  "Total Amount",
  "Deposit Amount",
  "Status",
];

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

const escapeCsvValue = (value) => {
  const stringValue =
    value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const bookingToRow = (booking) => [
  formatDate(booking.date),
  booking.startTime,
  booking.endTime,
  booking.court?.name || "",
  booking.player?.name || "",
  booking.totalAmount,
  booking.depositAmount,
  booking.status,
];

export const generateCsv = (bookings) => {
  const rows = [CSV_HEADERS, ...bookings.map(bookingToRow)];
  const csvBody = rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");
  return `﻿${csvBody}`;
};

const truncate = (text, maxLength) => {
  const stringValue = String(text ?? "");
  return stringValue.length > maxLength
    ? stringValue.slice(0, maxLength)
    : stringValue;
};

const formatRowLine = (values) =>
  PDF_COLUMNS.map((column, index) =>
    truncate(values[index], column.width).padEnd(column.width),
  ).join(" ");

const bookingToPdfRow = (booking) =>
  formatRowLine([
    formatDate(booking.date),
    booking.startTime,
    booking.endTime,
    booking.court?.name || "",
    booking.player?.name || "",
    String(booking.totalAmount),
    String(booking.depositAmount),
    booking.status,
  ]);

const escapePdfText = (text) =>
  String(text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const buildContentStream = (lines) => {
  const startY = PDF_PAGE_HEIGHT - PDF_MARGIN;
  let stream = `BT /F1 ${PDF_FONT_SIZE} Tf ${PDF_LINE_HEIGHT} TL ${PDF_MARGIN} ${startY} Td\n`;
  lines.forEach((line, index) => {
    if (index > 0) stream += "T*\n";
    stream += `(${escapePdfText(line)}) Tj\n`;
  });
  stream += "ET";
  return stream;
};

const assemblePdf = (objects) => {
  const totalObjects = objects.length;
  const chunks = [Buffer.from("%PDF-1.4\n", "latin1")];
  const offsets = new Array(totalObjects).fill(0);
  let offset = chunks[0].length;

  for (let num = 1; num < totalObjects; num++) {
    const obj = objects[num];
    if (obj === undefined) continue;
    offsets[num] = offset;

    let body;
    if (typeof obj === "object" && obj.stream !== undefined) {
      const streamBuffer = Buffer.from(obj.stream, "latin1");
      body = Buffer.concat([
        Buffer.from(
          `${num} 0 obj\n<< /Length ${streamBuffer.length} >>\nstream\n`,
          "latin1",
        ),
        streamBuffer,
        Buffer.from("\nendstream\nendobj\n", "latin1"),
      ]);
    } else {
      body = Buffer.from(`${num} 0 obj\n${obj}\nendobj\n`, "latin1");
    }

    chunks.push(body);
    offset += body.length;
  }

  const xrefOffset = offset;
  let xref = `xref\n0 ${totalObjects}\n0000000000 65535 f \n`;
  for (let num = 1; num < totalObjects; num++) {
    xref += `${String(offsets[num]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  chunks.push(Buffer.from(xref + trailer, "latin1"));
  return Buffer.concat(chunks);
};

const buildPdfDocument = (lines) => {
  const pageChunks = [];
  for (let i = 0; i < lines.length; i += PDF_LINES_PER_PAGE) {
    pageChunks.push(lines.slice(i, i + PDF_LINES_PER_PAGE));
  }
  if (pageChunks.length === 0) pageChunks.push([]);

  const pageCount = pageChunks.length;
  const fontObjNum = 3 + pageCount * 2;
  const objects = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";

  const kids = [];
  for (let i = 0; i < pageCount; i++) kids.push(`${3 + i * 2} 0 R`);
  objects[2] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pageCount} >>`;

  pageChunks.forEach((chunk, i) => {
    const pageNum = 3 + i * 2;
    const contentNum = pageNum + 1;
    objects[pageNum] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentNum} 0 R >>`;
    objects[contentNum] = { stream: buildContentStream(chunk) };
  });

  objects[fontObjNum] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>";

  return assemblePdf(objects);
};

export const generatePdf = (bookings, filters = {}) => {
  const lines = [];
  lines.push("PadelTime - Bookings Report");
  lines.push(`Generated: ${new Date().toISOString()}`);
  if (filters.startDate || filters.endDate) {
    lines.push(
      `Date range: ${filters.startDate || "-"} to ${filters.endDate || "-"}`,
    );
  }
  if (filters.status) lines.push(`Status: ${filters.status}`);
  lines.push("");
  lines.push(formatRowLine(PDF_COLUMNS.map((column) => column.header)));
  lines.push(
    "-".repeat(PDF_COLUMNS.reduce((sum, column) => sum + column.width + 1, -1)),
  );

  if (bookings.length === 0) {
    lines.push("No bookings found for the selected filters.");
  } else {
    bookings.forEach((booking) => lines.push(bookingToPdfRow(booking)));
  }

  return buildPdfDocument(lines);
};
