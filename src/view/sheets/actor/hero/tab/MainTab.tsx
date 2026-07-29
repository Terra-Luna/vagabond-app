import { Shield } from "lucide-react"
import { rollWeaponDamage } from "../../../../../combat/rules/dice-rolls"
import { HeroDataModel, getArmor } from "../../../../../model/actor/HeroDataModel"
import { sortedItems } from "../../../../../model/actor/type/Inventory"
import { ArmorDataModel } from "../../../../../model/item/equip/ArmorDataModel"
import { WeaponDataModel, isEquippedWeapon, gripStateDamage } from "../../../../../model/item/equip/WeaponDataModel"
import { inventoryItemDragDropHandler, weaponContextMenuItems, toggleGripState } from "../../../../../utils/heroInventoryUtil"
import { getId, getTargets } from "../../../../../utils/modelUtil"
import { DamageRollChatCard } from "../../../../chat/DamageRollChatCard"
import { glowOnHover } from "../../../../common/text-styles"
import { useContextMenu } from "../../../../component/ContextMenu"
import { useDragDrop } from "../../../../component/DragDrop"
import { Header, ItemDivider } from "../../../../component/Header"
import { Skill } from "./TopSection"
import { vgLiteLang } from "../../../../../utils/lang"
import { sendVgLiteChatMessage } from "../../../../chat/ChatCardSerializer"


export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="grid @sm:grid-cols-[44%_55%] my-1 gap-x-1">
            <Attacks hero={hero} />
            <div className="space-y-2">
                <Weapons hero={hero} />
                <Armor hero={hero} />
            </div>
        </div>
    )
}

const Attacks = ({ hero }: { hero: HeroDataModel }) => {
    const { melee, brawl, finesse, ranged } = hero.skills
    return (
        <div className="w-full">
            <Header title={vgLiteLang.HeroSheet.attacks} />
            <Skill hero={hero} name={vgLiteLang.Attacks.melee} value={melee.value!} isTrained={melee.isTrained} isAttack={true} />
            <Skill hero={hero} name={vgLiteLang.Attacks.brawl} value={brawl.value!} isTrained={brawl.isTrained} isAttack={true} />
            <Skill hero={hero} name={vgLiteLang.Attacks.finesse} value={finesse.value!} isTrained={finesse.isTrained} isAttack={true} />
            <Skill hero={hero} name={vgLiteLang.Attacks.ranged} value={ranged.value!} isTrained={ranged.isTrained} isAttack={true} />
        </div>
    )
}

const Weapons = ({ hero }: { hero: HeroDataModel }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    const equippedWeapons = sortedItems<WeaponDataModel>(hero.inventory.items.filter(it => isEquippedWeapon(it)) as WeaponDataModel[])
    const gripStyle = "text-text-aux text-lg text-center font-eskapade"
    const dmgStyle = "text-text-dmg font-eskapade font-bold text-xl text-right line-clamp-1 cursor-pointer"
    const propsStyle = "text-text-aux text-sm italic line-clamp-1"
    const { dragItem, targetItem, onDragStart, onDragEnter, onDragEnd } = useDragDrop(
        equippedWeapons,
        () => inventoryItemDragDropHandler(
            hero, dragItem, targetItem ?? equippedWeapons[equippedWeapons.length - 1], equippedWeapons
        )
    )

    return (
        <div className="w-full">
            <Header title={vgLiteLang.HeroSheet.weapons} />
            {
                equippedWeapons?.map((weapon: WeaponDataModel, index: number) => (
                    <div
                        key={getId(weapon)}
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragEnter={(e) => onDragEnter(e, index)}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDragEnd={(e) => onDragEnd(e, index)}
                        onContextMenu={async (e) => onCtxMenu(e, weaponContextMenuItems(hero, weapon))}
                    >
                        <div className="grid grid-cols-[53%_47%] place-content-between -gap-y-1 cursor-grab">
                            <div className={`text-lg line-clamp-1`}>{weapon.parent.name}</div>
                            <div className="flex justify-end">
                                <div className={`${gripStyle} mr-2 ${glowOnHover}`} onClick={() => toggleGripState(hero, weapon)}>{vgLiteLang.GripsAbbr[weapon.grip.state]}</div>
                                <div className="flex content-right">
                                    <div
                                        className={`${dmgStyle} ${glowOnHover}`}
                                        onClick={async () => {
                                            const dmgRoll = await rollWeaponDamage(weapon)
                                            sendVgLiteChatMessage(hero, <DamageRollChatCard
                                                actorId={getId(hero)}
                                                tokenIds={getTargets()}
                                                result={dmgRoll} />, dmgRoll.rolls
                                            )
                                        }}
                                    >
                                        {gripStateDamage(weapon)}
                                    </div>
                                </div>
                            </div>
                            <div className={propsStyle}>{weapon.properties.map(p => vgLiteLang.WeaponProps[p].name).join(", ")}</div>
                            <div className={propsStyle + " text-right mr-1"}>{vgLiteLang.Ranges[weapon.range]}</div>
                        </div>
                        <ItemDivider />
                    </div>
                ))
            }
            <ContextMenu />
        </div>
    )
}

const Armor = ({ hero }: { hero: HeroDataModel }) => {
    const armor = getArmor(hero) as any as ArmorDataModel
    const propsStyle = "text-text-aux text-sm italic line-clamp-1"
    return (
        <div className="w-full">
            <Header title={vgLiteLang.HeroSheet.armor} />
            <div className="grid grid-cols-[55%_45%] place-content-between -gap-y-1">
                <div className="text-lg line-clamp-1">{armor?.parent.name ?? '-'}</div>
                <div className="flex justify-end items-center">
                    <Shield className="mr-1" size={18} />
                    <div className="line-clamp-1 text-lg text-right mr-1">{armor?.rating ?? '-'}</div>
                </div>
                <div className={propsStyle}>{vgLiteLang.EquipmentCategories[armor?.category] ?? '-'}</div>
                <div className={propsStyle + " text-right mr-1"}>{vgLiteLang.Metals[armor?.material]?.name ?? '-'}</div>
            </div>
            <ItemDivider />
        </div>
    )
}