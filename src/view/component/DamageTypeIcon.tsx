import { ReactElement } from "react"
import { Brain, Cross, Droplets, Flame, FlaskRound, Skull, Snowflake, Sparkle, Sword, Swords, Wand2, Zap } from "lucide-react"
import { lang } from "../../utils/lang"

export const DamageTypeIcon = ({ dmgType, size }: { dmgType: string, size?: number }) => {
    size = size ? size : 20
    let element: ReactElement | undefined
    switch (lang.VGLITE.DamageTypes[dmgType]) {
        case lang.VGLITE.DamageTypes.magical: {
            element = <Wand2 size={size} className='text-magical' />
            break
        }
        case lang.VGLITE.DamageTypes.fire: {
            element = <Flame size={size} strokeWidth={1} className='text-black fill-fire' />
            break
        }
        case lang.VGLITE.DamageTypes.cold: {
            element = <Snowflake size={size} strokeWidth={1} className='text-black fill-cold' />
            break
        }
        case lang.VGLITE.DamageTypes.shock: {
            element = <Zap size={size} strokeWidth={1} className='text-black fill-shock' />
            break
        }
        case lang.VGLITE.DamageTypes.acid: {
            element = <Droplets size={size} strokeWidth={1} className='text-black fill-acid' />
            break
        }
        case lang.VGLITE.DamageTypes.poison: {
            element = <FlaskRound size={size} strokeWidth={1} className='text-black fill-poison' />
            break
        }
        case lang.VGLITE.DamageTypes.necrotic: {
            element = <Skull size={size} strokeWidth={1} className='text-black fill-necrotic' />
            break
        }
        case lang.VGLITE.DamageTypes.psychic: {
            element = <Brain size={size} className='text-psychic' />
            break
        }
        case lang.VGLITE.DamageTypes.healing: {
            element = <Cross size={size} strokeWidth={1} className='text-black fill-healing' />
            break
        }
        case lang.VGLITE.DamageTypes.mana: {
            element = <Sparkle size={size} strokeWidth={1} className='text-black fill-mana' />
            break
        }
        case lang.VGLITE.DamageTypes.silvered: {
            element = <Sword size={size} className='text-text-primary fill-ic-armor-fill' />
            break
        }
        case lang.VGLITE.DamageTypes.coldiron: {
            element = <Sword size={size} className='text-text-primary fill-cold' />
            break
        }
        case lang.VGLITE.DamageTypes.physical: {
            element = <Swords size={size - 2} className='text-black fill-ic-armor-fill' />
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
        <div title={lang.VGLITE.DamageTypes[dmgType]}>{element}</div>
    )
}

export const ImageWithDamageTypeBadge = ({ img = '', dmgType = 'none', size = 42, className = '' }: { img?: string, dmgType?: string, size?: number, className?: string }) => {
    const imageSize = { width: `${size}px`, height: `${size}px` }
    return (<>
        {
            img === '' && dmgType === 'none' ? <></> :
                <div className={`relative float-left ${className}`} style={imageSize}>
                    {
                        !img || img.length === 0 ? <></> :
                            <img src={img} className="border border-solid border-text-section-header rounded-sm" />
                    }
                    {
                        !dmgType || dmgType === 'none' ? <></> :
                            <div className="absolute w-8 h-8 z-10 -bottom-2 -right-3">
                                <DamageTypeIcon dmgType={dmgType} size={28} />
                            </div>
                    }
                </div>
        }
    </>)
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