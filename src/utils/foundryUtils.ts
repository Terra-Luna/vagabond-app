export const getTheme = () => (game.settings as any).get("core", "uiConfig").colorScheme.applications

export const sys_id = "vagabond-app" as any

/**
 * Triggers Dice-so-Nice 3D rolls without a chat message.
 * @param rolls 
 */
export const roll3dDice = (rolls: any[]) => {
    if ((game as any).dice3d) {
        rolls.forEach(roll => {
            (game as any).dice3d.showForRoll(roll, game.user, true)
        })
    }
}

export interface FloatingTextOptions {
    color?: string | number
    isHealing?: boolean
}

/**
 * Displays floating / scrolling damage or healing numbers over tokens on canvas.
 * @param target
 * @param amount
 * @param options
 */
export const showFloatingText = (
    target: any,
    amount: number | string,
    options: FloatingTextOptions = {}
) => {
    if (amount === undefined || amount === null || amount === 0 || amount === "0") return

    const tokens: any[] = []

    if (target) {
        if (typeof target === 'string') {
            const token = canvas?.tokens?.get(target)
            if (token) {
                tokens.push(token)
            }
            else {
                const actor = game.actors?.get(target)
                if (actor) tokens.push(...actor.getActiveTokens())
            }
        }
        else if (target.center || typeof target._displayScrollingText === 'function') {
            tokens.push(target)
        }
        else if (target.object?.center) {
            tokens.push(target.object)
        }
        else if (typeof target.getActiveTokens === 'function') {
            tokens.push(...target.getActiveTokens())
        }
        else if (target.token) {
            const tokenObj = target.token.object ?? (canvas?.tokens?.get(target.token.id ?? target.tokenId))
            if (tokenObj) {
                tokens.push(tokenObj)
            }
            else if (target.token.actor) {
                tokens.push(...target.token.actor.getActiveTokens())
            }
        }
        else if (target.actor) {
            if (typeof target.actor.getActiveTokens === 'function') {
                tokens.push(...target.actor.getActiveTokens())
            }
        }
    }

    if (!tokens.length) return

    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount)
    const isHealing = options.isHealing ?? (numAmount > 0)

    // Format display string
    let text = ""
    if (typeof amount === 'number') {
        const absVal = Math.abs(amount)
        text = isHealing ? `+${absVal}` : `-${absVal}`
    }
    else {
        text = amount
    }

    const fill = options.color ?? (isHealing ? "text-ic-luck" : "text-destructive-action")

    const anchorPoints = (game as any).CONST?.TEXT_ANCHOR_POINTS
    const scrollOptions = {
        anchor: anchorPoints?.CENTER ?? 1,
        direction: isHealing ? (anchorPoints?.BOTTOM ?? 1) : (anchorPoints?.TOP ?? 2),
        duration: 2000,
        jitter: 0.25,
        fill,
        fontSize: 32,
        stroke: 0x000000,
        strokeThickness: 4
    }

    tokens.forEach(token => {
        if (!token) return

        if (typeof token._displayScrollingText === 'function') {
            token._displayScrollingText(text, scrollOptions)
        }
        else if ((canvas as any)?.interface?.createScrollingText && token.center) {
            (canvas as any).interface.createScrollingText(token.center, text, scrollOptions)
        }
    })

}