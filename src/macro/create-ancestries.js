const human = {
    name: 'Human',
    type: 'ancestry',
    system: {
        name: 'Human',
        description: 'Humans are social beings that tend to be central in the development of major, diverse melting pot civilizations. Their tendency to develop wide, sprawling empires anad a huge pool of cultures makes them extrememly adaptable adventurers.',
        senses: [],
        beingType: 'Humanlike',
        beingSize: 'Medium',
        traits: [
            {
                name: 'Strong Potential',
                description: 'Increase one of your Stats by 1, but no higher than 7.',
                modifiers: [{
                    targetStat: '',
                    type: 'BONUS', //BONUS, SET, FORMULA
                    value: 0
                }]
            }
        ],
        grants: [
            {
                type: 'PERK', //PERK, SPELL, TRAINING
                count: 1,
                perkOptions: [],
                spellOptions: [],
                trainingOptions: [],
                ignorePrerequisites: false
            },
            {
                type: 'TRAINING', //PERK, SPELL, TRAINING
                count: 1,
                perkOptions: [],
                spellOptions: [],
                trainingOptions: [],
                ignorePrerequisites: false
            }
        ],
    },
    chosenPerks: [],
    chosenSpells: [],
    chosenTrainings: []
}

const elf = {
    name: 'Elf',
    type: 'ancestry',
    system: {
        name: 'Elf',
        description: 'Elves are known for their tall height, etherial beauty, and inquisitive passion to witness awe. This passion embodies itself in their clothing, language, arts, and cuisine, as evles seek to make every moment one worth savoring. Of all the peoples that inhabit the world, it is likely no other lives as peacefully and permissively with the fae, fauna, and flora as elves.',
        senses: [],
        beingType: 'Fae',
        beingSize: 'Medium',
        traits: [{
            name: 'Elven Eyes',
            description: 'You have Favor on sight-based Detect Checks.',
            modifiers: []
        }],
        grants: [
            {
                type: 'TRAINING', //PERK, SPELL, TRAINING
                count: 1,
                perkOptions: [],
                spellOptions: [],
                trainingOptions: ['Arcana', 'Mysticism', 'Influence', 'Ranged'],
                ignorePrerequisites: false
            },
            {
                type: 'SPELL', //PERK, SPELL, TRAINING
                count: 1,
                perkOptions: [],
                spellOptions: [],
                trainingOptions: [],
                ignorePrerequisites: false
            }
        ],
    },
    chosenPerks: [],
    chosenSpells: [],
    chosenTrainings: []
}
await Item.create(human)
await Item.create(elf)
ui.notifications.info('Success!')
game.items.filter(it => it.type === 'ancestry')

const actor = game.actors.getName('Orphenia')
const human = game.items.find(it => it.type === 'ancestry' && it.name === 'Human')
await actor.update({ 'system.ancestry': { ...human.system } })