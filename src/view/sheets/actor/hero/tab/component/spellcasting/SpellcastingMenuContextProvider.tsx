
import { useSpellCastingMenu } from "./SpellcastingMenu"
import { SpellcastingMenuContext } from "./SpellcastingMenuContext"

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