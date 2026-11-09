import { Btn, Card, Field, Toggle, inputCls } from './ui.jsx'
import { newRow, newTable } from '../lib/defaults.js'
import { calcTotals, money } from '../lib/pdf.js'

const Cell = ({ className = '', ...p }) => <input className={`${inputCls} ${className}`} {...p} />

function TableCard({ t, index, onChange, onRemove, canRemove }) {
  const upRow = (id, k, v) => onChange({ ...t, rows: t.rows.map((r) => (r.id === id ? { ...r, [k]: v } : r)) })
  return (
    <Card
      title={`Table ${index + 1}`}
      action={canRemove && <Btn variant="danger" onClick={onRemove}>Remove table</Btn>}
    >
      <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="Table title (optional, leave empty to hide)">
          <Cell value={t.title} onChange={(e) => onChange({ ...t, title: e.target.value })} placeholder="e.g. Option 1" />
        </Field>
        <Toggle checked={t.showRate} onChange={(v) => onChange({ ...t, showRate: v })} label="Show Qty / Rate / Amount" />
      </div>
      <div className="space-y-2">
        {t.rows.map((r, i) => (
          <div key={r.id} className="flex items-start gap-2">
            <span className="mt-2 w-5 shrink-0 text-center text-xs text-gray-400">{i + 1}</span>
            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-12">
              <Cell className={t.showRate ? 'sm:col-span-4' : 'sm:col-span-6'} placeholder="Description" value={r.desc} onChange={(e) => upRow(r.id, 'desc', e.target.value)} />
              <Cell className={t.showRate ? 'sm:col-span-3' : 'sm:col-span-6'} placeholder="Size" value={r.size} onChange={(e) => upRow(r.id, 'size', e.target.value)} />
              {t.showRate && (
                <>
                  <Cell className="sm:col-span-2" type="number" min="0" placeholder="Qty" value={r.qty} onChange={(e) => upRow(r.id, 'qty', e.target.value)} />
                  <Cell className="sm:col-span-3" type="number" min="0" placeholder="Rate" value={r.rate} onChange={(e) => upRow(r.id, 'rate', e.target.value)} />
                </>
              )}
            </div>
            <button type="button" aria-label="Delete row" className="mt-1 rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" onClick={() => onChange({ ...t, rows: t.rows.filter((x) => x.id !== r.id) })}>✕</button>
          </div>
        ))}
      </div>
      <Btn className="mt-3" onClick={() => onChange({ ...t, rows: [...t.rows, newRow()] })}>+ Add row</Btn>
    </Card>
  )
}

export default function QuotationEditor({ q, setQ, currency }) {
  const set = (k) => (e) => setQ({ ...q, [k]: e.target.value })
  const upTable = (id, nt) => setQ({ ...q, tables: q.tables.map((t) => (t.id === id ? nt : t)) })
  const totals = calcTotals(q)
  const a = q.area
  const upArea = (k, v) => setQ({ ...q, area: { ...a, [k]: v } })

  return (
    <div className="space-y-4">
      <Card title="Quotation details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Ref (customer / site name)"><Cell value={q.ref} onChange={set('ref')} placeholder="e.g. Crystal City" /></Field>
          <Field label="Date"><Cell value={q.date} onChange={set('date')} /></Field>
          <Field label="Heading (centre of page)"><Cell value={q.heading} onChange={set('heading')} placeholder="QUOTATION" /></Field>
          <Field label="To (optional)"><Cell value={q.to} onChange={set('to')} placeholder="Customer name & address" /></Field>
        </div>
      </Card>

      {q.tables.map((t, i) => (
        <TableCard key={t.id} t={t} index={i} canRemove={q.tables.length > 1}
          onChange={(nt) => upTable(t.id, nt)}
          onRemove={() => setQ({ ...q, tables: q.tables.filter((x) => x.id !== t.id) })} />
      ))}
      <Btn variant="dark" onClick={() => setQ({ ...q, tables: [...q.tables, newTable(`Option ${q.tables.length + 1}`, [newRow()])] })}>
        + Add another table
      </Btn>

      <Card title="Area calculator (optional)" action={<Toggle checked={a.enabled} onChange={(v) => upArea('enabled', v)} label="Use" />}>
        {a.enabled ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Width"><Cell type="number" value={a.w} onChange={(e) => upArea('w', e.target.value)} /></Field>
              <Field label="Height"><Cell type="number" value={a.h} onChange={(e) => upArea('h', e.target.value)} /></Field>
              <Field label="Unit"><Cell value={a.unit} onChange={(e) => upArea('unit', e.target.value)} /></Field>
              <Field label={`Rate per ${a.unit || 'unit'}`}><Cell type="number" value={a.rate} onChange={(e) => upArea('rate', e.target.value)} /></Field>
            </div>
            <Field label="Label"><Cell value={a.label} onChange={(e) => upArea('label', e.target.value)} /></Field>
            <p className="text-sm text-gray-600">
              {a.w} x {a.h} = <b>{totals.area} {a.unit}</b>
              {Number(a.rate) > 0 && <> → <b>{currency} {money(totals.areaAmount)}</b></>}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Turn on to calculate area (e.g. 30 x 40 site) x rate automatically.</p>
        )}
      </Card>

      <Card title="Notes">
        <div className="space-y-2">
          {q.notes.map((n, i) => (
            <div key={i} className="flex gap-2">
              <span className="mt-2 w-5 text-center text-xs text-gray-400">{i + 1}</span>
              <textarea rows={2} className={inputCls} value={n} onChange={(e) => setQ({ ...q, notes: q.notes.map((x, j) => (j === i ? e.target.value : x)) })} />
              <button type="button" aria-label="Delete note" className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" onClick={() => setQ({ ...q, notes: q.notes.filter((_, j) => j !== i) })}>✕</button>
            </div>
          ))}
        </div>
        <Btn className="mt-3" onClick={() => setQ({ ...q, notes: [...q.notes, ''] })}>+ Add note</Btn>
        <div className="mt-4 max-w-[10rem]">
          <Field label="GST % (0 = hide)"><Cell type="number" min="0" value={q.gst} onChange={set('gst')} /></Field>
        </div>
      </Card>
    </div>
  )
}
