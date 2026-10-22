import { getAttackRegistry } from "../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { sys_id } from "../../../utils/foundryUtils"

type Listener = () => void
type Entry = { id: string }

interface Subscription {
    actorId: string
    attackId: string
    lastJson: string
    listeners: Set<Listener>
}

const subscriptions = new Map<string, Subscription>()
let hook: number | null = null

const keyOf = (actorId: string, attackId: string) => `${actorId}:${attackId}`

const findEntryJson = (registry: Record<string, Entry[]>, actorId: string, attackId: string): string => {
    const entry = registry[actorId]?.find(atk => atk.id === attackId)
    return entry ? JSON.stringify(entry) : ""
}

/**
 * One shared updateSetting hook serves every mounted chat card. It parses the
 * incoming registry once and only notifies cards whose own attack changed.
 */
const onUpdateSetting = (settingDoc: any, changes: any) => {
    if (settingDoc.key !== `${sys_id}.attackRegistry`) return

    let registry: Record<string, Entry[]>
    try {
        registry = typeof changes.value === "string"
            ? JSON.parse(changes.value)
            : (changes.value || {})
    }
    catch {
        registry = getAttackRegistry()
    }

    subscriptions.forEach(sub => {
        const json = findEntryJson(registry, sub.actorId, sub.attackId)
        if (!json || json === sub.lastJson) return
        sub.lastJson = json
        sub.listeners.forEach(listener => listener())
    })
}

export const subscribeToAttack = (actorId: string, attackId: string, listener: Listener): (() => void) => {
    const key = keyOf(actorId, attackId)
    let sub = subscriptions.get(key)
    if (!sub) {
        sub = {
            actorId,
            attackId,
            lastJson: findEntryJson(getAttackRegistry(), actorId, attackId),
            listeners: new Set(),
        }
        subscriptions.set(key, sub)
    }

    sub.listeners.add(listener)

    if (hook === null) hook = Hooks.on("updateSetting", onUpdateSetting)

    return () => {
        const current = subscriptions.get(key)
        if (!current) return
        
        current.listeners.delete(listener)
        if (current.listeners.size === 0) subscriptions.delete(key)
        if (subscriptions.size === 0 && hook !== null) {
            Hooks.off("updateSetting", hook)
            hook = null
        }
    }
}
