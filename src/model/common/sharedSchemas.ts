import locale from "../../../public/lang/en.json"

export const fields = foundry.data.fields

export const optionalString = { required: false, nullable: true }
export const requiredString = { required: true, nullable: false, initial: '' }
export const standardInteger = { integer: true, min: 0, initial: 0 }
export const requiredInteger = { required: true, integer: true, min: 0 }
export const uncappedInteger = { required: true, integer: true, initial: 0 }

export const rangeOptions = () => {
    const ranges = Object.keys(locale.VGLITE.Ranges)
    return {
        choices: ranges,
        initial: ranges[0]
    }
}

export const beingSizeOptions = () => {
    const sizes = Object.keys(locale.VGLITE.Sizes)
    return {
        choices: sizes,
        initital: sizes[0]
    }
}

export const beingTypeOptions = () => {
    const beingTypes = Object.keys(locale.VGLITE.BeingTypes)
    return {
        choices: beingTypes,
        initial: beingTypes[0]
    }
}

export const zonePreferences = () => {
    const zones = Object.keys(locale.VGLITE.Zones)
    return {
        choices: zones,
        initial: zones[0]
    }
}

export const damageTypeOptions = () => {
    const damageTypes = Object.keys(locale.VGLITE.DamageTypes)
    return {
        choices: damageTypes,
        initial: damageTypes[0]
    }
}

export const effectSchema = () => {
    return {
        type: new fields.StringField({ ...requiredString, choices: ['TEMPORARY', 'PASSIVE', 'INAC'] })
    }
}