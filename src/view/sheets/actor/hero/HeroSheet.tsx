import HeroDataModel, { getSkillByName } from "../../../../model/actor/HeroDataModel"
import { FoundryActor, VgLiteActorSheet } from "../VgLiteActorSheet"
import { localizeString } from "../../../../utils/localeUtils"
import { Menu } from "lucide-react"
import lang from "../../../../../public/lang/en.json"
import { IconOnlyButton } from "../../../component/IconOnlyButton"
import { useCallback, useEffect, useRef, useState } from "react"
import { SpellDelivery, Sphere } from "../../../../combat/spellcasting/SpellDelivery"
import { Tabs, Tab, TabList, TabPanel } from "react-tabs"
import { MainTab } from "./tab/MainTab"
import { InventoryTab } from "./tab/InventoryTab"
import { MagicTab } from "./tab/MagicTab"
import { AbilitiesTab } from "./tab/AbilitiesTab"
import { EditableNameField } from "../../../component/EditableTextField"
import { importHero } from "../../../../api/tagalong/TagalongImporter"
import { getName } from "../../../../utils/modelUtil"
import { Avatar, Stats, Actions, HPAndArmorDisplay, Saves, Speeds, Trackers } from "./tab/TopSection"
import { useDimensions } from "../../../context/DimensionsContext"

const locale = lang.VGLITE.HeroSheet

export default class HeroSheet extends VgLiteActorSheet {
    Component = HeroSheetReactComponent

    static DEFAULT_OPTIONS = {
        position: {
            width: 440,
            height: 1060
        },
        window: {
            resizable: true
        }
    }

}

const HeroSheetReactComponent = ({ actor, sheet }: { actor: FoundryActor<HeroDataModel>, sheet: VgLiteActorSheet }) => {
    const hero = actor.system
    const { height } = useDimensions()
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
        <div className="@container flex flex-col grow min-h-0">
            <HeroSheetHeader hero={hero} sheet={sheet} />
            <HeroSheetUpperSection hero={hero} />
            <HeroSheetTabbedSection hero={hero} />
        </div>
    )
}

const HeroSheetHeader = ({ hero, sheet }: { hero: HeroDataModel, sheet: VgLiteActorSheet }) => {
    hero.tagalongId
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
        <div className="bg-sheet-header-fill font-eskapade">
            <div className="text-text-header-primary text-4xl font-bold ml-2 flex">
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
    )
}

const HeroSheetUpperSection = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="grid @sm:grid-cols-1 @md:grid-cols-2 ml-1 mr-1 mt-1 gap-1">
            <div>
                <Avatar hero={hero} />
                <HPAndArmorDisplay health={hero.health} armor={hero.armor} hero={hero} />
                <Trackers hero={hero} />
                <Speeds hero={hero} />
            </div>
            <div className="flex flex-col items-center gap-y-2">
                <Stats hero={hero} />
                {
                    hero.actions.length > 0 ? (
                        <Actions hero={hero} actions={hero.actions.map(a => getSkillByName(hero, a))} />
                    ) : null
                }
                <Saves hero={hero} />
            </div>
        </div>
    )
}

const HeroSheetTabbedSection = ({ hero }: { hero: HeroDataModel }) => {
    const tabPanelClasses = "min-h-0 overflow-y-auto"
    return <div className="mt-1 flex flex-col min-h-0 grow">
        <div className="h-px bg-sheet-main-fill w-full mt-1 align-top" />
        <Tabs className="flex flex-col min-h-0 grow">
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
