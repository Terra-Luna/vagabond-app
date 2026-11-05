import { useState } from "react"

/** Tracks whether an async action is in flight, so buttons can disable themselves. */
export const useBusy = () => {
  const [busy, setBusy] = useState(false)
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await fn()
    }
    finally {
      setBusy(false)
    }
  }
  return { busy, run }
}
