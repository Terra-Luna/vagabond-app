
import { useSpellCastingMenu } from "./SpellcastingMenu"
import { SpellcastingMenuContext } from "./SpellcastingMenuContext"

export const SpellcastingMenuContextProvider = ({ actor, children, imbueMode, windowedMode }: { actor: any, children: any, imbueMode?: boolean, windowedMode?: boolean }) => {

    const {isSpellcastingOpen, setIsSpellcastingOpen, onSelectSpell, selectedSpellId, SpellcastingMenu } = useSpellCastingMenu(actor, imbueMode, windowedMode)

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