import locale from "../../../public/lang/en.json"

export const fields = foundry.data.fields

export const optionalString = { required: false, nullable: true }
export const requiredString = { required: true, nullable: false, initial: '' }
export const standardInteger = { integer: true, min: 0, initial: 0 }
export const requiredInteger = { required: true, integer: true, min: 0 }

export const statOptions = () => {
    const stats = Object.values(locale.VGLITE.Stat)
    return {
        choices: stats.map(i => i.long),
        initial: ''
    }
}

export const rangeOptions = () => {
    const ranges = Object.values(locale.VGLITE.Ranges)
    return {
        choices: ranges,
        initial: ranges[0]
    }
}

export const beingSizeOptions = () => {
    const sizes = Object.values(locale.VGLITE.Sizes)
    return {
        choices: sizes,
        initital: sizes[1]
    }
}

export const beingTypeOptions = () => {
    const beingTypes = Object.values(locale.VGLITE.BeingTypes)
    return {
        choices: beingTypes,
        initial: beingTypes[0]
    }
}

export const zonePreferences = () => {
    const zones = Object.values(locale.VGLITE.Zones)
    return {
        choices: zones,
        initial: zones[0]
    }
}

export const damageTypeOptions = () => {
    const damageTypes = Object.values(locale.VGLITE.DamageTypes)
    return {
        choices: damageTypes,
        initial: damageTypes[0]
    }
}