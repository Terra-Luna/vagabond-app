import { LockKeyhole } from "lucide-react"
import { useCallback, useMemo } from "react"

import { ItemsCache } from "../../../rules/util/ItemsCache"
import { CustomDropDown } from "../../../view/component/Dropdown"

/**
 * This component is good for tracking multiple user selections across an array
 * of drop-down selector boxes and multiple selection pools. See Hero Creation
 * spells and perks selection steps for an example where the user can select spells
 * and/or perks across various ancestry and class-proviced ChoiceSet Rules.
 * @param param0
 * @returns 
 */
export const ItemSelectorGroup = ({ slotGroup, options, otherSlotGroup, grants, onSelect, lockOldSlots }: {
    slotGroup: { value: string, label: string, isLocked?: boolean }[],
    options: { value: string, label: string }[],
    otherSlotGroup: any[],
    grants: any[],
    onSelect: any,
    lockOldSlots?: boolean
}) => {

    /**
     * Filter to make sure spells/perks are removed from other slot selectors
     * as the player makes selections for each slot...
     * @param index 
     * @returns 
    */
    const getOtherSelectedIds = useCallback((index: number) => {
        const otherGivenSlots = slotGroup.filter((_, i) => i !== index)
        return [
            ...otherGivenSlots,
            ...otherSlotGroup,
            ...grants.map(g => ({ value: g.uuid, label: g.item }))
        ].map(s => s.value).filter(Boolean)
    }, [slotGroup, otherSlotGroup, grants])

    const stackablePerkIds = useMemo(() => {
        return ItemsCache.perks().filter(it => it.system.canTakeMultiple).map(it => it.uuid)
    }, [])

    return (
        <div className="@container w-full">
            <div className="grid grid-cols-1 @xs:grid-cols-2 gap-2 mt-2 w-full">
                {
                    slotGroup.map((slot, index) => {
                        const otherSelectedIds = getOtherSelectedIds(index)
                        const filteredOptions = options.filter(opt =>
                            opt.value === slot.value || stackablePerkIds.includes(opt.value) || !otherSelectedIds.includes(opt.value)
                        )
                        const isLocked = slot.isLocked || (lockOldSlots && index + 1 < slotGroup.length)

                        return (
                            <div key={`item-slot-selector-${index}`} className="w-full min-w-0">
                                {/* SELECTABLE SLOTS */}
                                {!isLocked && <CustomDropDown
                                    value={slot.value}
                                    options={filteredOptions}
                                    className={`
                                        w-full flex flex-wrap gap-x-1 text-lg font-eskapade font-normal
                                        ${slot.value === '' ? 'border-2 border-solid border-wealth-denom-label' : ''}
                                    `}
                                    onChange={(e) => {
                                        const selectedId = e.target.value
                                        const selectedSpell = options.find(opt => opt.value === selectedId)
                                        const label = selectedSpell ? selectedSpell.label : ''
                                        onSelect(index, label, selectedId)
                                    }}
                                    editModeOverride={!isLocked}
                                />}

                                {/* LOCKED / READ-ONLY MODE */}
                                {isLocked && <div className="w-full h-full flex gap-x-2 items-center justify-between text-xl font-eskapade font-bold border border-solid border-table-border px-2">
                                    <span className="truncate">{slot.label}</span>
                                    <LockKeyhole size={12} className="flex-shrink-0" />
                                </div>}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}