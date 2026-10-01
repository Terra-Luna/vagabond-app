
import { useSpellCastingMenu } from "./SpellcastingMenu"
import { SpellcastingMenuContext } from "./SpellcastingMenuContext"

export const SpellcastingMenuContextProvider = ({ actor, children }) => {

    const {isSpellcastingOpen, setIsSpellcastingOpen, onSelectSpell, selectedSpellId, SpellcastingMenu } = useSpellCastingMenu(actor)

    return (
        <SpellcastingMenuContext.Provider value={{
            isSpellcastingOpen,
            setIsSpellcastingOpen,
            onSelectSpell,
            selectedSpellId,
            SpellcastingMenu
        }}>
            {children}
        </SpellcastingMenuContext.Provider>
    )
}