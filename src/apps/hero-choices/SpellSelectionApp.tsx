import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { useSpellSelectionView } from "./SpellSelectionView"

export class SpellSelectionApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }
    isLevelUp?: boolean

    constructor(actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean) {
        super({
            window: { title: "Grants & Modifiers" },
            position: { width: 400 },
            Component: () => {
                const { SpellSelection } = useSpellSelectionView(actor, isLevelUp)
                return (
                    <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                        <div className="flex flex-col min-h-0 w-full p-1 mb-4 overflow-y-auto">
                            {SpellSelection}
                        </div>
                    </EditModeContextProvider>
                )
            }
        } as VagabondAppArgs)
        this.actor = actor
        this.isLevelUp = isLevelUp
    }

}