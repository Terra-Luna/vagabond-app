import { HeroDataModel } from "../model/actor/HeroDataModel"
import { appLang } from "../util/lang"
import { VagabondApplication } from "./VagabondApplication"

export abstract class OwnerHeroApplication extends VagabondApplication {

  abstract actor: Actor & { system: HeroDataModel }

  protected override _canRender(options: any): false | void {
    if (!this.actor.isOwner) {
      ui.notifications?.warn(appLang.HeroChoices.ownerRequired)
      this.releaseRegistration()
      return false
    }
    return super._canRender(options)
  }

}
