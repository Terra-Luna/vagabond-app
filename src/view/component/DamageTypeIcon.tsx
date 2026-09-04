import { Brain, Cross, Droplets, Flame, FlaskRound, Skull, Snowflake, Sparkle, Sword, Swords, Wand2, Zap } from "lucide-react"
import { ReactElement } from "react"

import { sys_id } from "../../utils/foundryUtils"
import { lang } from "../../utils/lang"

export const DamageTypeIcon = ({ dmgType, size }: { dmgType: string, size?: number }) => {
    size = size ? size : 20
    let element: ReactElement | undefined
    switch (lang.APP.DamageTypes[dmgType]) {
        case lang.APP.DamageTypes.magical: {
            element = <Wand2 size={size} className='text-magical' />
            break
        }
        case lang.APP.DamageTypes.fire: {
            element = <Flame size={size} strokeWidth={1} className='text-black fill-fire' />
            break
        }
        case lang.APP.DamageTypes.cold: {
            element = <Snowflake size={size} strokeWidth={1} className='text-black fill-cold' />
            break
        }
        case lang.APP.DamageTypes.shock: {
            element = <Zap size={size} strokeWidth={1} className='text-black fill-shock' />
            break
        }
        case lang.APP.DamageTypes.acid: {
            element = <Droplets size={size} strokeWidth={1} className='text-black fill-acid' />
            break
        }
        case lang.APP.DamageTypes.poison: {
            element = <FlaskRound size={size} strokeWidth={1} className='text-black fill-poison' />
            break
        }
        case lang.APP.DamageTypes.necrotic: {
            element = <Skull size={size} strokeWidth={1} className='text-black fill-necrotic' />
            break
        }
        case lang.APP.DamageTypes.psychic: {
            element = <Brain size={size} className='text-psychic' />
            break
        }
        case lang.APP.DamageTypes.healing: {
            element = <Cross size={size} strokeWidth={1} className='text-black fill-healing' />
            break
        }
        case lang.APP.DamageTypes.mana: {
            element = <Sparkle size={size} strokeWidth={1} className='text-black fill-mana' />
            break
        }
        case lang.APP.DamageTypes.silvered: {
            element = <Sword size={size} className='text-text-primary fill-ic-armor-fill' />
            break
        }
        case lang.APP.DamageTypes.coldiron: {
            element = <Sword size={size} className='text-text-primary fill-cold' />
            break
        }
        case lang.APP.DamageTypes.physical: {
            element = <Swords size={size - 2} className='text-black fill-ic-armor-fill' />
            break
        }
        case lang.APP.DamageTypes.blunt: {
            element = <CustomIcon path={`systems/${sys_id}/assets/icons/dmg/blunt.svg`} size={size} />
            break 
        }
        case lang.APP.DamageTypes.pierce: {
            element = <CustomIcon path={`systems/${sys_id}/assets/icons/dmg/pierce.svg`} size={size} />
            break
        }
        case lang.APP.DamageTypes.slash: {
            element = <CustomIcon path={`systems/${sys_id}/assets/icons/dmg/slash.svg`} size={size} />
            break
        }
    }
    if (element === undefined) {
        element = <p>{lang.APP.DamageTypes[dmgType]}</p>
    }
    return (
        <div title={lang.APP.DamageTypes[dmgType]}>{element}</div>
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