import { createContext, useContext } from "react"

export const SpellcastingMenuContext = createContext({
    isSpellcastingOpen: false,
    setIsSpellcastingOpen: (isOpen: boolean) => { },
    onSelectSpell: (id: string) => { },
    SpellcastingMenu: <></> as any
})

export const useSpellcastingMenuContext = () => useContext(SpellcastingMenuContext)