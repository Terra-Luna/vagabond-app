import { Check, Clover, Shield, Swords, X } from "lucide-react"

import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { appLang } from "../../../utils/lang"
import { DamageRollsComponent } from "../../../view/chat/component/DamageRollsComponent"
import { TargetsDisplay } from "../../../view/chat/component/TargetsDisplay"
import { TotalDmgFooter } from "../../../view/chat/TotalDamageFooter"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { UtilityButton } from "../../../view/component/Button"
import { DamageTypeIcon } from "../../../view/component/DamageTypeIcon"
import { ClearHeader, Divider, Header } from "../../../view/component/Header"
import { Tooltip } from "../../../view/component/Tooltip"
import { AdversaryAttack, SavingThrowType } from "../../engine/AdversaryAttack"
import { AdversaryComboAttack } from "../../engine/AdversaryComboAttack"
import { DamageRoll } from "../../engine/roll/DamageRoll"
import { SkillCheckResult } from "../../engine/roll/SkillCheck"
import { TargetDisplayItem } from "../../engine/usecase/LiveTargetSyncUseCase"
import { useAdversaryAttack, useAdversaryAttackSaveHandlers, useAdversaryAttackTargets } from "../hooks"

export const AdversaryAttackComponent = ({ attack, setRevision }: { attack: AdversaryAttack, setRevision: any }) => {
    const { targets, ownedTargets, handleSave, handleRerollSave } = useAdversaryAttack(attack, setRevision)
    const unownedTargets = targets.filter(target => !ownedTargets.some(ownedTarget => ownedTarget.id === target.id))

    return (
        <div className="flex flex-col gap-1">
            <AttackDamageAndSavesSection
                damageRoll={attack.damageRoll}
                saveTypes={attack.saveTypes}
                saveResults={attack.saveResults}
                defenseArmorBonuses={attack.defenseArmorBonuses}
                rerolledSaveTargetIds={attack.rerolledSaveTargetIds}
                isResolved={attack.isResolved}
                ownedTargets={ownedTargets}
                unownedTargets={unownedTargets}
                onRollSave={handleSave}
                onRerollSave={handleRerollSave}
            />
        </div>
    )
}

export const AdversaryComboAttackComponent = ({ attack, setRevision }: { attack: AdversaryComboAttack, setRevision: any }) => {
    const { targets, ownedTargets } = useAdversaryAttackTargets(attack)
    const unownedTargets = targets.filter(target => !ownedTargets.some(ownedTarget => ownedTarget.id === target.id))

    return (
        <div className={`flex flex-col gap-2`}>
            {/* TARGET TOKENS ARRAY (shared by every action in the combo) */}
            {attack.showTargets &&
                <div className="flex flex-col w-full">
                    <TargetsDisplay targets={targets} />
                </div>
            }

            {/* ONE DAMAGE + SAVES SECTION PER COMBO ACTION */}
            {attack.subAttacks.map((sub, index) => (
                <AdversaryComboAttackSection attack={attack} sub={sub} subIndex={index} ownedTargets={ownedTargets} unownedTargets={unownedTargets} setRevision={setRevision} key={index} />
            ))}
        </div>
    )
}

const AdversaryComboAttackSection = ({ attack, sub, subIndex, ownedTargets, unownedTargets, setRevision }: {
    attack: AdversaryComboAttack
    sub: AdversaryComboAttack["subAttacks"][number]
    subIndex: number
    ownedTargets: TargetDisplayItem[]
    unownedTargets: TargetDisplayItem[]
    setRevision: any
}) => {
    const { handleSave, handleRerollSave } = useAdversaryAttackSaveHandlers(attack, setRevision, subIndex)

    return (
        <div className={`${tableBorderRounded} bg-context-menu-fill/25`}>
            <AttackDamageAndSavesSection
                title={sub.name}
                damageRoll={sub.damageRoll}
                saveTypes={sub.saveTypes}
                saveResults={sub.saveResults}
                rerolledSaveTargetIds={sub.rerolledSaveTargetIds}
                isResolved={attack.isResolved}
                ownedTargets={ownedTargets}
                unownedTargets={unownedTargets}
                onRollSave={handleSave}
                onRerollSave={handleRerollSave}
            />
        </div>
    )
}

