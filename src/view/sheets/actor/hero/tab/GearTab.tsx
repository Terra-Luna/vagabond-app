import { Shield } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { RollPreset } from "../../../../../apps/attack-builder/model/RollPreset"
import { RollBuilderView } from "../../../../../apps/attack-builder/RollBuilderView"
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
import { WeaponPropsList } from "../../../item/equip/component/WeaponPropsList"
import { ItemIconImg } from "../../../shared/InventoryItemsTable"

export const GearTab = ({ hero }: { hero: HeroDataModel }) => {
    const [documentUpdateKey, setDocumentUpdateKey] = useState(0)

    useEffect(() => {
        const handleActorUpdate = (updatedActor: Actor) => {
            if (updatedActor.id === hero.parent.id) {
                setDocumentUpdateKey(prev => prev + 1)
            }
        }
        const handleItemUpdate = (item: Item) => {
            if ((item.parent as Actor | null)?.id === hero.parent.id) {
                setDocumentUpdateKey(prev => prev + 1)
            }
        }

        Hooks.on("updateActor", handleActorUpdate)
        Hooks.on("createItem", handleItemUpdate)
        Hooks.on("updateItem", handleItemUpdate)
        Hooks.on("deleteItem", handleItemUpdate)
        return () => {
            Hooks.off("updateActor", handleActorUpdate)
            Hooks.off("createItem", handleItemUpdate)
            Hooks.off("updateItem", handleItemUpdate)
            Hooks.off("deleteItem", handleItemUpdate)
        }
    }, [hero.parent.id])

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
                    {hasEquippedWeapons && <Weapons hero={hero} equippedWeapons={equippedWeapons} equippedSundries={equippedSundries} documentUpdateKey={documentUpdateKey} />}
                    {hasEquippedArmor && <Armor hero={hero} armor={armor} wearables={wearables} />}
                </div>
            }
        </div>
    )
}

