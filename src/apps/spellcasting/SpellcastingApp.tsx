import { useEffect, useState } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../util/lang"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { ManaHUD } from "../../view/sheets/actor/hero/tab/component/spellcasting/ManaHUD"
import { useSpellcastingMenuContext } from "../../view/sheets/actor/hero/tab/component/spellcasting/SpellcastingMenuContext"
import { SpellcastingMenuContextProvider } from "../../view/sheets/actor/hero/tab/component/spellcasting/SpellcastingMenuContextProvider"
import { EditModeContextProvider } from "../../view/wrappers/EditModeContextProvider"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"

export class SpellcastingApp extends VagabondApplication {
  actor: (Actor & { system: HeroDataModel }) | undefined

  constructor(
    actor: (Actor & { system: HeroDataModel }) | undefined,
    imbueMode?: boolean,
    windowedMode?: boolean,
    imbueTarget?: { actorId: string; attackId: string },
  ) {
    if (!actor) return

    let closeApp: () => void = () => {}

    const RenderOpened = () => {
      const { setIsSpellcastingOpen } = useSpellcastingMenuContext()
      useEffect(() => {
        setIsSpellcastingOpen(true)
      }, [])

      // Re-render when this changes...
      const [, setActorUpdateTick] = useState(0)
      useEffect(() => {
        const hookId = Hooks.on("updateActor", (updatedActor: any) => {
          if (updatedActor.id === actor.id)
            setActorUpdateTick((prev) => prev + 1)
        })
        return () => Hooks.off("updateActor", hookId)
      }, [])

      return <ManaHUD hero={actor.system} hideTab={true} />
    }

    const SpellcastingMenuView = () => {
      return (
        <div className="">
          <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
            <SpellcastingMenuContextProvider
              actor={actor}
              imbueMode={imbueMode}
              windowedMode={windowedMode}
              imbueTarget={imbueTarget}
              onClose={() => closeApp()}
            >
              <RenderOpened />
            </SpellcastingMenuContextProvider>
          </EditModeContextProvider>
        </div>
      )
    }

    super({
      window: {
        title: `${appLang.Spellcasting.title}: ${actor.name}`,
        resizable: false,
      },
      position: {
        width: 360,
        height: "auto",
      },
      actorId: actor.id ?? undefined,
      enforceSingleInstancePerActor: !imbueTarget,
      enforceSingleInstance: !imbueTarget,
      Component: SpellcastingMenuView,
    } as VagabondAppArgs)

    this.actor = actor
    closeApp = () => {
      this.close()
    }
  }
}
