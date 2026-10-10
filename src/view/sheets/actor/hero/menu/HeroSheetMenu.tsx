import { Menu, Moon, Sun, X } from "lucide-react"
import { useCallback, useState } from "react"

import { ActiveEffectsView } from "../../../../../apps/active-effects/ActiveEffectsView"
import { HeroCreationApp } from "../../../../../apps/hero-creator/HeroCreationApp"
import { RestApp } from "../../../../../apps/rest/RestApp"
import { HeroGrantsAndModifiersApp } from "../../../../../apps/rules/HeroGrantsAndModifiersApp"
import { TravelApp } from "../../../../../apps/travel/TravelApp"
import { VagabondSettingsRegistry } from "../../../../../apps/vagabond-tools/VagabondSettingsRegistry"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { sys_id } from "../../../../../utils/foundryUtils"
import { appLang } from "../../../../../utils/lang"
import { tableBorderRounded } from "../../../../common/border-styles"
import { ItemDivider } from "../../../../component/Header"
import { VagabondActorSheet } from "../../VagabondActorSheet"
import { AppMenuToggleSwitch } from "./item/AppMenuToggleSwitch"
import { MenuListItem } from "./item/MenuListItem"

export const HeroSheetMenu = ({ hero, sheet, className }: { hero: HeroDataModel, sheet: VagabondActorSheet, className: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(
        sheet.classList.contains('theme-dark') || (
            !sheet.classList.contains('theme-light') && document.body.classList.contains('theme-dark')
        )
    )

    const toggleMenu = useCallback(() => {
        setIsOpen(!isOpen)
    }, [isOpen])

    const toggleTheme = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setIsDarkMode(!isDarkMode)
        const curUiConfig = (game.settings as any).get("core", "uiConfig")
        const curColorScheme = curUiConfig.colorScheme
        const curTheme = curColorScheme.applications;
        (game.settings as any).set("core", "uiConfig", {
            ...curUiConfig,
            colorScheme: {
                ...curColorScheme,
                applications: curTheme === "dark" ? "light" : "dark"
            }
        })
        sheet._renderHTML() // Ensures a smooth visual transition
        VagabondSettingsRegistry.refreshActorSheets() // Propagates the theme change to all owned actors' sheets
    }, [sheet, isDarkMode])

    return (<>
        <div className={`relative ${className}`}>
            {/* MENU BUTTON */}
            <button onClick={toggleMenu} className="flex items-center justify-center p-2 cursor-pointer">
                <div className="relative w-6 h-6">
                    <Menu className={`absolute inset-0 w-6 h-6 transition-all duration-300 transform ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                    <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 transform ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
                </div>
            </button>

            {/* MENU CONTAINER */}
            <div className={`
                absolute top-9 right-0 z-1000 p-4 w-54 max-h-120 overflow-y-auto
                bg-context-menu-fill border-2 border-solid border-table-border rounded-sm shadow-lg
                transition-all duration-200 transform origin-top-right
                ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}
            `}>
                {/* DARK/LIGHT THEME SELECTOR */}
                <div className={`flex gap-x-2 items-center justify-between mb-4 px-2 py-1 bg-sheet-header-fill cursor-pointer ${tableBorderRounded}`} onClick={toggleTheme}>
                    <p className="text-sm">{appLang.General.theme}</p>
                    <div className="flex gap-x-2 px-2 py-1 border border-solid border-text-header-tertiary rounded-sm">
                        <Sun size={18} className={`${isDarkMode ? 'text-text-header-primary hover-glow' : 'text-text-header-secondary'}`} />
                        <Moon size={18} className={`${isDarkMode ? 'text-text-header-secondary' : 'text-text-header-primary hover-glow'}`} />
                    </div>
                </div>
                <ul className="space-y-2 text-sm text-text-primary font-eskapade font-bold">
                    {/* {!hero.tagalongId &&
                        <MenuListItem text={"IMPORT"} onClick={() => importFromVgbndApp(hero)} />
                    } */}
                    {!hero.ancestry &&
                        <MenuListItem text={"CREATE HERO"} onClick={() => new HeroCreationApp(hero.parent).render({ force: true })} toggleMenu={toggleMenu} />
                    }
                    {game.user?.isActiveGM && hero.level.xpToLevel === -1 && !hero.parent.getFlag(sys_id, "destiny") &&
                        <MenuListItem text={'[GM] GRANT LEVEL UP!!'} onClick={() => hero.parent.setFlag(sys_id, "destiny", true)} toggleMenu={toggleMenu} />
                    }
                    {game.user?.isActiveGM && hero.parent.getFlag(sys_id, "destiny") &&
                        <MenuListItem text={'[GM] REVOKE LEVEL UP'} onClick={() => hero.parent.setFlag(sys_id, "destiny", false)} toggleMenu={toggleMenu} />
                    }

                    <AppMenuToggleSwitch label={appLang.General.heroSheetStats} hero={hero} toggleKey="hero-sheet-stats-hide" />
                    <AppMenuToggleSwitch label={appLang.General.heroSheetTrackers} hero={hero} toggleKey="hero-sheet-trackers-hide" />
                    <AppMenuToggleSwitch label={appLang.General.miniCards} hero={hero} toggleKey="hero-sheet-mini-cards" />
                    <MenuListItem text={'REST'} onClick={() => { new RestApp(hero.parent).render({force: true}) }} toggleMenu={toggleMenu} />
                    <MenuListItem text={'TRAVEL'} onClick={() => { new TravelApp(hero.parent).render({force: true}) }} toggleMenu={toggleMenu} />
                    <MenuListItem text={'DOWNTIME'} onClick={() => { }} toggleMenu={toggleMenu} />
                    <MenuListItem text={'GRANTS & MODIFIERS'} onClick={() => new HeroGrantsAndModifiersApp(hero.parent).render({ force: true })} toggleMenu={toggleMenu} />

                    <ItemDivider />

                    <div className="-mx-2">
                        <ActiveEffectsView initialDocument={hero.parent} />
                    </div>
                </ul>
            </div>
        </div>
    </>)
}