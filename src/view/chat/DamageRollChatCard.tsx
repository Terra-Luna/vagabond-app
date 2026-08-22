import { useCallback, useState } from 'react'

import { DamageRollResult } from '../../combat/engine/roll/DamageRoll'
import { vgLiteLang } from '../../utils/lang'
import { getCanvasToken, getTokenImg } from '../../utils/modelUtil'
import { BaseChatCardHost } from './component/BaseChatCardHost'
import { ChatCardBanner } from './component/ChatCardBanner'
import { DamageRollsComponent } from './component/DamageRollsComponent'
import { TargetsDisplay } from './component/TargetsDisplay'

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
                <DamageRollsComponent result={result} />
                <TotalDmgFooter total={result.total} />
            </>}
        />
    )
}

export const TotalDmgFooter = ({ total }) => {
    return (
        <div className="flex h-full w-full items-center justify-center space-x-2">
            <p className="text-xl text-text-secondary font-paradigm font-normal mr-2">Total:</p>
            <div className="text-3xl text-text-primary">{total}</div>
        </div>
    )
}