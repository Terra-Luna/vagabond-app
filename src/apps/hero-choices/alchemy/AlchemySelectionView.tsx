import { useCallback, useEffect, useState } from "react"

import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { multiplyCoins, toCopper } from "../../../model/common/CoinValue"
import { getItemChoiceRules } from "../../../rules/util/item-rules-util"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { appLang } from "../../../utils/lang"
import { Header } from "../../../view/component/Header"
import { ItemSelectorGroup } from "../../hero-creator/component/ItemSelectorGroup"
import { Recipes } from "./Recipes"

export const useAlchemySelectionView = (actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean) => {

    const level = actor.system.level.current! + (isLevelUp ? 1 : 0)
    const clazz = actor.system.class
    const valueLimit = toCopper(multiplyCoins({ g: 0, s: 50, c: 0 }, level))
    
    const [alchemyItems, setAlchemyItems] = useState<{ value: string, label: string, img: string, dmgType: string, category: string, description: string }[]>([])
    const [alchemySlots, setAlchemySlots] = useState<{ value: string, label: string, ruleName: string, ruleId: string }[]>([])

    useEffect(() => {
        setAlchemyItems([
            { value: '', label: appLang.HeroCreation.emptySlot, img: "", dmgType: "", category: "", description: "" },
            ...ItemsCache.alchemical().filter(item => toCopper(item.system.value) <= valueLimit).map(item => ({
                value: item.uuid,
                label: item.name,
                img: item.img ?? "",
                dmgType: item.system.damage.type ?? "",
                category: item.system.alchemyCategory,
                description: item.system.description
            }))
        ])
    }, [])

    const loadInitialSlots = useCallback((rules: any[]) => {
        const slots: any[] = []
        rules.filter(r => r.pack === "alchemical").forEach(r => {
            Array.from({ length: r.maxChoices }).forEach(_ => {
                slots.push({ value: "", label: appLang.HeroCreation.emptySlot, ruleName: r.label, ruleId: r.id })
            })
        })
        return slots
    }, [])

    useEffect(() => {
        const classRules = getItemChoiceRules(level, clazz?.rules ?? [])
        setAlchemySlots(loadInitialSlots(classRules.filter(r => r.pack === "alchemical")))
    }, [loadInitialSlots])

    const onSelectAlchemyItem = useCallback((slotIndex: number, itemName: string, itemId: string, setter: any) => {
        setter(prevSlots =>
            prevSlots.map((slot, index) =>
                index === slotIndex
                    ? { ...slot, label: itemName, value: itemId }
                    : slot
            )
        )
    }, [])

    const AlchemySelectionView = <div className="@container p2 h-full min-h-0 flex flex-col overflow-hidden">
        <div className="sticky top-0 bg-sheet-main-fill text-center items-center">
            <Header title={appLang.HeroSheet.Alchemy.header} />
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto w-full justify-start">
            <div className="inline-flex flex-col items-stretch space-y-4 w-full @2xl:w-3/5 mx-auto">
                {alchemySlots.length > 0 &&
                    <div className="flex flex-col gap-y-1">
                        <ItemSelectorGroup
                            slotGroup={alchemySlots}
                            options={alchemyItems}
                            otherSlotGroup={[]}
                            grants={[]}
                            onSelect={(index, label, selectedId) => onSelectAlchemyItem(index, label, selectedId, setAlchemySlots)}
                        />

                        {/* SELECTED RECIPIES */}
                        <Recipes alchemySlots={alchemySlots} alchemyItems={alchemyItems} />
                    </div>
                }
            </div>
        </div>

    </div>

    return { AlchemySelectionView, loadInitialSlots, alchemyItems, alchemySlots, setAlchemySlots }
}