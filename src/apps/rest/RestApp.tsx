import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { removeStackableItemFromHero, subtractCoinsFromHero } from "../../utils/heroInventoryUtil";
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication";
import { LodgingTypes } from "./RestUtils";
import { RestView } from "./RestView";

export class RestApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Rest & Recovery", resizable: false },
            position: { width: 800, height: 332, top: 200, left: 400 },
            Component: RestView
        } as VagabondAppArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor,
            onCancel: this.onCancel,
            rest: this.rest,
            breather: this.breather
        }
    }

    onCancel = () => {
        this.close()
    }

    rest = async (lodging?: keyof typeof LodgingTypes, ration?: any) => {
        if (lodging) {
            await subtractCoinsFromHero(this.actor.system, { g: 0, c: 0, s: LodgingTypes[lodging] })
        }
        if (ration) {
            await removeStackableItemFromHero(this.actor.system, ration)
        }

        await this.actor.system.rest()
    }

    breather = async (ration?: any) => {
        if (ration) {
            await removeStackableItemFromHero(this.actor.system, ration)
        }

        await this.actor.system.breather()
    }
}