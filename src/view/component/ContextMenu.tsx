import { useState, useCallback } from 'react'
import { deleteItems, openItemSheet } from '../../model/actor/type/Inventory'
import { getId } from '../../utils/modelUtil'
import HeroDataModel from '../../model/actor/HeroDataModel'
import EquipmentDataModel, { EquipmentSchema, setEquipState } from '../../model/item/equip/EquipmentDataModel'
import { useDimensions } from '../context/DimensionsContext'
import { ItemDivider } from './Header'
import WeaponDataModel, { equipWeapon } from '../../model/item/equip/WeaponDataModel'
import { rollDamage, rollWeaponDamage } from '../../combat/dice-rolls'

/**
 * A reusable context menu!
 * @param param0
 * @returns 
 */
export const VgLiteContextMenu = ({ options, position }: { options: any, position: { x: number, y: number } }) => {
    const x = Number.isNaN(position.x) ? 0 : position.x
    const y = Number.isNaN(position.y) ? 0 : position.y
    return (
        <div
            className="bg-context-menu-fill text-context-menu-text border border-solid border-table-border"
            style={{ position: 'absolute', top: y, left: x }}
        >
            <ItemDivider />
            {
                options.map((option, index) => (
                    <div key={index ?? 0}>
                        <div className="py-1 px-2 font-eskapade font-bold hover:bg-context-menu-hover" onClick={option.action}>
                            {option.label}
                        </div>
                        <ItemDivider />
                    </div>
                ))
            }
        </div>
    )
}

export const useContextMenu = () => {
    const [options, setOptions] = useState([])
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const { top, left } = useDimensions()
    const [menuVisible, setMenuVisible] = useState(false)

    const showMenu = useCallback((e, options) => {
        e.stopPropagation()
        e.preventDefault()
        setOptions(options)
        setPosition({ x: e.clientX, y: e.clientY })
        setMenuVisible(true)
    }, [])

    const hideMenu = useCallback(() => {
        setMenuVisible(false)
    }, [])

    const menu = menuVisible ? <VgLiteContextMenu
        options={options}
        position={{ x: position.x - left, y: position.y - top }}
    /> : undefined

    return { menuVisible, setMenuVisible, showMenu, hideMenu, menu }
}

/**
 * Target-specific context menu options...
 */
export const itemContextMenuOptions = (
    hero: HeroDataModel,
    item: EquipmentDataModel<EquipmentSchema>,
    hideMenu: () => void
) => {
    let options: { id: number, label: string, action: () => void }[] = []
    let id = 1
    if (item.isEquippable) {
        options.push({
            id: id, label: item.isEquipped ? 'Unequip' : 'Equip', action: () => {
                hideMenu()
                item.isEquipped ? setEquipState(item, false) : (
                    (item instanceof WeaponDataModel) ? equipWeapon(hero, item) : 
                        setEquipState(item, false)
                    )
            }
        })
        id += 1
    }
    else if (item.isConsumable) {
        options.push({
            id: id, label: 'Use', action: () => {
                hideMenu()
                ui.notifications?.warn("TODO: send item cards to chat on-use...")
                deleteItems(hero, [getId(item)])
            }
        })
        id += 1
    }

    options.push({
        id: id, label: 'View details', action: () => {
            hideMenu()
            openItemSheet(hero, getId(item))
        }
    })
    id += 1
        
    options.push({
        id: id, label: 'Send to Chat', action: () => {
            hideMenu()
            ui.notifications?.warn("TODO: send item cards to chat...")
        }
    })
    id += 1

    options.push({
        id: id, label: 'Discard', action: () => {
            hideMenu()
            deleteItems(hero, [getId(item)])
        }
    })
    return options
}

export const weaponsContextMenuOptions = (
    hero: HeroDataModel,
    weapon: WeaponDataModel,
    hideMenu: () => void
) => {
    return [
        {
            id: 1, label: 'Attack', action: () => {
                hideMenu()
                rollWeaponDamage(hero.parent, weapon)
            }
        },
        {
            id: 2, label: 'Unequip', action: () => {
                hideMenu()
                setEquipState(weapon, false)
            }
        }
    ]
}