import { Cross, Sword, Wrench } from 'lucide-react'
import { DamageRollResult } from '../../combat/dice-rolls'
import { DamageTypeIcon } from '../component/DamageTypeIcon'
import { BaseChatCardHost } from './component/BaseChatCardHost'
import { ChatCardBanner } from './component/ChatCardBanner'
import { MenuItem, Menu } from '@szhsin/react-menu'
import { TargetsDisplay } from './component/TargetsDisplay'
import { getCanvasToken, getTokenImg } from '../../utils/modelUtil'
import { applyDamage, applyHealing } from '../../combat/damage-handler'
import { glowOnHover } from '../common/text-styles'
import { vgLiteLang } from '../../utils/lang'
import { DamageRolls } from './component/DamageRolls'
import { useCallback, useState } from 'react'

export const DamageRollChatCard = ({ actorId, tokenIds, result }: {
    actorId: string, tokenIds: string[], result: DamageRollResult
}) => {
    const actor = game.actors?.get(actorId)

    const [targets, setTargets] = useState(tokenIds.map(id => (
        { id: id, src: getTokenImg(getCanvasToken(id)), token: getCanvasToken(id) }
    )).filter(it => it.src != null && it.src.length > 0))

    const onRemoveTarget = useCallback((targetIndex) => {
        setTargets(targets.filter((_, i) => i !== targetIndex))
    }, [targets])

    return (
        <BaseChatCardHost
            banner={<ChatCardBanner
                tokenId={actor?.getActiveTokens()[0]?.id}
                portrait={getTokenImg(actor)}
                title={result.atkName}
                subtitle={[{ label: "Damage Type", value: vgLiteLang.DamageTypes[result.dmgType] }]}
            />}
            contents={<>
                <TargetsDisplay targets={targets} onRemoveTarget={onRemoveTarget} />
                <DamageRolls result={result} />
                <TotalDmgFooter total={result.total} dmgType={result.dmgType} targets={targets} />
            </>}
        />
    )
}

export const TotalDmgFooter = ({ total, dmgType, targets }) => {
    return (
        <div className="flex h-full w-full items-center justify-center space-x-2">
            <p className="text-xl text-text-secondary font-paradigm font-normal mr-2">Total:</p>
            <p className="text-3xl text-text-primary">{total}</p>
            <div className="flex w-fit h-full space-x-4">
                <DamageTypeIcon dmgType={dmgType} size={26} />
                {game.user?.isGM ? <GMToolsMenu targets={targets} damage={total} /> : <></>}
            </div>
        </div>
    )
}

const GMToolsMenu = ({ targets, damage }: { targets: any[], damage: number }) => {
    return (<>
        <Menu direction={"top"} align={"end"} menuButton={<Wrench size={20} className={`text-text-header-tertiary ml-2 cursor-pointer overflow-visible ${glowOnHover}`} />}>
            <div className="bg-context-menu-fill text-base text-left border border-solid border-table-border rounded-sm p-2 space-y-2">
                {/* APPLY HEALING */}
                <MenuItem onClick={(e) => applyHealing(targets.map(t => t.id), damage)}>
                    <div className="flex items-center space-x-2">
                        <Cross size={14} className="text-ic-luck fill-ic-luck" />
                        <p className={`text-text-header-tertiary font-bold ${glowOnHover}`}>Apply Healing</p>
                    </div>
                </MenuItem>
                {/* APPLY HALF DAMAGE */}
                <MenuItem onClick={(e) => applyDamage(targets.map(t => t.id), damage, true)}>
                    <div className="flex items-center space-x-2">
                        <Sword size={14} className="text-text-header-tertiary" />
                        <p className={`text-text-header-tertiary font-bold ${glowOnHover}`}>Apply 1/2 Damage</p>
                    </div>
                </MenuItem>
                {/* APPLY DAMAGE */}
                <MenuItem onClick={(e) => applyDamage(targets.map(t => t.id), damage)}>
                    <div className="flex items-center space-x-2">
                        <Sword size={14} className="text-text-header-tertiary fill-text-header-tertiary" />
                        <p className={`text-text-header-tertiary font-bold ${glowOnHover}`}>Apply Damage</p>
                    </div>
                </MenuItem>
            </div>
        </Menu>
    </>)
}