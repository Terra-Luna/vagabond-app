import { BookMarked, Clover } from "lucide-react"
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"

import { getAllowLateLuckStudy, getAttackRegistry } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { isEquippedWeapon, WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import { BaseChatCardHost } from "../../view/chat/component/BaseChatCardHost"
import { ChatCardBanner } from "../../view/chat/component/ChatCardBanner"
import { DamageRollsComponent } from "../../view/chat/component/DamageRollsComponent"
import { TargetsDisplay } from "../../view/chat/component/TargetsDisplay"
import { TotalDmgFooter } from "../../view/chat/DamageRollChatCard"
import { SkillCheckDiceComponent } from "../../view/chat/SkillCheckChatCard"
import { tableBorder, tableBorderRounded } from "../../view/common/border-styles"
import { UtilityButton } from "../../view/component/Button"
import { Checkbox } from "../../view/component/Checkbox"
import { DamageTypeIcon } from "../../view/component/DamageTypeIcon"
import { Divider, Header } from "../../view/component/Header"
import { CardSubHeader } from "../../view/component/SkillCard"
import { EditModeContextProvider } from "../../view/context/EditModeContext/EditModeContext"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { ItemPortraitComponent } from "../../view/sheets/item/shared/ItemPortraitComponent"
import { AdversaryAttack, SavingThrowType } from "../engine/AdversaryAttack"
import { AdversaryComboAttack } from "../engine/AdversaryComboAttack"
import { HeroAttack } from "../engine/HeroAttack"
import { DamageRoll } from "../engine/roll/DamageRoll"
import { SkillCheckResult } from "../engine/roll/SkillCheck"
import { TargetDisplayItem, useLiveTargetSync } from "../engine/usecase/LiveTargetSyncUseCase"
import { deserializeAttack } from "../engine/util/attack-deserializer"
import { serializeAttack } from "../engine/util/attack-serializer"
import { SpellAttackInfoComponent } from "./SpellAttackInfoComponent"

export const InteractiveAttackChatCard = ({ actorId, attackId }: { actorId: string, attackId: string }) => {
    const [revision, setRevision] = useState(0)
    const [armorBypassToggle, setArmorBypassToggle] = useState<boolean>(false)
    const [targetsToggle, setTargetsToggle] = useState<boolean>(false)
    const [halfDamageToggle, setHalfDamageToggle] = useState<boolean>(false)

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
        return snapshot ? deserializeAttack(snapshot, (title, actor, targetIds) => new HeroAttack(title, actor, targetIds)) : null
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
                        {(game.user?.isGM && !attack.isResolved) &&
                            <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
                                <div className="mt-0.5 text-base font-normal">
                                    <Header title={"GM Tools"} textLeft={true} />
                                    <div className="flex items-end justify-between px-1">
                                        <div>
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
                                            <Checkbox
                                                label={"Halve Damage"}
                                                checked={halfDamageToggle}
                                                onCheckedChanged={(e) => { setHalfDamageToggle(e) }}
                                            />
                                        </div>

                                        {/* GM TOOL BUTTONS FOR MANAGING OUTCOMES */}
                                        <div className="flex flex-col gap-1 mt-1">
                                            {attack.showDamage &&
                                                <InteractiveChatCardButton label="Apply" tooltip="Apply damage, effects, & lock attack from edits"
                                                    fn={async () => {
                                                        await attack.applyDamageAndResolve(
                                                            { bypassArmor: armorBypassToggle, gmTargetsOnly: targetsToggle, halveDamage: halfDamageToggle },
                                                            serializeAttack
                                                        )
                                                        setRevision(prev => prev + 1)
                                                    }}
                                                />}
                                            {((attack instanceof AdversaryAttack && attack.statuses.length > 0) ||
                                                (attack instanceof AdversaryComboAttack && attack.subAttacks.some(sub => sub.statuses.length > 0))) &&
                                                <InteractiveChatCardButton label="Status only" tooltip="Apply statuses only (no damage) & lock attack from edits"
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

const HeroAttackComponent = ({ actor, attack, source, setRevision }: {
    actor: Actor & { system: HeroDataModel }, attack: HeroAttack, source: Item | undefined, setRevision: any
}) => {
    const hasPermission = game.user?.isGM || game.user?.id === attack.userId
    const isFailure = attack.skillCheck?.result?.outcome === appLang.RollResult.failure
    const needsResourceUpdates = hasPermission && !attack.isResolved && (
        isFailure || attack.showCritChoices
    )

    useEffect(() => {
        if (!needsResourceUpdates) return

        const handleUpdate = () => setRevision(prev => prev + 1)

        const hookActorId = Hooks.on("updateActor", (updatedActor: any, changes: any) => {
            if (updatedActor.id !== actor.id) return

            if (foundry.utils.hasProperty(changes, "system.statuses.counters.luck") ||
                foundry.utils.hasProperty(changes, "system.statuses.counters.studied")) {
                handleUpdate()
            }
        })

        return () => {
            Hooks.off("updateActor", hookActorId)
        }
    }, [actor.id, needsResourceUpdates, setRevision])

    const luck = useMemo<number>(() => actor.system.statuses.counters.luck, [actor.system.statuses.counters.luck, setRevision])
    const isMaxLuck = useMemo<boolean>(() => luck === actor.system.stats.luck, [luck, setRevision])
    const studied = useMemo<number>(() => actor.system.statuses.counters.studied, [actor.system.statuses.counters.studied, setRevision])

    const isFriendlySpell = useMemo<boolean>(() => {
        return attack.spellDelivery != null && !attack.hasHostileTargets
    }, [attack, setRevision])

    const canUpdateSkillCheck = useMemo<boolean>(() => {
        const hasResources = luck > 0 || studied > 0
        return hasPermission && !attack.isResolved && !attack.isRerolled && isFailure && hasResources
    }, [luck, studied, attack, setRevision])

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
    }, [liveTargetIds, setRevision])

    const handleLuckReroll = useCallback(async () => {
        await attack.rollSkillCheck(true)
        setRevision(prev => prev + 1)
    }, [attack])

    const handleLateD6 = useCallback(async (resource: 'luck' | 'studied', currentValue: number) => {
        await attack.addLateFavor(resource, currentValue);
        setRevision(prev => prev + 1)
    }, [attack])

    const addCritLuck = useCallback(async () => {
        await attack.addCritLuck()
        setRevision(prev => prev + 1)
    }, [attack])

    const addCritDamage = useCallback(async () => {
        await attack.addCritDamage()
        setRevision(prev => prev + 1)
    }, [attack])

    const addSpellFx = useCallback(async () => {
        await attack.addCritSpellFx()
        setRevision(prev => prev + 1)
    }, [attack])

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
                            d20s={attack.skillCheck?.result?.d20s}
                            d6={attack.skillCheck?.result?.d6}
                            modifier={attack.skillCheck?.modifier}
                            favHinder={attack.skillCheck?.favorHinder}
                            bonusDice={[]}
                        />

                        {/* CRIT CHOICE BUTTONS */}
                        {attack.showCritChoices &&
                            <div className="flex wrap gap-1 mb-1 justify-center text-center text-base font-normal content-center">
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
                                <div className="flex gap-x-1 items-center justify-center text-base font-normal px-4 mb-2">
                                    {luck > 0 && <>
                                        <InteractiveChatCardButton
                                            icon={<Clover size={18} className="text-ic-luck h-full" />}
                                            label={"Reroll"} tooltip="Spend a Luck to reroll"
                                            fn={() => handleLuckReroll()}
                                        />
                                        {getAllowLateLuckStudy() &&
                                            <InteractiveChatCardButton
                                                icon={<Clover size={18} className="text-ic-luck h-full" />}
                                                label={"+Favor"} tooltip="Spend a Luck to add Favor or remove Hinder"
                                                fn={() => handleLateD6('luck', luck)}
                                            />}
                                    </>}
                                    {studied > 0 && getAllowLateLuckStudy() &&
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
                        <Header title={`Targets (x ${targets.length})`} textLeft={true} />
                        <TargetsDisplay targets={targets} />
                    </div>
                </div>
            }

            {/* DAMAGE DISPLAY */}
            {attack.showDamage &&
                <div>
                    {/* HIDE THE DAMAGE HEADER IF IT WAS HEALING OR FRIENDLY FX ONLY */}
                    {!isFriendlySpell && <Header title={'Damage'} textLeft={true} />}

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

const getDefenseWeapon = (actor: Actor | null | undefined): WeaponDataModel | undefined => {
    const hero = actor?.system as HeroDataModel | undefined
    return hero?.inventory?.items?.find(it =>
        isEquippedWeapon(it) && (it as WeaponDataModel).properties?.includes('defense')
    ) as WeaponDataModel | undefined
}

const AdversaryAttackComponent = ({ attack, setRevision }: { attack: AdversaryAttack, setRevision: any }) => {
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
    }, [liveTargetIds])

    const handleSave = useCallback(async (targetId: string, saveType: SavingThrowType, blockDie?: number, clickEvent?: React.MouseEvent) => {
        await attack.rollSave(targetId, saveType, blockDie, clickEvent)
        setRevision((prev: number) => prev + 1)
    }, [attack])

    const handleRerollSave = useCallback(async (targetId: string) => {
        await attack.rerollSave(targetId)
        setRevision((prev: number) => prev + 1)
    }, [attack])

    // Players should only see their own saves.
    const ownedTargets = useMemo(() => {
        return targets.filter(target => game.user?.isGM || target.token?.actor?.isOwner)
    }, [targets])

    return (
        <div className="flex flex-col gap-1">
            {/* TARGET TOKENS ARRAY */}
            {attack.showTargets &&
                <div className="flex flex-col w-full">
                    <Header title={`Targets [ ${targets.length} ]`} textLeft={true} />
                    <TargetsDisplay targets={targets} />
                </div>
            }

            <AttackDamageAndSavesSection
                damageRoll={attack.damageRoll}
                saveTypes={attack.saveTypes}
                saveResults={attack.saveResults}
                rerolledSaveTargetIds={attack.rerolledSaveTargetIds}
                isResolved={attack.isResolved}
                ownedTargets={ownedTargets}
                onRollSave={handleSave}
                onRerollSave={handleRerollSave}
            />
        </div>
    )
}

const AdversaryComboAttackComponent = ({ attack, setRevision }: { attack: AdversaryComboAttack, setRevision: any }) => {
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
    }, [liveTargetIds])

    // Players should only see their own saves.
    const ownedTargets = useMemo(() => {
        return targets.filter(target => game.user?.isGM || target.token?.actor?.isOwner)
    }, [targets])

    const handleSave = useCallback(async (subIndex: number, targetId: string, saveType: SavingThrowType, blockDie?: number, clickEvent?: React.MouseEvent) => {
        await attack.rollSave(subIndex, targetId, saveType, blockDie, clickEvent)
        setRevision((prev: number) => prev + 1)
    }, [attack])

    const handleRerollSave = useCallback(async (subIndex: number, targetId: string) => {
        await attack.rerollSave(subIndex, targetId)
        setRevision((prev: number) => prev + 1)
    }, [attack])

    return (
        <div className={`flex flex-col gap-2`}>
            {/* TARGET TOKENS ARRAY (shared by every action in the combo) */}
            {attack.showTargets &&
                <div className="flex flex-col w-full">
                    <Header title={`Targets (x ${targets.length})`} textLeft={true} />
                    <TargetsDisplay targets={targets} />
                </div>
            }

            {/* ONE DAMAGE + SAVES SECTION PER COMBO ACTION */}
            {attack.subAttacks.map((sub, index) => (
                <div className={`${tableBorderRounded} p-1`} key={index}>
                    <AttackDamageAndSavesSection
                        title={sub.name}
                        damageRoll={sub.damageRoll}
                        saveTypes={sub.saveTypes}
                        saveResults={sub.saveResults}
                        rerolledSaveTargetIds={sub.rerolledSaveTargetIds}
                        isResolved={attack.isResolved}
                        ownedTargets={ownedTargets}
                        onRollSave={(targetId, saveType, blockDie, clickEvent) => handleSave(index, targetId, saveType, blockDie, clickEvent)}
                        onRerollSave={(targetId) => handleRerollSave(index, targetId)}
                    />
                </div>
            ))}
        </div>
    )
}

// Renders one action's damage roll and save/reroll/Block buttons.
const AttackDamageAndSavesSection = ({
    title, damageRoll, saveTypes, saveResults, rerolledSaveTargetIds, isResolved, ownedTargets, onRollSave, onRerollSave
}: {
    title?: string
    damageRoll: DamageRoll | undefined
    saveTypes: SavingThrowType[]
    saveResults: Record<string, SkillCheckResult>
    rerolledSaveTargetIds: string[]
    isResolved: boolean
    ownedTargets: TargetDisplayItem[]
    onRollSave: (targetId: string, saveType: SavingThrowType, blockDie?: number, clickEvent?: React.MouseEvent) => void
    onRerollSave: (targetId: string) => void
}) => {
    const showDamage = (damageRoll?.result?.total ?? 0) > 0

    return (
        <div className="flex flex-col gap-1">
            {/* DAMAGE DISPLAY */}
            {showDamage &&
                <div>
                    <Header title={title ? `${title}` : 'DAMAGE'} textLeft={true} />
                    <DamageRollsComponent result={damageRoll!.result!} />
                    <div className="flex items-center justify-center">
                        <TotalDmgFooter total={
                            <div className="flex gap-x-1 items-center">
                                <p>{damageRoll?.result?.total}</p>
                                <DamageTypeIcon dmgType={damageRoll?.result?.dmgType ?? ''} />
                            </div>
                        } />
                    </div>
                </div>
            }

            {/* SAVING THROW BUTTONS */}
            {saveTypes.length > 0 && ownedTargets.length > 0 &&
                <div>
                    <Header title={"SAVES"} textLeft={true} />
                    <div className="flex flex-col gap-1 mt-1 px-2">
                        {ownedTargets.map(target => {
                            const result = saveResults[target.id]
                            const canRollSave = !isResolved && !result && (game.user?.isGM || target.token?.actor?.isOwner)
                            const luck = (target.token?.actor?.system as HeroDataModel | undefined)?.statuses?.counters?.luck ?? 0
                            const canReroll = !isResolved && result?.outcome === appLang.RollResult.failure &&
                                !result?.blockDie && !rerolledSaveTargetIds.includes(target.id) && luck > 0 &&
                                (game.user?.isGM || target.token?.actor?.isOwner)

                            return (
                                <div key={target.id} className="flex items-center gap-1 font-normal">
                                    {result
                                        ? <div className="flex items-center gap-1">
                                            <p>{`${result.outcome} (${result.total} vs ${result.difficulty})`}</p>
                                            {canReroll &&
                                                <UtilityButton title="Spend a Luck to reroll" onClick={(e) => {
                                                    e?.stopPropagation()
                                                    e?.preventDefault()
                                                    onRerollSave(target.id)
                                                }}>
                                                    <Clover size={14} className="text-ic-luck" />
                                                </UtilityButton>
                                            }
                                        </div> : canRollSave &&
                                        <div className="flex gap-1">
                                            {saveTypes.map(saveType => (
                                                <UtilityButton key={saveType} title="Roll save ([Shift] Favor, [Ctrl] Hinder)" onClick={(e) => {
                                                    e?.stopPropagation()
                                                    e?.preventDefault()
                                                    onRollSave(target.id, saveType, undefined, e)
                                                }}>
                                                    {`${appLang.Saves[saveType]?.name ?? saveType}`}
                                                </UtilityButton>
                                            ))}
                                            {/* BLOCK: a Reflex save using an equipped 'defense' weapon's damage die */}
                                            {saveTypes.includes('reflex') && getDefenseWeapon(target.token?.actor) &&
                                                    <UtilityButton title="Roll defense check (Shift = Favor, Ctrl = Hinder)" onClick={(e) => {
                                                        e?.stopPropagation()
                                                        e?.preventDefault()
                                                        onRollSave(target.id, 'reflex', getDefenseWeapon(target.token?.actor)!.damage.dice.faces, e)
                                                    }}>
                                                    Block
                                                </UtilityButton>
                                            }
                                        </div>
                                    }
                                    <div className="flex items-center gap-2">
                                        <img src={target.src} alt={target.token?.name} className="object-contain h-[28px] w-[28px]" />
                                        <p>{target.token?.name}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            }
        </div>
    )
}

const InteractiveChatCardButton = ({ icon, label, tooltip, fn }: { icon?: ReactNode, label: string, tooltip: string, fn: () => void }) => {
    return (
        <button title={tooltip}
            className={`flex items-center justify-center px-2 hover-glow pointer-events-auto transition-transform active:scale-95 cursor-pointer ${tableBorder}`}
            onClick={fn}
        >
            {icon}
            {label}
        </button>
    )
}