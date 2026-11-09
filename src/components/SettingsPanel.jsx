import { Btn, Card, Field, Toggle, inputCls } from './ui.jsx'
import SignaturePad from './SignaturePad.jsx'
import { defaultSettings } from '../lib/defaults.js'

export default function SettingsPanel({ s, setS }) {
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value })
  const put = (k, v) => setS({ ...s, [k]: v })
  return (
    <div className="space-y-4">
      <Card title="Company details (top heading of every quotation)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Prop. name"><input className={inputCls} value={s.prop} onChange={set('prop')} /></Field>
          <Field label="Phone number"><input className={inputCls} value={s.phone} onChange={set('phone')} /></Field>
        </div>
        <div className="mt-3 space-y-3">
          <Field label="Company name"><input className={inputCls} value={s.companyName} onChange={set('companyName')} /></Field>
          <Field label="Specialist line"><textarea rows={3} className={inputCls} value={s.specialist} onChange={set('specialist')} /></Field>
          <Field label="Address / location"><textarea rows={2} className={inputCls} value={s.address} onChange={set('address')} /></Field>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Heading colour">
            <input type="color" className="h-10 w-full rounded-md border border-gray-300" value={s.accent} onChange={set('accent')} />
          </Field>
          <Field label="Currency symbol"><input className={inputCls} value={s.currency} onChange={set('currency')} /></Field>
          <Field label="Footer text (optional)"><input className={inputCls} value={s.footerText} onChange={set('footerText')} /></Field>
        </div>
      </Card>

      <Card title="Watermark">
        <Toggle checked={s.watermarkEnabled} onChange={(v) => put('watermarkEnabled', v)} label="Show watermark on PDF" />
        {s.watermarkEnabled && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Watermark text"><input className={inputCls} value={s.watermarkText} onChange={set('watermarkText')} /></Field>
            <Field label={`Strength (${Math.round(s.watermarkOpacity * 100)}%)`}>
              <input type="range" min="0.03" max="0.3" step="0.01" className="w-full accent-red-600" value={s.watermarkOpacity} onChange={(e) => put('watermarkOpacity', Number(e.target.value))} />
            </Field>
          </div>
        )}
      </Card>

      <Card title="Signature (optional)">
        <Toggle checked={s.signatureEnabled} onChange={(v) => put('signatureEnabled', v)} label="Add signature to PDF" />
        {s.signatureEnabled && (
          <div className="mt-3 space-y-3">
            <Field label="Text under the signature line"><input className={inputCls} value={s.signatureLabel} onChange={set('signatureLabel')} /></Field>
            <SignaturePad value={s.signatureImage} onChange={(v) => put('signatureImage', v)} />
          </div>
        )}
      </Card>

      <Btn variant="danger" onClick={() => confirm('Reset all settings to default?') && setS(defaultSettings)}>
        Reset settings to default
      </Btn>
    </div>
  )
}
