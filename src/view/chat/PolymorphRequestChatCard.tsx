import { ArrowBigRightDash } from "lucide-react"
import { useEffect, useState } from "react"

import { api } from "../../apps/api/VagabondAPI"
import { getPolymorphRequestRegistry, PolymorphRequestStatus, setPolymorphRequestStatus } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../model/actor/NpcDataModel"
import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { getCanvasToken, getTokenImg } from "../../utils/modelUtil"
import { UtilityButton } from "../component/Button"
import { BaseChatCardHost } from "./component/BaseChatCardHost"
import { ChatCardBanner } from "./component/ChatCardBanner"

type RequestStatus = "pending" | PolymorphRequestStatus

export const PolymorphRequestChatCard = ({ casterId, targetId, targetTokenId, formUuid, messageId }: {
    casterId: string,
    targetId: string,
    targetTokenId?: string,
    formUuid: string,
    messageId: string
}) => {
    const caster = game.actors?.get(casterId)
    const targetToken = getCanvasToken(targetTokenId)
    const target = targetToken?.actor ?? game.actors?.get(targetId)
    const [form, setForm] = useState<(Actor & { system: NpcDataModel | AdversaryDataModel }) | undefined>()
    const [formLoadError, setFormLoadError] = useState(false)
    const [status, setStatus] = useState<RequestStatus>(() =>
        (messageId && getPolymorphRequestRegistry()[messageId]?.status) || "pending"
    )
    const [savedTargetImg, setSavedTargetImg] = useState<string | undefined>(() =>
        messageId ? getPolymorphRequestRegistry()[messageId]?.targetImg : undefined
    )
    const [isApplying, setIsApplying] = useState(false)

    useEffect(() => {
        if (!messageId) return
        const hookId = Hooks.on("updateSetting", (settingDoc: any) => {
            if (settingDoc.key !== `${sys_id}.polymorphRequestRegistry`) return
            const record = getPolymorphRequestRegistry()[messageId]
            setStatus(record?.status ?? "pending")
            setSavedTargetImg(record?.targetImg)
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

    if (!caster || !target) return null

    const saveStatus = async (newStatus: PolymorphRequestStatus, targetImg?: string) => {
        await setPolymorphRequestStatus(messageId, newStatus, targetImg)
        setStatus(newStatus)
        setSavedTargetImg(targetImg)
    }

    const applyRequest = async () => {
        if (!game.user?.isActiveGM || !form || isApplying || status !== "pending") return
        setIsApplying(true)

        const originalTargetImg = getTokenImg(targetToken ?? target)

        try {
            await api.util.polymorph({
                caster: caster as Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel },
                target: target as Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel },
                form
            })
            await saveStatus("applied", originalTargetImg)
        }
        catch (error: any) {
            ui.notifications?.error(`${error?.name ?? appLang.Polymorph.error}: ${error?.message ?? error}`)
        }
        finally {
            setIsApplying(false)
        }
    }

    const cancelRequest = async () => {
        try {
            await saveStatus("declined", getTokenImg(targetToken ?? target))
        }
        catch (error: any) {
            ui.notifications?.error(`${error?.name ?? appLang.Polymorph.error}: ${error?.message ?? error}`)
        }
    }

    return (
        <div className={status !== "pending" ? "opacity-90 grayscale-[85%]" : ""}>
            <BaseChatCardHost
                banner={
                    <ChatCardBanner
                        tokenId={caster?.getActiveTokens()[0]?.id}
                        portrait={getTokenImg(caster)}
                        subtitle={[{ label: appLang.Polymorph.targetHd, value: (target.system as any).hitDice?.toString() }]}
                        title={appLang.Polymorph.request}
                    />
                }
                contents={
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-center items-center gap-x-2 px-4">
                            <img
                                src={(status !== "pending" && savedTargetImg) || getTokenImg(targetToken ?? target) || null as any}
                                alt={appLang.Polymorph.target}
                                className="w-16 h-16 rounded"
                            />

                            <ArrowBigRightDash size={24} className="text-text-secondary" />

                            <img
                                src={form ? getTokenImg(form) : null as any}
                                alt={appLang.Polymorph.polymorphForm}
                                className="w-16 h-16 rounded"
                            />
                        </div>

                        {status !== "pending"
                            ? <div className="text-center text-sm">
                                {status === "applied" ? appLang.Polymorph.applied : appLang.Polymorph.cancelled}
                            </div>
                            : (game.user?.isActiveGM || target?.isOwner) && (
                                form
                                    ? <div className="flex justify-center items-center gap-x-2 px-2">
                                        <UtilityButton onClick={applyRequest}>
                                            {isApplying ? "..." : appLang.ButtonActions.apply}
                                        </UtilityButton>

                                        {!isApplying && <UtilityButton onClick={cancelRequest}>
                                            {appLang.ButtonActions.decline}
                                        </UtilityButton>}
                                    </div>
                                    : <div className="text-center text-sm">
                                        {formLoadError ? appLang.Polymorph.statBlockError : appLang.Polymorph.loadingStatBlock}
                                    </div>
                            )
                        }
                    </div>
                }
            />
        </div>
    )
}