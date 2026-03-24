import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: cancel the timer if value changes before delay expires
    // This is what makes it a "debounce" — resets on every keystroke
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}