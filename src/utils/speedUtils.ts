import { appLang } from "./lang"

export interface Speed { value: number, type: string }

export const formatSpeeds = (speeds: Speed[] | undefined | null): string => {
    if (!speeds?.length) return ''
    const base = (speeds.find(s => s.type === 'walk') ?? speeds[0]).value
    const extras = speeds
        .filter(s => s.type !== 'walk')
        .map(s => {
            const name = appLang.Movement[s.type as keyof typeof appLang.Movement] ?? s.type
            return s.value === base ? name : `${name} ${s.value}'`
        })
    
    return extras.length ? `${base}' (${extras.join(', ')})` : `${base}'`
}