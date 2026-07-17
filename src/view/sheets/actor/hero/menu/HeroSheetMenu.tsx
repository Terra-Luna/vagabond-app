import { useCallback, useEffect, useState } from "react"
import { Menu, Moon, Sun, X } from "lucide-react"
import { VgLiteActorSheet } from "../../VgLiteActorSheet"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { MenuListItem } from "./item/MenuListItem"
import { importFromVgbndApp } from "./util/vgbnd-import"
import { HeroCreator } from "../../../../../apps/hero-creator/HeroCreator"
import { useGlobalPopout } from "../../../../../apps/PopoutApplication"
import { NavigationContextProvider } from "../../../../context/navigation/NavigationContextProvider"
import { HeroActiveRulesView } from "../../../../component/rules/HeroActiveRulesView"
import { ActiveEffectsManager } from "../../../../../apps/active-effects/ActiveEffectManager"

export const HeroSheetMenu = ({ hero, sheet, className }: { hero: HeroDataModel, sheet: VgLiteActorSheet, className: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(
        sheet.classList.contains('theme-dark') || (
            !sheet.classList.contains('theme-light') && document.body.classList.contains('theme-dark')
        )
    )

    const [isCreatorOpen, setIsCreatorOpen] = useState(false)
    const [isActiveEffectsOpen, setIsActiveEffectsOpen] = useState(false)
    const [isGrantModifiersOpen, setIsGrantModifiersOpen] = useState(false)

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

    const setCreatorClosed = useCallback(() => {
        setIsCreatorOpen(false)
    }, [])

    const setEffectsClosed = useCallback(() => {
        setIsActiveEffectsOpen(false)
    }, [])

    const setRulesClosed = useCallback(() => {
        setIsGrantModifiersOpen(false)
    }, [])

    const createrPopout = useGlobalPopout(setCreatorClosed)
    const effectsPopout = useGlobalPopout(setEffectsClosed)
    const rulesPopout = useGlobalPopout(setRulesClosed)

    // Note - this could just be a useCallback that the button calls to render the 
    // popup, but that makes it so that if you click "create hero" multiple times, 
    // you get multiple popups.
    useEffect(() => {
        if (isCreatorOpen) {
            createrPopout.renderPopout(
                <NavigationContextProvider children={
                    <HeroCreator hero={hero.parent} />
                } />, "Hero Creator", true
            )
        }
        if (isActiveEffectsOpen) {
            effectsPopout.renderPopout(
                <ActiveEffectsManager initialDocument={hero.parent} />, "Active Effects", true
            )
        }
        if (isGrantModifiersOpen) {
            rulesPopout.renderPopout(
                <HeroActiveRulesView actor={hero.parent} />, "Grants & Modifiers", false
            )
        }
    }, [isCreatorOpen, isActiveEffectsOpen, isGrantModifiersOpen])

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
                absolute top-8 right-0 z-1000 p-4
                bg-context-menu-fill border-2 border-solid border-table-border rounded-sm shadow-lg
                transition-all duration-200 transform origin-top-right
                ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
            `}>
                {/* MENU CONTENT */}
                <div className="flex gap-x-2 justify-between mb-4 px-2 py-1 bg-sheet-header-fill border border-solid border-table-border rounded-md cursor-pointer" onClick={toggleTheme}>
                    <Sun size={18} className={`${!isDarkMode ? 'text-text-header-secondary' : 'text-text-header-primary'}`} />
                    <Moon size={18} className={`${isDarkMode ? 'text-text-header-secondary' : 'text-text-header-primary'}`} />
                </div>
                <ul className="space-y-2 text-sm text-text-primary font-eskapade font-bold">
                    {
                        !hero.tagalongId ?
                            <MenuListItem text={"IMPORT"} onClick={() => importFromVgbndApp(hero)} /> :
                            <></>
                    }
                    {
                        !hero.ancestry || !hero.class ?
                            <MenuListItem text={"CREATE"} onClick={() => setIsCreatorOpen(true)} toggleMenu={toggleMenu} /> :
                            <></>
                    }
                    <MenuListItem text={'ACTIVE EFFECTS'} onClick={() => setIsActiveEffectsOpen(true)} toggleMenu={toggleMenu} />
                    <MenuListItem text={'GRANTS & MODIFIERS'} onClick={() => setIsGrantModifiersOpen(true)} toggleMenu={toggleMenu} />
                    <MenuListItem text={'REST'} onClick={() => { }} toggleMenu={toggleMenu} />
                    <MenuListItem text={'TRAVEL'} onClick={() => { }} toggleMenu={toggleMenu} />
                    <MenuListItem text={'DOWNTIME'} onClick={() => { }} toggleMenu={toggleMenu} />
                    <MenuListItem text={'STATUSES'} onClick={() => { }} toggleMenu={toggleMenu} />
                    <MenuListItem text={'LEVEL UP'} onClick={() => { }} toggleMenu={toggleMenu} />
                </ul>
            </div>
        </div>
    </>)
}