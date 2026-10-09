import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication";
import { TravelView } from "./TravelView";

export class TravelApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Travel Info", resizable: true },
            position: { width: 1000, height: 1200, top: 200, left: 400 },
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