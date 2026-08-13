import { EquipmentDataModel, EquipmentSchema } from "../../../model/item/equip/EquipmentDataModel"

export interface RelicPower {
    id: string,
    category: { value: string, label: string },
    power: {
        value: string,
        label: string,
        modifiers: {
            path: string,
            value: number
        }[]
    },
    goldValue: number,
    bound: boolean,
    description: string
}

export class RelicPowers {
    static register() {
        game.settings?.register("vagabond-lite" as any, "relics" as any, {
            name: "Relics",
            hint: "Relic Powers",
            scope: "world",
            config: false,
            type: Object,
            default: [
                ...RelicPowers.ace,
                ...RelicPowers.bane,
                ...RelicPowers.bonus,
                ...RelicPowers.cursed,
                ...RelicPowers.fabled,
                ...RelicPowers.movement,
                ...RelicPowers.protection,
                ...RelicPowers.resistance,
                ...RelicPowers.senses,
                ...RelicPowers.utility
            ] as any
        })
    }

    static get(): RelicPower[] {
        return (game.settings as any)?.get("vagabond-lite", "relics")
    }

    static async toggleRelicEffect(item: Item & { system: EquipmentDataModel<EquipmentSchema> }, relic: RelicPower) {
        const existingPowers = item.system.relicPowers

        if (existingPowers.some(p => p.id === relic.id)) {
            // Remove
            await item.update({
                'system.relicPowers': [...existingPowers.filter(p => p.id !== relic.id)]
            } as Record<string, any>)
        }
        else {
            // Add
            await item.update({
                'system.relicPowers': [...existingPowers, relic]
            } as Record<string, any>)
        }
    }

    static getFormattedRelicName(relic: RelicPower): string {
        if (['ace', 'bane', 'protection'].includes(relic.category.value)) {
            return `${relic.category.label} - ${relic.power.label}`
        }
        else {
            return relic.power.label
        }
    }

    static ace = [
        {
            id: 'ace-cleave',
            category: { value: 'ace', label: 'Ace' },
            power: { value: 'cleave', label: 'Cleave' },
            goldValue: 2000,
            description: ''
        },
        {
            id: 'ace-grapple',
            category: { value: 'ace', label: 'Ace' },
            power: { value: 'grapple', label: 'Grapple' },
            goldValue: 1000,
            description: ''
        },
        {
            id: 'ace-keen',
            category: { value: 'ace', label: 'Ace' },
            power: {
                value: 'keen',
                label: 'Keen',
                modifiers: [{
                    path: 'modifiers.skillCheck.*.critThreshold', value: 1
                }]
            },
            goldValue: 2000,
            description: ''
        },
        {
            id: 'ace-thrown',
            category: { value: 'ace', label: 'Ace' },
            power: { value: 'thrown', label: 'Thrown' },
            goldValue: 2000,
            description: ''
        },
        {
            id: 'ace-vicious',
            category: { value: 'ace', label: 'Ace' },
            power: {
                value: 'vicious',
                label: 'Vicious',
                modifiers: [{
                    path: 'modifiers.dice.crit.*.extraDice', value: 1
                }]
            },
            goldValue: 2000,
            description: ''
        }
    ]

    static bane = [
        {
            id: 'bane-nice',
            category: { value: 'bane', label: 'Bane' },
            power: { value: 'niche', label: 'Niche' },
            goldValue: 500,
            description: ''
        },
        {
            id: 'specific-nice',
            category: { value: 'bane', label: 'Bane' },
            power: { value: 'specific', label: 'Specific' },
            goldValue: 2000,
            description: ''
        },
        {
            id: 'bane-general',
            category: { value: 'bane', label: 'Bane' },
            power: { value: 'general', label: 'General' },
            goldValue: 5000,
            description: ''
        }
    ]

