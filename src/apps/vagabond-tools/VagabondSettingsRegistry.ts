import { fields } from "../../model/common/sharedSchemas"
import { XpProgressionCurveApp } from "../level-up/progression/XpProgressionCurveApp"
import { XpQuestionnaireConfigApp } from "../level-up/questionnaire/XpQuestionnaireConfigApp"
import { RelicPowers } from "./relic/RelicPowers"

/**
 * These settings show up in Foundry's system settings main menu.
 */
export class VagabondSettingsRegistry {

    static register() {
        VagabondSettingsRegistry.registerMaxLevel()
        VagabondSettingsRegistry.registerXpCurve()
        VagabondSettingsRegistry.registerXpQuestionnaire()
        VagabondSettingsRegistry.registerAttackRegistry()
        VagabondSettingsRegistry.registerItemShopToggle()
        VagabondSettingsRegistry.registerProgressClocks()
        VagabondSettingsRegistry.registerCountdowns()
        VagabondSettingsRegistry.registerManaEnforcement()

        RelicPowers.register()
    }

    static registerClientSetting(settingKey: any) {
        game.settings?.register("vagabond-lite" as any, settingKey, {
            name: `Custom client setting`,
            hint: `${settingKey}`,
            scope: "client",
            type: new fields.BooleanField(),
            default: false
        })
    }

    static async toggleClientSetting(settingKey: any, actorId?: string | undefined | null) {
        const state = game.settings?.get("vagabond-lite" as any, settingKey)
        await game.settings?.set("vagabond-lite" as any, settingKey, !state)
        if (actorId) {
            game.actors?.get(actorId)?.render()
        }
    }

    /**
     * This is called from vagabond-lite.tsx and is triggered when a user
     * with permission tries to udpate a setting.
     * @param data
     */
    static handleIncomingSettingsChange(data: { setting: string, update: any, pw: string }) {
        (game.settings as any)?.set("vagabond-lite", data.setting, data.update)
    }

    private static registerMaxLevel() {
        game.settings?.register("vagabond-lite" as any, "maxLevel" as any, {
            name: "Max Level (default: 10)",
            hint: "The highest level a Hero can achieve.",
            scope: "world",
            config: true,
            type: Number,
            default: 10,
            onChange: () => { VagabondSettingsRegistry.refreshHeroSheets() }
        })
    }

    private static registerXpCurve() {
        game.settings?.register("vagabond-lite" as any, "xpCurve" as any, {
            name: "XP Progression Curve",
            hint: "Adjust required XP values to reach next level.",
            scope: "world",
            config: false,
            type: Object,
            default: [
                { id: "l0", level: 0, xp: 5 },
                { id: "l1", level: 1, xp: 10 },
                { id: "l2", level: 2, xp: 15 },
                { id: "l3", level: 3, xp: 20 },
                { id: "l4", level: 4, xp: 25 },
                { id: "l5", level: 5, xp: 30 },
                { id: "l6", level: 6, xp: 35 },
                { id: "l7", level: 7, xp: 40 },
                { id: "l8", level: 8, xp: 45 },
                { id: "l9", level: 9, xp: 50 }
            ] as any,
            onChange: () => { VagabondSettingsRegistry.refreshHeroSheets() }
        })
        game.settings?.registerMenu("vagabond-lite", "xpCurveConfig", {
            name: "XP Progression Curve Editor",
            label: "Modify Curve",
            hint: "Edit the XP curve for Hero leveling pace.",
            icon: "fas fa-tasks",
            type: XpProgressionCurveApp,
            restricted: true
        })
    }

    private static registerXpQuestionnaire() {
        game.settings?.register("vagabond-lite" as any, "xpQuestionnaire" as any, {
            name: "XP Questionnaire",
            hint: "An array of questions and their XP values.",
            scope: "world",
            config: false,
            type: Object,
            default: [
                { id: "q1", text: "Did you complete a Quest?", xp: 1 },
                { id: "q2", text: "Did you Fail and allow the Fail to resolve?", xp: 1 },
                { id: "q3", text: "Did you pass a Hindered Check?", xp: 1 },
                { id: "q4", text: "Did you make a discovery?", xp: 1 },
                { id: "q5", text: "Did you loot at least 50g of treasure?", xp: 1 }
            ] as any,
            onChange: () => { VagabondSettingsRegistry.refreshHeroSheets() }
        })
        game.settings?.registerMenu("vagabond-lite", "xpQuestionnaireConfig", {
            name: "XP Questionnaire Editor",
            label: "Modify Questions",
            hint: "Add, remove, or edit the XP questionnaire.",
            icon: "fas fa-tasks",
            type: XpQuestionnaireConfigApp,
            restricted: true
        })
    }

    private static registerAttackRegistry() {
        (game.settings as any).register("vagabond-lite", "attackRegistry", {
            name: "Attack Registry",
            hint: "Stores attack data from Heroes and Adversaries",
            scope: "world",
            config: false,
            type: Object,
            default: {}
        })
    }

    private static registerItemShopToggle() {
        (game.settings as any).register("vagabond-lite", "itemShopToggle", {
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
        (game.settings as any).register("vagabond-lite", "progressClocks" as any, {
            name: "Progress Clocks",
            hint: "World Progress Clocks",
            scope: "world",
            config: false,
            type: Array,
            default: []
        });
        (game.settings as any).register("vagabond-lite", "clockPermissionLevel" as any, {
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
        (game.settings as any).register("vagabond-lite", "countdowns" as any, {
            name: "Countdown Timers",
            hint: "Countdown Timers",
            scope: "world",
            config: false,
            type: Array,
            default: []
        });

        (game.settings as any).register("vagabond-lite", "countdownPermissionLevel" as any, {
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
        game.settings?.register("vagabond-lite" as any, "enforceMana" as any, {
            name: "Enforce Mana ",
            hint: "Enable to enforce spellcasting Mana consumption and Max/Cast limits.",
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        })
    }

    private static async refreshHeroSheets() {
        const heroes = game.actors?.contents.filter(it => (it.type as string) === 'hero')
        if (!heroes) return
        for (const hero of heroes) {
            (hero?.system as any)?.forceUpdate()
        }
    }

}