type Listener = () => void

const listeners = new Map<string, Set<Listener>>()
let hook: number | null = null

const onUpdateChatMessage = (msg: any) => {
    const set = listeners.get(msg?.id)
    if (set) set.forEach(listener => listener())
}

export const subscribeToChatMessage = (messageId: string, listener: Listener): (() => void) => {
    let set = listeners.get(messageId)
    if (!set) {
        set = new Set()
        listeners.set(messageId, set)
    }

    set.add(listener)

    if (hook === null) hook = Hooks.on("updateChatMessage", onUpdateChatMessage)

    return () => {
        const current = listeners.get(messageId)
        if (!current) return
        current.delete(listener)
        if (current.size === 0) listeners.delete(messageId)
        if (listeners.size === 0 && hook !== null) {
            Hooks.off("updateChatMessage", hook)
            hook = null
        }
    }
}