const Weapons = ({ hero, equippedWeapons, equippedSundries, documentUpdateKey }: { hero: HeroDataModel, equippedWeapons: WeaponDataModel[], equippedSundries: SundryDataModel[], documentUpdateKey: number }) => {
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
                skill: attackInstance?.skillCheck?.skill ?? '',
                preset: {
                    title: item.parent.name,
                    description: '',
                    weaponId: item.parent.id,
                    skill: attackInstance?.skillCheck?.skill ?? '',
                    d20Count: attackInstance?.skillCheck?.d20Count ?? 1,
                    skillCheckMod: attackInstance?.skillCheck?.modifier ?? 0,
                    critThreshold: attackInstance?.skillCheck?.critThreshold ?? 20,
                    critSum: false,
                    explodeFavor: false,
                    favorHinder: attackInstance?.skillCheck?.favorHinder ?? 'none',
                    damageRolls: attackInstance?.damageRoll?.dice ?? [],
                    flatModifier: attackInstance?.damageRoll?.flatDmgBonus ?? 0,
                    perDieBonus: attackInstance?.damageRoll?.perDieDmgBonus ?? 0,
                    armorPiercing: attackInstance?.damageRoll?.armorPiercing ?? 0
                } as RollPreset,
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
            return { item, damageString: "", skill: "", preset: undefined as RollPreset | undefined, initiateAttack: () => { }, rollDefenseCheck: () => { } }
        })

        return [...weaponData, ...sundriesData].sort((a, b) => a.item.parent.sort - b.item.parent.sort)
    }, [hero.parent, equipDependency, targetIds, effectUpdateKey, documentUpdateKey, hero.modifiers])

    return (
        <div className="w-full">
            <Header title={appLang.HeroSheet.weapons} />
            {
                equipDisplayData?.map(({ item, damageString, skill, preset, initiateAttack, rollDefenseCheck }, index: number) => {
                    const isDefense = hero.skills[skill]?.trained && item instanceof WeaponDataModel
                        ? (item.properties.includes('defense') || hero.modifiers.damage.out[skill]?.weaponProps?.includes('defense'))
                        : false

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
                            <div className="flex items-center my-0.5 gap-x-1">
                                <ItemImage item={item} />

                                <div className="flex flex-col w-full px-2">
                                    <div className="flex justify-between items-center">
                                        <div className={`text-lg line-clamp-1`}>{item.parent.name}</div>
                                        <div className="flex justify-end items-center">
                                            {/* WEAPON GRIP DISPLAY */}
                                            {item instanceof WeaponDataModel && (
                                                <Tooltip
                                                    title={"Grip"}
                                                    disabled={item.grip.style !== 'V'}
                                                    content={`${item.grip.style === 'V' && (item as any).grip.state === 'HH'
                                                        ? 'Switch to One-Handed'
                                                        : 'Switch to Two-Handed'}`}
                                                >
                                                    <div
                                                        className={`mr-2 ${gripStyle} ${item.grip.style === 'V' ? 'hover-glow' : ''}`}
                                                        onClick={() => toggleGripState(item)}>
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
                                                <Tooltip content={<RollBuilderView actor={hero.parent} showHeader={true} preset={preset} lockWeaponSelection={true} saveOnRoll={false} />} interactive={true}>
                                                    <div className={`${dmgStyle} hover-glow`} onClick={(e) => initiateAttack(e)}>
                                                        {damageString}
                                                    </div>
                                                </Tooltip>

                                                {/* DEFENSE ACTION BUTTON */}
                                                {isDefense &&
                                                    <Tooltip title={"Defense Action"} content={"Roll defense check to apply weapon damage as armor"}>
                                                        <button onClick={(e) => rollDefenseCheck(e)} onMouseDown={(e) => e.preventDefault()} className="hover-glow cursor-pointer">
                                                            <Shield className="text-ic-armor-border fill-ic-armor-fill -mb-1.5" size={22} />
                                                        </button>
                                                    </Tooltip>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* WEAPON RELIC LISTS */}
                                    <div className="flex justify-between items-center -mt-1">
                                        <RelicEffectList relicPowers={item.relicPowers ?? []} textColor="text-text-header-tertiary" />
                                    </div>

                                    {/* WEAPON PROPERTIES AND RANGE */}
                                    <div className="flex justify-between items-center pb-1">
                                        <WeaponPropsList weaponProps={(item as any).properties ?? []} />
                                        <div className={propsStyle + " text-right"}>{appLang.Ranges[(item as any).range ?? '']}</div>
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

const Armor = ({ hero, armor, wearables }: { hero: any, armor: ArmorDataModel, wearables: SundryDataModel[] }) => {
    const { onCtxMenu, ContextMenu } = useContextMenu()

    return (
        <div className="w-full -mt-1">

            {/* EQUIPPED ARMOR */}
            {armor &&
                <div onContextMenu={(e) => onCtxMenu(e, equippedItemContextMenu(hero, armor))}>
                    <Header title={appLang.HeroSheet.armor} />
                    <div className="flex items-center  gap-x-1">
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
                            <div className="flex items-center justify-between -mt-1">
                                {/* RELIC INFO */}
                                <RelicEffectList relicPowers={armor.relicPowers ?? []} textColor="text-text-header-tertiary" />
                                <div className={"text-text-aux text-sm italic line-clamp-1 text-right mr-1"}>{appLang.Metals[armor.material]?.name ?? '-'}</div>
                            </div>

                        </div>
                    </div>
                    <ItemDivider />
                </div>
            }

            {/* WEARABLE ITEMS */}
            {wearables.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                    <Header title={"MISC"} />
                    {wearables.map((item, index) => (
                        <div key={index}>
                            <div className="flex items-center gap-x-1" onContextMenu={(e) => onCtxMenu(e, equippedItemContextMenu(hero, item))}>
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

            <ContextMenu />
        </div>
    )
}

const ItemImage = ({ item }) => {
    return <button
        className={`flex items-center mx-1 -mr-3 my-0.5 shrink-0
            hover-glow cursor-pointer ${buttonAnimation}`}
        onClick={() => item.parent?.sheet?.render(true)}
    >
        <ItemIconImg item={item} size={34} />
    </button>
}