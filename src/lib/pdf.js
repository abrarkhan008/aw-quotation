import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const hexToRgb = (hex) => {
  const h = (hex || '#000000').replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export const money = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function calcTotals(q) {
  const tableTotals = q.tables.map((t) =>
    t.showRate ? t.rows.reduce((s, r) => s + Number(r.qty || 0) * Number(r.rate || 0), 0) : 0
  )
  const area = q.area?.enabled ? Number(q.area.w || 0) * Number(q.area.h || 0) : 0
  const areaAmount = q.area?.enabled ? area * Number(q.area.rate || 0) : 0
  const subtotal = tableTotals.reduce((a, b) => a + b, 0) + areaAmount
  const gstAmount = (subtotal * Number(q.gst || 0)) / 100
  return { tableTotals, area, areaAmount, subtotal, gstAmount, grand: subtotal + gstAmount }
}

export function buildPdf(s, q) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const H = 297
  const M = 14
  const accent = hexToRgb(s.accent)
  const cur = s.currency || 'Rs.'
  const totals = calcTotals(q)
  let y = 16

  // ---------- HEADER ----------
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...accent)
  if (s.prop) doc.text(`PROP: ${s.prop}`, M, y)
  if (s.phone) doc.text(`CALL : ${s.phone}`, W - M, y, { align: 'right' })

  y += 16
  doc.setFont('times', 'bold')
  doc.setFontSize(27)
  doc.text(s.companyName || '', W / 2, y, { align: 'center' })

  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(20, 20, 20)
  const spec = doc.splitTextToSize(s.specialist || '', W - 2 * M - 10)
  doc.text(spec, W / 2, y, { align: 'center' })
  y += spec.length * 3.8 + 1

  if (s.address) {
    doc.setFontSize(8.5)
    const addr = doc.splitTextToSize(s.address, W - 2 * M - 10)
    const boxH = addr.length * 4 + 3
    doc.setDrawColor(30)
    doc.setLineWidth(0.4)
    doc.rect(M, y, W - 2 * M, boxH)
    doc.text(addr, W / 2, y + 5, { align: 'center' })
    y += boxH + 8
  }

  // ---------- REF / DATE / TO ----------
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  if (q.ref) doc.text(`Ref: ${q.ref}`, M, y)
  if (q.date) doc.text(`Date: ${q.date}`, W - M, y, { align: 'right' })
  y += 6
  if (q.to) {
    doc.setFont('helvetica', 'normal')
    const toLines = doc.splitTextToSize(`To: ${q.to}`, W - 2 * M)
    doc.text(toLines, M, y)
    y += toLines.length * 5
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(q.heading || 'QUOTATION', W / 2, y + 3, { align: 'center' })
  y += 8

  // ---------- TABLES ----------
  q.tables.forEach((t, ti) => {
    if (t.title) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...accent)
      doc.text(t.title, M, y + 2)
      y += 4
    }
    const head = t.showRate
      ? [['SL NO', 'DESCRIPTION', 'SIZE', 'QTY', `RATE (${cur})`, `AMOUNT (${cur})`]]
      : [['SL NO', 'DESCRIPTION', 'SIZE']]
    const body = t.rows.map((r, i) =>
      t.showRate
        ? [i + 1, r.desc, r.size, r.qty, money(r.rate), money(Number(r.qty || 0) * Number(r.rate || 0))]
        : [i + 1, r.desc, r.size]
    )
    const foot = t.showRate
      ? [[{ content: 'TOTAL', colSpan: 5, styles: { halign: 'right' } }, money(totals.tableTotals[ti])]]
      : undefined
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head,
      body,
      foot,
      theme: 'grid',
      showFoot: 'lastPage',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 40, lineWidth: 0.25 },
      headStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold', halign: 'center' },
      footStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' },
      columnStyles: t.showRate
        ? { 0: { halign: 'center', cellWidth: 16 }, 3: { halign: 'center', cellWidth: 16 }, 4: { halign: 'right', cellWidth: 28 }, 5: { halign: 'right', cellWidth: 30 } }
        : { 0: { halign: 'center', cellWidth: 20 }, 2: { cellWidth: 70 } },
    })
    y = doc.lastAutoTable.finalY + 8
  })

  // ---------- AREA CALC ----------
  if (q.area?.enabled) {
    if (y > H - 50) { doc.addPage(); y = 20 }
    const a = q.area
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.text(
      `${a.label || 'Area'}: ${a.w} x ${a.h} = ${totals.area} ${a.unit}` +
        (Number(a.rate) ? `   @ ${cur} ${money(a.rate)} per ${a.unit} = ${cur} ${money(totals.areaAmount)}` : ''),
      M, y
    )
    y += 8
  }

  // ---------- SUMMARY ----------
  if (totals.subtotal > 0) {
    if (y > H - 60) { doc.addPage(); y = 20 }
    const rows = [['Sub Total', `${cur} ${money(totals.subtotal)}`]]
    if (Number(q.gst)) {
      rows.push([`GST @ ${q.gst}%`, `${cur} ${money(totals.gstAmount)}`])
      rows.push(['Grand Total', `${cur} ${money(totals.grand)}`])
    }
    autoTable(doc, {
      startY: y,
      margin: { left: W - M - 85, right: M },
      body: rows,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2, lineColor: 40, lineWidth: 0.25, textColor: 0, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' } },
    })
    y = doc.lastAutoTable.finalY + 8
  }

  // ---------- NOTES ----------
  const notes = (q.notes || []).filter((n) => n.trim())
  if (notes.length) {
    if (y > H - 50) { doc.addPage(); y = 20 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(0)
    doc.text('NOTE:', M, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    notes.forEach((n, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${n}`, W - 2 * M)
      if (y + lines.length * 4.5 > H - 30) { doc.addPage(); y = 20 }
      doc.text(lines, M, y)
      y += lines.length * 4.5 + 1
    })
    y += 4
  }

  // ---------- SIGNATURE (optional) ----------
  if (s.signatureEnabled) {
    if (y + 38 > H - 14) { doc.addPage(); y = 20 }
    const sy = y + 26
    const x = W - M - 60
    if (s.signatureImage) {
      try {
        const fmt = s.signatureImage.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG'
        doc.addImage(s.signatureImage, fmt, x + 5, sy - 22, 50, 20)
      } catch { /* bad image, skip */ }
    }
    doc.setDrawColor(40)
    doc.setLineWidth(0.3)
    doc.line(x, sy, x + 60, sy)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(0)
    doc.text(s.signatureLabel || 'Authorised Signature', x + 30, sy + 5, { align: 'center' })
    if (s.companyName) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text(`For ${s.companyName}`, x + 30, sy + 10, { align: 'center' })
    }
  }

  // ---------- WATERMARK + FOOTER on every page ----------
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    if (s.watermarkEnabled && s.watermarkText) {
      doc.saveGraphicsState()
      doc.setGState(new doc.GState({ opacity: Number(s.watermarkOpacity) || 0.08 }))
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(44)
      doc.setTextColor(...accent)
      doc.text(s.watermarkText, W / 2, H / 2, { align: 'center', angle: 45 })
      doc.restoreGraphicsState()
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120)
    if (s.footerText) doc.text(s.footerText, W / 2, H - 8, { align: 'center' })
    if (pages > 1) doc.text(`Page ${i} of ${pages}`, W - M, H - 8, { align: 'right' })
  }

  return doc
}
