export default async function createAncestries() {
    const folder = "Ancestries"
    if (!game.folders?.getName(folder)) {
        await Folder.create({ name: folder, type: "Item" })
    }

    const human = {
        name: 'Human',
        type: 'ancestry',
        folder: game.folders?.getName(folder)?.id,
        system: {
            description: 'Humans are social beings that tend to be central in the development of major, diverse melting pot civilizations. Their tendency to develop wide, sprawling empires and a huge pool of cultures makes them extremely adaptable adventurers.',
            beingType: 'humanlike',
            beingSize: 'medium',
            senses: [],
            traitInfo: [
                ['<br><b>Knack</b>', 'You gain a Perk and a Training.'],
                ['<br><b>Strong Potential</b>', 'Increase one of your Stats by 1, but no higher than 7.']
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

}