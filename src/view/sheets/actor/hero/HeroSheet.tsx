import lang from "../../../../../public/lang/en.json"
import HeroDataModel from "../../../../model/actor/HeroDataModel"
import { localizeString } from "../../../../utils/localeUtils"
import { FoundryActor, VgLiteActorSheet } from "../VgLiteActorSheet"
import { EditableNameField } from "../../../component/EditableTextField"
import { Menu } from "lucide-react"
import { IconOnlyButton } from "../../../component/IconOnlyButton"
import { useCallback, useEffect, useRef, useState } from "react"
import { SpellDelivery, Sphere } from "../../../../combat/spellcasting/SpellDelivery"
import { Tabs, Tab, TabList, TabPanel } from "react-tabs"
import { MainTab } from "./tab/MainTab"
import { InventoryTab } from "./tab/InventoryTab"
import { MagicTab } from "./tab/MagicTab"
import { AbilitiesTab } from "./tab/AbilitiesTab"
import { importHero } from "../../../../api/tagalong/TagalongImporter"
import { getName } from "../../../../utils/modelUtil"
import { Stats, HPArmorFatigueHUD, Saves, Speeds, Luck, Studied, Skills, StatsDrawerContextProvider, useStatsDrawerStatus } from "./tab/TopSection"
import ActorDataModel, { BaseActorSchema } from "../../../../model/actor/ActorDataModel"

const locale = lang.VGLITE.HeroSheet

export default class HeroSheet extends VgLiteActorSheet {
    Component = HeroSheetReactComponent
    static DEFAULT_OPTIONS = {
        position: {
            width: 420,
            height: 1060
        },
        window: {
            resizable: true
        }
    }
}

const HeroSheetReactComponent = ({ actor, sheet }: { actor: FoundryActor<HeroDataModel>, sheet: VgLiteActorSheet }) => {
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
    const deliveryRef = useRef<SpellDelivery>(null)

    const [_, forceUpdate] = useState(false)

    const openMenu = useCallback((event) => {
        deliveryRef.current = new Sphere()
        forceUpdate(!_)
    }, [])

    const toggleTheme = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        const curUiConfig = (game.settings as any).get("core", "uiConfig")
        const curColorScheme = curUiConfig.colorScheme
        const curTheme = curColorScheme.applications; // this semicolon is needed
        (game.settings as any).set("core", "uiConfig", {
            ...curUiConfig,
            colorScheme: {
                ...curColorScheme,
                applications: curTheme === "dark" ? "light" : "dark"
            }
        })
        sheet._renderHTML()
    }, [sheet])

    return (
        <div className="flex">
            {/* MAIN STATS ARRAY */}
            <Stats hero={hero} />

            {/* PORTRAIT */}
            <Portrait actor={hero} />

            {/* MAIN HEADER CONTENT + MENU BUTTON */}
            <div className="flex flex-col grow">
                <div className="bg-sheet-header-fill font-eskapade grow">
                    <div className="text-text-header-primary text-4xl font-bold mt-1 ml-2 flex">
                        <EditableNameField actor={hero.parent} />
                        <IconOnlyButton Icon={Menu} size={24} className="ml-auto mr-2" onClick={openMenu} onAuxClick={toggleTheme} />
                    </div>
                    <div className="flex text-text-header-secondary ml-2 pb-1">
                        <span>{localizeString(locale.Level, { level: hero.level.current?.toString() ?? "0" })}</span>
                        <span>&nbsp;•&nbsp;</span>
                        <span>{localizeString(locale.AncestryAndClass, { ancestry: getName(hero.ancestry) || '', class: getName(hero.class) || "Vagabond" })}</span>
                        <div className="ml-auto mr-2">
                            <span>{localizeString(locale.xp, { xp: hero.level.xp?.toString() || '0', nextLevel: hero.level.xpToLevel?.toString() || '0' })}</span>
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

export const Portrait = ({ actor }: { actor: ActorDataModel<BaseActorSchema> }) => {
    return (
        <img
            className={`bg-transparent object-contain h-[178px] w-[120px] ml-1`}
            src={actor.parent.img}
            alt={actor.parent.name}
            onClick={async (event) => {
                // TODO: migrate the tagalong import into the hero sheet burger menu.
                if (actor instanceof HeroDataModel && actor.tagalongId == undefined) {
                    const tagalongLink = prompt('Enter character link from Vagabond Tagalong App')
                    if (tagalongLink != null) {
                        importHero(actor, tagalongLink)
                    }
                }
                else {
                    new foundry.applications.apps.ImagePopout(
                        actor.parent.img, {
                            src: actor.parent.img,
                            uuid: actor.parent.uuid,
                            window: { title: actor.parent.name }
                    }
                    ).render(true)
                }
            }}
        />
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
                <Tab>
                    {locale["tab-main"]}
                </Tab>
                <Tab>
                    {locale["tab-inv"]}
                </Tab>
                {
                    hero.spells?.length > 0 ? <Tab>{locale["tab-magic"]}</Tab> : <></>
                }
                <Tab>
                    {locale["tab-abilities"]}
                </Tab>
            </TabList>
            <TabPanel className={tabPanelClasses}>
                <MainTab hero={hero} />
            </TabPanel>
            <TabPanel className={tabPanelClasses}>
                <InventoryTab hero={hero} />
            </TabPanel>
            {
                hero.spells?.length > 0 ? <TabPanel className={tabPanelClasses}>
                    <MagicTab hero={hero} />
                </TabPanel> : <></>
            }
            <TabPanel className={tabPanelClasses}>
                <AbilitiesTab hero={hero} />
            </TabPanel>
        </Tabs>
    </div >
}