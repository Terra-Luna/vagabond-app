import HeroDataModel from "../../../../model/actor/HeroDataModel"
import { FoundryActor, VgLiteActorSheet } from "../VgLiteActorSheet"
import { localizeString } from "../../../../utils/localeUtils"
import { Menu } from "lucide-react"
import lang from "../../../../../public/lang/en.json"
import { IconButton } from "../../../component/IconButton"
import { useCallback, useRef, useState } from "react"
import { SpellDelivery, Sphere } from "../../../../combat/spellcasting/SpellDelivery"
import { GridItem, GridRow } from "../../../component/Grid"
import { Avatar, HPAndArmorDisplay, Saves, Speeds, Stats, Trackers } from "./tab/TopSection"
import { SkillCard } from "../../../component/SkillCard"
import { Tabs, Tab, TabList, TabPanel } from "react-tabs"
import { MainTab } from "./tab/MainTab"
import { EditableNameField } from "../../../component/EditableTextField"

const locale = lang.VGLITE.HeroSheet

export default class HeroSheet extends VgLiteActorSheet {
    Component = HeroSheetReactComponent
}

const HeroSheetReactComponent = ({ actor }: { actor: FoundryActor<HeroDataModel> }) => {
    const hero = actor.system;
    return (
        <div id="hero-sheet-div">
            <HeroSheetHeader hero={hero} />
            <HeroSheetUpperSection hero={hero} />
            <HeroSheetTabbedSection hero={hero} />
        </div>
    )
}

const HeroSheetHeader = ({ hero }: { hero: HeroDataModel }) => {
    const deliveryRef = useRef<SpellDelivery>(null)

    const [_, forceUpdate] = useState(false)

    const openMenu = useCallback((event) => {
        deliveryRef.current = new Sphere()
        forceUpdate(!_)
    }, [])

    const toggleTheme = useCallback(() => {
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
    }, [])

    return (
        <div className="vglite-sheet-header">
            <div className="name">
                <EditableNameField actor={hero.parent} />
                <IconButton Icon={Menu} size={24} className="float-right vglite-menu" onClick={openMenu} onAuxClick={toggleTheme} /></div>
            <div className="descriptor">
                <span>{localizeString(locale.Level, { level: hero.level.current?.toString() ?? "0" })}</span>
                <span className="vglite-dot"> • </span>
                <span>{localizeString(locale.AncestryAndClass, { ancestry: hero.ancestry.name || lang.VGLITE.AncestryTypes.human, class: hero.class.name || "Vagabond" })}</span>
            </div>
            <div className="xp float-right">
                <span>{localizeString(locale.xp, { xp: hero.level.xp?.toString() || '0', nextLevel: hero.level.xpToLevel?.toString() || '0' })}</span>
            </div>
        </div>
    )
}

const HeroSheetUpperSection = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="hero-sheet-upper-section">
            <GridRow>
                <GridItem lg={6} sm={6}>
                    <Avatar hero={hero} />
                    <HPAndArmorDisplay health={hero.health} armor={hero.armor} hero={hero} />
                    <Speeds hero={hero} />
                </GridItem>
                <GridItem lg={6} sm={6}>
                    <Stats hero={hero} />
                    <Trackers hero={hero} />
                    <Saves hero={hero} />
                </GridItem>
            </GridRow>
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