import { Pencil, Trash } from "lucide-react"
import ReactHtmlParser from "react-html-parser"

import { appLang } from "../../../utils/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { UtilityButton } from "../../../view/component/Button"
import { useContextMenu } from "../../../view/component/ContextMenu"
import { DynamicGrid } from "../../../view/component/DynamicGrid"
import { Tooltip } from "../../../view/component/Tooltip"
import { ActiveEffectButtons } from "./ActiveEffectButtons"

const MODE_LABELS: Record<string, string> = {
    "0": "custom", "1": "×", "2": "+", "3": "min", "4": "max", "5": "=",
    add: "+", subtract: "-", override: "=", multiply: "×", upgrade: "min", downgrade: "max"
}

const formatChange = (change: any): string => {
    const mode = change.type ?? change.mode
    const op = MODE_LABELS[String(mode)] ?? String(mode ?? "")
    const key = String(change.key ?? "").replace(/^system\./, "")
    return `${key} ${op} ${change.value}`
}

const EffectTooltipBody: React.FC<{ effect: Effect }> = ({ effect }) => {
    const changes = effect.changes ?? []
    if (!effect.description && changes.length === 0) return null
    return (
        <div className="flex flex-col gap-1 text-text-primary font-paradigm font-normal">
            {effect.description && <div>{ReactHtmlParser(effect.description)}</div>}
            {changes.length > 0 && (
                <ul className="list-disc pl-4">
                    {changes.map((change, i) => <li key={i} className="break-all">{formatChange(change)}</li>)}
                </ul>
            )}
        </div>
    )
}

export interface Effect {
    id: string
    statusId: string
    name: string
    img: string
    disabled: boolean
    isTransfer: boolean // is from equipped gear
    duration?: number // (Cd4, etc...)
    sourceName?: string
    description?: string
    changes?: any[] // list of changes applied by this effect
}

interface EffectsTabProps {
    effects: Effect[]
    onCreate: () => void
    onToggle: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export const ActiveEffectsComponent: React.FC<EffectsTabProps> = ({
    effects,
    onCreate,
    onToggle,
    onEdit,
    onDelete
}) => {

    const { ContextMenu, onCtxMenu } = useContextMenu()

    return (
        <div className={`flex flex-col gap-1 h-full text-text-primary font-eskapade font-bold rounded-sm`}>

            {/* Header & Add Button */}
            <div className="flex justify-between items-center">
                {(game.user?.isActiveGM || effects.length > 0) &&
                    <p className="text-lg">{appLang.Effects.title}</p>
                }
                {game.user?.isActiveGM &&
                    <UtilityButton children={appLang.ButtonActions.addEffect} onClick={onCreate} />
                }
            </div>

            {/* EFFECTS LIST */}
            <DynamicGrid>
                {effects.filter(eff => !eff.name.includes("burning")).map((eff) => (
                    <li
                        key={eff.id}
                        onClick={() => {
                            if (game.user?.isActiveGM) {
                                onEdit(eff.id)
                            }
                        }}
                        onContextMenu={(e) => onCtxMenu(e, [
                            { icon: Pencil, label: appLang.ButtonActions.edit, action: () => onEdit(eff.id) },
                            { icon: Trash, label: appLang.ButtonActions.delete, action: () => onDelete(eff.id), isDestructive: true }
                        ])}
                        className={`
                            flex items-center justify-between pl-2
                            text-base text-text-header-primary font-normal transition-all 
                            bg-sheet-header-fill ${tableBorderRounded}
                            ${eff.disabled ? 'opacity-50' : ''}
                        `}
                    >
                        {/* ICON & NAME */}
                        <Tooltip title={eff.name} content={<EffectTooltipBody effect={eff} />}>
                            <div className="flex items-center gap-2">
                                <img
                                    src={eff.img}
                                    alt={eff.name}
                                    className={`w-4 h-4 rounded object-cover`}
                                />
                                <span className={`${eff.disabled ? 'line-through' : ''}`}>
                                    {eff.name}
                                </span>
                            </div>
                        </Tooltip>

                        {/* TOGGLE SWITCH */}
                        {game.user?.isActiveGM && eff.changes && eff.changes.length > 0 &&
                            <ActiveEffectButtons effect={eff} onToggle={() => onToggle(eff.id)} />
                        }
                    </li>
                ))}
            </DynamicGrid>

            {game.user?.isActiveGM && <ContextMenu />}

        </div>
    )
}