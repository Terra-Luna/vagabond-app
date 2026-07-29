import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { VagabondLiteAppArgs, VagabondLiteApplication } from "../VagabondLiteApplication";
import { SpellSelectionView } from "./SpellSelectionView";

export class SpellSelectionApp extends VagabondLiteApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Grants & Modifiers" },
            position: { width: 400 },
            Component: SpellSelectionView,
        } as VagabondLiteAppArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor
        }
    }

}