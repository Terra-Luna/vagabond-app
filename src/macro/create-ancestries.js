const human = {
    name: 'Human',
    type: 'ancestry',
    system: {
        name: 'Human',
        description: 'Humans are social beings that tend to be central in the development of major, diverse melting pot civilizations. Their tendency to develop wide, sprawling empires anad a huge pool of cultures makes them extrememly adaptable adventurers.',
        beingType: 'Humanlike',
        beingSize: 'Medium',
        senses: [],
        traitInfo: [
            ['Knack', 'You gain a Perk and a Training.'],
            ['Strong Potential', 'Increase one of your Stats by 1, but no higher than 7.']
        ],
        traits: [
            {
                modifiers: [{
                    targetStat: '',
                    type: 'BONUS', //BONUS, SET, FORMULA
                    value: 1
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
await Item.create(human)

const elf = {
    name: 'Elf',
    type: 'ancestry',
    system: {
        name: 'Elf',
        description: 'Elves are known for their tall height, etherial beauty, and inquisitive passion to witness awe. This passion embodies itself in their clothing, language, arts, and cuisine, as evles seek to make every moment one worth savoring. Of all the peoples that inhabit the world, it is likely no other lives as peacefully and permissively with the fae, fauna, and flora as elves.',
        beingType: 'Fae',
        beingSize: 'Medium',
        senses: [],
        traitInfo: [
            ['Ascendancy', 'You are Trained in a Skill from either Arcana, Mysticism, Influence, or in Ranged Attacks.'],
            ['Elven Eyes', 'You have Favor on sight-based Detect Checks.'],
            ['Naturally Attuned', 'You know a Spell and can Cast it with a Skill of yoru choice.']
        ],
        traits: [{ modifiers: [] }],
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
await Item.create(elf)