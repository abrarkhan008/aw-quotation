import { useEffect, useState } from 'react'

// Works like useState, but saves to the browser so data stays after refresh.
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage full */ }
  }, [key, value])
  return [value, setValue]
}
