import { Wand2 } from "lucide-react"

import { SpellcastingApp } from "../../../apps/spellcasting/SpellcastingApp"
import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { appLang } from "../../../utils/lang"
import { getTokenImg } from "../../../utils/modelUtil"
import { DamageRollsComponent } from "../../../view/chat/component/DamageRollsComponent"
import { ClearHeader } from "../../../view/component/Header"
import type { Attack } from "../../engine/Attack"
import { HeroAttack } from "../../engine/HeroAttack"
import { InteractiveChatCardButton } from "./InteractiveChatCardButton"

const hasOffensiveSpell = (actor: any): boolean =>
    !!actor?.system?.spells?.some(sp => sp.damageType !== 'none' && sp.damageType !== 'healing')

/**
 * Heroes that can still imbue: they have an offensive spell, and haven't imbued this attack.
 */
const canImbue = (actor: any, attack: Attack): boolean =>
    hasOffensiveSpell(actor)
    && !attack.imbues.some(imbue => imbue.actorId === actor.id)

const getImbueActor = (attack: Attack): (Actor & { system: HeroDataModel }) | undefined => {
    const heroes = game.actors?.contents?.filter(it => (it.type as any) === "hero" && it.isOwner && canImbue(it, attack)) ?? []
    if (heroes.length === 1) {
        return heroes[0] as Actor & { system: HeroDataModel }
    }
    else if (heroes.length > 1) {
        return (canvas?.tokens?.controlled?.find(it => heroes?.some(h => h.id === it.actor?.id))?.actor ?? heroes[0]) as Actor & { system: HeroDataModel }
    }

    if (!game.user?.isActiveGM) return undefined
    const controlled: any[] = game.canvas?.tokens?.controlled ?? []
    return controlled.map(token => token.actor).find(actor => canImbue(actor, attack))
}

/**
 * One damage section per imbued spell.
 */
export const ImbuedDamageSections = ({ attack }: { attack: Attack }) => (
    <>
        {attack.imbues.map((imbue, index) => {
            if (!imbue.damageRoll.result) return null
            const casterImg = getTokenImg(game.actors?.get(imbue.actorId))
            return (
                <div key={`${imbue.actorId}-${imbue.spellUuid}-${index}`} className="mt-2">
                    <ClearHeader title={
                        <span className="flex items-center gap-x-1">
                            {casterImg && <img src={casterImg} alt="" className="w-6 h-6 object-contain" />}
                            {`Imbue: ${imbue.spellName}`}
                        </span>
                    } />
                    <DamageRollsComponent attack={{ damageRoll: { result: imbue.damageRoll.result } }} />
                </div>
            )
        })}
    </>
)

export const ImbueButton = ({ attack }: { attack: Attack }) => {
    const skillFailed = (attack as any).skillCheck?.result?.outcome === appLang.RollResult.failure
    const imbuer = getImbueActor(attack)
    const isEligible = attack.isImbuable
        && !attack.isResolved
        && !skillFailed
        && !!attack.damageRoll?.result
        && !["healing", "fatigue", "mana"].includes(attack.damageRoll.dmgType)
        && !!imbuer

    if (!isEligible) return null

    return (
        <div className="flex items-center justify-center my-2 px-1 [&>span]:flex-1 [&>span>button]:w-full">
            <InteractiveChatCardButton
                label={
                    <div className="flex gap-x-2 justify-center items-center">
                        <Wand2 size={16} className="text-mana mr-2" />
                        Imbue
                        <Wand2 size={16} className="text-mana mr-2" />
                    </div>
                }
                tooltip={appLang.Combat.imbueAttack}
                borderClassName="border border-solid border-mana"
                fn={() => {
                    const caster = getImbueActor(attack)
                    if (!caster) return
                    HeroAttack.announceImbue(caster.name ?? "")
                    new SpellcastingApp(caster, true, false, { actorId: attack.actor.id!, attackId: attack.id }).render({ force: true })
                }}
            />
        </div>
    )
}
