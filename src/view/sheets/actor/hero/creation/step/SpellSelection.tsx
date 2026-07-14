import { useCallback, useEffect, useState } from "react"
import { AncestryDataModel } from "../../../../../../model/item/character/AncestryDataModel"
import { ClassDataModel } from "../../../../../../model/item/character/ClassDataModel"
import { vgLiteLang } from "../../../../../../utils/lang"
import { Select, Option } from "../../../../../component/Dropdown"
import { Divider, Header } from "../../../../../component/Header"
import { useNavButtons } from "../../../../../context/navigation/NavButtons"
import { HeroCreationLabel, HeroCreationSubtext } from "../component/HeroCreationTypography"
import { CombinedItems } from "../../../../../../utils/modelUtil"
import { getSpellGrants, ItemRule } from "../../../../../component/rules/util/item-rules-util"
import { ItemGrantCard } from "../component/ItemGrantCard"
import { SkillCard } from "../../../../../component/SkillCard"
import { SpellDataModel } from "../../../../../../model/item/character/SpellDataModel"

export const useSpellSelection = (ancestry: Item & { system: AncestryDataModel } | undefined, clazz: Item & { system: ClassDataModel } | undefined) => {
    const strings = vgLiteLang.HeroCreation
    const { NavButtons, setCanProceed } = useNavButtons()

    // All spells for selection.
    const [spellsList, setSpellsList] = useState<{ value: string, label: string, img: string, dmgType: string, description: string }[]>([])

    // Spells automatically granted by chosen Ancestry & Class.
    const [ancestrySpellGrants, setAncestrySpellGrants] = useState<(ItemRule & { spell: string, uuid: string, source: string })[]>([])
    const [classSpellGrants, setClassSpellGrants] = useState<(ItemRule & { spell: string, uuid: string, source: string })[]>([])

    // Player's chose spells for each slot.
    const [ancestrySpellSlots, setAncestrySpellSlots] = useState<{ value: string, label: string }[]>([])
    const [classSpellSlots, setClassSpellSlots] = useState<{ value: string, label: string }[]>([])

    useEffect(() => {
        CombinedItems('spell').then(spells => {
            setSpellsList([
                { value: '', label: strings.emptySlot, img: '', dmgType: '', description: '' },
                ...spells
                    .map(spell => ({
                        value: spell.uuid,
                        label: spell.name,
                        img: spell.img ?? '',
                        dmgType: (spell.system as SpellDataModel)?.damageType ?? '-',
                        description: (spell.system as SpellDataModel)?.description ?? ''
                    }))
            ])
        })
    }, [ancestrySpellGrants, classSpellGrants])

    useEffect(() => {
        getSpellGrants([ancestry]).then(grants => {
            setAncestrySpellGrants(grants)
            if (ancestry?.system?.initialSpellSlots && ancestry.system.initialSpellSlots > 0) {
                const slotsCount = Math.max(0, ancestry.system.initialSpellSlots - grants.length)
                setAncestrySpellSlots(
                    Array.from({ length: slotsCount }).map(() => (
                        { value: '', label: strings.emptySlot }
                    ))
                )
            }
        })

        getSpellGrants([clazz]).then(grants => {
            setClassSpellGrants(grants)
            if (clazz?.system?.initialSpellSlots && clazz.system.initialSpellSlots > 0) {
                const slotsCount = Math.max(0, clazz.system.initialSpellSlots - grants.length)
                setClassSpellSlots(
                    Array.from({ length: slotsCount }).map(() => (
                        { value: '', label: strings.emptySlot }
                    ))
                )
            }
        })

    }, [ancestry, clazz])

    const onSelectAncestrySpell = useCallback((slotIndex: number, spell: string, spellId: string) => {
        setAncestrySpellSlots(prevSlots =>
            prevSlots.map((slot, index) =>
                index === slotIndex ? { label: spell, value: spellId } : slot
            )
        )
    }, [])

    const onSelectClassSpell = useCallback((slotIndex: number, spell: string, spellId: string) => {
        setClassSpellSlots(prevSlots =>
            prevSlots.map((slot, index) =>
                index === slotIndex ? { label: spell, value: spellId } : slot
            )
        )
    }, [])

    const SpellSelection = () => {
        return (<>

            {/* HEADER AND NAVIGATION BUTTONS */}
            <div className="bg-sheet-main-fill space-y-4 text-center items-center">
                <NavButtons header={<Header title={strings.spellsHeader} />} />
                <HeroCreationSubtext text={strings.spellsSubheader} />
                <Divider />
            </div>

            {/* GRANTED SPELLS */}
            <div className="mt-4 space-y-1">
                <HeroCreationLabel text={strings.grantedSpells} />
                {
                    [...ancestrySpellGrants, ...classSpellGrants].map(grant => (
                        <ItemGrantCard key={grant.value} name={grant.spell} source={grant.source} />
                    ))
                }
            </div>

            {/* CHOOSE CLASS SPELLS */}
            <div className="mt-4 space-y-2">
                <HeroCreationLabel text={strings.electiveSpells} />
                <HeroCreationSubtext text={strings.classSpells} />
                <div className="flex flex-wrap gap-2 mt-2 w-full">
                    {
                        classSpellSlots.map((slot, index) => {
                            // Filters spells chosen in other spell slots and grants.
                            const otherSelectedIds = [
                                ...classSpellSlots,
                                ...ancestrySpellSlots,
                                ...classSpellGrants.map(g => ({ value: g.uuid, label: g.spell })),
                                ...ancestrySpellGrants.map(g => ({ value: g.uuid, label: g.spell }))
                            ]
                                .filter((_, slotIndex) => slotIndex !== index)
                                .map(s => s.value)
                                .filter(Boolean)

                            return (
                                <Select
                                    key={index}
                                    value={slot.value}
                                    onChange={(e) => {
                                        const selectedId = e.target.value
                                        const selectedSpell = spellsList.find(sp => sp.value === selectedId)
                                        const label = selectedSpell ? selectedSpell.label : ''
                                        onSelectClassSpell(index, label, selectedId)
                                    }}
                                    className="border border-solid border-table-border rounded-sm px-1 w-7/16"
                                >
                                    {
                                        spellsList
                                            .filter(sp => sp.value === slot.value || !otherSelectedIds.includes(sp.value))
                                            .map(sp => (
                                                <Option key={sp.value} value={sp.value}>
                                                    {sp.label}
                                                </Option>
                                            ))
                                    }
                                </Select>
                            )
                        })
                    }
                </div>
            </div>

            {/* CHOOSE ANCESTRY SPELLS */}
            {ancestrySpellSlots.length > 0 &&
                <div className="mt-4 space-y-2">
                    <HeroCreationSubtext text={strings.ancestrySpells} />
                    <div className="flex flex-wrap gap-2 mt-2 w-full">
                        {
                            ancestrySpellSlots.map((slot, index) => {
                                // Filters spells chosen in other spell slots and grants.
                                const otherSelectedIds = [
                                    ...classSpellSlots,
                                    ...ancestrySpellSlots,
                                    ...classSpellGrants.map(g => ({ value: g.uuid, label: g.spell })),
                                    ...ancestrySpellGrants.map(g => ({ value: g.uuid, label: g.spell }))
                                ]
                                    .filter((_, slotIndex) => slotIndex !== index)
                                    .map(s => s.value)
                                    .filter(Boolean)

                                return (
                                    <Select
                                        key={index}
                                        value={slot.value}
                                        onChange={(e) => {
                                            const selectedId = e.target.value
                                            const selectedSpell = spellsList.find(sp => sp.value === selectedId)
                                            const label = selectedSpell ? selectedSpell.label : ''
                                            onSelectAncestrySpell(index, label, selectedId)
                                        }}
                                        className="border border-solid border-table-border rounded-sm px-1 w-7/16"
                                    >
                                        {
                                            spellsList
                                                .filter(sp => sp.value === slot.value || !otherSelectedIds.includes(sp.value))
                                                .map(sp => (
                                                    <Option key={sp.value} value={sp.value}>
                                                        {sp.label}
                                                    </Option>
                                                ))
                                        }
                                    </Select>
                                )
                            })
                        }
                    </div>
                </div>
            }

            {/* YOUR GRIMOIRE */}
            <div className="space-y-1 mt-4">
                <HeroCreationLabel text={strings.grimoire} />

                {/* GRANTED SPELLS */}
                {[...ancestrySpellGrants, ...classSpellGrants].map(g => {
                    const sp = spellsList.find(sp => sp.value === g.uuid)
                    if (sp) {
                        return (
                            <SkillCard
                                key={g.uuid}
                                img={sp.img}
                                dmgType={sp.dmgType}
                                title={sp.label}
                                subtitles={[{ label: vgLiteLang.HeroSheet.Magic.labelDmgBase, value: sp.dmgType }]}
                                description={sp.description}
                            />
                        )
                    }
                    else {
                        return <></>
                    }
                })}

                {/* CHOSEN SPELLS */}
                {[...ancestrySpellSlots, ...classSpellSlots].filter(slot => slot.value.length > 0).map(slot => {
                    const sp = spellsList.find(sp => sp.value === slot.value)
                    if (sp) {
                        return (
                            <SkillCard
                                key={sp.value}
                                img={sp.img}
                                dmgType={sp.dmgType}
                                title={sp.label}
                                subtitles={[{ label: vgLiteLang.HeroSheet.Magic.labelDmgBase, value: sp.dmgType }]}
                                description={sp.description}
                            />
                        )
                    }
                    else {
                        return <></>
                    }
                })}
            </div>
        </>)
    }

    return { SpellSelection, ancestrySpellSlots, classSpellSlots }
}