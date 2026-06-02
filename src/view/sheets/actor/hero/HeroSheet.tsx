import HeroDataModel from "../../../../model/actor/HeroDataModel"
import { FoundryActor, VgLiteActorSheet } from "../VgLiteActorSheet"
import { localizeString } from "../../../../utils/localeUtils"
import { Menu } from "lucide-react"
import lang from "../../../../../public/lang/en.json"
import { IconButton } from "../../../component/IconButton"
import { useCallback, useRef, useState } from "react"
import { SpellDelivery, Sphere } from "../../../../combat/spellcasting/SpellDelivery"
import { Avatar, HPAndArmorDisplay, Saves, Speeds, Stats, Trackers } from "./tab/TopSection"
import { SkillCard } from "../../../component/SkillCard"
import { Tabs, Tab, TabList, TabPanel } from "react-tabs"
import { MainTab } from "./tab/MainTab"
import { EditableNameField } from "../../../component/EditableTextField"

const locale = lang.VGLITE.HeroSheet

export default class HeroSheet extends VgLiteActorSheet {
    Component = HeroSheetReactComponent
}

const HeroSheetReactComponent = ({ actor, sheet }: { actor: FoundryActor<HeroDataModel>, sheet: VgLiteActorSheet }) => {
    const hero = actor.system;
    return (
        <div id="hero-sheet-div">
            <HeroSheetHeader hero={hero} sheet={sheet} />
            <HeroSheetUpperSection hero={hero} />
            <HeroSheetTabbedSection hero={hero} />
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
        <div className="bg-sheet-header-fill font-eskapade">
            <div className="text-text-header-primary text-4xl font-bold ml-2 flex">
                <EditableNameField actor={hero.parent} />
                <IconButton Icon={Menu} size={24} className="ml-auto mr-2" onClick={openMenu} onAuxClick={toggleTheme} />
            </div>
            <div className="flex text-text-header-secondary ml-2 pb-1">
                <span>{localizeString(locale.Level, { level: hero.level.current?.toString() ?? "0" })}</span>
                <span>&nbsp;•&nbsp;</span>
                <span>{localizeString(locale.AncestryAndClass, { ancestry: hero.ancestry.name || '', class: hero.class.name || "Vagabond" })}</span>
                <div className="ml-auto mr-2">
                    <span>{localizeString(locale.xp, { xp: hero.level.xp?.toString() || '0', nextLevel: hero.level.xpToLevel?.toString() || '0' })}</span>
                </div>
            </div>
        </div>
    )
}

const HeroSheetUpperSection = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 ml-1 mt-1 gap-1">
            <div>
                <Avatar hero={hero} />
                <HPAndArmorDisplay health={hero.health} armor={hero.armor} hero={hero} />
                <Speeds hero={hero} />
            </div>
            <div className="flex flex-col items-center mx-1 gap-y-2">
                <Stats hero={hero} />
                <Trackers hero={hero} />
                <Saves hero={hero} />
            </div>
        </div>
    )
}

const HeroSheetTabbedSection = ({ hero }: { hero: HeroDataModel }) => {
    return <div className="hero-sheet-tabbed-section">
        <Tabs>
            <TabList>
                <Tab>
                    Main
                </Tab>
                <Tab>
                    Inventory
                </Tab>
                <Tab>
                    Magic
                </Tab>
                <Tab>
                    Abilities
                </Tab>
            </TabList>
            <TabPanel>
                <MainTab hero={hero} />
            </TabPanel>
            <TabPanel>
                Inventory
            </TabPanel>
            <TabPanel>
                {
                    hero.spells.map(s => (
                        <SkillCard
                            title={s.name}
                            subtitles={[['Base dmg', s.damageType]]}
                            description={`${s.description}`}
                        />
                    ))
                }
            </TabPanel>
            <TabPanel>
                Abilities
            </TabPanel>
        </Tabs>
    </div>
}