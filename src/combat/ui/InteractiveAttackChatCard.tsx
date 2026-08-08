import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import { deserializeAttack, serializeAttack } from "../engine/util/attack-serializer"
import { BaseChatCardHost } from "../../view/chat/component/BaseChatCardHost"
import { ChatCardBanner } from "../../view/chat/component/ChatCardBanner"
import { HeroAttack } from "../engine/HeroAttack"
import { AdversaryAttack } from "../engine/AdversaryAttack"
import { Divider, Header } from "../../view/component/Header"
import { SkillCheckDiceComponent } from "../../view/chat/SkillCheckChatCard"
import { TargetsDisplay } from "../../view/chat/component/TargetsDisplay"
import { useLiveTargetSync, TargetDisplayItem } from "../engine/util/target-sync"
import { CardSubHeader } from "../../view/component/SkillCard"
import { vgLiteLang } from "../../utils/lang"
import { BookMarked, Clover } from "lucide-react"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { TotalDmgFooter } from "../../view/chat/DamageRollChatCard"
import { DamageRollsComponent } from "../../view/chat/component/DamageRollsComponent"
import { DamageTypeIcon } from "../../view/component/DamageTypeIcon"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { SpellAttackInfoComponent } from "./SpellAttackInfoComponent"
import { ItemPortraitComponent } from "../../view/sheets/item/shared/ItemPortraitComponent"
import { Checkbox } from "../../view/component/Checkbox"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { getAttackRegistry } from "../../apps/vagabond-tools/VagabondSettingsRegistry"

