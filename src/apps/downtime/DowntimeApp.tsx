import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication";
import { DowntimeView } from "./DowntimeView";

export class DowntimeApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Downtime", resizable: true },
            position: { width: 1000, height: 1200, top: 200, left: 400 },
            Component: DowntimeView
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