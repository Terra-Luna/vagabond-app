import { useState, useCallback } from 'react'
import { deleteItems, openItemSheet } from '../../model/actor/type/Inventory'
import { getId } from '../../utils/modelUtil'
import HeroDataModel from '../../model/actor/HeroDataModel'
import EquipmentDataModel, { EquipmentSchema } from '../../model/item/equip/EquipmentDataModel'

/**
 * A reusable context menu!
 * @param param0
 * @returns 
 */
export const VgLiteContextMenu = ({ options, position }: { options: any, position: { x: number, y: number } }) => {
    console.log(position.x, position.y)
    return (
        <div className={`absolute top-" + ${position.y} + " left-" + ${ position.x }`}>
            {
                options.map((option, index) => (
                    <div key={index} onClick={option.action}>
                        {option.label}
                    </div>
                ))
            }
        </div>
    )
}

export const useContextMenu = () => {
    const [options, setOptions] = useState([])
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [menuVisible, setMenuVisible] = useState(false)

    const showMenu = useCallback((e, options) => {
        e.stopPropagation()    
        e.preventDefault()
        setOptions(options)
        setPosition({ x: e.pageX, y: e.pageY })
        setMenuVisible(true)
    }, []);

    const hideMenu = useCallback(() => {
        setMenuVisible(false)
    }, [])

    return { menuVisible, options, position, showMenu, hideMenu }
}

/**
 * Target-specific context menu options...
 */
export const itemContextMenuOptions = (hero: HeroDataModel, item: EquipmentDataModel<EquipmentSchema>) => {
    return [
        { id: 1, label: 'Use', action: () => { console.log("Using item!") } },
        { id: 2, label: 'View details', action: () => { openItemSheet(hero, getId(item)) } },
        { id: 3, label: '????', action: () => { console.log("????") } },
        { id: 4, label: 'Discard', action: () => { deleteItems(hero, [getId(item)])} }
    ]
}