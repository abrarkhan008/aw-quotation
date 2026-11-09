import { useEffect, useRef } from 'react'
import { Btn } from './ui.jsx'

// Draw a signature with mouse / finger, or upload an image.
export default function SignaturePad({ value, onChange }) {
  const ref = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    if (value) {
      const img = new Image()
      img.onload = () => {
        const r = Math.min(c.width / img.width, c.height / img.height)
        ctx.drawImage(img, 0, 0, img.width * r, img.height * r)
      }
      img.src = value
    }
  }, [value])

  const pos = (e) => {
    const r = ref.current.getBoundingClientRect()
    return { x: ((e.clientX - r.left) * ref.current.width) / r.width, y: ((e.clientY - r.top) * ref.current.height) / r.height }
  }
  const down = (e) => {
    drawing.current = true
    ref.current.setPointerCapture(e.pointerId)
    const ctx = ref.current.getContext('2d')
    const { x, y } = pos(e)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#111'
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  const move = (e) => {
    if (!drawing.current) return
    const ctx = ref.current.getContext('2d')
    const { x, y } = pos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  const up = () => {
    if (!drawing.current) return
    drawing.current = false
    onChange(ref.current.toDataURL('image/png'))
  }
  const upload = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(f)
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={ref}
        width={500}
        height={200}
        className="h-32 w-full touch-none rounded-md border border-dashed border-gray-400 bg-white"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Btn onClick={() => onChange('')}>Clear</Btn>
        <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Upload image
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={upload} />
        </label>
        <span className="text-xs text-gray-400">Draw above, or upload a photo of your signature.</span>
      </div>
    </div>
  )
}
