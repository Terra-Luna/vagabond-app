import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication";
import { LodgingTypes, RestView } from "./RestView";

export class RestApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Rest & Recovery" },
            position: { width: 400, height: "auto", top: 200, left: 400 },
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

    rest = async (lodging: keyof typeof LodgingTypes) => {
        this.close()
    }

    breather = async () => {
        this.close()
    }

}