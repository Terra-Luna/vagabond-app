import lang from "../../../public/lang/en.json"
import { Brain, Cross, Droplets, Flame, FlaskRound, HandFist, Skull, Snowflake, Wand, Zap } from "lucide-react"

export const DamageTypeIcon = ({ dmgType, size }: { dmgType: string, size?: number }) => {
    size = size ? size : 20
    switch (lang.VGLITE.DamageTypes[dmgType]) {
        case lang.VGLITE.DamageTypes.magical: {
            return (<Wand size={size} className='text-magical' />)
        }
        case lang.VGLITE.DamageTypes.fire: {
            return (<Flame size={size} className='text-fire' />)
        }
        case lang.VGLITE.DamageTypes.cold: {
            return (<Snowflake size={size} className='text-cold' />)
        }
        case lang.VGLITE.DamageTypes.shock: {
            return (<Zap size={size} className='text-shock' />)
        }
        case lang.VGLITE.DamageTypes.acid: {
            return (<Droplets size={size} className='text-acid' />)
        }
        case lang.VGLITE.DamageTypes.poison: {
            return (<FlaskRound size={size} className='text-poison' />)
        }
        case lang.VGLITE.DamageTypes.necrotic: {
            return (<Skull size={size} className='text-necrotic' />)
        }
        case lang.VGLITE.DamageTypes.psychic: {
            return (<Brain size={size} className='text-psychic' />)
        }
        case lang.VGLITE.DamageTypes.healing: {
            return (<Cross size={size} className='text-healing' />)
        }
        case lang.VGLITE.DamageTypes.physical: {
            return (
                <div className={`bg-white rounded-full p-0.5`}>
                    <HandFist size={size-2} className='text-black' />
                </div>
            )
        }
        case lang.VGLITE.DamageTypes.blunt: {
            return <CustomIcon path={'systems/vagabond-lite/assets/icons/dmg/blunt.svg'} size={size} />
        }
        case lang.VGLITE.DamageTypes.piercing: {
            return <CustomIcon path={'systems/vagabond-lite/assets/icons/dmg/pierce.svg'} size={size} />
        }
        case lang.VGLITE.DamageTypes.slashing: {
            return <CustomIcon path={'systems/vagabond-lite/assets/icons/dmg/slash.svg'} size={size} />
        }
    }
    return <p>{lang.VGLITE.DamageTypes[dmgType]}</p>
}

const CustomIcon = ({ path, size }: { path: string, size: number }) => {
    return (
        <div className="bg-white rounded-full p-0.5">
            <img
                src={path}
                height={`${size-2}px`}
                width={`${size-2}px`}
                alt={lang.VGLITE.DamageTypes.slashing}
            />
        </div>
    )
}