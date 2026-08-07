import { ArrowsUpFromLine, Menu, Sword, Swords } from "lucide-react"
import { useEffect } from "react"
import { Tabs, TabList, Tab, TabPanel } from "react-tabs"
import { importHero } from "../../../../apps/importer/TagalongImporter"
import { HeroDataModel } from "../../../../model/actor/HeroDataModel"
import { localizeString } from "../../../../utils/localeUtils"
import { getName } from "../../../../utils/modelUtil"
import { EditableNameField } from "../../../component/EditableTextField"
import { useEditMode } from "../../../context/EditModeContext/Hooks"
import { Portrait } from "../component/ActorPortrait"
import { VgLiteActorSheet } from "../VgLiteActorSheet"
import { AbilitiesTab } from "./tab/AbilitiesTab"
import { InventoryTab } from "./tab/InventoryTab"
import { MagicTab } from "./tab/MagicTab"
import { MainTab } from "./tab/MainTab"
import { Stats, HPArmorFatigueHUD, Speeds, Luck, Studied, Saves, Skills } from "./tab/TopSection"
import { StatsDrawerContextProvider } from "./tab/statdrawer/StatsDrawerContextProvider"
import { lang } from "../../../../utils/lang"
import { openItemSheet } from "../../../../model/actor/type/Inventory"
import { HeroSheetMenu } from "./menu/HeroSheetMenu"
import { AttacksTab } from "./tab/AttacksTab"
import { XpQuestionnairePlayerApp } from "../../../../apps/level-up/questionnaire/XpQuestionnairePlayerApp"
import { LevelUpApp } from "../../../../apps/level-up/LevelUpApp"
import { HeroCreationApp } from "../../../../apps/hero-creator/HeroCreationApp"

const locale = lang.VGLITE.HeroSheet

export const HeroSheetReactComponent = ({ actor, sheet }: { actor: Actor & { system: HeroDataModel }, sheet: VgLiteActorSheet }) => {
    const hero = actor.system
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.code === "KeyI") {
                importHero(hero, "https://www.vgbnd.app/character/e38db88c-ec28-4b67-a44c-09f0fe199d01")
                e.preventDefault()
                e.stopPropagation()
            }
        }
        window.addEventListener("keydown", listener)

        return () => { window.removeEventListener("keydown", listener) }
    }, [])

    const { setEditMode } = useEditMode()
    useEffect(() => {
        setEditMode(true)
    }, [])

    return (
        <div className="@container flex flex-col grow min-h-0 overflow-y-hidden">
            <StatsDrawerContextProvider>
                <HeroSheetHeader hero={hero} sheet={sheet} />
                <HeroSheetUpperSection hero={hero} />
                <HeroSheetTabbedSection hero={hero} />
            </StatsDrawerContextProvider>
        </div>
    )
}