// Renders one action's damage roll and save/defend/reroll buttons.
const AttackDamageAndSavesSection = ({
    title, damageRoll, saveTypes, saveResults, defenseArmorBonuses, rerolledSaveTargetIds, isResolved, ownedTargets, unownedTargets, onRollSave, onRerollSave
}: {
    title?: string
    damageRoll: DamageRoll | undefined
    saveTypes: SavingThrowType[]
    saveResults: Record<string, SkillCheckResult>
        defenseArmorBonuses?: Record<string, number>
    rerolledSaveTargetIds: string[]
    isResolved: boolean
    ownedTargets: TargetDisplayItem[]
    unownedTargets: TargetDisplayItem[]
    onRollSave: (targetId: string, saveType: SavingThrowType, clickEvent?: React.MouseEvent) => void
    onRerollSave: (targetId: string) => void
}) => {
    const showDamage = (damageRoll?.result?.total ?? 0) > 0

    return (
        <div className="flex flex-col gap-1 pb-1">

            {/* SAVING THROW BUTTONS */}
            {saveTypes.length > 0 && (ownedTargets.length > 0 || unownedTargets.length > 0) &&
                <div className="px-1">
                    <ClearHeader title="TARGETS" />
                    <div className="flex flex-col gap-1 mt-1 px-1">
                        {/* OWNED TARGETS */}
                        {ownedTargets.map(target => {
                            const result = saveResults[target.id]
                            const canRollSave = !isResolved && !result && target.token?.actor?.system instanceof HeroDataModel && (game.user?.isActiveGM || target.token?.actor?.isOwner)
                            const luck = (target.token?.actor?.system as HeroDataModel | undefined)?.statuses?.counters?.luck ?? 0
                            const canReroll = !isResolved && result?.outcome === appLang.RollResult.failure &&
                                !rerolledSaveTargetIds.includes(target.id) && luck > 0 &&
                                (game.user?.isActiveGM || target.token?.actor?.isOwner)

                            const canDefend = canRollSave && (target.token?.actor?.system as HeroDataModel)?.defenseWeapons()?.length > 0 && saveTypes.includes('reflex')
                            const targetSaveTypes: SavingThrowType[] = canDefend && !saveTypes.includes('defend')
                                ? [...saveTypes, 'defend']
                                : saveTypes

                            const defenseBonus = defenseArmorBonuses?.[target.id]

                            return (
                                <div key={target.id} className="flex min-w-0 items-center gap-1 whitespace-nowrap font-normal">
                                    {result
                                        ? <div className="flex shrink-0 items-center gap-1">
                                            {/* SAVING THROW OUTCOME */}
                                            <SaveOutcomeIcon result={result} />
                                            <p>{defenseBonus !== undefined
                                                ? `(${defenseBonus})`
                                                : `(${result.total} vs. ${result.difficulty})`}</p>

                                            {/* REROLL BUTTON */}
                                            {canReroll &&
                                                <Tooltip title={"Fluke"} content={"Spend a Luck to reroll"}>
                                                    <UtilityButton onClick={(e) => {
                                                        e?.stopPropagation()
                                                        e?.preventDefault()
                                                        onRerollSave(target.id)
                                                    }}>
                                                        <Clover size={14} className="text-ic-luck" />
                                                    </UtilityButton>
                                                </Tooltip>
                                            }
                                        </div>
                                        : canRollSave && <div className="flex gap-1">
                                            {/* ROLL SAVE BUTTONS */}
                                            {targetSaveTypes.map(saveType => (
                                                <Tooltip key={saveType} title={`${appLang.Saves[saveType]?.name} Save`} content={`${appLang.HeroSheet[`${saveType}_tooltip`]}<br>${appLang.HeroSheet.skills_tooltip}`}>
                                                    <UtilityButton onClick={(e) => {
                                                        e?.stopPropagation()
                                                        e?.preventDefault()
                                                        onRollSave(target.id, saveType, e)
                                                    }}>
                                                        {`${appLang.Saves[saveType]?.name ?? saveType}`}
                                                    </UtilityButton>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    }
                                    <div className="flex min-w-0 items-center gap-2">
                                        <TargetPortrait target={target} />
                                        <p className="min-w-0 truncate">{target.token?.name}</p>
                                    </div>
                                </div>
                            )
                        })}

                        {/* UNOWNED TARGETS */}
                        {ownedTargets.length > 0 && unownedTargets.length > 0 && <Divider />}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            {unownedTargets.map(target => {
                                const result = saveResults[target.id]

                                return (
                                    <div key={target.id} className="flex min-w-0 items-center gap-2 font-normal">
                                        <TargetPortrait target={target} result={result} />
                                        <p className="min-w-0 truncate" title={target.token?.name}>{target.token?.name}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            }

            {/* DAMAGE DISPLAY */}
            {showDamage &&
                <div>
                    {title
                        ? <Header title={title} textLeft={true} />
                        : <ClearHeader title="DAMAGE" />
                    }
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
        </div>
    )
}

const TargetPortrait = ({ target, result }: { target: TargetDisplayItem, result?: SkillCheckResult }) => {
    return (
        <div className="relative h-[28px] w-[28px] shrink-0">
            <img src={target.src} alt={target.token?.name} className="object-contain h-[28px] w-[28px]" />
            <SaveOutcomeIcon result={result} overlay />
        </div>
    )
}

const SaveOutcomeIcon = ({ result, overlay = false }: { result?: SkillCheckResult, overlay?: boolean }) => {
    if (!result) return null

    const isFailure = result.outcome === appLang.RollResult.failure
    const isSuccess = result.outcome === appLang.RollResult.success || result.outcome === appLang.RollResult.crit
    const isSuccessfulDefense = isSuccess && result.skill !== 'reflex' && result.skill !== 'will' && result.skill !== 'endure'
    if (!isFailure && !isSuccess) return null

    return (
        <span className={`${overlay ? "absolute -right-1 top-2 rounded-full bg-context-menu-fill" : "relative"} flex h-4 w-4 shrink-0 items-center justify-center`}>
            {isFailure
                ? <Tooltip content={"Failure"}>
                    <X size={14} strokeWidth={3} className="text-destructive-action" />
                </Tooltip>
                : isSuccessfulDefense
                    ? <Tooltip content={"Successful Defense"}>
                        <Shield size={14} strokeWidth={2} className="text-ic-luck" />
                    </Tooltip>
                    : result.outcome === appLang.RollResult.crit
                        ? <Tooltip title={"Critical Success"} content={appLang.Combat.critSaveTooltip}>
                            <Swords size={14} strokeWidth={2} className="text-ic-luck" />
                        </Tooltip>
                        : <Tooltip content={"Success"}>
                            <Check size={14} strokeWidth={3} className="text-ic-luck" />
                        </Tooltip>
            }
        </span>
    )
}
