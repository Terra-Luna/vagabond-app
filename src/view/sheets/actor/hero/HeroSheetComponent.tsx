import { ArrowBigUpDash, BookText, Dices, FlaskConical, Handbag, PawPrint, Swords, WandSparkles } from "lucide-react"
import { ReactNode, useEffect, useRef, useState } from "react"
import { Tab, TabList, TabPanel,Tabs } from "react-tabs"

import { ActiveEffectsView } from "../../../../apps/active-effects/ActiveEffectsView"
import { HeroCreationApp } from "../../../../apps/hero-creator/HeroCreationApp"
import { LevelUpApp } from "../../../../apps/level-up/LevelUpApp"
import { XpQuestionnairePlayerApp } from "../../../../apps/level-up/questionnaire/XpQuestionnairePlayerApp"
import { HeroDataModel, isAlchemist } from "../../../../model/actor/HeroDataModel"
import { openItemSheet } from "../../../../model/actor/type/Inventory"
import { getItemChoiceRules, getItemRules } from "../../../../rules/util/item-rules-util"
import { sys_id } from "../../../../utils/foundryUtils"
import { appLang } from "../../../../utils/lang"
import { localizeString } from "../../../../utils/localeUtils"
import { getName, inventoryItemTypes } from "../../../../utils/modelUtil"
import { EditableNameField } from "../../../component/EditableTextField"
import { ClearHeader } from "../../../component/Header"
import { Tooltip } from "../../../component/Tooltip"
import { EditModeContextProvider } from "../../../context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../context/EditModeContext/EditModeOptions"
import { ActorPortrait } from "../component/ActorPortrait"
import { VagabondActorSheet } from "../VagabondActorSheet"
import { HeroSheetMenu } from "./menu/HeroSheetMenu"
import { AbilitiesTab } from "./tab/AbilitiesTab"
import { AlchemyTab } from "./tab/AlchemyTab"
import { GearTab } from "./tab/GearTab"
import { InventoryTab } from "./tab/InventoryTab"
import { MagicTab } from "./tab/MagicTab"
import { PolymorphTab } from "./tab/PolymorphTab"
import { RollsTab } from "./tab/RollsTab"
import { StatsDrawerContextProvider } from "./tab/statdrawer/StatsDrawerContextProvider"
import { CustomTrackers, Focus, HPArmorFatigueHUD, Luck, Saves, Skills, Speeds, StatsDrawer, Studied } from "./tab/TopSection"

const locale = appLang.HeroSheet

export const HeroSheetComponent = ({ actor, sheet }: { actor: Actor & { system: HeroDataModel }, sheet: VagabondActorSheet }) => {
    const hero = actor.system
    return (
        <div className="@container flex flex-col grow min-h-0 overflow-hidden">
            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                <StatsDrawerContextProvider id={hero.parent.id}>
                    <HeroSheetBody hero={hero} sheet={sheet} />
                </StatsDrawerContextProvider>
            </EditModeContextProvider>
        </div>
    )
}

