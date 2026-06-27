import { Cross, Plus, Sword, Wrench } from 'lucide-react'
import { DamageRollResult } from '../../combat/dice-rolls'
import { DamageTypeIcon } from '../component/DamageTypeIcon'
import { BaseChatCardHost } from './component/BaseChatCardHost'
import { ChatCardBanner } from './component/ChatCardBanner'
import { DiceRoll } from './component/DiceRoll'
import { MenuItem, Menu } from '@szhsin/react-menu'
import { glowOnHover } from '../sheets/VgLiteSheet'
import { TargetsDisplay } from './component/TargetsDisplay'
import { getTokenImg } from '../../utils/modelUtil'
import { applyDamage, applyHealing } from '../../combat/damage-handler'

export const DamageRollChatCard = ({ actorId, tokenIds, result }: { actorId: string, tokenIds: string[], result: DamageRollResult }) => {
    const actor = game.actors?.get(actorId)
    return (
        <BaseChatCardHost
            banner={<ChatCardBanner portrait={getTokenImg(actor)} title={result.atkName} />}
            contents={<>
                <TargetsDisplay tokenIds={tokenIds} />
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
                <TotalDmgFooter total={result.total} dmgType={result.dmgType} tokenIds={tokenIds} />
            </>}
        />
    )
}

const TotalDmgFooter = ({ total, dmgType, tokenIds }) => {
    return (
        <div className="flex h-full w-full items-center justify-center space-x-2">
            <p className="text-xl text-text-secondary font-paradigm mr-2">Total:</p>
            <p className="text-3xl text-text-primary">{total}</p>
            <div className="w-fit">
                <DamageTypeIcon dmgType={dmgType} size={18} />
            </div>
            {game.user?.isGM ? <GMToolsMenu tokenIds={tokenIds} damage={total} /> : <></>}
        </div>
    )
}

const GMToolsMenu = ({ tokenIds, damage }: { tokenIds: string[], damage: number }) => {
    return (<>
        <Menu direction={"top"} align={"end"} menuButton={<Wrench size={18} className={`text-stat-block-fill ml-2 cursor-pointer overflow-visible ${glowOnHover}`} />}>
            <div className="bg-context-menu-fill text-base text-left border border-solid border-table-border rounded-sm p-2 space-y-2">
                {/* APPLY HEALING */}
                <MenuItem onClick={(e) => applyHealing(tokenIds, damage)}>
                    <div className="flex items-center space-x-2">
                        <Cross size={14} className="text-ic-luck fill-ic-luck" />
                        <p className={`text-stat-block-fill font-bold ${glowOnHover}`}>Apply Healing</p>
                    </div>
                </MenuItem>
                {/* APPLY HALF DAMAGE */}
                <MenuItem onClick={(e) => applyDamage(tokenIds, damage, true)}>
                    <div className="flex items-center space-x-2">
                        <Sword size={14} className="text-stat-block-fill" />
                        <p className={`text-stat-block-fill font-bold ${glowOnHover}`}>Apply 1/2 Damage</p>
                    </div>
                </MenuItem>
                {/* APPLY DAMAGE */}
                <MenuItem onClick={(e) => applyDamage(tokenIds, damage)}>
                    <div className="flex items-center space-x-2">
                        <Sword size={14} className="text-stat-block-fill fill-stat-block-fill" />
                        <p className={`text-stat-block-fill font-bold ${glowOnHover}`}>Apply Damage</p>
                    </div>
                </MenuItem>
            </div>
        </Menu>
    </>)
}