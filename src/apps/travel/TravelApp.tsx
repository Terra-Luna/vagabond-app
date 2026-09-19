import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication";
import { TravelView } from "./TravelView";

export class TravelApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Travel Info", resizable: false },
            position: { width: 800, height: 332, top: 200, left: 400 },
            Component: TravelView
        } as VagabondAppArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor,
        }
    }

    onCancel = () => {
        this.close()
    }
}