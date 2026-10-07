import { useEffect, useMemo, useState } from "react"

import { getAttackRegistry } from "../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { ItemsCache } from "../../../rules/util/ItemsCache"
import { sys_id } from "../../../utils/foundryUtils"
import { getCanvasToken, getTokenImg } from "../../../utils/modelUtil"
import { BaseChatCardHost } from "../../../view/chat/component/BaseChatCardHost"
import { ChatCardBanner } from "../../../view/chat/component/ChatCardBanner"
import { Checkbox } from "../../../view/component/Checkbox"
import { Header } from "../../../view/component/Header"
import { EditModeContextProvider } from "../../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../../view/context/EditModeContext/EditModeOptions"
import { AdversaryAttack } from "../../engine/AdversaryAttack"
import { AdversaryComboAttack } from "../../engine/AdversaryComboAttack"
import { HeroAttack } from "../../engine/HeroAttack"
import { deserializeAttack } from "../../engine/util/attack-deserializer"
import { serializeAttack } from "../../engine/util/attack-serializer"
import { AdversaryAttackComponent, AdversaryComboAttackComponent } from "./AdversaryAttackComponent"
import { HeroAttackComponent } from "./HeroAttackComponent"
import { InteractiveChatCardButton } from "./InteractiveChatCardButton"

export const InteractiveAttackChatCard = ({ actorId, attackId }: { actorId: string, attackId: string }) => {
    const [revision, setRevision] = useState(0)
    const [flanked, setFlanked] = useState<boolean>(false)
    const [targetsToggle, setTargetsToggle] = useState<boolean>(false)
    const [armorBypassToggle, setArmorBypassToggle] = useState<boolean>(false)

    /**
     * This side-effect is responsible for responsive UI elements
     * in the interactive chat card. It subs to the updateSetting
     * hook to check for changes that include additions/edits to 
     * our Attack Registry.
     */
    useEffect(() => {
        const hookId = Hooks.on("updateSetting", (settingDoc: any, changes: any) => {
            if (settingDoc.key !== `${sys_id}.attackRegistry`) return

            let updatedData: Record<string, any>
            try {
                updatedData = typeof changes.value === "string"
                    ? JSON.parse(changes.value)
                    : (changes.value || {})
            }
            catch {
                updatedData = getAttackRegistry()
            }

            if (actorId in updatedData) {
                setRevision(prev => prev + 1)
            }
        })

        return () => Hooks.off("updateSetting", hookId)
    }, [actorId])

    const actor = useMemo(() => {
        return getCanvasToken(actorId)?.actor ?? game.actors?.get(actorId)
    }, [actorId, revision])

    const snapshot = useMemo(() => {
        const attacks = getAttackRegistry()[actorId] ?? []
        const match = attacks.find(atk => atk.id === attackId)
        return match ? foundry.utils.deepClone(match) : null
    }, [actor, attackId, revision])

    const attack = useMemo(() => {
        return snapshot ? deserializeAttack(snapshot, (title, actor, targetIds) => new HeroAttack(title, actor, targetIds)) : null
    }, [snapshot])

    const source = useMemo<Item | undefined>(() => {
        if (attack instanceof HeroAttack && attack.itemId) {
            const items = actor?.items as Item[] | undefined
            const item =
                items?.find(it => it.id === attack.itemId) ??
                items?.find(it => it.id === attack.itemId.split(".").pop()) ??
                ItemsCache.allItems().find(it => it.uuid === attack.itemId)

            return item
        }
    }, [attack])

    return (
        <div className={`${attack?.isResolved ? 'opacity-90 grayscale-[85%]' : ''}`}>
            {actor && attack && <BaseChatCardHost
                banner={
                    <ChatCardBanner
                        tokenId={actor?.getActiveTokens()[0]?.id}
                        portrait={getTokenImg(actor)}
                        title={attack.title}
                    />}
                contents={
                    <div>
                        {/* ATTACK CONTENT BY CHARACTER TYPE */}
                        {attack instanceof HeroAttack &&
                            <HeroAttackComponent
                                actor={actor as Actor & { system: HeroDataModel }}
                                attack={attack}
                                source={source}
                                setRevision={setRevision}
                            />
                        }

                        {/* ADVERSARY ATTACK CHAT CARD */}
                        {attack instanceof AdversaryAttack &&
                            <AdversaryAttackComponent attack={attack} setRevision={setRevision} />
                        }

                        {/* ADVERSARY COMBO ATTACK CHAT CARD */}
                        {attack instanceof AdversaryComboAttack &&
                            <AdversaryComboAttackComponent attack={attack} setRevision={setRevision} />
                        }

                        {/* GM TOOLS */}
                        {(game.user?.isActiveGM && !attack.isResolved && !(attack as any).showCritChoices && !(attack as any).isDefenseCheck) &&
                            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                                <div className="mt-0.5 text-base font-normal">
                                    <Header title={"GM Tools"} />
                                    <div className="flex items-end justify-between px-1">
                                        <div>
                                            <Checkbox
                                                label={"Flanked"}
                                                checked={flanked}
                                                onCheckedChanged={(e) => { setFlanked(e) }}
                                            />
                                            <Checkbox
                                                label={"GM Target Override"}
                                                checked={targetsToggle}
                                                onCheckedChanged={(e) => { setTargetsToggle(e) }}
                                            />
                                            <Checkbox
                                                label={"Ignore Armor"}
                                                checked={armorBypassToggle}
                                                onCheckedChanged={(e) => { setArmorBypassToggle(e) }}
                                            />
                                        </div>

                                        {/* GM TOOL BUTTONS FOR MANAGING OUTCOMES */}
                                        <div className="flex flex-col gap-1 mt-1">
                                            {(attack.showDamage || attack.appliedEffects.length > 0) &&
                                                <InteractiveChatCardButton label="Apply" tooltip="Apply damage, effects, & lock attack from edits."
                                                    fn={async () => {
                                                        await attack.applyDamageAndResolve(
                                                            { flanked: flanked, bypassArmor: armorBypassToggle, gmTargetsOnly: targetsToggle },
                                                            serializeAttack
                                                        )
                                                        setRevision(prev => prev + 1)
                                                    }}
                                                />}

                                            {((attack instanceof AdversaryAttack && attack.statuses.length > 0) ||
                                                (attack instanceof AdversaryComboAttack && attack.subAttacks.some(sub => sub.statuses.length > 0))) &&
                                                <InteractiveChatCardButton label="Statuses" tooltip="Apply statuses only (no damage) & lock attack from edits."
                                                    fn={async () => {
                                                        await attack.applyStatusesAndResolve({ gmTargetsOnly: targetsToggle }, serializeAttack)
                                                        setRevision(prev => prev + 1)
                                                    }}
                                                />}

                                            <InteractiveChatCardButton
                                                label="Resolve" tooltip="Resolve with no updates"
                                                fn={async () => {
                                                    await attack.resolve(serializeAttack)
                                                    setRevision(prev => prev + 1)
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </EditModeContextProvider>
                        }
                    </div>
                }
            />}
        </div>
    )
}
