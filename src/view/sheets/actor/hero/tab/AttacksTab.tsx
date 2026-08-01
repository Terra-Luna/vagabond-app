import { useEffect, useMemo, useState } from "react"
import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { ManaHUD } from "./component/spellcasting/ManaHUD"
import { isEquippedWeapon, WeaponDataModel } from "../../../../../model/item/equip/WeaponDataModel"

export const AttacksTab = ({ actor }: { actor: Actor & { system: HeroDataModel }}) => {

    const [hasEquippedWeapon, setHasEquippedWeapon] = useState(false)
    const [isCaster, setIsCaster] = useState(false)

    const weapons = useMemo(() => {
        return actor.items.filter(it => (it.type as string) === 'weapon' && isEquippedWeapon(it.system))
    }, [actor])

    useEffect(() => {
        setHasEquippedWeapon(actor.system.inventory.items.some(it => isEquippedWeapon(it)))
        setIsCaster(actor.system.spells.length > 0)
    }, [actor])
    
    return (
        <div>
            {weapons.length > 0 && <WeaponAttackMenu actor={actor} weapons={weapons} />}
            {isCaster && <ManaHUD hero={actor.system} isCastMenuOpen={true} />}
        </div>
    )
}

const WeaponAttackMenu = ({ actor, weapons }: {
    actor: Actor & { system: HeroDataModel }, weapons: Item[]
}) => {
    return (
        <div>
            <Label text={"Weapons"} />
            {weapons.map(weapon => (
                <div key={weapon.uuid}>
                    {weapon.name}
                </div>
            ))}
        </div>
    )
}

const Label = ({ text }) => {
    return (
        <div className="text-xl text-text-primary font-eskapade font-bold">{text}</div>
    )
}