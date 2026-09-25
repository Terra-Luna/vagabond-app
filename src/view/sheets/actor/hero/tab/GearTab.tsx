import { Shield } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { HeroAttack } from "../../../../../combat/engine/HeroAttack"
import { getArmor, HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { sortedItems } from "../../../../../model/actor/type/Inventory"
import { ArmorDataModel } from "../../../../../model/item/equip/ArmorDataModel"
import { SundryDataModel } from "../../../../../model/item/equip/SundryDataModel"
import { isEquippedSundry, isEquippedWeapon, WeaponDataModel } from "../../../../../model/item/equip/WeaponDataModel"
import { equippedItemContextMenu, inventoryItemDragDropHandler, toggleGripState } from "../../../../../utils/heroInventoryUtil"
import { appLang } from "../../../../../utils/lang"
import { getId } from "../../../../../utils/modelUtil"
import { buttonAnimation } from "../../../../component/Button"
import { useContextMenu } from "../../../../component/ContextMenu"
import { useDragDrop } from "../../../../component/DragDrop"
import { Header, ItemDivider } from "../../../../component/Header"
import { Tooltip } from "../../../../component/Tooltip"
import { RelicEffectList } from "../../../item/equip/component/RelicEffectList"
import { EquipmentSheetComponent } from "../../../item/equip/EquipmentSheetComponent"
import { ItemIconImg } from "../../../shared/InventoryItemsTable"

export const GearTab = ({ hero }: { hero: HeroDataModel }) => {
    const equippedWeapons = sortedItems<WeaponDataModel>(hero.inventory.items.filter(it => isEquippedWeapon(it)) as WeaponDataModel[])
    const equippedSundries = sortedItems<SundryDataModel>(hero.inventory.items.filter(it => it instanceof SundryDataModel && isEquippedSundry(it) && !it.isWearable) as SundryDataModel[])
    const armor = getArmor(hero) as any as ArmorDataModel
    const wearables = hero.inventory.items.filter(it =>
        it instanceof SundryDataModel && isEquippedSundry(it) && it.isWearable
    ) as SundryDataModel[]

    const hasEquippedWeapons = [...equippedWeapons, ...equippedSundries, ...wearables].length > 0
    const hasEquippedArmor = !!armor || wearables.length > 0

    return (
        <div className="flex flex-col h-full">
            {(!hasEquippedWeapons && !hasEquippedArmor)
                ? <div className="text-text-aux text-center italic mt-4 mb-8">
                    {appLang.HeroSheet.noEquipment}
                </div>
                : <div className="space-y-2 mb-4">
                    {hasEquippedWeapons && <Weapons hero={hero} equippedWeapons={equippedWeapons} equippedSundries={equippedSundries} />}
                    {hasEquippedArmor && <Armor armor={armor} wearables={wearables} />}
                </div>
            }
        </div>
    )
}

const Weapons = ({ hero, equippedWeapons, equippedSundries }: { hero: HeroDataModel, equippedWeapons: WeaponDataModel[], equippedSundries: SundryDataModel[] }) => {
    const gripStyle = "text-text-aux text-lg text-center font-eskapade"
    const dmgStyle = "text-text-dmg font-eskapade font-bold text-xl text-right line-clamp-1 cursor-pointer"
    const propsStyle = "text-text-aux text-sm italic line-clamp-1"

    const { onCtxMenu, ContextMenu } = useContextMenu()
    const combinedEquipped = sortedItems<WeaponDataModel | SundryDataModel>([...equippedWeapons, ...equippedSundries])

    const { dragItem, targetItem, onDragStart, onDragEnter, onDragEnd } = useDragDrop(
        combinedEquipped,
        () => inventoryItemDragDropHandler(
            hero, dragItem, targetItem ?? combinedEquipped[combinedEquipped.length - 1], combinedEquipped
        )
    )

    const equipDependency = combinedEquipped.map(i => i.parent.id).join(',')
    const [targetIds, setTargetIds] = useState("")

    useEffect(() => {
        const handleTargetChange = (user, token, isTargeted) => {
            if (user.id !== game.user?.id) return
            setTargetIds(Array.from(game.user?.targets ?? []).join("."))
        }
        const hookId = Hooks.on('targetToken', handleTargetChange)
        return () => { Hooks.off('targetToken', hookId) }
    }, [])

    /**
     * Monitor for Active Effect updates that might alter their
     * equipped weapon attack rolls.
     */
    const [effectUpdateKey, setEffectUpdateKey] = useState(0)

    useEffect(() => {
        const triggerUpdate = (effect: any) => {
            if (effect.parent?.id === hero.parent?.id) {
                setEffectUpdateKey(prev => prev + 1)
            }
        }

        Hooks.on("createActiveEffect", triggerUpdate)
        Hooks.on("updateActiveEffect", triggerUpdate)
        Hooks.on("deleteActiveEffect", triggerUpdate)
        return () => {
            Hooks.off("createActiveEffect", triggerUpdate)
            Hooks.off("updateActiveEffect", triggerUpdate)
            Hooks.off("deleteActiveEffect", triggerUpdate)
        }
    }, [hero.parent?.id])

    const equipDisplayData = useMemo(() => {
        const weaponData = equippedWeapons.map(item => {
            let attackInstance = HeroAttack.buildWeaponAttack(hero.parent, item.parent, undefined, [])
            return {
                item,
                damageString: attackInstance?.damageRoll?.toString() ?? '',
                initiateAttack: async (e: React.MouseEvent) => {
                    await attackInstance.initiate(e)
                    attackInstance = HeroAttack.buildWeaponAttack(hero.parent, item.parent, undefined, [])
                },
                rollDefenseCheck: async (e: React.MouseEvent) => {
                    await attackInstance.initiate(e, { isDefenseCheck: true })
                    attackInstance = HeroAttack.buildWeaponAttack(hero.parent, item.parent, undefined, [])
                }
            }
        })

        const sundriesData = equippedSundries.map(item => {
            return { item, damageString: "", initiateAttack: () => { }, rollDefenseCheck: () => { } }
        })

        return [...weaponData, ...sundriesData].sort((a, b) => a.item.parent.sort - b.item.parent.sort)
    }, [hero.parent, equipDependency, targetIds, effectUpdateKey])

    return (
        <div className="w-full">
            <Header title={appLang.HeroSheet.weapons} />
            {
                equipDisplayData?.map(({ item, damageString, initiateAttack, rollDefenseCheck }, index: number) => {
                    return (
                        <div
                            key={getId(item)}
                            draggable
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragEnter={(e) => onDragEnter(e, index)}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDragEnd={(e) => onDragEnd(e, index)}
                            onContextMenu={async (e) => onCtxMenu(e, equippedItemContextMenu(hero, item))}
                        >
                            <div className="flex items-center">
                                <ItemImage item={item} />

                                <div className="flex flex-col w-full gap-y-0.5 px-2 py-0.25">
                                    <div className="flex justify-between items-center">
                                        <div className={`text-lg line-clamp-1`}>{item.parent.name}</div>
                                        <div className="flex justify-end items-center">
                                            {/* WEAPON GRIP DISPLAY */}
                                            {item instanceof WeaponDataModel && (
                                                <Tooltip title={"Grip"} disabled={item.grip.style !== 'V'} content={`${item.grip.style === 'V' && (item as any).grip.state === 'HH' ? 'Switch to One-Handed' : 'Switch to Two-Handed'}`}>
                                                    <div className={`${gripStyle} ${item.grip.style === 'V' ? 'hover-glow' : ''} mr-2`} onClick={() => toggleGripState(item)}>
                                                        {appLang.GripsAbbr[item.grip.state]}
                                                    </div>
                                                </Tooltip>
                                            )}

                                            {/* SUNDRY BULK DISPLAY */}
                                            {item instanceof SundryDataModel && (
                                                <p className={gripStyle}>
                                                    {appLang.GripsAbbr[item.bulk.slots === 0 ? "" : (item.bulk.slots > 1 ? 'HH' : 'H')]}
                                                </p>
                                            )}

                                            <div className="flex content-right items-center gap-x-1">
                                                {/* CLICKABLE DAMAGE ROLL */}
                                                <Tooltip title={"Attack Action"} content={`Attack with this weapon. Set targets to trigger Skill Check.<br>${appLang.HeroSheet.skills_tooltip}`}>
                                                    <div className={`${dmgStyle} hover-glow`} onClick={(e) => initiateAttack(e)}>
                                                        {damageString}
                                                    </div>
                                                </Tooltip>

                                                {/* DEFENSE ACTION BUTTON */}
                                                {item instanceof WeaponDataModel && item.properties.includes("defense") &&
                                                    <Tooltip title={"Defense Action"} content={"Roll defense check to apply weapon damage as armor"}>
                                                        <button onClick={(e) => rollDefenseCheck(e)} onMouseDown={(e) => e.preventDefault()} className="hover-glow cursor-pointer">
                                                            <Shield className="text-ic-armor-border fill-ic-armor-fill -mb-1.5" size={22} />
                                                        </button>
                                                    </Tooltip>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center -mt-1">
                                        <RelicEffectList relicPowers={item.relicPowers ?? []} textColor="text-text-header-tertiary" />
                                    </div>

                                    <div className="flex justify-between items-center -mt-1 pb-1">
                                        <div className={propsStyle}>{(item as any).properties?.map(p => appLang.WeaponProps[p].name).join(", ")}</div>
                                        <div className={propsStyle + " text-right mr-1.5"}>{appLang.Ranges[(item as any).range ?? '']}</div>
                                    </div>
                                </div>
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

const Armor = ({ armor, wearables }: { armor: ArmorDataModel, wearables: SundryDataModel[] }) => {
    const propsStyle = "text-text-aux text-sm italic line-clamp-1"

    return (
        <div className="w-full -mt-1">
            {/* SECTION HEADER */}
            {armor || wearables.length > 0 ? <Header title={appLang.HeroSheet.armor} /> : null}

            {/* EQUIPPED ARMOR */}
            {armor &&
                <div>
                    <div className="flex items-center">
                        <ItemImage item={armor} />
                        <div className="flex flex-col w-full px-2">
                            {/* ARMOR NAME AND RATING */}
                            <div className="flex items-center justify-between">
                                <div className="text-lg line-clamp-1">{armor.parent.name ?? '-'}</div>
                                <div className="flex justify-end items-center">
                                    <Shield className="mr-1" size={18} />
                                    <div className="line-clamp-1 text-lg text-right font-eskapade font-bold mr-1">{armor.rating ?? '-'}</div>
                                </div>
                            </div>

                            {/* ARMOR CATEGORY AND MATERIAL */}
                            <div className="flex items-center justify-between">
                                {/* RELIC INFO */}
                                <RelicEffectList relicPowers={armor.relicPowers ?? []} textColor="text-text-header-tertiary" />
                                <div className={propsStyle + " text-right mr-1"}>{appLang.Metals[armor.material]?.name ?? '-'}</div>
                            </div>

                        </div>
                    </div>
                    <ItemDivider />
                </div>
            }

            {/* WEARABLE ITEMS */}
            {wearables.length > 0 && (
                <div className="flex flex-col gap-1">
                    {wearables.map((item, index) => (
                        <div key={index}>
                            <div className="flex items-center">
                                <ItemImage item={item} />
                                <div className="flex flex-col gap-0.5 pl-2">
                                    {/* WEARABLE NAME */}
                                    <p className="text-base line-clamp-1">{item.parent.name}</p>
                                    {/* RELIC INFO */}
                                    <RelicEffectList relicPowers={item.relicPowers ?? []} textColor="text-text-header-tertiary -mt-1" />
                                </div>
                            </div>
                            <ItemDivider />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const ItemImage = ({ item }) => {
    return (
        <Tooltip title={item.parent.name} content={<EquipmentSheetComponent item={item.parent} hideBottomSection={true} />}>
            <button
                className={`flex items-center pl-2 py-1 -mr-1 hover-glow cursor-pointer shrink-0 ${buttonAnimation}`}
                onClick={() => item.parent?.sheet?.render(true)}
            >
                <ItemIconImg item={item} />
            </button>
        </Tooltip>
    )
}