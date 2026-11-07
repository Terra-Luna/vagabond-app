import { Book } from "lucide-react"

import { AlchemyCraftingView } from "../../../../../apps/alchemy/AlchemyCraftingView"
import { AlchemySelectionApp } from "../../../../../apps/hero-choices/alchemy/AlchemySelectionApp"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { appLang } from "../../../../../util/lang"
import { UtilityButton } from "../../../../component/Button"

export const AlchemyTab = ({
  actor,
}: {
  actor: Actor & { system: HeroDataModel }
}) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <AlchemyCraftingView actor={actor} />

      {actor.isOwner && (
        <UtilityButton
          onClick={() => new AlchemySelectionApp(actor).render({ force: true })}
        >
          <div className="flex gap-x-1">
            <Book size={18} className="self-center" />
            {appLang.HeroSheet.Alchemy.recipesbtn}
          </div>
        </UtilityButton>
      )}
    </div>
  )
}
