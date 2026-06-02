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
ui.notifications.info('Success')
game.items.filter(it => it.type === 'perk')

const actor = game.actors.getName('Orphenia')
const gish = game.items.filter(it => it.type === 'perk' && it.name === 'Gish')
await actor.update({ 'system.perks': [{ ...gish[0].system }] })