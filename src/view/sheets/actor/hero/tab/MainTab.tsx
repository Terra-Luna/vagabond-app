import { Shield } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { HeroAttack } from "../../../../../combat/engine/HeroAttack"
import { getArmor,HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { sortedItems } from "../../../../../model/actor/type/Inventory"
import { ArmorDataModel } from "../../../../../model/item/equip/ArmorDataModel"
import { SundryDataModel } from "../../../../../model/item/equip/SundryDataModel"
import { isEquippedTool, isEquippedWeapon,WeaponDataModel } from "../../../../../model/item/equip/WeaponDataModel"
import { equippedItemContextMenu, inventoryItemDragDropHandler, toggleGripState } from "../../../../../utils/heroInventoryUtil"
import { vgLiteLang } from "../../../../../utils/lang"
import { getId } from "../../../../../utils/modelUtil"
import { useContextMenu } from "../../../../component/ContextMenu"
import { useDragDrop } from "../../../../component/DragDrop"
import { Header, ItemDivider } from "../../../../component/Header"
import { Skill } from "./TopSection"

export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="grid @sm:grid-cols-[44%_55%] my-1 gap-x-1 flex-1">
                <Attacks hero={hero} />
                <div className="space-y-2">
                    <Weapons hero={hero} />
                    <Armor hero={hero} />
                </div>
            </div>
        </div>
    )
}

const Attacks = ({ hero }: { hero: HeroDataModel }) => {
    const { melee, brawl, finesse, ranged } = hero.skills
    return (
        <div className="w-full">
            <Header title={vgLiteLang.HeroSheet.attacks} />
            <Skill hero={hero} name={vgLiteLang.Attacks.melee} skillKey="melee" value={melee.value!} isTrained={melee.isTrained} isAttack={true} />
            <Skill hero={hero} name={vgLiteLang.Attacks.brawl} skillKey="brawl" value={brawl.value!} isTrained={brawl.isTrained} isAttack={true} />
            <Skill hero={hero} name={vgLiteLang.Attacks.finesse} skillKey="finesse" value={finesse.value!} isTrained={finesse.isTrained} isAttack={true} />
            <Skill hero={hero} name={vgLiteLang.Attacks.ranged} skillKey="ranged" value={ranged.value!} isTrained={ranged.isTrained} isAttack={true} />
        </div>
    )
}

const Weapons = ({ hero }: { hero: HeroDataModel }) => {
    const gripStyle = "text-text-aux text-lg text-center font-eskapade"
    const dmgStyle = "text-text-dmg font-eskapade font-bold text-xl text-right line-clamp-1 cursor-pointer"
    const propsStyle = "text-text-aux text-sm italic line-clamp-1"

    const { onCtxMenu, ContextMenu } = useContextMenu()
    const equippedWeapons = sortedItems<WeaponDataModel>(hero.inventory.items.filter(it => isEquippedWeapon(it)) as WeaponDataModel[])
    const equippedTools = sortedItems<SundryDataModel>(hero.inventory.items.filter(it => isEquippedTool(it)) as SundryDataModel[])
    const combinedEquipped = [...equippedWeapons, ...equippedTools]

    const { dragItem, targetItem, onDragStart, onDragEnter, onDragEnd } = useDragDrop(
        combinedEquipped,
        () => inventoryItemDragDropHandler(
            hero, dragItem, targetItem ?? combinedEquipped[combinedEquipped.length - 1], combinedEquipped
        )
    )

    const equipDependency = combinedEquipped.map(i => `${i.parent.id}-${(i as any)?.grip?.state ?? i.isEquipped}`).join(',')
    const [targetIds, setTargetIds] = useState("")

    useEffect(() => {
        const handleTargetChange = (user, token, isTargeted) => {
            if (user.id !== game.user?.id) return
            setTargetIds(Array.from(game.user?.targets ?? []).join("."))
        }
        const hookId = Hooks.on('targetToken', handleTargetChange)
        return () => { Hooks.off('targetToken', hookId) }
    }, [])

    const equipDisplayData = useMemo(() => {
        const weaponData = equippedWeapons.map(item => {
            const attackInstance = HeroAttack.buildWeaponAttack(hero.parent, item.parent, undefined, [])
            return {
                item,
                damageString: attackInstance?.damageRoll?.toString() ?? '',
                initiateAttack: (e: React.MouseEvent) => attackInstance.initiate(e)
            }
        })
        const toolsData = equippedTools.map(item => {
            return { item, damageString: "", initiateAttack: () => { } }
        })
        return [...weaponData, ...toolsData]
    }, [hero.parent, equipDependency, targetIds])

    return (
        <div className="w-full">
            <Header title={vgLiteLang.HeroSheet.weapons} />
            {
                equipDisplayData?.map(({ item, damageString, initiateAttack }, index: number) => {
                    return (
                        <div
                            key={getId(item)}
                            draggable
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragEnter={(e) => onDragEnter(e, index)}
                            onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            onDragEnd={(e) => onDragEnd(e, index)}
                            onContextMenu={async (e) => onCtxMenu(e, equippedItemContextMenu(hero, item))}
                        >
                            <div className="grid grid-cols-[53%_47%] place-content-between -gap-y-1">
                                <div className={`text-lg line-clamp-1`}>{item.parent.name}</div>
                                <div className="flex justify-end">
                                    <div title={"Toggle grip (if applicable)"}
                                        className={`${gripStyle} mr-2 hover-glow`}
                                        onClick={() => toggleGripState(item)}
                                    >
                                        {vgLiteLang.GripsAbbr[
                                            item instanceof WeaponDataModel
                                                ? item.grip.state
                                                : item.bulk.slots > 1 ? 'HH' : 'H'
                                        ]}
                                    </div>
                                    <div className="flex content-right">
                                        <div
                                            title={`Attack Action:\n${vgLiteLang.HeroSheet.skills_tooltip}`}
                                            className={`${dmgStyle} hover-glow`}
                                            onClick={(e) => initiateAttack(e)}
                                        >
                                            {damageString}
                                        </div>
                                    </div>
                                </div>
                                <div className={propsStyle}>{(item as any).properties?.map(p => vgLiteLang.WeaponProps[p].name).join(", ")}</div>
                                <div className={propsStyle + " text-right mr-1.5"}>{vgLiteLang.Ranges[(item as any).range ?? '']}</div>
                            </div>
                            <ItemDivider />
                        </div>
                    )
                })
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