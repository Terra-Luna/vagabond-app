const ward = {
    name: 'Ward',
    type: 'spell',
    system: {
        name: 'Ward',
        description: 'If the Target takes damage, make a Cast Check. On a pass, you reduce that damage by d6 and you can spend Mana to reduce it by an additional d6 per Mana spent.<br><b>Crit:</b> The Target takes no damage.',
        damageType: '-',
        effectAppliesBurn: false,
        effectBurnCountdown: '-'
    }
}
await Item.create(ward)

const light = {
    name: 'Light',
    type: 'spell',
    system: {
        name: 'Light',
        description: 'The Target sheds Light out to Near for the duration. You can choose to do so by creating a floatnig mote of light that follows the Target.<br><b>Crit:</b> Beings of your choice within the Light when you Cast the Spell are Blinded (Cd4).',
        damageType: 'Fire',
        effectAppliesBurn: false,
        effectBurnCountdown: '-'
    }
}
await Item.create(light)