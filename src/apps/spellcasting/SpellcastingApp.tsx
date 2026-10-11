import { useEffect } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../utils/lang"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { ManaHUD } from "../../view/sheets/actor/hero/tab/component/spellcasting/ManaHUD"
import { useSpellcastingMenuContext } from "../../view/sheets/actor/hero/tab/component/spellcasting/SpellcastingMenuContext"
import { SpellcastingMenuContextProvider } from "../../view/sheets/actor/hero/tab/component/spellcasting/SpellcastingMenuContextProvider"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"

export class SpellcastingApp extends VagabondApplication {

    actor: (Actor & { system: HeroDataModel }) | undefined

    constructor(actor: (Actor & { system: HeroDataModel }) | undefined, imbueMode?: boolean, windowedMode?: boolean) {
        if (!actor) return
        
        const RenderOpened = () => {
            const { setIsSpellcastingOpen } = useSpellcastingMenuContext()
            useEffect(() => { setIsSpellcastingOpen(true) }, [])
            return <ManaHUD hero={actor.system} hideTab={true} />
        }

        const AppView = () => {            
            return <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                <SpellcastingMenuContextProvider actor={actor} imbueMode={imbueMode} windowedMode={windowedMode}>
                    <RenderOpened />
                </SpellcastingMenuContextProvider>
            </EditModeContextProvider>
        }

        super({
            window: { title: `${appLang.Spellcasting.title}: ${actor.name} (${(actor.system?.class as any)?.parent?.name})` },
            position: { width: 360 },
            Component: AppView,
        } as VagabondAppArgs)

        this.actor = actor
    }

}