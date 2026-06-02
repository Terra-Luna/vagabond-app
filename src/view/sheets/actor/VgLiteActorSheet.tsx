const { api, sheets } = foundry.applications;
import ActorDataModel, { BaseActorSchema } from "../../../model/actor/ActorDataModel";
import { VgLiteSheetMixin } from "../VgLiteSheet";

export interface FoundryActor<T extends ActorDataModel<BaseActorSchema>> {
    update: (data: Record<keyof T, any>) => any
    system: T
}

export abstract class VgLiteActorSheet extends VgLiteSheetMixin(sheets.ActorSheetV2) {
    getReactProps() { return { ...super.getReactProps(), actor: this.actor } }

    abstract Component: React.ComponentType<any>;
}