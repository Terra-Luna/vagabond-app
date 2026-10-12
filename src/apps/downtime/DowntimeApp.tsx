import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { appLang } from "../../utils/lang"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication";
import { DowntimeView } from "./DowntimeView";

const locale = appLang.Downtime

export class DowntimeApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: locale.title, resizable: true },
            position: { width: 1000, height: 1200 },
            enforceSingleInstancePerActor: true,
            actorId: actor.id,
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