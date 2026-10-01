import { createContext, useContext } from "react"

export const SpellcastingMenuContext = createContext({
    isSpellcastingOpen: false,
    setIsSpellcastingOpen: (isOpen: boolean) => { },
    onSelectSpell: (id: string) => { },
    selectedSpellId: null as string | null,
    SpellcastingMenu: <></> as any
})

export const useSpellcastingMenuContext = () => useContext(SpellcastingMenuContext)