export const InteractiveAttackChatCard = ({ actorId, attackId }: { actorId: string, attackId: string }) => {
    const [revision, setRevision] = useState(0)
    const [armorBypassToggle, setArmorBypassToggle] = useState<boolean>(false)
    const [targetsToggle, setTargetsToggle] = useState<boolean>(false)

    /**
     * This side-effect is responsible for responsive UI elements
     * in the interactive chat card. It subs to the updateSetting
     * hook to check for changes that include additions/edits to 
     * our Attack Registry.
     */
    useEffect(() => {
        const hookId = Hooks.on("updateSetting", (settingDoc: any, changes: any) => {
            if (settingDoc.key !== "vagabond-lite.attackRegistry") return

            let updatedData: Record<string, any>
            try {
                updatedData = typeof changes.value === "string"
                    ? JSON.parse(changes.value)
                    : (changes.value || {})
            }
            catch (err) {
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
        return snapshot ? deserializeAttack(snapshot) : null
    }, [snapshot])

    const source = useMemo<Item | undefined>(() => {
        if (attack instanceof HeroAttack && attack.itemId) {
            const item =
                actor?.items?.contents?.find(it => it.id === attack.itemId) ??
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
                        {attack instanceof HeroAttack && <HeroAttackComponent actor={actor as Actor & { system: HeroDataModel }} attack={attack} source={source} />}
                        {attack instanceof AdversaryAttack && <AdversaryAttackComponent actor={actor} attack={attack} />}

                        {/* GM TOOLS */}
                        {(game.user?.isGM && !attack.isResolved) &&
                            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                                <div className="mt-0.5">
                                    <Header title={"GM Tools"} />
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <Checkbox
                                                label={"GM Target Override"}
                                                checked={targetsToggle}
                                                onCheckedChanged={(e) => {
                                                    setTargetsToggle(e)
                                                }}
                                            />
                                            <Checkbox
                                                label={"Ignore Armor"}
                                                checked={armorBypassToggle}
                                                onCheckedChanged={(e) => {
                                                    setArmorBypassToggle(e)
                                                }}
                                            />
                                        </div>
                                        <InteractiveChatCardButton
                                            label="Apply" tooltip="Apply damage & lock attack from edits"
                                            fn={async () => await attack.applyDamageAndResolve(
                                                { bypassArmor: armorBypassToggle, gmTargetsOnly: targetsToggle },
                                                serializeAttack
                                            )}
                                        />
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

const HeroAttackComponent = ({ actor, attack, source }: { actor: Actor & { system: HeroDataModel }, attack: HeroAttack, source: Item | undefined }) => {

    const [subRevision, setSubRevision] = useState(0)

    useEffect(() => {
        const handleUpdate = () => setSubRevision(prev => prev + 1)

        const hookActorId = Hooks.on("updateActor", (updatedActor: any) => {
            if (updatedActor.id === actor.id) handleUpdate()
        })

        const hookChatId = Hooks.on("updateChatMessage", (message: any) => {
            handleUpdate()
        })

        return () => {
            Hooks.off("updateActor", hookActorId)
            Hooks.off("updateChatMessage", hookChatId)
        }
    }, [actor.id, attack])

    const luck = useMemo<number>(() => actor.system.statuses.counters.luck, [actor.system.statuses.counters.luck, subRevision])
    const isMaxLuck = useMemo<boolean>(() => luck === actor.system.stats.luck, [luck, subRevision])
    const studied = useMemo<number>(() => actor.system.statuses.counters.studied, [actor.system.statuses.counters.studied, subRevision])

    const isFriendlySpell = useMemo<boolean>(() => {
        return attack.spellDelivery != null && !attack.hasHostileTargets
    }, [attack, subRevision])

    const canUpdateSkillCheck = useMemo<boolean>(() => {
        const hasPermission = game.user?.isGM || game.user?.id === attack.userId
        const isFailure = attack.skillCheck?.result?.outcome === vgLiteLang.RollResult.failure
        const hasResources = luck > 0 || studied > 0
        return hasPermission && !attack.isResolved && !attack.isRerolled && isFailure && hasResources
    }, [luck, studied, attack, subRevision])

    const liveTargetIds = useLiveTargetSync(attack)

    const targets = useMemo<TargetDisplayItem[]>(() => {
        return liveTargetIds
            .map(id => {
                const canvasToken = getCanvasToken(id)
                return {
                    id: id,
                    src: getTokenImg(canvasToken),
                    token: canvasToken
                }
            })
            .filter(it => it.src != null && it.src.length > 0)
    }, [liveTargetIds, subRevision])

    const handleLuckReroll = useCallback(async () => {
        await attack.rollSkillCheck(true)
    }, [luck, attack, subRevision])

    const handleLateD6 = useCallback(async (resource: 'luck' | 'studied', currentValue: number) => {
        await attack.addLateFavor(resource, currentValue)
    }, [luck, studied, subRevision])

    const addCritLuck = useCallback(async () => {
        await attack.addCritLuck()
    }, [attack, subRevision])

    const addCritDamage = useCallback(async () => {
        await attack.addCritDamage()
    }, [attack, subRevision])

    const addSpellFx = useCallback(async () => {
        await attack.addCritSpellFx()
    }, [attack, subRevision])

    return (
        <div>
            {/* SKILL CHECK */}
            {attack.showSkillCheck &&
                <div>
                    <Header title={`${attack.skillCheck!.result!.skillName} Check`} textLeft={true} />
                    <CardSubHeader showRightBorder={false} values={[
                        { label: "Difficulty", value: attack.skillCheck?.difficulty?.toString() },
                        { label: "Result", value: attack.skillCheck?.result?.outcome }
                    ]} />
                    <div className="flex flex-col justify-center items-center">
                        <SkillCheckDiceComponent
                            d20={attack.skillCheck?.result?.d20}
                            d6={attack.skillCheck?.result?.d6}
                            modifier={attack.skillCheck?.modifier}
                            favHinder={attack.skillCheck?.favorHinder}
                        />

                        {/* CRIT CHOICE BUTTONS */}
                        {attack.showCritChoices &&
                            <div className="flex wrap gap-1 mb-1 justify-center text-center content-center">
                                {/* GAIN A LUCK */}
                                {!isMaxLuck && <InteractiveChatCardButton label="+1 Luck" tooltip="Gain a Luck" fn={addCritLuck} />}
                                {/* ADD DAMAGE EQUAL TO SKILL'S STAT */}
                                <InteractiveChatCardButton label="+Damage" tooltip="Add damage equal to stat used" fn={addCritDamage} />
                                {/* ADD SPELL'S CRIT FX */}
                                {source?.system instanceof SpellDataModel &&
                                    <InteractiveChatCardButton label="Spell Effect" tooltip="Apply Spell on-crit effect" fn={addSpellFx} />
                                }
                            </div>
                        }

                        {/* SKILL CHECK AUGMENTATION BUTTONS */}
                        {canUpdateSkillCheck &&
                            <div className="flex flex-col w-full gap-2">
                                <Divider />
                                <div className="flex gap-x-1 items-center justify-between px-4 mb-2">
                                    {luck > 0 && <>
                                        <InteractiveChatCardButton
                                            icon={<Clover size={18} className="text-ic-luck h-full" />}
                                            label={"Reroll"} tooltip="Spend a Luck to reroll"
                                            fn={() => handleLuckReroll()}
                                        />
                                        <InteractiveChatCardButton
                                            icon={<Clover size={18} className="text-ic-luck h-full" />}
                                            label={"+Favor"} tooltip="Spend a Luck to add Favor or remove Hinder"
                                            fn={() => handleLateD6('luck', luck)}
                                        />
                                    </>}
                                    {studied > 0 &&
                                        <InteractiveChatCardButton
                                            icon={<BookMarked size={18} className="text-ic-studied h-full" />}
                                            label={"+Favor"} tooltip="Spend a Studied die to add Favor or remove Hinder"
                                            fn={() => handleLateD6('studied', studied)}
                                        />
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }

            {/* TARGET TOKENS ARRAY */}
            {attack.showTargets &&
                <div className="flex">
                    {source && <ItemPortraitComponent item={source} size={54} className={'m-0 -mt-0.25'} />}
                    <div className="flex flex-col w-full">
                        <Header title={`Targets (x ${targets.length})`} />
                        <TargetsDisplay targets={targets} />
                    </div>
                </div>
            }

            {/* DAMAGE DISPLAY */}
            {attack.showDamage &&
                <div>
                    {/* HIDE THE DAMAGE HEADER IF IT WAS HEALING OR FRIENDLY FX ONLY */}
                    {!isFriendlySpell && <Header title={'Damage'} />}

                    {/* SPELL ATTACK INFO */}
                        {attack.isSpellAttack
                            ? <SpellAttackInfoComponent
                                spell={source as Item & { system: SpellDataModel }}
                                delivery={attack.spellDelivery}
                                dmgRoll={attack.damageRoll?.result}
                            />
                            : <div className="w-full">
                                {/* WEAPON ATTACK DAMAGE */}
                                <DamageRollsComponent result={attack.damageRoll!.result!} />
                                <div className="flex items-center justify-center">
                                    <TotalDmgFooter total={
                                        <div className="flex gap-x-1 items-center">
                                            <p>{attack.damageRoll?.result?.total}</p>
                                            <DamageTypeIcon dmgType={attack.damageRoll?.result?.dmgType ?? ''} />
                                        </div>
                                    } />
                                </div>
                            </div>
                        }
                </div>
            }
        </div>
    )
}

const AdversaryAttackComponent = ({ actor, attack }: { actor: Actor, attack: AdversaryAttack }) => {
    return (
        <div>
            Under construction...
        </div>
    )
}

const InteractiveChatCardButton = ({ icon, label, tooltip, fn }: { icon?: ReactNode, label: string, tooltip: string, fn: () => void }) => {
    return (
        <button title={tooltip}
            className="flex text-base items-center border border-solid border-table-border px-1 hover-glow cursor-pointer"
            onClick={fn}
        >
            {icon}
            {label}
        </button>
    )
}