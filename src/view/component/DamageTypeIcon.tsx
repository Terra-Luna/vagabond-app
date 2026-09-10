import { Brain, Cross, Droplets, Flame, FlaskRound, HeartOff, Shield, Skull, Snowflake, Sparkle, Sword, Swords, Wand2, Zap } from "lucide-react"
import { ReactElement } from "react"

import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"

export const DamageTypeIcon = ({ dmgType, size }: { dmgType: string, size?: number }) => {
    size = size ? size : 20
    let element: ReactElement | undefined

    if (dmgType === 'defense') {
        return <Shield size={size} className='text-ic-armor fill-ic-armor-fill' />
    }

    switch (appLang.DamageTypes[dmgType]) {
        case appLang.DamageTypes.magical: {
            element = <Wand2 size={size} className='text-magical' />
            break
        }
        case appLang.DamageTypes.fire: {
            element = <Flame size={size} strokeWidth={1} className='text-black fill-fire' />
            break
        }
        case appLang.DamageTypes.cold: {
            element = <Snowflake size={size} strokeWidth={1} className='text-black fill-cold' />
            break
        }
        case appLang.DamageTypes.shock: {
            element = <Zap size={size} strokeWidth={1} className='text-black fill-shock' />
            break
        }
        case appLang.DamageTypes.acid: {
            element = <Droplets size={size} strokeWidth={1} className='text-black fill-acid' />
            break
        }
        case appLang.DamageTypes.poison: {
            element = <FlaskRound size={size} strokeWidth={1} className='text-black fill-poison' />
            break
        }
        case appLang.DamageTypes.necrotic: {
            element = <Skull size={size} strokeWidth={1} className='text-black fill-necrotic' />
            break
        }
        case appLang.DamageTypes.psychic: {
            element = <Brain size={size} className='text-psychic' />
            break
        }
        case appLang.DamageTypes.healing: {
            element = <Cross size={size} strokeWidth={1} className='text-black fill-healing' />
            break
        }
        case appLang.DamageTypes.mana: {
            element = <Sparkle size={size} strokeWidth={1} className='text-black fill-mana' />
            break
        }
        case appLang.DamageTypes.silvered: {
            element = <Sword size={size} className='text-text-primary fill-ic-armor-fill' />
            break
        }
        case appLang.DamageTypes.coldiron: {
            element = <Sword size={size} className='text-text-primary fill-cold' />
            break
        }
        case appLang.DamageTypes.physical: {
            element = <Swords size={size - 2} className='text-black fill-ic-armor-fill' />
            break
        }
        case appLang.DamageTypes.adamant: {
            element = <Swords size={size - 2} className='text-header-text-tertiary fill-black' />
            break
        }
        case appLang.DamageTypes.fatigue: {
            element = <HeartOff size={size - 2} className='text-ic-fatigue fill-white' />
            break
        }   
        case appLang.DamageTypes.blunt: {
            element = <CustomIcon path={`systems/${sys_id}/assets/icons/dmg/blunt.svg`} size={size} />
            break 
        }
        case appLang.DamageTypes.pierce: {
            element = <CustomIcon path={`systems/${sys_id}/assets/icons/dmg/pierce.svg`} size={size} />
            break
        }
        case appLang.DamageTypes.slash: {
            element = <CustomIcon path={`systems/${sys_id}/assets/icons/dmg/slash.svg`} size={size} />
            break
        }
    }
    if (element === undefined) {
        element = <p>{appLang.DamageTypes[dmgType]}</p>
    }
    return (
        <div title={appLang.DamageTypes[dmgType]}>{element}</div>
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