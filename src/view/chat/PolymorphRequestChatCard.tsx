import { ArrowBigRightDash, Check } from "lucide-react"
import { useEffect, useState } from "react"

import { getPolymorphRequestRegistry, PolymorphRequestStatus, PolymorphRequestTargetRecord, setPolymorphRequestStatuses } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../model/actor/NpcDataModel"
import { PolymorphUtil } from "../../model/actor/util/PolymorphUtil"
import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import { DestructiveButton, PrimaryButton } from "../component/Button"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"

type RequestTarget = { actorId: string, tokenId?: string }
type TargetStatuses = Record<string, PolymorphRequestTargetRecord>

const targetKey = (t: RequestTarget) => t.tokenId ?? t.actorId

export const PolymorphRequestChatCard = ({ casterId, targets, duration, formUuid, messageId }: {
    casterId: string,
    targets: RequestTarget[],
    duration: 'focus' | 'continual' | 'turn',
    formUuid: string,
    messageId: string
}) => {
    const caster = game.actors?.get(casterId)
    const [form, setForm] = useState<(Actor & { system: NpcDataModel | AdversaryDataModel }) | undefined>()
    const [formLoadError, setFormLoadError] = useState(false)
    const [statuses, setStatuses] = useState<TargetStatuses>(() =>
        (messageId && getPolymorphRequestRegistry()[messageId]?.targets) || {}
    )

    const [isApplying, setIsApplying] = useState(false)

    useEffect(() => {
        if (!messageId) return
        const hookId = Hooks.on("updateSetting", (settingDoc: any) => {
            if (settingDoc.key !== `${sys_id}.polymorphRequestRegistry`) return
            setStatuses(getPolymorphRequestRegistry()[messageId]?.targets ?? {})
        })
        return () => Hooks.off("updateSetting", hookId)
    }, [messageId])

    useEffect(() => {
        let isCurrent = true

        async function loadForm() {
            try {
                const result = await fromUuid(formUuid)
                if (!isCurrent) return

                if (result?.documentName === "Actor" && (result.system instanceof AdversaryDataModel || result.system instanceof NpcDataModel)) {
                    setForm(result as Actor & { system: NpcDataModel | AdversaryDataModel })
                    return
                }

                setFormLoadError(true)
                ui.notifications?.error(`${appLang.Polymorph.error}: ${appLang.Polymorph.statBlockNotFound}`)
            }
            catch (error: any) {
                if (!isCurrent) return

                setFormLoadError(true)
                ui.notifications?.error(`${error?.name ?? appLang.Polymorph.error}: ${error?.message ?? error}`)
            }
        }

        loadForm()

        return () => {
            isCurrent = false
        }
    }, [formUuid])

    const entries = (targets ?? []).map(t => {
        const token = getCanvasToken(t.tokenId)
        const actor = token?.actor ?? game.actors?.get(t.actorId)
        return { key: targetKey(t), token, actor }
    }).filter(it => !!it.actor)

    const [excluded, setExcluded] = useState<Set<string>>(() => {
        if (!caster || (caster.type as string) !== "hero") return new Set()

        const casterSystem = caster.system as any
        const maxHd = (casterSystem.level?.current ?? 0) + (casterSystem.modifiers?.polymorph?.castingLevelBonus ?? 0)
        return new Set(entries
            .filter(it => (it.actor!.type as string) !== "hero" && !((it.actor!.system as any).hitDice <= maxHd))
            .map(it => it.key))
    })

    if (!caster || entries.length === 0) return null

    const canAct = (entry: (typeof entries)[number]) => !!(game.user?.isActiveGM || entry.actor?.isOwner)
    const pendingEntries = entries.filter(it => !statuses[it.key] && canAct(it))
    const selectedEntries = pendingEntries.filter(it => !excluded.has(it.key))

    const saveStatuses = async (updates: TargetStatuses) => {
        await setPolymorphRequestStatuses(messageId, updates)
        setStatuses(prev => ({ ...prev, ...updates }))
    }

    const record = (status: PolymorphRequestStatus, list: typeof entries): TargetStatuses =>
        Object.fromEntries(list.map(it => [it.key, { status, targetImg: getTokenImg(it.token ?? it.actor) }]))

    const applyRequest = async () => {
        if (!form || isApplying || selectedEntries.length === 0) return
        setIsApplying(true)

        const declined = pendingEntries.filter(it => excluded.has(it.key))

        try {
            await PolymorphUtil.polymorph({
                caster: caster as Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel },
                targets: selectedEntries.map(it => it.actor) as any,
                form,
                duration
            })
            await saveStatuses({ ...record("declined", declined), ...record("applied", selectedEntries) })
        }
        catch (error: any) {
            ui.notifications?.error(`${error?.name ?? appLang.Polymorph.error}: ${error?.message ?? error}`)
        }
        finally {
            setIsApplying(false)
        }
    }

    const cancelRequest = async () => {
        setExcluded(new Set(entries.map(it => it.key)))
        try {
            await saveStatuses(record("declined", pendingEntries))
        }
        catch (error: any) {
            ui.notifications?.error(`${error?.name ?? appLang.Polymorph.error}: ${error?.message ?? error}`)
        }
    }

    const toggleExcluded = (key: string) => {
        setExcluded(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const isCasterHero = (caster?.type as string) === "hero"
    const isResolved = entries.every(it => !!statuses[it.key])

    const subtitles = [
        {
            label: isCasterHero ? appLang.Polymorph.casterLvl : appLang.Polymorph.casterHD,
            value: isCasterHero
                ? ((caster?.system as any).level?.current + (caster?.system as any).modifiers?.polymorph?.castingLevelBonus)?.toString()
                : (caster?.system as any).hitDice?.toString()
        }
    ]

    const targetInfo = (actor: Actor) => {
        const isHero = (actor.type as string) === "hero"
        return {
            label: isHero ? appLang.Polymorph.targetLvl : appLang.Polymorph.targetHd,
            value: isHero ? (actor.system as any).level?.current?.toString() : (actor.system as any).hitDice?.toString()
        }
    }

    return (
        <div className={isResolved ? "opacity-90 grayscale-[85%]" : ""}>
            <BaseChatCardHost
                banner={
                    <ChatCardBanner
                        tokenId={caster?.getActiveTokens()[0]?.id}
                        portrait={getTokenImg(caster)}
                        subtitle={subtitles}
                        title={appLang.Polymorph.request}
                    />
                }
                contents={
                    <div className="flex flex-col gap-1">
                        {entries.map(entry => {
                            const result = statuses[entry.key]
                            const info = targetInfo(entry.actor!)
                            const canChoose = !result && !!game.user?.isActiveGM
                            const selectable = entries.length > 1 && !result
                            const selected = result ? result.status === "applied" : !excluded.has(entry.key)
                            const boxStyle = selected
                                ? "border border-solid border-wealth-denom-label bg-sheet-header-fill text-text-header-primary"
                                : "border border-solid border-sheet-header-fill bg-sheet-main-fill text-text-primary"
                            const subStyle = (selected ? "text-text-header-secondary" : "text-text-secondary") + " font-normal"
                            return (
                                <div key={entry.key} className="flex flex-col px-2">
                                    <div
                                        className={`flex justify-start items-center gap-x-2 rounded-md p-1 ${boxStyle} ${canChoose && selectable ? "cursor-pointer" : ""}`}
                                        onClick={() => { if (canChoose && selectable) toggleExcluded(entry.key) }}
                                    >
                                        <img
                                            src={(result?.targetImg) || getTokenImg(entry.token ?? entry.actor) || null as any}
                                            alt={appLang.Polymorph.target}
                                            className="w-10 h-10 rounded"
                                        />

                                        <div className="flex flex-col justify-start gap-x-2 text-lg">
                                            <span>{entry.actor!.name}</span>
                                            <div className={`flex gap-x-2 text-sm items-center -mt-2 ${subStyle}`}>
                                                <span>{info.label}:</span>
                                                <span className="text-xl font-normal">{info.value}</span>
                                            </div>
                                        </div>

                                        {selected &&
                                            <Check size={24} className="text-wealth-denom-label ml-auto mr-2" />
                                        }
                                    </div>
                                </div>
                            )
                        })}

                        {/* POLYMORPH FORM - TOKEN IMAGE AND HD VALUE */}
                        <div className="flex justify-start items-center gap-x-2 ml-4">
                            <ArrowBigRightDash size={32} className="text-text-secondary" />
                            <img
                                src={form ? getTokenImg(form) : null as any}
                                alt={appLang.Polymorph.polymorphForm}
                                className="w-16 h-16 rounded"
                            />
                            <div className="flex flex-col justify-start gap-x-2 text-xl">
                                <span>{form?.name}</span>
                                <div className="flex gap-x-2 text-lg">
                                    <span>{appLang.Polymorph.targetHd}:</span>
                                    <span className="font-normal">{form?.system?.hitDice}</span>
                                </div>
                            </div>
                        </div>

                        {/* DURATION SELECTED BY THE CASTER */}
                        <span className="flex justify-center items-center gap-x-2">
                            <p>Duration:</p>
                            <p className="font-normal">{duration.toUpperCase()}</p>
                        </span>

                        {pendingEntries.length > 0 && (
                            form
                                ? <div className="flex justify-between items-center gap-x-2 mb-2 px-2">
                                    <PrimaryButton onClick={applyRequest} disabled={selectedEntries.length === 0}>
                                        {isApplying ? "polymorphing..." : appLang.ButtonActions.accept}
                                    </PrimaryButton>

                                    {!isApplying && <DestructiveButton onClick={cancelRequest} hideIcon={true}>
                                        {appLang.ButtonActions.decline} all
                                    </DestructiveButton>}
                                </div>
                                : <div className="text-center text-sm">
                                    {formLoadError ? appLang.Polymorph.statBlockError : appLang.Polymorph.loadingStatBlock}
                                </div>
                        )}
                    </div>
                }
            />
        </div>
    )
}
