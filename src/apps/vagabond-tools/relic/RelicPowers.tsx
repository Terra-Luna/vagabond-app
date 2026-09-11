import { EquipmentDataModel, EquipmentSchema } from "../../../model/item/equip/EquipmentDataModel"
import { sys_id } from "../../../utils/foundryUtils"

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
        game.settings?.register(sys_id, "relics" as any, {
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

    static get(itemType: string): RelicPower[] {
        const relics = (game.settings as any)?.get(sys_id, "relics")
        console.log(relics)
        return relics.filter(rel => rel.types.includes(itemType))
    }

    static async toggleRelicEffect(item: Item & { system: EquipmentDataModel<EquipmentSchema> }, relic: RelicPower) {
        const existingPowers = item.system.relicPowers

        if (existingPowers.some(p => p.id === relic.id)) {
            // Remove
            await item.update({ 'system.relicPowers': [...existingPowers.filter(p => p.id !== relic.id)] } as Record<string, any>)
        }
        else {
            // Add
            await item.update({ 'system.relicPowers': [...existingPowers, relic] } as Record<string, any>)
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
            types: ['weapon'],
            goldValue: 2000,
            description: "The damage die is one size larger when using the Cleave property."
        },
        {
            id: 'ace-grapple',
            category: { value: 'ace', label: 'Ace' },
            power: { value: 'grapple', label: 'Grapple' },
            types: ['weapon'],
            goldValue: 1000,
            description: "Target is considered Vulnerable for ending the Restrained Status."
        },
        {
            id: 'ace-keen',
            category: { value: 'ace', label: 'Ace' },
            power: {
                value: 'keen',
                label: 'Keen',
                modifiers: [{ path: "modifiers.skillCheck.attack.critThreshold", value: 1 }]
            },
            types: ['weapon'],
            goldValue: 2000,
            description: "Crits 2 lower rather than 1 lower from Keen."
        },
        {
            id: 'ace-thrown',
            category: { value: 'ace', label: 'Ace' },
            power: { value: 'thrown', label: 'Thrown' },
            types: ['weapon'],
            goldValue: 2000,
            description: "Far Thrown attacks with it aren't Hindered."
        },
        {
            id: 'ace-vicious',
            category: { value: 'ace', label: 'Ace' },
            power: {
                value: 'vicious',
                label: 'Vicious',
                modifiers: [
                    { path: "modifiers.dice.crit.melee.extraDice", value: 2 },
                    { path: "modifiers.dice.crit.brawl.extraDice", value: 2 },
                    { path: "modifiers.dice.crit.finesse.extraDice", value: 2 },
                    { path: "modifiers.dice.crit.ranged.extraDice", value: 2 }
                ]
            },
            types: ['weapon'],
            goldValue: 2000,
            description: "Deals an extra damage die from Vicious."
        }
    ]

    static bane = [
        {
            id: 'bane-nice',
            category: { value: 'bane', label: 'Bane' },
            power: { value: 'niche', label: 'Niche' },
            types: ['weapon'],
            goldValue: 500,
            description: "Adds an extra damage die to extremely specific Beings, such as Trolls (not all giants)."
        },
        {
            id: 'specific-nice',
            category: { value: 'bane', label: 'Bane' },
            power: { value: 'specific', label: 'Specific' },
            types: ['weapon'],
            goldValue: 2000,
            description: "Adds an extra damage die to a Being subtype, such as giants (not all Cryptids)."
        },
        {
            id: 'bane-general',
            category: { value: 'bane', label: 'Bane' },
            power: { value: 'general', label: 'General' },
            types: ['weapon'],
            goldValue: 5000,
            description: "Adds an extra damage die to an entire Being Type, such as Cryptids (not just giants)."
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
                    path: 'system.rating', value: 1
                }]
            },
            types: ['armor'],
            goldValue: 100,
            description: "+1 bonus to Armor."
        },
        {
            id: 'bonus-armor-2',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'armor-2',
                label: 'Armor +2',
                modifiers: [{
                    path: 'system.rating', value: 2
                }]
            },
            types: ['armor'],
            goldValue: 5000,
            description: "+2 bonus to Armor."
        },
        {
            id: 'bonus-armor-3',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'armor-3',
                label: 'Armor +3',
                modifiers: [{
                    path: 'system.rating', value: 3
                }]
            },
            types: ['armor'],
            goldValue: 50000,
            description: "+3 bonus to Armor."
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
            types: ['armor', 'weapon', 'sundry'],
            goldValue: 1000,
            description: "+1 bonus to Saves."
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
            types: ['armor', 'weapon', 'sundry'],
            goldValue: 10000,
            description: "+2 bonus to Saves."
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
            types: ['armor', 'weapon', 'sundry'],
            goldValue: 100000,
            description: "+3 bonus to Saves."
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
            types: ['weapon', 'sundry'],
            goldValue: 200,
            description: "+1 bonus to Spell damage."
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
            types: ['weapon', 'sundry'],
            goldValue: 2500,
            description: "+2 bonus to Spell damage."
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
            types: ['weapon', 'sundry'],
            goldValue: 10000,
            description: "+3 bonus to Spell damage."
        },
        {
            id: 'bonus-weapon-1',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'weapon-1',
                label: 'Weapon +1',
                modifiers: [
                    { path: 'system.damage.dice.modifier', value: 1 }
                ]
            },
            types: ['weapon'],
            goldValue: 100,
            description: "+1 bonus to Attack damage."
        },
        {
            id: 'bonus-weapon-2',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'weapon-2',
                label: 'Weapon +2',
                modifiers: [
                    { path: 'system.damage.dice.modifier', value: 2 }
                ]
            },
            types: ['weapon'],
            goldValue: 1250,
            description: "+2 bonus to Attack damage."
        },
        {
            id: 'bonus-weapon-3',
            category: { value: 'bonus', label: 'Bonus' },
            power: {
                value: 'weapon-3',
                label: 'Weapon +3',
                modifiers: [
                    { path: 'system.damage.dice.modifier', value: 3 }
                ]
            },
            types: ['weapon'],
            goldValue: 5000,
            description: "+3 bonus to Attack damage."
        },
    ]

    static cursed = [
        {
            id: 'cursed-anger',
            category: { value: 'cursed', label: 'Cursed' },
            power: { value: 'anger', label: 'Anger' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 0,
            bound: true,
            description: "Wearer always fails Saves against Berserk."
        },
        {
            id: 'cursed-cowardice',
            category: { value: 'cursed', label: 'Cursed' },
            power: { value: 'cowardice', label: 'Cowardice' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 0,
            bound: true,
            description: "Wearer always fails Saves against Frightened."
        },
        {
            id: 'cursed-doom',
            category: { value: 'cursed', label: 'Cursed' },
            power: { value: 'doom', label: 'Doom' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 0,
            bound: true,
            description: "Wearer only regains 1 Hit Point per die used for healing rolls Targeting it."
        },
        {
            id: 'cursed-gullibility',
            category: { value: 'cursed', label: 'Cursed' },
            power: { value: 'gullibility', label: 'Gullibility' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 0,
            bound: true,
            description: "Wearer always fails Saves against Charmed."
        },
        {
            id: 'cursed-vuln-1',
            category: { value: 'cursed', label: 'Cursed' },
            power: {
                value: 'vuln-1',
                label: 'Vulnerability -1',
                modifiers: [{
                    path: 'system.rating', value: -1
                }]
            },
            types: ['armor'],
            goldValue: 0,
            bound: true,
            description: "-1 penalty to Armor."
        },
        {
            id: 'cursed-vuln-2',
            category: { value: 'cursed', label: 'Cursed' },
            power: {
                value: 'vuln-2',
                label: 'Vulnerability -2',
                modifiers: [{
                    path: 'system.rating', value: -2
                }]
            },
            types: ['armor'],
            goldValue: 0,
            bound: true,
            description: "-2 penalty to Armor."
        },
        {
            id: 'cursed-vuln-3',
            category: { value: 'cursed', label: 'Cursed' },
            power: {
                value: 'vuln-3',
                label: 'Vulnerability -3',
                modifiers: [{
                    path: 'system.rating', value: -3
                }]
            },
            types: ['armor'],
            goldValue: 0,
            bound: true,
            description: "-3 penalty to Armor."
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
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 0,
            bound: true,
            description: "-1 penalty to Attack damage."
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
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 0,
            bound: true,
            description: "-2 penalty to Attack damage."
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
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 0,
            bound: true,
            description: "-3 penalty to Attack damage."
        }
    ]

    static fabled = [
        {
            id: 'fabled-benediction',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'benediction', label: 'Benediction' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 50000,
            description: "Immediately revived upon death by dropping to 0 HP, once per week."
        },
        {
            id: 'fabled-blasting',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'blasting', label: 'Blasting' },
            types: ['weapon'],
            goldValue: 5000,
            description: "Can send a beam of magic energy to attack."
        },
        {
            id: 'fabled-precision',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'precision', label: 'Precision' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 10000,
            description: "Once per day, gain Favor on attacks for 1 Minute, or until you miss."
        },
        {
            id: 'fabled-soul-eater',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'soul-eater', label: 'Soul Eater' },
            types: ['weapon'],
            goldValue: 50000,
            description: "Those killed by it can't be resurrected unless a wish is granted to do so."
        },
        {
            id: 'fabled-vicious',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'vicious', label: 'Vicious' },
            types: ['weapon'],
            goldValue: 25000,
            description: "On a Crit, the Target takes extra damage equal to twice its HD."
        },
        {
            id: 'fabled-vorpal',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'vorpal', label: 'Vorpal' },
            types: ['weapon'],
            goldValue: 50000,
            description: "Behead Target on Crit if the Target takes the damage."
        },
        {
            id: 'fabled-wish',
            category: { value: 'fabled', label: 'Fabled' },
            power: { value: 'wish', label: 'Wish-Granting' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 1000000,
            description: "Grants a wish."
        }
    ]

    static movement = [
        {
            id: 'movement-blinking',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'blinking', label: 'Blinking' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 2000,
            description: "Wearer is under the effects of the Blink Spell."
        },
        {
            id: 'movement-climbing',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'climbing', label: 'Climbing' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 500,
            description: "Wearer gains Climb."
        },
        {
            id: 'movement-clinging',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'clinging', label: 'Clinging' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 2500,
            description: "Wearer gains Cling."
        },
        {
            id: 'movement-displacement',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'displacement', label: 'Displacement' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 1000,
            description: "Sight-based attacks against the Wearer are made as if the attacker is Vulnerable."
        },
        {
            id: 'movement-flying',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'climbing', label: 'Flying' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 5000,
            description: "Wearer gains Fly."
        },
        {
            id: 'movement-jumping-1',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'jumping-1', label: 'Jumping I' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 500,
            description: "Wearer's horizontal jump distance is multiplied by 2."
        },
        {
            id: 'movement-jumping-2',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'jumping-2', label: 'Jumping II' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 2500,
            description: "Wearer's horizontal jump distance is multiplied by 3."
        },
        {
            id: 'movement-jumping-3',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'jumping-3', label: 'Jumping III' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 12500,
            description: "Wearer's horizontal jump distance is multiplied by 4."
        },
        {
            id: 'movement-levitation',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'levitation', label: 'Levitation' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 500,
            description: "Wearer is under the effects of the Levitate Spell."
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
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 250,
            description: "Wearer gains a bonus + 5' to Speed."
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
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 1000,
            description: "Wearer gains a bonus + 10' to Speed."
        },
        {
            id: 'movement-swiftness-3',
            category: { value: 'movement', label: 'Movement' },
            power: {
                value: 'swiftness-3',
                label: 'Swiftness III',
                modifiers: [{
                    path: 'speed.turn', value: 15
                }]
            },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 5000,
            description: "Wearer gains a bonus + 15' to Speed."
        },
        {
            id: 'movement-waterwalk',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'waterwalk', label: 'Waterwalk' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 500,
            description: "Wearer can walk on liquids."
        },
        {
            id: 'movement-webwalk',
            category: { value: 'movement', label: 'Movement' },
            power: { value: 'webwalk', label: 'Webwalk' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 500,
            description: "Wearer ignores Difficult Terrain of webs, and can't be Restrained by them."
        }
    ]

    static protection = [
        {
            id: 'protection-niche',
            category: { value: 'protection', label: 'Protection' },
            power: { value: 'niche', label: 'Niche' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 500,
            description: "Wearer can't be Hindered on Saves against extremely specific Beings, such as Trolls (not all giants)."
        },
        {
            id: 'protection-specific',
            category: { value: 'protection', label: 'Protection' },
            power: { value: 'specific', label: 'Specific' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 2000,
            description: "Wearer can't be Hindered on Saves against a Being subtype, such as giants (not all Cryptids)."
        },
        {
            id: 'protection-general',
            category: { value: 'protection', label: 'Protection' },
            power: { value: 'general', label: 'General' },
            types: ['armor', 'weapon', 'sundry'],
            goldValue: 5000,
            description: "Wearer can't be Hindered on Saves against an entire Being Type, such as Cryptids (not just giants)."
        },
    ]

    static resistance = [
        {
            id: 'resistance-bravery',
            category: { value: 'resistance', label: 'Resistance' },
            power: { value: 'bravery', label: 'Bravery' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 150,
            description: "Grants Favor on Saves against the Frightened Status."
        },
        {
            id: 'resistance-clarity',
            category: { value: 'resistance', label: 'Resistance' },
            power: { value: 'clarity', label: 'Clarity' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 150,
            description: "Grants Favor on Saves against the Confused Status."
        },
        {
            id: 'resistance-repulsing',
            category: { value: 'resistance', label: 'Resistance' },
            power: { value: 'repulsing', label: 'Repulsing' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 150,
            description: "Grants Favor on Saves against the Charmed Status."
        },
        {
            id: 'resistance-resistance',
            category: { value: 'resistance', label: 'Resistance' },
            power: { value: 'resistance', label: 'Resistance (vs. Damage Type)' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 2500,
            description: "Favor on Saves and damage reduction against a damage source (such as fire)."
        }
    ]

    static senses = [
        {
            id: 'senses-detection',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'detection', label: 'Detection' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 5000,
            bound: true,
            description: "Grants Allsight to see a Being Type (Bound)."
        },
        {
            id: 'senses-night',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'night', label: 'Nightvision' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 100,
            description: "Grants Darksight."
        },
        {
            id: 'senses-echo',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'echo', label: 'Echolocation' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 250,
            description: "Grants Echolocation."
        },
        {
            id: 'senses-life',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'life', label: 'Sense Life' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 10000,
            description: "Senses Small and larger Beings within Far who aren't Artificials or Undead."
        },
        {
            id: 'senses-valuables',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'valuables', label: 'Sense Valuables' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 10000,
            description: "Senses gold and gems within Near."
        },
        {
            id: 'senses-tremors',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'tremors', label: 'Tremors' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 1000,
            bound: true,
            description: "Grants Seismicsense (Bound)."
        },
        {
            id: 'senses-telepathy',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'telepathy', label: 'Telepathy' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 10000,
            bound: true,
            description: "Grants Telepathy (Bound)."
        },
        {
            id: 'senses-true',
            category: { value: 'senses', label: 'Senses' },
            power: { value: 'true', label: 'True-Seeing' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 20000,
            bound: true,
            description: "Grants Allsight (Bound)."
        }
    ]

    static utility = [
        {
            id: 'utility-after-im-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'after-im-1', label: 'After-Image I' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 500,
            bound: true,
            description: "Wearer can project an illusory duplicate out to Near (Bound)."
        },
        {
            id: 'utility-after-im-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'after-im-2', label: 'After-Image II' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 2500,
            bound: true,
            description: "Wearer can project an illusory duplicate out to Far (Bound)."
        },
        {
            id: 'utility-ambassador',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'ambassador', label: 'Ambassador' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 1250,
            description: "Wielder can speak with certain Beings they normally couldn't otherwise."
        },
        {
            id: 'utility-aqua',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'aqua', label: 'Aqua Lung' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 5000,
            description: "Wearer can breathe water."
        },
        {
            id: 'utility-darkness-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'darkness-1', label: 'Darkness I' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 500,
            description: "Darkens non-magical light within Close while Equipped."
        },
        {
            id: 'utility-darkness-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'darkness-2', label: 'Darkness II' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 1250,
            description: "Darkens non-magical light within Near while Equipped."
        },
        {
            id: 'utility-darkness-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'darkness-3', label: 'Darkness III' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 5000,
            description: "Darkens non-magical light within Far while Equipped."
        },
        {
            id: 'utility-burning-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'burning-1', label: 'Burning I' },
            types: ['weapon'],
            goldValue: 4000,
            description: "Burning (Cd4) on a hit."
        },
        {
            id: 'utility-burning-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'burning-2', label: 'Burning II' },
            types: ['weapon'],
            goldValue: 15000,
            description: "Burning (Cd6) on a hit."
        },
        {
            id: 'utility-burning-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'burning-3', label: 'Burning III' },
            types: ['weapon'],
            goldValue: 64000,
            description: "Burning (Cd8) on a hit."
        },
        {
            id: 'utility-holding',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'holding', label: 'Holding' },
            types: ['container'],
            goldValue: 200,
            description: "Gives bonus Item Slots."
        },
        {
            id: 'utility-inf',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'inf', label: 'Infinite' },
            types: ['sundry', 'weapon'],
            goldValue: 1000,
            description: "Provides an endless amount of a detailed Item that disappears in 1 Round."
        },
        {
            id: 'utility-invis-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'invis-1', label: 'Invisibility I' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 5000,
            description: "Skip Move to become Invisible until after it takes an Action."
        },
        {
            id: 'utility-invis-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'invis-2', label: 'Invisibiliyy II' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 50000,
            description: "Wearer is Invisible."
        },
        {
            id: 'utility-lifesteal-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'lifesteal-1', label: 'Lifesteal I' },
            types: ['weapon'],
            goldValue: 1000,
            description: "Killing a foe with it heals the Wielder for d8 HP."
        },
        {
            id: 'utility-lifesteal-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'lifesteal-2', label: 'Lifesteal II' },
            types: ['weapon'],
            goldValue: 12500,
            description: "Killing a foe with it heals the Wielder for 2d8 HP."
        },
        {
            id: 'utility-lifesteal-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'lifesteal-3', label: 'Lifesteal III' },
            types: ['weapon'],
            goldValue: 50000,
            description: "Killing a foe with it heals the Wielder for 3d8 HP."
        },
        {
            id: 'utility-loyalty',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'loyalty', label: 'Loyalty' },
            types: ['weapon'],
            goldValue: 1000,
            bound: true,
            description: "Magically returns to the Being's hand if thrown to attack (Bound)."
        },
        {
            id: 'utility-manasteal-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'manasteal-1', label: 'Manasteal I' },
            types: ['sundry', 'weapon'],
            goldValue: 5000,
            bound: true,
            description: "Killing a foe with it restores d4 Mana to the Bound Wielder."
        },
        {
            id: 'utility-manasteal-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'manasteal-2', label: 'Manasteal II' },
            types: ['sundry', 'weapon'],
            goldValue: 20000,
            bound: true,
            description: "Killing a foe with it restores 2d4 Mana to the Bound Wielder."
        },
        {
            id: 'utility-manasteal-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'manasteal-3', label: 'Manasteal III' },
            types: ['sundry', 'weapon'],
            goldValue: 50000,
            bound: true,
            description: "Killing a foe with it restores 3d4 Mana to the Bound Wielder."
        },
        {
            id: 'utility-moonlit-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'moonlit-1', label: 'Moonlit I' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 500,
            description: "Sheds Moonlight out to Close while Equipped."
        },
        {
            id: 'utility-moonlit-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'moonlit-2', label: 'Moonlit II' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 1250,
            description: "Sheds Moonlight out to Near while Equipped."
        },
        {
            id: 'utility-moonlit-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'moonlit-3', label: 'Moonlit III' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 50000,
            description: "Sheds Moonlight out to Far while Equipped."
        },
        {
            id: 'utility-piercing-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'piercing-1', label: 'Piercing I' },
            types: ['weapon'],
            goldValue: 150,
            description: "Attacks with it ignore 1 Armor."
        },
        {
            id: 'utility-piercing-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'piercing-2', label: 'Piercing II' },
            types: ['weapon'],
            goldValue: 1875,
            description: "Attacks with it ignore 2 Armor."
        },
        {
            id: 'utility-piercing-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'piercing-3', label: 'Piercing III' },
            types: ['weapon'],
            goldValue: 7500,
            description: "Attacks with it ignore 3 Armor."
        },
        {
            id: 'utility-store-spell',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'store-spell', label: 'Store Spell' },
            types: ['sundry', 'weapon'],
            goldValue: 0,
            description: "Reduce Caster's Maximum Mana to store a Casting of a Spell."
        },
        {
            id: 'utility-radiant-1',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'radiant-1', label: 'Radiant I' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 2000,
            description: "Sheds Sunlight out to Close while Equipped."
        },
        {
            id: 'utility-radiant-2',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'radiant-2', label: 'Radiant II' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 2000,
            description: "Sheds Sunlight out to Near while Equipped."
        },
        {
            id: 'utility-radiant-3',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'radiant-3', label: 'Radiant III' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 2000,
            description: "Sheds Sunlight out to Far while Equipped."
        },
        {
            id: 'utility-warning',
            category: { value: 'utility', label: 'Utility' },
            power: { value: 'warning', label: 'Warning' },
            types: ['armor', 'sundry', 'weapon'],
            goldValue: 7500,
            bound: true,
            description: "Bound Being can't be surprised, and is awoken if foes are Near."
        }
    ]
    
}