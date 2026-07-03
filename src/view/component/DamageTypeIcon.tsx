import { ReactElement } from "react"
import lang from "../../../public/lang/en.json"
import { Brain, Cross, Droplets, Flame, FlaskRound, HandFist, Skull, Snowflake, Sparkle, Wand, Zap } from "lucide-react"
import { Tooltip } from "./Tooltip"

export const DamageTypeIcon = ({ dmgType, size }: { dmgType: string, size?: number }) => {
    size = size ? size : 20
    let element: ReactElement | undefined
    switch (lang.VGLITE.DamageTypes[dmgType]) {
        case lang.VGLITE.DamageTypes.magical: {
            element = <Wand size={size} className='text-magical' />
            break
        }
        case lang.VGLITE.DamageTypes.fire: {
            element = <Flame size={size} className='text-fire' />
            break
        }
        case lang.VGLITE.DamageTypes.cold: {
            element = <Snowflake size={size} className='text-cold' />
            break
        }
        case lang.VGLITE.DamageTypes.shock: {
            element = <Zap size={size} className='text-shock' />
            break
        }
        case lang.VGLITE.DamageTypes.acid: {
            element = <Droplets size={size} className='text-acid' />
            break
        }
        case lang.VGLITE.DamageTypes.poison: {
            element = <FlaskRound size={size} className='text-poison' />
            break
        }
        case lang.VGLITE.DamageTypes.necrotic: {
            element = <Skull size={size} className='text-necrotic' />
            break
        }
        case lang.VGLITE.DamageTypes.psychic: {
            element = <Brain size={size} className='text-psychic' />
            break
        }
        case lang.VGLITE.DamageTypes.healing: {
            element = <Cross size={size} className='text-healing' />
            break
        }
        case lang.VGLITE.DamageTypes.mana: {
            element = <Sparkle size={size} className='text-mana' />
            break
        }
        case lang.VGLITE.DamageTypes.physical: {
            element = <div className={`bg-white rounded-full p-0.5`}>
                <HandFist size={size - 2} className='text-black' />
            </div>
            break
        }
        case lang.VGLITE.DamageTypes.blunt: {
            element = <CustomIcon path={'systems/vagabond-lite/assets/icons/dmg/blunt.svg'} size={size} />
            break 
        }
        case lang.VGLITE.DamageTypes.pierce: {
            element = <CustomIcon path={'systems/vagabond-lite/assets/icons/dmg/pierce.svg'} size={size} />
            break
        }
        case lang.VGLITE.DamageTypes.slash: {
            element = <CustomIcon path={'systems/vagabond-lite/assets/icons/dmg/slash.svg'} size={size} />
            break
        }
    }
    if (element === undefined) {
        element = <p>{lang.VGLITE.DamageTypes[dmgType]}</p>
    }
    return (
        <Tooltip text={lang.VGLITE.DamageTypes[dmgType]} children={element} />
    )
}

const CustomIcon = ({ path, size }: { path: string, size: number }) => {
    return (
        <div className="bg-white rounded-full p-0.5 h-fit">
            <img
                src={path}
                height={`${size-2}px`}
                width={`${size-2}px`}
                alt={''}
            />
        </div>
    )
}