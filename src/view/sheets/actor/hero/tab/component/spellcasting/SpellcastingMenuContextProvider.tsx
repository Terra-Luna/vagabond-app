import { useSpellCastingMenu } from "./SpellcastingMenu"
import { SpellcastingMenuContext } from "./SpellcastingMenuContext"

export const SpellcastingMenuContextProvider = ({
  actor,
  children,
  imbueMode,
  windowedMode,
  imbueTarget,
  onClose,
}: {
  actor: any
  children: any
  imbueMode?: boolean
  windowedMode?: boolean
  imbueTarget?: { actorId: string; attackId: string }
  onClose?: () => void
}) => {
  const {
    isSpellcastingOpen,
    setIsSpellcastingOpen,
    onSelectSpell,
    selectedSpellId,
    SpellcastingMenu,
  } = useSpellCastingMenu(
    actor,
    imbueMode,
    windowedMode,
    undefined,
    imbueTarget,
    onClose,
  )

  return (
    <SpellcastingMenuContext.Provider
      value={{
        isSpellcastingOpen,
        setIsSpellcastingOpen,
        onSelectSpell,
        selectedSpellId,
        SpellcastingMenu,
      }}
    >
      {children}
    </SpellcastingMenuContext.Provider>
  )
}
