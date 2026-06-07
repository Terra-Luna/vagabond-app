export default async function createPerks() {
    const folder = "Perks"
    if (!game.folders?.getName(folder)) {
        await Folder.create({ name: folder, type: "Item" })
    }

    const gish = {
        name: 'Gish',
        type: 'perk',
        folder: game.folders?.getName(folder)?.id,
        system: {
            description: 'You can use Weapons as trinkets to Cast and, when you Cast with a Delivery of Imbue on a Weapon you have Equipped, you can make an Attack with the Weapon with the same Action.',
            prerequisites: [
                {
                    type: 'SPELL', // STAT, TRAINING, SPELL
                    stat: '',
                    value: 0,
                    skillName: '',
                    spell: 'Any'
                },
                {
                    type: 'TRAINING', // STAT, TRAINING, SPELL
                    stat: '',
                    value: 0,
                    spell: 'Any',
                    skillNames: ['Melee, Ranged'],
                    andOr: 'or'
                }
            ],
            modifiers: []
        }
    }
    await Item.create(gish)
}