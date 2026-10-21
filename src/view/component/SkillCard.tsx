import { ToggleLeft, ToggleRight } from 'lucide-react'
import { ReactNode, useCallback } from 'react'

import { sys_id } from '../../utils/foundryUtils'
import { tableBorderRounded } from '../common/border-styles'
import { CardHeader } from './CardHeader'
import {
    CardSubHeader,
    type CardSubHeaderValues,
    HeaderWithClipPath
} from './CardSubHeader'
import { Collapsible } from "./Collapsible"
import { ImageWithDamageTypeBadge } from './DamageTypeIcon'
import { EnrichedContent } from './EnrichedContent'
import { SkillCardAction } from './Header'
import { Tooltip } from './Tooltip'

export {
    CardSubHeader,
    type CardSubHeaderValues,
    HeaderWithClipPath
}
const cardBodyLayout = "p-2 border-b-1 border-l-1 border-r-1 border-solid border-table-border bg-sheet-main-fill"
const cardBodyStyle = "text-text-primary text-sm antialiased font-paradigm font-normal"

export const SkillCard = ({ actor, img = '', dmgType = 'none', title, subtitles, description, startCollapsed = true, hideCollapseButton, actions = [], mini }: {
    actor?: Actor,
    img?: string,
    dmgType?: string,
    title: string | ReactNode,
    subtitles: CardSubHeaderValues[],
    description: string,
    startCollapsed?: boolean,
    hideCollapseButton?: boolean,
    actions?: SkillCardAction[],
    mini?: boolean
}) => {
    return (mini
        ? <Tooltip interactive={true} content={
            <SkillCard
                actor={actor}
                img={img}
                dmgType={dmgType}
                title={title}
                subtitles={subtitles}
                description={description}
                startCollapsed={false}
                hideCollapseButton={true}
                actions={actions}
                mini={false}
            />}
        >
            <div className={`flex items-center gap-x-1 bg-sheet-header-fill ${tableBorderRounded} pl-1 py-1 w-full min-w-0`}>
                {!img || img === ''
                    ? <></>
                    : <div className="flex-shrink-0">
                        <ImageWithDamageTypeBadge img={img} dmgType={dmgType} size={32} />
                    </div>
                }
                {title}
            </div>
        </Tooltip>
        : <Collapsible
            img={img}
            title={title}
            dmgType={dmgType}
            startCollapsed={startCollapsed}
            hideCollapseButton={hideCollapseButton}
            actions={actions}
            Header={CardHeader}
            content={(
                <>
                    <CardSubHeader values={subtitles} />
                    <CardBody actor={actor} description={description} />
                </>)}
            />
        )
}

export const SkillCardTitle = ({ text, children }: { text: string, children?: ReactNode }) => {
    return (
        <div className="flex min-w-0 w-full">
            <div className="flex gap-1 justify-between items-center w-full">
                <p className="text-text-header-primary font-eskapade font-normal truncate min-w-0 flex-1">
                    {text}
                </p>
                <div className="flex-shrink-0">
                    {children}
                </div>
            </div>
        </div>
    )
}

export const ItemRuleToggleSwitch = ({ actor, item }) => {
    const itemId = item.id || item._sourceId.split('.').pop()

    const toggleFeature = useCallback(() => {
        if (itemId) {
            actor.toggleItemRule(item)
        }
        else {
            console.warn(`${sys_id} | Item ID undefined for`, { item })
        }
    }, [actor.flags, actor.getRuleToggleState(itemId)])

    return (
        <button
            type="button"
            title={`Toggle:\n${item.rules?.filter(r => r.toggleableEffect).map(r => r.label).join('\n')}`}
            className="flex cursor-pointer hover-glow pr-1"
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleFeature()
            }}
        >
            {actor.getRuleToggleState(itemId)
                ? <ToggleRight strokeWidth={2} className="text-ic-luck" />
                : <ToggleLeft strokeWidth={1} className="text-text-header-primary/80" />
            }
        </button>
    )
}

const CardBody = ({ actor, description }: { actor?: Actor, description: string }) => {
    return (
        <div className={cardBodyLayout}>
            <div className={cardBodyStyle}>
                <EnrichedContent actor={actor} content={description} />
            </div>
        </div>
    )
}