export const inputCls =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'

export const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
  </label>
)

export const Toggle = ({ checked, onChange, label }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
    <input type="checkbox" className="h-4 w-4 accent-red-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
)

export const Btn = ({ variant = 'light', className = '', ...p }) => {
  const styles = {
    primary: 'bg-red-600 text-white hover:bg-red-700',
    dark: 'bg-gray-800 text-white hover:bg-gray-900',
    light: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
  }
  return <button type="button" className={`rounded-md px-3 py-2 text-sm font-medium ${styles[variant]} ${className}`} {...p} />
}

export const Card = ({ title, children, action }) => (
  <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    {(title || action) && (
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </section>
)