    static bonus = [
        {
            id: 'bonus-armor-1',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'armor-1',
                label: 'Armor +1',
                modifiers: [{
                    path: 'armor.rating', value: 1
                }]
            },
            goldValue: 100,
            description: ''
        },
        {
            id: 'bonus-armor-2',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'armor-2',
                label: 'Armor +2',
                modifiers: [{
                    path: 'armor.rating', value: 2
                }]
            },
            goldValue: 5000,
            description: ''
        },
        {
            id: 'bonus-armor-3',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'armor-3',
                label: 'Armor +3',
                modifiers: [{
                    path: 'armor.rating', value: 3
                }]
            },
            goldValue: 50000,
            description: ''
        },
        {
            id: 'bonus-prot-1',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'prot-1',
                label: 'Protection +1',
                modifiers: [
                    { path: 'modifiers.skillCheck.reflex.modifier', value: 1 },
                    { path: 'modifiers.skillCheck.endure.modifier', value: 1 },
                    { path: 'modifiers.skillCheck.will.modifier', value: 1 }
                ]
            },
            goldValue: 1000,
            description: ''
        },
        {
            id: 'bonus-prot-2',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'prot-2',
                label: 'Protection +2',
                modifiers: [
                    { path: 'modifiers.skillCheck.reflex.modifier', value: 2 },
                    { path: 'modifiers.skillCheck.endure.modifier', value: 2 },
                    { path: 'modifiers.skillCheck.will.modifier', value: 2 }
                ]
            },
            goldValue: 10000,
            description: ''
        },
        {
            id: 'bonus-prot-3',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'prot-3',
                label: 'Protection +3',
                modifiers: [
                    { path: 'modifiers.skillCheck.reflex.modifier', value: 3 },
                    { path: 'modifiers.skillCheck.endure.modifier', value: 3 },
                    { path: 'modifiers.skillCheck.will.modifier', value: 3 }
                ]
            },
            goldValue: 100000,
            description: ''
        },
        {
            id: 'bonus-trinket-1',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'trinket-1',
                label: 'Trinket +1',
                modifiers: [
                    { path: 'modifiers.damage.out.spell', value: 1 }
                ]
            },
            goldValue: 200,
            description: ''
        },
        {
            id: 'bonus-trinket-2',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'trinket-2',
                label: 'Trinket +2',
                modifiers: [
                    { path: 'modifiers.damage.out.spell', value: 2 }
                ]
            },
            goldValue: 2500,
            description: ''
        },
        {
            id: 'bonus-trinket-3',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'trinket-3',
                label: 'Trinket +3',
                modifiers: [
                    { path: 'modifiers.damage.out.spell', value: 3 }
                ]
            },
            goldValue: 10000,
            description: ''
        },
        {
            id: 'bonus-weapon-1',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'weapon-1',
                label: 'Weapon +1',
                modifiers: [
                    { path: 'modifiers.damage.out.attack', value: 1 }
                ]
            },
            goldValue: 100,
            description: ''
        },
        {
            id: 'bonus-weapon-2',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'weapon-2',
                label: 'Weapon +2',
                modifiers: [
                    { path: 'modifiers.damage.out.attack', value: 2 }
                ]
            },
            goldValue: 1250,
            description: ''
        },
        {
            id: 'bonus-weapon-3',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'weapon-3',
                label: 'Weapon +3',
                modifiers: [
                    { path: 'modifiers.damage.out.attack', value: 3 }
                ]
            },
            goldValue: 5000,
            description: ''
        },
    ]

    static cursed = [
        {
            id: 'cursed-anger',
            category: { value: 'cursed', label: 'Cursed' },
            power: { value: 'anger', label: 'Anger' },
            goldValue: 0,
            bound: true,
            description: ''
        },
        {
            id: 'cursed-cowardice',
            category: { value: 'cursed', label: 'Cursed' },
            power: { value: 'cowardice', label: 'Cowardice' },
            goldValue: 0,
            bound: true,
            description: ''
        },
        {
            id: 'cursed-doom',
            category: { value: 'cursed', label: 'Cursed' },
            power: { value: 'doom', label: 'Doom' },
            goldValue: 0,
            bound: true,
            description: ''
        },
        {
            id: 'cursed-gullibility',
            category: { value: 'cursed', label: 'Cursed' },
            power: { value: 'gullibility', label: 'Gullibility' },
            goldValue: 0,
            bound: true,
            description: ''
        },
        {
            id: 'cursed-vuln-1',
            category: { value: 'cursed', label: 'Cursed' },
            power: {
                value: 'vuln-1',
                label: 'Vulnerability -1',
                modifiers: [{
                    path: 'armor.rating', value: -1
                }]
            },
            goldValue: 0,
            bound: true,
            description: ''
        },
        {
            id: 'cursed-vuln-2',
            category: { value: 'cursed', label: 'Cursed' },
            power: {
                value: 'vuln-2',
                label: 'Vulnerability -2',
                modifiers: [{
                    path: 'armor.rating', value: -2
                }]
            },
            goldValue: 0,
            bound: true,
            description: ''
        },
        {
            id: 'cursed-vuln-3',
            category: { value: 'cursed', label: 'Cursed' },
            power: {
                value: 'vuln-3',
                label: 'Vulnerability -3',
                modifiers: [{
                    path: 'armor.rating', value: -3
                }]
            },
            goldValue: 0,
            bound: true,
            description: ''
        },
        {
            id: 'cursed-weak-1',
            category: { value: 'cursed', label: 'Cursed' },
            power: {
                value: 'weak-1',
                label: 'Weakness -1',
                modifiers: [{
                    path: 'modifiers.damage.out.attack', value: -1
                }]
            },
            goldValue: 0,
            bound: true,
            description: ''
        },
        {
            id: 'cursed-weak-2',
            category: { value: 'cursed', label: 'Cursed' },
            power: {
                value: 'weak-2',
                label: 'Weakness -2',
                modifiers: [{
                    path: 'modifiers.damage.out.attack', value: -2
                }]
            },
            goldValue: 0,
            bound: true,
            description: ''
        },
        {
            id: 'cursed-weak-3',
            category: { value: 'cursed', label: 'Cursed' },
            power: {
                value: 'weak-3',
                label: 'Weakness -3',
                modifiers: [{
                    path: 'modifiers.damage.out.attack', value: -3
                }]
            },
            goldValue: 0,
            bound: true,
            description: ''
        }
    ]

    static fabled = [
        {
            id: 'fabled-benediction',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'benediction', label: 'Benediction' },
            goldValue: 50000,
            description: ''
        },
        {
            id: 'fabled-blasting',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'blasting', label: 'Blasting' },
            goldValue: 5000,
            description: ''
        },
        {
            id: 'fabled-precision',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'precision', label: 'Precision' },
            goldValue: 10000,
            description: ''
        },
        {
            id: 'fabled-soul-eater',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'soul-eater', label: 'Soul Eater' },
            goldValue: 50000,
            description: ''
        },
        {
            id: 'fabled-vicious',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'vicious', label: 'Vicious' },
            goldValue: 25000,
            description: ''
        },
        {
            id: 'fabled-vorpal',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'vorpal', label: 'Vorpal' },
            goldValue: 50000,
            description: ''
        },
        {
            id: 'fabled-wish',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'wish', label: 'Wish-Granting' },
            goldValue: 1000000,
            description: ''
        }
    ]

    static movement = [
        {
            id: 'movement-blinking',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'blinking', label: 'Blinking' },
            goldValue: 2000,
            description: ''
        },
        {
            id: 'movement-climbing',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'climbing', label: 'Climbing' },
            goldValue: 500,
            description: ''
        },
        {
            id: 'movement-clinging',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'clinging', label: 'Clinging' },
            goldValue: 2500,
            description: ''
        },
        {
            id: 'movement-displacement',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'displacement', label: 'Displacement' },
            goldValue: 1000,
            description: ''
        },
        {
            id: 'movement-flying',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'climbing', label: 'Flying' },
            goldValue: 5000,
            description: ''
        },
        {
            id: 'movement-jumping-1',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'jumping-1', label: 'Jumping I' },
            goldValue: 500,
            description: ''
        },
        {
            id: 'movement-jumping-2',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'jumping-2', label: 'Jumping II' },
            goldValue: 2500,
            description: ''
        },
        {
            id: 'movement-jumping-3',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'jumping-3', label: 'Jumping III' },
            goldValue: 12500,
            description: ''
        },
        {
            id: 'movement-levitation',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'levitation', label: 'Levitation' },
            goldValue: 500,
            description: ''
        },
        {
            id: 'movement-swiftness-1',
            category: { value: 'movement', label: 'Movement' },
            power: {
                value: 'swiftness-1',
                label: 'Swiftness I',
                modifiers: [{
                    path: 'speed.turn', value: 5
                }]
            },
            goldValue: 250,
            description: ''
        },
        {
            id: 'movement-swiftness-2',
            category: { value: 'movement', label: 'Movement' },
            power: {
                value: 'swiftness-2',
                label: 'Swiftness II',
                modifiers: [{
                    path: 'speed.turn', value: 10
                }]
            },
            goldValue: 1000,
            description: ''
        },
        {
            id: 'movement-swiftness-3',
            category: { value: 'movement', label: 'Movement' },
            power: {
                value: 'swiftness-3',
                label: 'Swiftness III',
                modifiers: [{
                    path: 'speed.turn', value: 5
                }]
            },
            goldValue: 5000,
            description: ''
        },
        {
            id: 'movement-waterwalk',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'waterwalk', label: 'Waterwalk' },
            goldValue: 500,
            description: ''
        },
        {
            id: 'movement-webwalk',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'webwalk', label: 'Webwalk' },
            goldValue: 500,
            description: ''
        }
    ]

    static protection = [
        {
            id: 'protection-niche',
            category: { value: 'protection', label: 'Protection' },
            power: { value: 'niche', label: 'Niche' },
            goldValue: 500,
            description: ''
        },
        {
            id: 'protection-specific',
            category: { value: 'protection', label: 'Protection' },
            power: { value: 'specific', label: 'Specific' },
            goldValue: 2000,
            description: ''
        },
        {
            id: 'protection-general',
            category: { value: 'protection', label: 'Protection' },
            power: { value: 'general', label: 'General' },
            goldValue: 5000,
            description: ''
        },
    ]

    static resistance = [
        {
            id: 'resistance-bravery',
            category: { value: 'resistance', label: 'Resistance' },
            power: { value: 'bravery', label: 'Bravery' },
            goldValue: 150,
            description: ''
        },
        {
            id: 'resistance-clarity',
            category: { value: 'resistance', label: 'Resistance' },
            power: { value: 'clarity', label: 'Clarity' },
            goldValue: 150,
            description: ''
        },
        {
            id: 'resistance-repulsing',
            category: { value: 'resistance', label: 'Resistance' },
            power: { value: 'repulsing', label: 'Repulsing' },
            goldValue: 150,
            description: ''
        },
        {
            id: 'resistance-resistance',
            category: { value: 'resistance', label: 'Resistance' },
            power: { value: 'resistance', label: 'Resistance (vs. Damage Type)' },
            goldValue: 2500,
            description: ''
        }
    ]

    static senses = [
        {
            id: 'senses-detection',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'detection', label: 'Detection' },
            goldValue: 5000,
            bound: true,
            description: ''
        },
        {
            id: 'senses-night',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'night', label: 'Nightvision' },
            goldValue: 100,
            description: ''
        },
        {
            id: 'senses-echo',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'echo', label: 'Echolocation' },
            goldValue: 250,
            description: ''
        },
        {
            id: 'senses-life',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'life', label: 'Sense Life' },
            goldValue: 10000,
            description: ''
        },
        {
            id: 'senses-valuables',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'valuables', label: 'Sense Valuables' },
            goldValue: 10000,
            description: ''
        },
        {
            id: 'senses-tremors',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'tremors', label: 'Tremors' },
            goldValue: 1000,
            bound: true,
            description: ''
        },
        {
            id: 'senses-telepathy',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'telepathy', label: 'Telepathy' },
            goldValue: 10000,
            bound: true,
            description: ''
        },
        {
            id: 'senses-true',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'true', label: 'True-Seeing' },
            goldValue: 20000,
            bound: true,
            description: ''
        }
    ]

    static utility = [
        {
            id: 'utility-after-im-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'after-im-1', label: 'After-Image I' },
            goldValue: 500,
            bound: true,
            description: ''
        },
        {
            id: 'utility-after-im-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'after-im-2', label: 'After-Image II' },
            goldValue: 2500,
            bound: true,
            description: ''
        },
        {
            id: 'utility-ambassador',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'ambassador', label: 'Ambassador' },
            goldValue: 1250,
            description: ''
        },
        {
            id: 'utility-aqua',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'aqua', label: 'Aqua Lung' },
            goldValue: 5000,
            description: ''
        },
        {
            id: 'utility-darkness-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'darkness-1', label: 'Darkness I' },
            goldValue: 500,
            description: ''
        },
        {
            id: 'utility-darkness-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'darkness-2', label: 'Darkness II' },
            goldValue: 1250,
            description: ''
        },
        {
            id: 'utility-darkness-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'darkness-3', label: 'Darkness III' },
            goldValue: 5000,
            description: ''
        },
        {
            id: 'utility-burning-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'burning-1', label: 'Burning I' },
            goldValue: 4000,
            description: ''
        },
        {
            id: 'utility-burning-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'burning-2', label: 'Burning II' },
            goldValue: 15000,
            description: ''
        },
        {
            id: 'utility-burning-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'burning-3', label: 'Burning III' },
            goldValue: 64000,
            description: ''
        },
        {
            id: 'utility-holding',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'holding', label: 'Holding' },
            goldValue: 200,
            description: ''
        },
        {
            id: 'utility-inf',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'inf', label: 'Infinite' },
            goldValue: 1000,
            description: ''
        },
        {
            id: 'utility-invis-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'invis-1', label: 'Invisibility I' },
            goldValue: 5000,
            description: ''
        },
        {
            id: 'utility-invis-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'invis-2', label: 'Invisibiliyy II' },
            goldValue: 50000,
            description: ''
        },
        {
            id: 'utility-lifesteal-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'lifesteal-1', label: 'Lifesteal I' },
            goldValue: 1000,
            description: ''
        },
        {
            id: 'utility-lifesteal-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'lifesteal-2', label: 'Lifesteal II' },
            goldValue: 12500,
            description: ''
        },
        {
            id: 'utility-lifesteal-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'lifesteal-3', label: 'Lifesteal III' },
            goldValue: 50000,
            description: ''
        },
        {
            id: 'utility-loyalty',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'loyalty', label: 'Loyalty' },
            goldValue: 1000,
            bound: true,
            description: ''
        },
        {
            id: 'utility-manasteal-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'manasteal-1', label: 'Manasteal I' },
            goldValue: 5000,
            bound: true,
            description: ''
        },
        {
            id: 'utility-manasteal-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'manasteal-2', label: 'Manasteal II' },
            goldValue: 20000,
            bound: true,
            description: ''
        },
        {
            id: 'utility-manasteal-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'manasteal-3', label: 'Manasteal III' },
            goldValue: 50000,
            bound: true,
            description: ''
        },
        {
            id: 'utility-moonlit-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'moonlit-1', label: 'Moonlit I' },
            goldValue: 500,
            description: ''
        },
        {
            id: 'utility-moonlit-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'moonlit-2', label: 'Moonlit II' },
            goldValue: 1250,
            description: ''
        },
        {
            id: 'utility-moonlit-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'moonlit-3', label: 'Moonlit III' },
            goldValue: 50000,
            description: ''
        },
        {
            id: 'utility-piercing-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'piercing-1', label: 'Piercing I' },
            goldValue: 150,
            description: ''
        },
        {
            id: 'utility-piercing-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'piercing-2', label: 'Piercing II' },
            goldValue: 1875,
            description: ''
        },
        {
            id: 'utility-piercing-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'piercing-3', label: 'Piercing III' },
            goldValue: 7500,
            description: ''
        },
        {
            id: 'utility-store-spell',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'store-spell', label: 'Store Spell' },
            goldValue: 0,
            description: ''
        },
        {
            id: 'utility-radiant-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'radiant-1', label: 'Radiant I' },
            goldValue: 2000,
            description: ''
        },
        {
            id: 'utility-radiant-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'radiant-2', label: 'Radiant II' },
            goldValue: 2000,
            description: ''
        },
        {
            id: 'utility-radiant-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'radiant-3', label: 'Radiant III' },
            goldValue: 2000,
            description: ''
        },
        {
            id: 'utility-warning',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'warning', label: 'Warning' },
            goldValue: 7500,
            bound: true,
            description: ''
        }
    ]
    
}