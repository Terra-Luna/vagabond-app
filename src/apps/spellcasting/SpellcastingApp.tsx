import { useEffect } from "react"

import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { useSpellCastingMenu } from "../../view/sheets/actor/hero/tab/component/spellcasting/SpellcastingMenu"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"

export class SpellcastingApp extends VagabondApplication {

    actor: (Actor & { system: HeroDataModel }) | undefined

    constructor(actor: (Actor & { system: HeroDataModel }) | undefined, imbueMode?: boolean) {
        if (!actor) return
        
        const AppView = () => {
            const { setIsSpellcastingOpen, SpellcastingMenu } = useSpellCastingMenu(actor, imbueMode, () => this.close())
            
            useEffect(() => setIsSpellcastingOpen(true), [])
            
            return <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                <SpellcastingMenu />
            </EditModeContextProvider>
        }

        super({
            window: { title: "Spellcasting" },
            position: { width: 300 },
            Component: AppView,
        } as VagabondAppArgs)

        this.actor = actor
    }

}