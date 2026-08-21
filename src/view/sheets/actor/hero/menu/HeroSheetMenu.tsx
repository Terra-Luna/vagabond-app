import { Menu, Moon, Sun, X } from "lucide-react"
import { useCallback, useState } from "react"
import { VagabondActorSheet } from "../../VagabondActorSheet"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { MenuListItem } from "./item/MenuListItem"
import { importFromVgbndApp } from "./util/vgbnd-import"
import { ItemDivider } from "../../../../component/Header"
import { HeroCreationApp } from "../../../../../apps/hero-creator/HeroCreationApp"
import { ActiveEffectsApp } from "../../../../../apps/active-effects/ActiveEffectsApp"
import { HeroGrantsAndModifiersApp } from "../../../../../apps/rules/HeroGrantsAndModifiersApp"
import { fields } from "../../../../../model/common/sharedSchemas"
import { VagabondSettingsRegistry } from "../../../../../apps/vagabond-tools/VagabondSettingsRegistry"

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
        sheet._renderHTML()
    }, [sheet, isDarkMode])

    const toggleClientSetting = useCallback(async (settingKey) => {
        VagabondSettingsRegistry.registerClientSetting(settingKey)
        VagabondSettingsRegistry.toggleClientSetting(settingKey, hero.parent.id)
    }, [])

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
                absolute top-9 right-0 z-1000 p-4 w-54
                bg-context-menu-fill border-2 border-solid border-table-border rounded-sm shadow-lg
                transition-all duration-200 transform origin-top-right
                ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}
            `}>
                {/* DARK/LIGHT THEME SELECTOR */}
                <div className="flex gap-x-2 items-center justify-between mb-4 px-2 py-1 bg-sheet-header-fill border border-solid border-table-border rounded-md cursor-pointer" onClick={toggleTheme}>
                    <p className="text-sm">THEME</p>
                    <div className="flex gap-x-2 px-2 py-1 border border-solid border-text-header-tertiary rounded-sm">
                        <Sun size={18} className={`${!isDarkMode ? 'text-text-header-secondary' : 'text-text-header-primary'}`} />
                        <Moon size={18} className={`${isDarkMode ? 'text-text-header-secondary' : 'text-text-header-primary'}`} />
                    </div>
                </div>
                <ul className="space-y-2 text-sm text-text-primary font-eskapade font-bold">
                    {!hero.tagalongId &&
                        <MenuListItem text={"IMPORT"} onClick={() => importFromVgbndApp(hero)} />
                    }
                    {(!hero.ancestry || !hero.class) &&
                        <MenuListItem text={"CREATE"} onClick={() => new HeroCreationApp(hero.parent).render({ force: true })} toggleMenu={toggleMenu} />
                    }
                    <MenuListItem text={'ACTIVE EFFECTS'} onClick={() => new ActiveEffectsApp(hero.parent).render({ force: true })} toggleMenu={toggleMenu} />
                    <MenuListItem text={'GRANTS & MODIFIERS'} onClick={() => new HeroGrantsAndModifiersApp(hero.parent).render({ force: true })} toggleMenu={toggleMenu} />
                    <MenuListItem text={"TOGGLE TRACKERS"} toggleMenu={toggleMenu} onClick={async () => {
                        toggleClientSetting(`hero-sheet-trackers-hide-${hero.parent.id}`)
                    }} />
                    <MenuListItem text={"TOGGLE STATS"} toggleMenu={toggleMenu} onClick={async () => {
                        toggleClientSetting(`hero-sheet-stats-hide-${hero.parent.id}`)
                    }} />
                    <MenuListItem text={'REST'} onClick={() => { }} toggleMenu={toggleMenu} />
                    <MenuListItem text={'TRAVEL'} onClick={() => { }} toggleMenu={toggleMenu} />
                    <MenuListItem text={'DOWNTIME'} onClick={() => { }} toggleMenu={toggleMenu} />
                    <ItemDivider />
                </ul>
            </div>
        </div>
    </>)
}