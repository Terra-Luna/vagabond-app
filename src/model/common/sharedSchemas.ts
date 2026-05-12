export const fields = foundry.data.fields

export const requiredString = { required: true, nullable: false }
export const standardInteger = { integer: true, min: 0, initial: 0 }
export const requiredInteger = { required: true, integer: true, min: 0 }

export const rangeOptions = () => {
    return {
        choices: ['close', 'near', 'far'],
        initial: 'close'
    }
}

export const beingSizeOptions = () => {
    return {
        choices: ['small', 'medium', 'large', 'huge', 'giant', 'colossal'],
        initital: 'medium'
    }
}

export const beingTypeOptions = () => {
    return {
        choices: ['artificial', 'beast', 'cryptid', 'fae', 'humanlike', 'outer', 'primordial', 'undead'],
        initial: 'humanlike'
    }
}

export const zonePreferences = () => {
    return {
        choices: ['frontline', 'midline', 'backline'],
        initial: 'midline'
    }
}