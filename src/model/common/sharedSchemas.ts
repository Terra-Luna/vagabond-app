import { lang as locale } from "../../utils/lang"
export const fields = foundry.data.fields

export const optionalString = { required: false, nullable: true, blank: false }
export const requiredString = { required: true, nullable: false, initial: '' }
export const standardInteger = { integer: true, min: 0, initial: 0 }
export const optionalInteger = { nullable: true, integer: true }
export const requiredInteger = { required: true, integer: true, min: 0, nullable: false }
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

export const movementTypes = () => {
    const moveTypes = Object.keys(locale.VGLITE.Movement)
    return {
        choices: moveTypes,
        initial: moveTypes[0]
    }
}

export const damageTypeOptions = () => {
    const damageTypes = Object.keys(locale.VGLITE.DamageTypes)
    return {
        required: false,
        nullable: true,
        blank: false,
        choices: damageTypes,
        initial: 'none'
    }
}

export const statusEffOptions = () => {
    const statusFx = Object.keys(locale.VGLITE.StatusConditions)
    return {
        required: true,
        nullable: false,
        choices: statusFx
    }
}

export const savingThrowOptions = () => {
    const saves = Object.keys(locale.VGLITE.Saves)
    return {
        required: true,
        nullable: false,
        choices: saves,
        initial: 'reflex'
    }
}