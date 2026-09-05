/* eslint-disable react-refresh/only-export-components */
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { Coins } from "../../model/common/CoinValue"
import { ClassDataModel } from "../../model/item/character/ClassDataModel"
import { stackStackables } from "../../utils/heroInventoryUtil"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { useItemShopView } from "./ItemShopView"

export class ItemShopApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }
    
    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Item Shop" },
            position: { height: 800, width: 600 },
            Component: ItemShopComponent
        } as VagabondAppArgs)
        
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor,
            onClose: () => this.onCancel()
        }
    }

    private onCancel() {
        this.close()
    }
}

const ItemShopComponent = ({ actor, onClose }) => {
    const { ItemShopView, wallet, cart } = useItemShopView(
        actor.system.inventory.coins,
        actor.items.find(it => (it.type as string) === 'class') as Item & { system: ClassDataModel }
    )

    const onCheckout = async () => {
        await actor.update({ 'system.inventory.coins': wallet } as Record<string, Coins>)
        await actor.createEmbeddedDocuments("Item", cart)
        await stackStackables(actor.system)
        onClose()
    }

    return <ItemShopView onCheckout={onCheckout} onCancel={onClose} useCheckout />
}