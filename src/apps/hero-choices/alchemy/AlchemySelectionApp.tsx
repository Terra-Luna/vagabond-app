import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { appLang } from "../../../util/lang"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { EditModeContextProvider } from "../../../view/wrappers/EditModeContextProvider"
import { OwnerHeroApplication } from "../../OwnerHeroApplication"
import { VagabondAppArgs } from "../../VagabondApplication"
import { useAlchemySelection } from "./AlchemySelectionUseCase"

export class AlchemySelectionApp extends OwnerHeroApplication {

  actor: Actor & { system: HeroDataModel }
  isLevelUp?: boolean

  constructor(actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean) {
    super({
      window: { title: appLang.HeroChoices.selectAlchemyRecipes },
      position: { width: 400 },
      Component: () => {
        const { AlchemySelectionView } = useAlchemySelection(actor, isLevelUp)
        return (
          <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
            <div className="flex flex-col min-h-0 w-full p-1 mb-4 overflow-y-auto">
              {AlchemySelectionView}
            </div>
          </EditModeContextProvider>
        )
      },
    } as VagabondAppArgs)
    this.actor = actor
    this.isLevelUp = isLevelUp
  }

}
