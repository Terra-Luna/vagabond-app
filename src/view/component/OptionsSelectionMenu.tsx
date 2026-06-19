import { X } from "lucide-react"
import { useCallback, useState } from "react"
import { updateDocumentAtPath } from "../../utils/documentUtils"
import { useDimensions } from "../context/DimensionsContext"
import { glowOnHover } from "../sheets/VgLiteSheet"

export const OptionsSelectionMenu = (
    { actor, path, options, position, hideMenu }: {
        actor: any,
        path: string[],
        options: { key: string, value: any, isSelected: boolean }[],
        position: { x: number, y: number },
        hideMenu: () => {}
    }
) => {
    const x = Number.isNaN(position.x) ? 0 : position.x
    const y = Number.isNaN(position.y) ? 0 : position.y

    const updateSelections = (option: { key: string, value: string, isSelected: boolean }) => {
        options.find(o => o.key === option.key)!.isSelected = !option.isSelected
        console.log("Updating options:", options.filter(o => o.isSelected))
        updateDocumentAtPath(actor, path, options.filter(o => o.isSelected).map(o => o.key))
    }

    return (
        <div
            className="p-2 bg-context-menu-fill border border-solid border-table-border rounded-md"
            style={{ position: 'absolute', top: y, left: x }}
        >
            <X size={18} className={`relative ml-auto mb-auto ${glowOnHover}`} onClick={() => { hideMenu() }} />
            <div className="columns-3">
                {
                    options.map(option => (
                        option.isSelected ?
                            <p key={option.key} className={`text-stat-block-fill font-bold ${glowOnHover}`} onClick={() => updateSelections(option)}>
                                {option.value}
                            </p> :
                            <p key={option.key} className={`text-text-primary font-normal ${glowOnHover}`} onClick={() => updateSelections(option)}>
                                {option.value}
                            </p>
                    ))
                }
            </div>
        </div>
    )
}

export const useOptionsSelectionMenu = () => {
    const [actor, setActor] = useState(null)
    const [path, setPath] = useState([])
    const [options, setOptions] = useState([])
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const { top, left } = useDimensions()
    const [menuVisible, setMenuVisible] = useState(false)

    const showMenu = useCallback((e: any, actor, path, options) => {
        setActor(actor)
        setPath(path)
        setOptions(options)
        setPosition({ x: e.clientX, y: e.clientY })
        setMenuVisible(true)
    }, [])

    const hideMenu = useCallback(() => {
        setMenuVisible(false)
    }, [])

    const menu = menuVisible ?
        <OptionsSelectionMenu
            actor={actor}
            path={path}
            options={options}
            position={{ x: position.x - left, y: position.y - top }}
            hideMenu={() => hideMenu}
        />
        : undefined

    return { menuVisible, showMenu, menu }
}