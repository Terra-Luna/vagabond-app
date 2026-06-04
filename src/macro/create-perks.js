const gish = {
    name: 'Gish',
    type: 'perk',
    system: {
        name: 'Gish',
        description: 'You can use Weapons as trinkets to Cast and, when you Cast with a Delivery of Imbue on a Weapon you have Equipped, you can make an Attack with the Weapon with the same Action.',
        prerequisites: [
            {
                type: 'SPELL', // STAT, TRAINING, SPELL
                stat: '',
                value: 0,
                skillName: '',
                spell: {}
            },
            {
                type: 'TRAINING', // STAT, TRAINING, SPELL
                stat: '',
                value: 0,
                spell: {},
                skillNames: ['Melee, Ranged'],
                andOr: 'or'
            }
        ],
        modifiers: []
    }
}
await Item.create(gish)