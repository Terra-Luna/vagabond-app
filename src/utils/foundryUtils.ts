export const getTheme = () => (game.settings as any).get("core", "uiConfig").colorScheme.applications

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