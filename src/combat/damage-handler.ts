/**
 * 
 * @param tokenIds 
 * @param damage 
 * @param isHalf 
 */
export function applyDamage(tokenIds: string[], damage: number, isHalf: boolean = false) {
    getActors(tokenIds).forEach(actor => {
        const target = actor?.system
        const armor = getArmor(target)
        const adjDamage = isHalf ? calculateDamage(Math.ceil(damage / 2), armor) : calculateDamage(damage, armor)
        updateHP(target, getHP(target) - adjDamage)
    })
}

export function applyHealing(tokenids: string[], healing: number) {
    getActors(tokenids).forEach(target => {
        updateHP(target?.system, getHP(target?.system) + healing)
    })
}

function getActors(targetIds: string[]) {
    return targetIds.map(id => canvas?.scene?.tokens?.get(id)?.actor)
}

function getHP(target) {
    return target.health.current
}

function getArmor(target) {
    return target.armor.rating
}

function calculateDamage(damage, armor) {
    console.log(damage - armor)
    return Math.max(0, damage - armor)
}

function updateHP(target, hp) {
    console.log(target)
    // @ts-ignore
    target?.parent.update({ "system.health.current": hp })
}