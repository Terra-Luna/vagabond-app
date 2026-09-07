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

/** Do a setTimeout of 0 an arbitrary number of times. Infinite pain. */
export const waitForFoundryChanges = () => {
    let resolve
    const promise = new Promise((r) => resolve = r)
    setTimeout(() => {
        resolve()
    }, 0)
    return promise
}