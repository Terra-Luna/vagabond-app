import { useEffect, useState } from "react"

const pad = (n: number) => String(n).padStart(2, "0")

const formatTimer = (totalSeconds: number): string => {
    const s = Math.max(0, Math.floor(totalSeconds))
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

/**
 * Displays a time as HH:MM:SS. While `running`, it re-renders every second and
 * asks `getSeconds` for the current value (given the current epoch ms).
 */
export const Timer = ({ getSeconds, running = false, className = "" }: {
    getSeconds: (now: number) => number
    running?: boolean
    className?: string
}) => {
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        if (!running) return
        setNow(Date.now())
        const id = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(id)
    }, [running])

    return <span className={`text-text-secondary font-eskapade font-regular ${className}`}>{formatTimer(getSeconds(now))}</span>
}
