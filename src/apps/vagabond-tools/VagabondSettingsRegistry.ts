import { fields } from "../../model/common/sharedSchemas"
import { sys_id } from "../../utils/foundryUtils"
import { XpQuestionnaireConfigApp } from "../level-up/questionnaire/XpQuestionnaireConfigApp"
import { RelicPowers } from "./relic/RelicPowers"

/**
 * These settings show up in Foundry's system settings main menu.
 */
export class VagabondSettingsRegistry {

    static register() {
        VagabondSettingsRegistry.registerMaxLevel()
        VagabondSettingsRegistry.registerLevelPacing()
        VagabondSettingsRegistry.registerXpQuestionnaire()
        VagabondSettingsRegistry.registerAttackRegistry()
        VagabondSettingsRegistry.registerItemShopToggle()
        VagabondSettingsRegistry.registerProgressClocks()
        VagabondSettingsRegistry.registerCountdowns()
        VagabondSettingsRegistry.registerManaEnforcement()
        VagabondSettingsRegistry.registerAllowLateLuckStudy()

        RelicPowers.register()
    }

    static registerClientSetting(settingKey: any) {
        game.settings?.register(sys_id, settingKey, {
            name: `Custom client setting`,
            hint: `${settingKey}`,
            scope: "client",
            type: new fields.BooleanField(),
            default: false
        })
    }

    static async toggleClientSetting(settingKey: any, actorId?: string | undefined | null) {
        const state = game.settings?.get(sys_id, settingKey)
        await game.settings?.set(sys_id, settingKey, !state)
        if (actorId) {
            game.actors?.get(actorId)?.render()
        }
    }

    /**
     * This is called from 'main' and is triggered when a user
     * with permission tries to udpate a setting.
     * @param data
     */
    static handleIncomingSettingsChange(data: { setting: string, update: any, pw: string }) {
        (game.settings as any)?.set(sys_id, data.setting, data.update)
    }

    private static registerMaxLevel() {
        game.settings?.register(sys_id, "maxLevel" as any, {
            name: "Max Level (default: 10)",
            hint: "The highest level a Hero can achieve.",
            scope: "world",
            config: true,
            type: Number,
            default: 10,
            onChange: () => { VagabondSettingsRegistry.refreshHeroSheets() }
        })
    }

    private static registerLevelPacing() {
        game.settings?.register(sys_id, "levelPacing" as any, {
            name: "Level Pacing",
            hint: "Pace at which the Heroes gain levels.",
            scope: "world",
            config: true,
            type: String,
            default: 'normal',
            choices: {
                "quick": "Quick: 5 XP / Level (2-5 month campaign)",
                "normal": "Normal: 5x next Level (5-12 month campaign)",
                "epic": "Epic: 7x next Level (1-2 year campaign)",
                "saga": "Saga: 10x next Level (2+ year campaign)",
                "destiny": "Destiny: Grant level-ups from Hero sheet menu."
            },
            onChange: () => { VagabondSettingsRegistry.refreshHeroSheets() }
        })
    }

    private static registerXpQuestionnaire() {
        game.settings?.register(sys_id, "xpQuestionnaire" as any, {
            name: "XP Questionnaire",
            hint: "An array of questions and their XP values.",
            scope: "world",
            config: false,
            type: Object,
            default: [
                { id: "q1", text: "Did you complete a Quest?", xp: 1 },
                { id: "q2", text: "Did you Fail and allow the Fail to resolve?", xp: 1 },
                { id: "q3", text: "Did you defeat a Boss Enemy?", xp: 1 },
                { id: "q4", text: "Did you pass a Hindered Check?", xp: 1 },
                { id: "q5", text: "Did you make a discovery?", xp: 1 },
                { id: "q6", text: "Did you loot at least 50g of treasure?", xp: 1 }
            ] as any,
            onChange: () => { VagabondSettingsRegistry.refreshHeroSheets() }
        })
        game.settings?.registerMenu(sys_id, "xpQuestionnaireConfig", {
            name: "XP Questionnaire Editor",
            label: "Modify Questions",
            hint: "Add, remove, or edit the XP questionnaire.",
            icon: "fas fa-tasks",
            type: XpQuestionnaireConfigApp,
            restricted: true
        })
    }

    private static registerAttackRegistry() {
        (game.settings as any).register(sys_id, "attackRegistry", {
            name: "Attack Registry",
            hint: "Stores attack data from Heroes and Adversaries",
            scope: "world",
            config: false,
            type: Object,
            default: {}
        })
    }

    private static registerItemShopToggle() {
        (game.settings as any).register(sys_id, "itemShopToggle", {
            name: "Toggle Item Shop",
            hint: "Control visibility of Item Shop to players",
            scope: "world",
            config: false,
            type: Boolean,
            default: true,
            onChange: () => { VagabondSettingsRegistry.refreshHeroSheets() }
        })
    }

    private static async registerProgressClocks() {
        (game.settings as any).register(sys_id, "progressClocks" as any, {
            name: "Progress Clocks",
            hint: "World Progress Clocks",
            scope: "world",
            config: false,
            type: Array,
            default: []
        });
        (game.settings as any).register(sys_id, "clockPermissionLevel" as any, {
            name: "Clock Interaction Permissions",
            hint: "Determines whether players can advance progress clocks or if it is restricted to GM.",
            scope: "world",
            config: true,
            type: String,
            default: "gmOnly",
            choices: {
                "gmOnly": "GM Only",
                "everyone": "All Players"
            }
        });
    }

    private static async registerCountdowns() {
        (game.settings as any).register(sys_id, "countdowns" as any, {
            name: "Countdown Timers",
            hint: "Countdown Timers",
            scope: "world",
            config: false,
            type: Array,
            default: []
        });

        (game.settings as any).register(sys_id, "countdownPermissionLevel" as any, {
            name: "Countdown Interaction Permissions",
            hint: "Determines whether players can interact with countdown dice or if it is restricted to GM.",
            scope: "world",
            config: true,
            type: String,
            default: "gmOnly",
            choices: {
                "gmOnly": "GM Only",
                "everyone": "All Players"
            }
        })
    }

    private static registerManaEnforcement() {
        game.settings?.register(sys_id, "enforceMana" as any, {
            name: "Enforce Mana",
            hint: "Enable to enforce spellcasting Mana consumption and Max/Cast limits.",
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        })
    }

    private static registerAllowLateLuckStudy() {
        game.settings?.register(sys_id, "allowLateLuckStudy" as any, {
            name: "Allow Late Luck/Study",
            hint: "Allow Heroes to spend Luck/Study dice after a failed check.",
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        })
    }

    private static async refreshHeroSheets() {
        const heroes = game.actors?.contents.filter(it => (it.type as string) === 'hero')
        if (!heroes) return
        for (const hero of heroes) {
            if (hero.isOwner) {
                (hero?.system as any)?.forceUpdate()
            }
        }
    }

}