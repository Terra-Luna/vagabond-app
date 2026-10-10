import { fields } from "../../model/common/sharedSchemas"
import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
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
        VagabondSettingsRegistry.registerShowTrainingSelectionToggle()
        VagabondSettingsRegistry.registerAllowLateLuckStudy()

        RelicPowers.register()
    }

    static registerClientSetting(settingKey: any, value?: boolean | undefined) {
        game.settings?.register(sys_id, settingKey, {
            name: appLang.Settings.customClientSetting,
            hint: `${settingKey}`,
            scope: "client",
            type: new fields.BooleanField(),
            default: value ?? true
        })
    }

    static async toggleClientSetting(settingKey: any, actorId?: string | undefined | null, value?: boolean | undefined) {
        let currentState: boolean
        try {
            const existing = game.settings?.get(sys_id, settingKey)
            currentState = existing !== undefined && existing !== null ? Boolean(existing) : true
        } catch {
            currentState = true
        }
        const state = value === undefined ? currentState : value
        await game.settings?.set(sys_id, settingKey, !state)
        if (actorId) {
            const actor = game.actors?.get(actorId)
            if (actor) {
                actor.sheet?.render() ?? actor.render()
            }
            if ((foundry as any)?.applications?.instances) {
                for (const app of (foundry as any).applications.instances.values()) {
                    const docApp = app as any
                    if (docApp.document?.id === actorId || docApp.actor?.id === actorId) {
                        docApp.render()
                    }
                }
            }
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
            name: appLang.Settings.maxLevel,
            hint: appLang.Settings.maxLevelHint,
            scope: "world",
            config: true,
            type: Number,
            default: 10,
            onChange: () => { VagabondSettingsRegistry.refreshActorSheets() }
        })
    }

    private static registerLevelPacing() {
        game.settings?.register(sys_id, "levelPacing" as any, {
            name: appLang.Settings.levelPacing,
            hint: appLang.Settings.levelPacingHint,
            scope: "world",
            config: true,
            type: String,
            default: 'normal',
            choices: {
                "quick": appLang.Settings.levelPacingQuick,
                "normal": appLang.Settings.levelPacingNormal,
                "epic": appLang.Settings.levelPacingEpic,
                "saga": appLang.Settings.levelPacingSaga,
                "destiny": appLang.Settings.levelPacingDestiny
            },
            onChange: () => { VagabondSettingsRegistry.refreshActorSheets() }
        })
    }

    private static registerXpQuestionnaire() {
        game.settings?.register(sys_id, "xpQuestionnaire" as any, {
            name: appLang.Settings.xpQuestionnaire,
            hint: appLang.Settings.xpQuestionnaireHint,
            scope: "world",
            config: false,
            type: Object,
            default: [
                { id: "q1", text: appLang.Settings.xpQuestion1, xp: 1 },
                { id: "q2", text: appLang.Settings.xpQuestion2, xp: 1 },
                { id: "q3", text: appLang.Settings.xpQuestion3, xp: 1 },
                { id: "q4", text: appLang.Settings.xpQuestion4, xp: 1 },
                { id: "q5", text: appLang.Settings.xpQuestion5, xp: 1 },
                { id: "q6", text: appLang.Settings.xpQuestion6, xp: 1 }
            ] as any,
            onChange: () => { VagabondSettingsRegistry.refreshActorSheets() }
        })
        game.settings?.registerMenu(sys_id, "xpQuestionnaireConfig", {
            name: appLang.Settings.xpQuestionnaireEditor,
            label: appLang.Settings.modifyQuestions,
            hint: appLang.Settings.xpQuestionnaireEditorHint,
            icon: "fas fa-tasks",
            type: XpQuestionnaireConfigApp,
            restricted: true
        })
    }

    private static registerAttackRegistry() {
        (game.settings as any).register(sys_id, "attackRegistry", {
            name: appLang.Settings.attackRegistry,
            hint: appLang.Settings.attackRegistryHint,
            scope: "world",
            config: false,
            type: Object,
            default: {}
        })
    }

    private static registerItemShopToggle() {
        (game.settings as any).register(sys_id, "itemShopToggle", {
            name: appLang.VagabondTools.toggleItemShop,
            hint: appLang.Settings.toggleItemShopHint,
            scope: "world",
            config: false,
            type: Boolean,
            default: true,
            onChange: () => { VagabondSettingsRegistry.refreshActorSheets() }
        })
    }

    private static async registerProgressClocks() {
        (game.settings as any).register(sys_id, "progressClocks" as any, {
            name: appLang.VagabondTools.progressClocks,
            hint: appLang.Settings.progressClocksHint,
            scope: "world",
            config: false,
            type: Array,
            default: []
        });
        (game.settings as any).register(sys_id, "clockPermissionLevel" as any, {
            name: appLang.Settings.clockInteractionPermissions,
            hint: appLang.Settings.progressClocksPermissionHint,
            scope: "world",
            config: true,
            type: String,
            default: "gmOnly",
            choices: {
                "gmOnly": appLang.Settings.gmOnly,
                "everyone": appLang.Settings.allPlayers
            }
        });
    }

    private static async registerCountdowns() {
        (game.settings as any).register(sys_id, "countdowns" as any, {
            name: appLang.Settings.countdowns,
            hint: appLang.Settings.countdowns,
            scope: "world",
            config: false,
            type: Array,
            default: []
        });

        (game.settings as any).register(sys_id, "countdownPermissionLevel" as any, {
            name: appLang.Settings.countdownInteractionPermissions,
            hint: appLang.Settings.countdownsPermissionHint,
            scope: "world",
            config: true,
            type: String,
            default: "gmOnly",
            choices: {
                "gmOnly": appLang.Settings.gmOnly,
                "everyone": appLang.Settings.allPlayers
            }
        })
    }

    private static registerManaEnforcement() {
        game.settings?.register(sys_id, "enforceMana" as any, {
            name: appLang.Settings.enforceMana,
            hint: appLang.Settings.manaEnforcementHint,
            scope: "world",
            config: true,
            type: Boolean,
            default: true
        })
    }

    private static registerShowTrainingSelectionToggle() {
        (game.settings as any).register(sys_id, "showTrainingSelection", {
            name: appLang.Settings.showTrainingSelection,
            hint: appLang.Settings.trainingSelectionHint,
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            onChange: () => { VagabondSettingsRegistry.refreshActorSheets() }
        })
    }

    private static registerAllowLateLuckStudy() {
        game.settings?.register(sys_id, "allowLateLuckStudy" as any, {
            name: appLang.Settings.allowLateLuckStudy,
            hint: appLang.Settings.lateLuckStudyHint,
            scope: "world",
            config: true,
            type: Boolean,
            default: false
        })
    }

    static async refreshActorSheets() {
        const actors = game.actors?.contents?.filter(it => it.isOwner)
        if (!actors) return
        for (const actor of actors) {
            if (actor.isOwner) {
                (actor?.system as any)?.forceUpdate()
            }
        }
    }

}