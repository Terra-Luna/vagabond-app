import { Cross, Plus, Sword, Wrench } from 'lucide-react'
import { DamageRollResult } from '../../combat/dice-rolls'
import { DamageTypeIcon } from '../component/DamageTypeIcon'
import { Divider } from '../component/Header'
import { BaseChatCardHost } from './component/BaseChatCardHost'
import { ChatCardBanner } from './component/ChatCardBanner'
import { DiceRoll } from './component/DiceRoll'
import { getCanvasToken, getTokenImg } from '../../utils/modelUtil'
import { MenuItem, Menu } from '@szhsin/react-menu'
import { glowOnHover } from '../sheets/VgLiteSheet'
import ActorDataModel, { BaseActorSchema } from '../../model/actor/ActorDataModel'

export const DamageRollCard = ({ actorId, targetIds, result }: { actorId: string, targetIds: string[], result: DamageRollResult }) => {
    const actor = game.actors?.get(actorId)
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={getTokenImg(actor)} title={result.atkName} />}
            contents={<>
                <Targets targetIds={targetIds} />
                <div className="flex flex-wrap grow gap-x-2 mt-2 justify-center">
                    {
                        result.rollsSummary.map((r, index) => (
                            <div key={index}>
                                <DiceRoll faces={r.dieSize} result={r.result} textSize={"text-4xl"} exploded={r.exploded} />
                            </div>
                        ))
                    }
                    {
                        result.bonus === 0 ? <></> :
                            <div className="flex">
                                <div className="h-full content-center"><Plus size={24} /></div>
                                <p className="h-full conent center text-4xl">{result.bonus}</p>
                            </div>
                    }
                </div>
                <TotalDmgFooter total={result.total} dmgType={result.dmgType} targetIds={targetIds} />
            </>}
        />
    )
}

const Targets = ({ targetIds }: { targetIds: string[] }) => {
    const targets = targetIds.map(id => (
        { id: id, src: getTokenImg(getCanvasToken(id)) }
    ))
    console.log(targetIds)
    return (
        <div className="flex space-x-1 justify-center items-center">
            {<>
                <Divider />
                {targets.filter(it => it.src != null && it.src.length > 0).map(target => (
                    <img
                        key={target.id}
                        className={`object-contain h-[32px] w-[32px]`}
                        src={target.src}
                        alt={'target'}
                    />
                ))}
                <Divider />
            </>}
        </div>
    )
}

const TotalDmgFooter = ({ total, dmgType, targetIds }) => {
    return (
        <div className="flex h-full w-full items-center justify-center space-x-2">
            <p className="text-xl text-text-secondary font-paradigm mr-2">Total:</p>
            <p className="text-3xl text-text-primary">{total}</p>
            <div className="w-fit">
                <DamageTypeIcon dmgType={dmgType} size={18} />
            </div>
            {game.user?.isGM ? <GMToolsMenu targetIds={targetIds} damage={total} /> : <></>}
        </div>
    )
}

const GMToolsMenu = ({ targetIds, damage }: { targetIds: string[], damage: number }) => {
    return (<>
        <Menu direction={"top"} align={"end"} menuButton={<Wrench size={18} className={`text-stat-block-fill ml-2 cursor-pointer overflow-visible ${glowOnHover}`} />}>
            <div className="bg-context-menu-fill text-base text-left border border-solid border-table-border rounded-sm p-2 space-y-2">
                {/* APPLY HEALING */}
                <MenuItem onClick={(e) => { applyDamage(targetIds, damage, true, false) }}>
                    <div className="flex items-center space-x-2">
                        <Cross size={14} className="text-ic-luck fill-ic-luck" />
                        <p className={`text-stat-block-fill font-bold ${glowOnHover}`}>Apply Healing</p>
                    </div>
                </MenuItem>
                {/* APPLY HALF DAMAGE */}
                <MenuItem onClick={(e) => { applyDamage(targetIds, damage, false, true) }}>
                    <div className="flex items-center space-x-2">
                        <Sword size={14} className="text-stat-block-fill" />
                        <p className={`text-stat-block-fill font-bold ${glowOnHover}`}>Apply 1/2 Damage</p>
                    </div>
                </MenuItem>
                {/* APPLY DAMAGE */}
                <MenuItem onClick={(e) => { applyDamage(targetIds, damage) }}>
                    <div className="flex items-center space-x-2">
                        <Sword size={14} className="text-stat-block-fill fill-stat-block-fill" />
                        <p className={`text-stat-block-fill font-bold ${glowOnHover}`}>Apply Damage</p>
                    </div>
                </MenuItem>
            </div>
        </Menu>
    </>)
}

function applyDamage(targetIds: string[], damage: number, isHealing: boolean = false, isHalf: boolean = false) {
    const targets = targetIds.map(id => canvas?.tokens?.get(id))
    targets.forEach(target => {
        const targetSys = target?.actor?.system as ActorDataModel<BaseActorSchema>
        const currentHP = targetSys.health.current
        const armor = isHealing ? 0 : targetSys.armor.rating
        const adjDamage = isHealing ? damage * -1 : (
            isHalf ? Math.ceil(damage / 2) - armor :
                damage - armor
        )
        // @ts-ignore
        target?.actor?.update({ "system.health.current": currentHP - adjDamage })
    })
}