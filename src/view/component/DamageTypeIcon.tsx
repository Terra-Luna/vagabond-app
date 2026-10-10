import { Anvil, Brain, Cross, Droplets, Flame, FlaskRound, Hammer, HeartOff, Section, Shield, Skull, Snowflake, Sparkle, Sword, Swords, Target, Wand2, Zap } from "lucide-react"
import { ReactElement } from "react"

import { appLang } from "../../utils/lang"
import { damageTypesWithPhysicalThresholds } from "../../utils/localeUtils"

export const DamageTypeIcon = ({ dmgType, size }: { dmgType: string, size?: number }) => {
    size = size ? size : 20
    let element: ReactElement | undefined

    if (dmgType === 'defense') {
        return <Shield size={size} className='text-ic-armor fill-ic-armor-fill' />
    }

    const allTypes = damageTypesWithPhysicalThresholds()

    switch (dmgType) {
        case "acid": {
            element = <Droplets size={size} strokeWidth={1} className='text-black fill-acid' />
            break
        }
        case "adamant": {
            element = <Anvil size={size} strokeWidth={1} className='text-header-text-tertiary fill-ic-armor-fill' />
            break
        }
        case "blunt": {
            element = <Hammer size={size} className='text-text-primary fill-ic-armor-fill' />
            break
        }
        case "cold": {
            element = <Snowflake size={size} strokeWidth={1} className='text-black fill-cold' />
            break
        }
        case "coldiron": {
            element = <Swords size={size} strokeWidth={1} className='text-text-primary fill-cold' />
            break
        }
        case "fatigue": {
            element = <HeartOff size={size} className='text-ic-fatigue fill-ic-armor-fill' />
            break
        }
        case "fire": {
            element = <Flame size={size} strokeWidth={1} className='text-black fill-fire' />
            break
        }
        case "healing": {
            element = <Cross size={size} strokeWidth={1} className='text-black fill-healing' />
            break
        }
        case "magical": {
            element = <Wand2 size={size} className='text-magical' />
            break
        }
        case "mana": {
            element = <Sparkle size={size} strokeWidth={1} className='text-black fill-mana' />
            break
        }
        case "necrotic": {
            element = <Skull size={size} strokeWidth={1} className='text-black fill-necrotic' />
            break
        }
        case "physical":
        case "physical_lt0":
        case "physical_lt1":
        case "physical_lt2":
        case "physical_lt3": {
            element = <div className="flex text-text-primary font-eskapade">
                <Swords size={size} strokeWidth={2} className='text-text-primary fill-ic-armor-fill' />
            </div>
            break
        }
        case "pierce": {
            element = <Target size={size} strokeWidth={2} className='text-text-primary' />
            break
        }
        case "poison": {
            element = <FlaskRound size={size} strokeWidth={1} className='text-black fill-poison' />
            break
        }
        case "psychic": {
            element = <Brain size={size} className='text-psychic' />
            break
        }
        case "shock": {
            element = <Zap size={size} strokeWidth={1} className='text-black fill-shock' />
            break
        }
        case "silvered": {
            element = <Section size={size} strokeWidth={1} className='text-text-primary' />
            break
        }
        case "slash": {
            element = <Sword size={size} className='text-text-primary fill-ic-armor-fill' />
            break
        }
    }
    if (element === undefined) {
        element = <p>{appLang.DamageTypes[dmgType]}</p>
    }
    return (
        <div title={allTypes[dmgType] ?? appLang.DamageTypes[dmgType]}>{element}</div>
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
                            <div className="absolute w-8 h-8 z-10 -bottom-4 -right-4">
                                <DamageTypeIcon dmgType={dmgType} size={18} />
                            </div>
                    }
                </div>
        }
    </>)
}