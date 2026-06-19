import lang from "../../../public/lang/en.json"
import { Brain, Cross, Droplets, Flame, Skull, Snowflake, Wand, Zap } from "lucide-react"

export const DamageTypeIcon = ({ dmgType, size }: { dmgType: string, size?: number }) => {
    size = size ? size : 18

    switch (dmgType) {
        case lang.VGLITE.DamageTypes.physical: {
            return (<img src='icons/svg/combat.svg' height={size} width={size} alt={lang.VGLITE.DamageTypes.physical} />)
        }
        case lang.VGLITE.DamageTypes.blunt: {
            return (<img src='systems/vagabond-lite/assets/icons/dmg/blunt.svg' height={size} width={size} alt={lang.VGLITE.DamageTypes.blunt} />)
        }
        case lang.VGLITE.DamageTypes.piercing: {
            return (<img src='systems/vagabond-lite/assets/icons/dmg/pierce.svg' height={size} width={size} alt={lang.VGLITE.DamageTypes.piercing} />)
        }
        case lang.VGLITE.DamageTypes.slashing: {
            return (<img src='systems/vagabond-lite/assets/icons/dmg/slash.svg' height={size} width={size} alt={lang.VGLITE.DamageTypes.slashing} />)
        }
        case lang.VGLITE.DamageTypes.magical: {
            return (<Wand size={size} strokeWidth={1} aria-label='magic' className='text-magical' />)
        }
        case lang.VGLITE.DamageTypes.fire: {
            return (<Flame size={18} strokeWidth={1} aria-label='fire' className='text-fire' />)
        }
        case lang.VGLITE.DamageTypes.cold: {
            return (<Snowflake size={size} strokeWidth={1} aria-label='cold' className='text-cold' />)
        }
        case lang.VGLITE.DamageTypes.shock: {
            return (<Zap size={size} strokeWidth={1} aria-label='shock' className='text-shock' /> )
        }
        case lang.VGLITE.DamageTypes.acid: {
            return (<Droplets size={size} strokeWidth={1} aria-label='acid' className='text-acid' /> )
        }
        case lang.VGLITE.DamageTypes.necrotic: {
            return (<Skull size={size} strokeWidth={1} aria-label='necrotic' className='text-necrotic' /> )
        }
        case lang.VGLITE.DamageTypes.psychic: {
            return (<Brain size={size} strokeWidth={1} aria-label='psychic' className='text-psychic' /> )
        }
        case lang.VGLITE.DamageTypes.healing: {
            return (<Cross size={size} strokeWidth={1} aria-label='healing' className='text-healing' /> )
        }
    }
    return <p>{dmgType}</p>
}