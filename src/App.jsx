import { useEffect, useMemo, useState } from 'react'
import useLocalStorage from './lib/useLocalStorage.js'
import { buildPdf } from './lib/pdf.js'
import { builtInTemplates, cloneTemplateData, defaultSettings, todayStr } from './lib/defaults.js'
import QuotationEditor from './components/QuotationEditor.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import { Btn, Card, inputCls } from './components/ui.jsx'

const freshQuotation = (templateData = builtInTemplates[0].data) => ({
  ref: '',
  date: todayStr(),
  heading: 'QUOTATION',
  to: '',
  ...cloneTemplateData(templateData),
})

export default function App() {
  const [settings, setSettings] = useLocalStorage('aw_settings', defaultSettings)
  const [q, setQ] = useLocalStorage('aw_quotation', freshQuotation())
  const [myTemplates, setMyTemplates] = useLocalStorage('aw_templates', [])
  const [tab, setTab] = useState('quotation') // quotation | settings | preview
  const [pdfUrl, setPdfUrl] = useState('')
  const [error, setError] = useState('')

  const s = { ...defaultSettings, ...settings }
  const allTemplates = useMemo(() => [...builtInTemplates, ...myTemplates], [myTemplates])

  // Rebuild the PDF preview shortly after any change.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const blob = buildPdf(s, q).output('blob')
        setPdfUrl((old) => {
          if (old) URL.revokeObjectURL(old)
          return URL.createObjectURL(blob)
        })
        setError('')
      } catch (e) {
        console.error(e)
        setError('Could not build the PDF: ' + e.message)
      }
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, q])

  const fileName = () => `Quotation-${(q.ref || 'new').replace(/[^\w-]+/g, '_')}-${q.date}.pdf`
  const download = () => buildPdf(s, q).save(fileName())

  const loadTemplate = (id) => {
    const t = allTemplates.find((x) => x.id === id)
    if (!t) return
    if (confirm(`Load "${t.name}"? This replaces the current tables and notes.`)) {
      setQ({ ...q, ...cloneTemplateData(t.data) })
    }
  }
  const saveTemplate = () => {
    const name = prompt('Template name? (e.g. "Main gate 12x8")')
    if (!name) return
    const { tables, notes, area, gst } = q
    setMyTemplates([...myTemplates, { id: 'my-' + Date.now(), name, data: cloneTemplateData({ tables, notes, area, gst }) }])
  }
  const deleteTemplate = (id) => confirm('Delete this template?') && setMyTemplates(myTemplates.filter((t) => t.id !== id))

  const tabBtn = (id, label, extra = '') => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`rounded-md px-4 py-2 text-sm font-medium ${extra} ${tab === id ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
    >
      {label}
    </button>
  )

  const preview = (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Btn variant="primary" onClick={download}>Download PDF</Btn>
        {pdfUrl && <a href={pdfUrl} target="_blank" rel="noreferrer" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Open in new tab</a>}
      </div>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {pdfUrl && <iframe title="PDF preview" src={pdfUrl} className="h-[78vh] w-full rounded-md border border-gray-300 bg-white" />}
      <p className="text-xs text-gray-400">If the preview is blank on your phone, tap "Open in new tab".</p>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1400px] p-3 sm:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-gray-800">Quotation Maker</h1>
        <nav className="flex gap-2">
          {tabBtn('quotation', 'Quotation')}
          {tabBtn('settings', 'Settings')}
          {tabBtn('preview', 'PDF Preview', 'lg:hidden')}
        </nav>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className={tab === 'preview' ? 'hidden lg:block' : ''}>
          {tab === 'settings' ? (
            <SettingsPanel s={s} setS={setSettings} />
          ) : (
            <div className="space-y-4">
              <Card title="Start from a template">
                <div className="flex flex-wrap gap-2">
                  <select id="tpl" className={`${inputCls} flex-1`} defaultValue="" onChange={(e) => { loadTemplate(e.target.value); e.target.value = '' }}>
                    <option value="" disabled>Choose a template...</option>
                    <optgroup label="Built-in">
                      {builtInTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </optgroup>
                    {myTemplates.length > 0 && (
                      <optgroup label="My templates">
                        {myTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </optgroup>
                    )}
                  </select>
                  <Btn onClick={saveTemplate}>Save current as template</Btn>
                </div>
                {myTemplates.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {myTemplates.map((t) => (
                      <span key={t.id} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                        {t.name}
                        <button aria-label={`Delete ${t.name}`} className="text-gray-400 hover:text-red-600" onClick={() => deleteTemplate(t.id)}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
                <Btn className="mt-3" onClick={() => confirm('Clear everything and start a new quotation?') && setQ(freshQuotation(builtInTemplates.at(-1).data))}>
                  New blank quotation
                </Btn>
              </Card>
              <QuotationEditor q={q} setQ={setQ} currency={s.currency} />
            </div>
          )}
        </div>

        <div className={`lg:sticky lg:top-4 lg:self-start ${tab === 'preview' ? '' : 'hidden lg:block'}`}>{preview}</div>
      </div>
    </div>
  )
}
