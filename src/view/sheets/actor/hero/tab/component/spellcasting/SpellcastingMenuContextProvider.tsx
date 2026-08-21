import { useCallback, useState } from "react"
import { SpellcastingMenuContext } from "./SpellcastingMenuContext"
import { useSpellCastingMenu } from "./SpellcastingMenu"

export const SpellcastingMenuContextProvider = ({ actor, children }) => {

    const {isSpellcastingOpen, setIsSpellcastingOpen, onSelectSpell, SpellcastingMenu } = useSpellCastingMenu(actor)

    return (
        <SpellcastingMenuContext.Provider value={{
            isSpellcastingOpen,
            setIsSpellcastingOpen,
            onSelectSpell,
            SpellcastingMenu
        }}>
            {children}
        </SpellcastingMenuContext.Provider>
    )
}