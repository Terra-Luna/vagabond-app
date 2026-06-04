const magus = {
    'name': 'Magus',
    'type': 'class',
    system: {
        name: 'Magus',
        description: 'Spellblades, gishes, arcane knights, and eldritch tricksters all. Magi are arcane specialists who blend magic and martial prowess.',
        action: 'Attack/Cast',
        move: 'Flexible',
        complexity: 4,
        icons: ['Alucard, Castlevania', 'Elric of Melnibone, Stormbringer', 'Geralt of Rivia, The Witcher', 'Twilight Suzuka, Outlaw Star'],
        playstyle: 'The magus may be a bit more challenging for newer players. Their playstyle is more build-dependent than the other classes, allowing for backline blasters, midline harassers, and frontline strikers.',
        keyStats: ['Reason'],
        startingPacks: [],

        requiredTraining: ['Arcana'],
        electedTrainingCount: 3,
        electivePoolOptions: ['Brawl', 'Detect', 'Finesse', 'Influence', 'Mysticism', 'Sneak'],

        castingSkill: 'Arcana',
        maxManaStat: 'Reason',
        manaMultiplier: 2,
        spellsGained: 2,
        spellGainInterval: 3,
        startingSpells: ['Ward'],

        features: [
            {
                level: 1,
                name: 'Spellstriker',
                description: 'You gain the Gish Perk (p. 68) and you can Cast Spells using Arcana.<br><b>Spells:</b> You learn 2 Spells, one of which must always be Ward. You learn 1 other Spell every 3 Magus Levels hereafter.<br><b>Mana:</b> Your Maximum Mana is equal to (2 x your Magus Level), and the highest amount of Mana you can spend to Cast a Spell is equal to (Reason + half your Magus Level, rounded up). You regain spent Mana when you Rest.',
                modifiers: [
                    {
                        targetStat: '',
                        type: '', //BONUS, SET, FORMULA
                        value: ''
                    }
                ],
                grants: [
                    {
                        type: 'PERK', //PERK, SPELL, TRAINING
                        count: 1,
                        perkOptions: ['Gish'],
                        spellOptions: [],
                        trainingOptions: [],
                        ignorePrerequisites: false
                    }
                ]
            },
            {
                level: 1,
                name: 'Esoteric Eye',
                description: 'If you can see a Target, you can use your Action or skip your Move to learn if any magic is currently affecting it. You can this once per Shift, but can spend 1 Mana to do so again.',
                modifiers: [],
                grants: []
            },
            {
                level: 2,
                name: 'Spell Parry',
                description: 'You can Block Casts that include you as a Target if it either calls for a Reflex Save or has a Delivery of Touch or Remote. If you Crit to Block a Cast, you can dispel the effect.',
                modifiers: [],
                grants: []
            },
            {
                level: 3,
                name: 'Perk',
                description: 'You gain a Perk.',
                modifiers: [],
                grants: [
                    {
                        type: 'PERK', //PERK, SPELL, TRAINING
                        count: 1,
                        perkOptions: [],
                        spellOptions: [],
                        trainingOptions: [],
                        ignorePrerequisites: false
                    }
                ]
            },
            {
                level: 4,
                name: 'Arcane Recall',
                description: 'You can use your Action to open your esoteric eye of recall, allowing you to change one of your known Spells that isn\'t Ward. You can\'t do this again until you Rest or take 1 Fatigue to do so.',
                modifiers: [],
                grangs: []
            }
        ]
    }
}
await Item.create(magus)