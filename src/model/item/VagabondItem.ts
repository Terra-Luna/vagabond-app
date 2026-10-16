
const defaultArtworkByType = {
    alchemical: `/icons/consumables/potions/bottle-conical-corked-purple.webp`,
    ancestry: `icons/svg/mystery-man.svg`,
    armor: `/icons/equipment/chest/breastplate-layered-leather-brown.webp`,
    class: `icons/svg/card-joker.svg`,
    container: `icons/containers/bags/pack-leather-white-tan.webp`,
    feature: `icons/magic/symbols/question-stone-yellow.webp`,
    perk: `/icons/skills/melee/sword-echo-stylized-tan.webp`,
    spell: `icons/magic/symbols/chevron-elipse-circle-blue.webp`,
    startingpack: `/icons/containers/bags/pouch-leather-silver-white.webp`,
    weapon: `icons/weapons/daggers/dagger-black.webp`
}


export class VagabondItem<SubType extends Item.SubType = Item.SubType> extends Item<SubType> {

    static override getDefaultArtwork(itemData: any): { img: string, texture: { src: string } } {
        const img = defaultArtworkByType[itemData.type as Item.SubType] ?? (super.getDefaultArtwork(itemData) as any).img
        return { img, texture: { src: img } }
    }

}