const HeroSheetHeader = ({ hero, sheet }: { hero: HeroDataModel, sheet: VgLiteActorSheet }) => {
    return (
        <div className="flex">
            {/* MAIN STATS ARRAY */}
            <Stats hero={hero} />

            {/* PORTRAIT */}
            <Portrait actor={hero} />

            {/* MAIN HEADER CONTENT + MENU BUTTON */}
            <div className="flex flex-col grow">
                <div className="bg-sheet-header-fill font-eskapade grow">
                    <div className="flex text-text-header-primary text-4xl font-bold mt-1 ml-2">
                        <EditableNameField actor={hero.parent} />

                        <div className="flex gap-x-2 ml-auto">
                            {((hero.level.xp ?? 0) >= (hero.level.xpToLevel ?? 9999) && hero.level.current! < 10 || !hero.ancestry) &&
                                <button
                                    title={`${hero.ancestry && hero.class ? 'LEVEL UP!!' : 'CREATE HERO'}`}
                                    onClick={async () => {
                                        if (hero.ancestry && hero.class) {
                                            new LevelUpApp(hero.parent).render({ force: true })
                                        }
                                        else {
                                            new HeroCreationApp(hero.parent).render({ force: true })
                                        }
                                    }}
                                    className="hover-glow cursor-pointer ml-auto"
                                >
                                    <ArrowsUpFromLine size={24} className="text-text-header-secondary" />
                                </button>
                            }

                            <HeroSheetMenu hero={hero} sheet={sheet} className="ml-auto" />
                        </div>
                    </div>
                    <div className="flex text-text-header-secondary ml-2 pb-1">
                        <span>{localizeString(locale.Level, { level: hero.level.current?.toString() ?? "0" })}</span>
                        <span>&nbsp;•&nbsp;</span>
                        <div className="flex gap-x-1 cursor-pointer">
                            <p onClick={() => openItemSheet(hero.ancestry)}>{getName(hero.ancestry) ?? ''}</p>
                            <p onClick={() => openItemSheet(hero.class)}>{getName(hero.class) ?? "Vagabond"}</p>
                        </div>

                        {/* EXPERIENCE POINTS */}
                        <div className="ml-auto mr-2 cursor-pointer hover-glow" onClick={() => new XpQuestionnairePlayerApp(hero.parent).render({ force: true })} >
                            {localizeString(locale.xp, { xp: hero.level.xp?.toString() || '0', nextLevel: hero.level.xpToLevel?.toString() || '0' })}
                        </div>
                    </div>
                </div>
                {/* HP, ARMOR, FATIGUE HUD */}
                <div className="flex grow grid @sm:grid-cols-1 @md:grid-cols-1 mt-1 gap-1 w-full">
                    <HPArmorFatigueHUD health={hero.health} armor={hero.armor} hero={hero} />
                </div>
            </div>
        </div>
    )
}

const HeroSheetUpperSection = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="flex">
            {/* UPPER SECTION */}
            <div className="grid @sm:grid-cols-1 @md:grid-cols-1 ml-1 mr-1 mt-1 gap-1 w-full">
                {/* SPEEDS, SAVES, & TRACKERS */}
                <div className="flex w-full space-x-1">
                    <div className="w-full">
                        <Speeds hero={hero} />
                        <div className="flex w-full justify-center space-x-4 mt-2">
                            <Luck hero={hero} />
                            <Studied hero={hero} />
                        </div>
                    </div>
                    <Saves hero={hero} />
                </div>

                {/* SKILL CHECKS AND DIFFICULTIES */}
                <Skills hero={hero} />
            </div>
        </div>
    )
}

const HeroSheetTabbedSection = ({ hero }: { hero: HeroDataModel }) => {
    const tabPanelClasses = "min-h-0 overflow-y-auto"
    return <div className="-mt-1 flex flex-col min-h-0 grow">
        <div className="h-px bg-sheet-main-fill w-full mt-1 align-top" />
        <Tabs className="flex flex-col min-h-0 grow text-lg">
            <TabList>
                <Tab>{locale["tab-main"]}</Tab>
                <Tab>{locale["tab-inv"]}</Tab>
                {hero.spells?.length > 0 && <Tab>{locale["tab-magic"]}</Tab>}
                <Tab> {locale["tab-abilities"]}</Tab>
                <Tab title="Attack Presets"><Swords size={32} className="hover-glow" /></Tab>
            </TabList>
            <TabPanel className={tabPanelClasses}>
                <MainTab hero={hero} />
            </TabPanel>
            <TabPanel className={tabPanelClasses}>
                <InventoryTab hero={hero} />
            </TabPanel>
            {hero.spells?.length > 0 &&
                <TabPanel className={tabPanelClasses}>
                    <MagicTab hero={hero} />
                </TabPanel>
            }
            <TabPanel className={tabPanelClasses}>
                <AbilitiesTab hero={hero} />
            </TabPanel>
            <TabPanel className={tabPanelClasses}>
                <AttacksTab actor={hero.parent} />
            </TabPanel>
        </Tabs>
    </div >
}