const HeroSheetHeader = ({ hero, sheet }: { hero: HeroDataModel, sheet: VagabondActorSheet }) => {
    const canLevelUp = () => {
        const hasDestiny = hero.parent.getFlag(sys_id, "destiny") || false
        const hasXpLevel = hero.level.xp! >= hero.level.xpToLevel! && hero.level.xpToLevel! > -1
        const isNewChar = !hero.ancestry
        return hasDestiny || hasXpLevel || isNewChar
    }

    return (
        <div className="flex mb-0.5">
            {/* MAIN STATS ARRAY */}
            <StatsDrawer hero={hero} />

            {/* PORTRAIT */}
            <ActorPortrait actor={hero} />

            {/* MAIN HEADER CONTENT + MENU BUTTON */}
            <div className="flex flex-col grow min-w-0 border-b border-solid border-sheet-header-fill">
                <div className="bg-sheet-header-fill font-eskapade px-1 min-w-0">
                    <div className="flex  min-w-0">

                        {/* HERO NAME FIELD */}
                        <div className="text-text-header-primary text-3xl font-bold mt-1 truncate">
                            <EditableNameField actor={hero.parent} />
                        </div>

                        <div className="flex gap-x-2 ml-auto shrink-0 pl-2">
                            {/* LEVEL-UP BUTTON */}
                            {canLevelUp() &&
                                <Tooltip
                                    title={`${hero.ancestry && hero.class ? 'LEVEL UP!!' : 'CREATE HERO'}`}
                                    content={`${hero.ancestry && hero.class ? 'Advance to the next Level...' : 'Launch the Hero Creation app...'}`}
                                >
                                    <button
                                        onClick={async () => {
                                            if (hero.ancestry) {
                                                new LevelUpApp(hero.parent).render({ force: true })
                                            }
                                            else {
                                                new HeroCreationApp(hero.parent).render({ force: true })
                                            }
                                        }}
                                        className="flex items-center hover-glow cursor-pointer ml-auto"
                                    >
                                        <ArrowBigUpDash size={32} className="text-text-header-secondary animate-pulse mt-1 [filter:drop-shadow(0_0_16px_var(--text-header-secondary))]" />
                                    </button>
                                </Tooltip>
                            }

                            {/* HERO SHEET MENU BUTTON */}
                            <HeroSheetMenu hero={hero} sheet={sheet} className="ml-auto" />

                        </div>
                    </div>
                    <div className="flex text-text-header-secondary pb-1 min-w-0">
                        {/* ANCESTRY & CLASS LABELS */}
                        <div className="min-w-0 grow truncate whitespace-nowrap">
                            <span>{localizeString(locale.Level, { level: hero.level.current?.toString() ?? "0" })}</span>
                            <span>&nbsp;•&nbsp;</span>
                            <span className="cursor-pointer" onClick={() => openItemSheet(hero.ancestry)}>{hero.polymorph ? hero.polymorph.statBlock.name : getName(hero.ancestry) ?? ''}</span>
                            {hero.class
                                ? <span className="cursor-pointer" onClick={() => openItemSheet(hero.class)}>{` ${getName(hero.class)}`}</span>
                                : <span>{" Vagabond"}</span>
                            }
                        </div>

                        {/* EXPERIENCE POINTS */}
                        {(hero.level.xpToLevel ?? -1) > 0 &&
                            <div className="ml-2 shrink-0 whitespace-nowrap cursor-pointer hover-glow" onClick={() => new XpQuestionnairePlayerApp(hero.parent).render({ force: true })}>
                                {localizeString(locale.xp, { xp: hero.level.xp?.toString() || '0', nextLevel: hero.level.xpToLevel?.toString() || '0' })}
                            </div>
                        }
                    </div>
                </div>
                {/* HP, ARMOR, FATIGUE HUD */}
                <div className="mt-3 -ml-1 w-full">
                    <HPArmorFatigueHUD health={hero.health} armor={hero.armor} hero={hero} />
                </div>
            </div>
        </div>
    )
}

const HeroSheetUpperSection = ({ hero, showActiveEffects }: { hero: HeroDataModel, showActiveEffects?: boolean }) => {
    return (
        <div className="flex">
            {/* UPPER SECTION */}
            <div className="grid @sm:grid-cols-1 @md:grid-cols-1 mx-1 gap-1 w-full">
                {/* SPEEDS, SAVES, & TRACKERS */}
                <div className="flex w-full space-x-1">
                    <div className="w-full">
                        <Speeds hero={hero} />
                        <div className="flex items-center justify-around mt-5">
                            <Luck hero={hero} />
                            <Studied hero={hero} />
                            <Focus hero={hero} />
                        </div>
                    </div>
                    <Saves hero={hero} />
                </div>

                {/* CUSTOM TRACKERS */}
                <CustomTrackers actor={hero.parent} />

                {/* SKILL CHECKS AND DIFFICULTIES */}
                <Skills hero={hero} />

                {/* ACTIVE EFFECTS (ONLY WHEN IN SUPER WIDE-MODE) */}
                {showActiveEffects && <div className="flex flex-col gap-1 mt-2">
                    <ActiveEffectsView initialDocument={hero.parent} />
                </div>}
            </div>
        </div>
    )
}


