import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../util/lang"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { TravelView } from "./TravelView"

export class TravelApp extends VagabondApplication {
  actor: Actor & { system: HeroDataModel }

  constructor(actor: Actor & { system: HeroDataModel }) {
    super({
      window: { title: appLang.Travel.title, resizable: false },
      position: { width: 940, height: "auto" },
      Component: TravelView,
    } as VagabondAppArgs)
    this.actor = actor
  }

  override getReactProps() {
    return {
      ...super.getReactProps(),
      actor: this.actor,
    }
  }
}
