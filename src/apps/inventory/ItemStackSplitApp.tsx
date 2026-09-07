import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel";
import { sys_id } from "../../utils/foundryUtils";
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication";
import { ItemStackSplitView } from "./ItemStackSplitView";

export class ItemStackSplitApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }
    item: Item & { system: EquipmentDataModel<EquipmentSchema> }
    
    constructor(actor: Actor & { system: HeroDataModel }, item: Item & { system: EquipmentDataModel<EquipmentSchema> }) {
        super({
            window: { title: "Split Item Stack" },
            position: { width: 400, height: "auto", top: 200, left: 400 },
            Component: ItemStackSplitView
        } as VagabondAppArgs)
        this.actor = actor
        this.item = item
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            item: this.item,
            onCancel: this.onCancel,
            onSave: this.onSave
        }
    }

    onCancel = () => {
        this.close()
    }

    onSave = async (value: number, remainder: number) => {
        // Update existing stack
        await this.item.update({ 'system.bulk.quantity': value } as Record<string, number>)
        await this.item.setFlag(sys_id, "item-stack-id", foundry.utils.randomID())

        // Update new stack
        const newStack = this.item.toObject()
        newStack.system.bulk.quantity = remainder
        newStack.flags[sys_id] = { "item-stack-id": foundry.utils.randomID() }

        await this.actor.createEmbeddedDocuments("Item", [newStack])
        this.close()
    }

}