const HeroSheetBody = ({ hero, sheet }: { hero: HeroDataModel, sheet: VagabondActorSheet }) => {
    const tabPanelClasses = "min-h-0 overflow-y-auto"
    const iconSize = 22

    const classItem = hero.parent.items.find(item => item.type === "class")
    const ancestryItem = hero.parent.items.find(item => item.type === "ancestry")
    const inventoryItems = hero.parent.items.filter(item => inventoryItemTypes().includes(item.type))
    const spellRules = [
        ...getItemRules(classItem),
        ...getItemRules(ancestryItem),
        ...hero.perks?.flatMap(perk => (perk as any).rules ?? []) ?? [],
        ...inventoryItems.flatMap(item => getItemRules(item))
    ]
    const canPolymorph = hero.spells.some(spell => spell.parent.flags[sys_id].polymorph)

    const showAlchemyTab = isAlchemist(hero)
    const showMagicTab = getItemChoiceRules(hero.level.current ?? 0, spellRules).some(rule => rule.pack === "spell" && rule.maxChoices > 0)
        || spellRules.some(rule => rule.key === "GrantItem" && rule.type === "spell")

    const showAbilitiesTab = classItem || ancestryItem

    const [width, setWidth] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        setWidth(el.clientWidth)
        const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width))
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const columns = Math.max(1, Math.floor(width / TAB_COLUMN_MIN_WIDTH))

    // Gear and inventory share a column once the sheet is wide enough; in single-column mode they are separate tabs.
    const gearTabs: HeroSheetTabs[] = columns > 1
        ? [
            {
                id: "main",
                title: locale["tab-main"],
                icon: <Swords size={iconSize} className="hover-glow" />,
                content: <div className="flex flex-col gap-y-2">
                    <ClearHeader title={locale["tab-inv"]} />
                    <InventoryTab hero={hero} />
                    <div className="flex flex-col gap-y-2 -mt-2">
                        <ClearHeader title={locale["tab-main"]} />
                        <GearTab hero={hero} />
                    </div>
                </div>
            }]
        : [
            {
                id: "main",
                title: locale["tab-main"],
                icon: <Swords size={iconSize} className="hover-glow" />,
                content: <GearTab hero={hero} />
            },
            {
                id: "inv",
                title: locale["tab-inv"],
                icon: <Handbag size={iconSize} className="hover-glow" />,
                content: <InventoryTab hero={hero} />
            }
        ]

    const tabs: HeroSheetTabs[] = [
        ...gearTabs,
        ...(showAlchemyTab
            ? [{
                id: "alchemy", title: appLang.General.alchemyTab,
                icon: <FlaskConical size={iconSize} className="hover-glow" />,
                content: <AlchemyTab actor={hero.parent} />
            }]
            : []
        ),
        ...(showAbilitiesTab
            ? [{
                id: "abilities",
                title: locale["tab-abilities"],
                icon: <BookText size={iconSize} className="hover-glow" />,
                content: <div className="-mt-1"><AbilitiesTab hero={hero} /></div>
            }]
            : []
        ),
        ...(showMagicTab
            ? [{
                id: "magic",
                title: locale["tab-magic"],
                icon: <WandSparkles size={iconSize} className="hover-glow" />,
                content: <MagicTab hero={hero} />, className: "overflow-x-hidden"
            }]
            : []
        ),
        ...(canPolymorph
            ? [{
                id: "polymorph",
                title: locale["tab-polymorph"],
                icon: <PawPrint size={iconSize} className="hover-glow" />,
                content: <PolymorphTab actor={hero.parent} />
            }]
            : []
        ),
        {
            id: "rolls",
            title: appLang.AttackBuilder.presets,
            icon: <Dices size={iconSize} className="hover-glow" />,
            content: <div className="flex flex-col gap-y-2">
                <ClearHeader title={locale["tab-rolls"]} />
                <RollsTab actor={hero.parent} />
            </div>
        }
    ]

    const [selectedId, setSelectedId] = useState("main")

    useEffect(() => {
        const hookId = (Hooks as any).on("vagabondSelectHeroTab", (actorId: string, tabId: string) => {
            if (actorId === hero.parent.id) setSelectedId(tabId)
        })
        return () => (Hooks as any).off("vagabondSelectHeroTab", hookId)
    }, [hero.parent.id])

    /**
     * Hero sheet tabbed sections get broken out into separate columns as the sheet is widened.
     */
    const extractedCount = Math.min(tabs.length, columns - 1)
    const extractedTabs = tabs.slice(0, extractedCount)
    const remainingTabs = tabs.slice(extractedCount)
    const showActiveEffects = remainingTabs.length === 0

    /**
     * Remove the tabs one-by-one as the sheet widens.
     */
    const selectedIndex = Math.max(0, remainingTabs.findIndex(tab => tab.id === selectedId))

    return <div ref={containerRef} className="flex min-h-0 grow">
        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
            <HeroSheetHeader hero={hero} sheet={sheet} />
            <HeroSheetUpperSection hero={hero} showActiveEffects={showActiveEffects} />
            {remainingTabs.length > 0 &&
                <div className="-mt-1 flex flex-col min-h-0 grow">
                    <div className="h-px bg-sheet-main-fill w-full mt-1 align-top" />
                    {remainingTabs.length === 1 &&
                        <div className={`${tabPanelClasses} grow ${remainingTabs[0].className ?? ""} mt-2`}>
                            {remainingTabs[0].content}
                        </div>
                    }
                    {remainingTabs.length > 1 &&
                        <Tabs
                            className="flex flex-col min-h-0 grow text-base"
                            selectedIndex={selectedIndex}
                            onSelect={index => setSelectedId(remainingTabs[index].id)}
                        >
                            <TabList>
                                {remainingTabs.map(tab => <Tab key={tab.id} title={tab.title}>{tab.icon}</Tab>)}
                            </TabList>

                            {remainingTabs.map(tab => (
                                <TabPanel key={tab.id} className={`${tabPanelClasses} ${tab.className ?? ""}`}>
                                    {tab.content}
                                </TabPanel>
                            ))}
                        </Tabs>
                    }
                </div>
            }
        </div>
        {extractedTabs.map(tab => (
            <div key={tab.id} className={`flex-1 min-w-0 min-h-0 -mt-1 overflow-y-auto border-l border-solid border-sheet-header-fill ${tab.className ?? ""}`}>
                <div className="mt-2 px-1">
                    {tab.content}
                </div>
            </div>
        ))}
    </div>
}

const TAB_COLUMN_MIN_WIDTH = 288

type HeroSheetTabs = {
    id: string
    title: string
    icon: ReactNode
    content: ReactNode
    className?: string
}