import { vgLiteLang } from "../../../utils/lang"
import { tableBorderRounded } from "../../../view/common/border-styles"
import { PrimaryButton } from "../../../view/component/Button"
import { ActiveEffectButtons } from "./ActiveEffectButtons"

export interface Effect {
    id: string
    statusId: string
    name: string
    img: string
    disabled: boolean
    isTransfer: boolean // is from equipped gear
    duration?: number // (Cd4, etc...)
    sourceName?: string
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
    return (
        <div className="flex flex-col gap-4 p-4 h-full bg-sheet-main-fill text-text-primary font-eskapade font-bold rounded-b-lg">
            {/* Header / Add Button */}
            <div className="flex justify-between items-center">
                <p className="text-2xl">{vgLiteLang.Effects.title}</p>
                <PrimaryButton children={vgLiteLang.ButtonActions.addEffect} onClick={onCreate} />
            </div>

            {/* 🔥 BURNING NOTIFICATIONS 🔥 */}
            {effects.filter(eff => eff.name.includes("burning")).map((eff) => (
                <div
                    key={eff.id}
                    onClick={() => onEdit(eff.id)}
                    className="flex items-center justify-between bg-context-menu-fill border border-solid border-destructive-action/50 rounded p-2 text-text-primary text-sm"
                >
                    <span className="flex items-center gap-1.5 text-lg">
                        <span>🔥</span> {vgLiteLang.Effects.burn}:
                        <span className="text-text-header-tertiary italic ml-1 text-sm line-clamp-1">
                            {`(${vgLiteLang.Effects.by} ${eff.sourceName || vgLiteLang.Effects.env})`}
                        </span>
                    </span>
                    <div className="flex gap-x-4">
                        <ActiveEffectButtons
                            effect={eff}
                            onToggle={() => onToggle(eff.id)}
                            onEdit={() => onEdit(eff.id)}
                            onDelete={() => onDelete(eff.id)}
                        />
                        <span className="bg-sheet-main-fill px-2 py-0.5 rounded-sm border border-solid border-destructive-action/50 text-text-secondary text-lg">
                            Cd{eff.duration?.toString()}
                        </span>
                    </div>
                </div>
            ))}

            {/* EFFECTS LIST */}
            <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
                {effects.filter(eff => !eff.name.includes("burning")).map((eff) => (
                    <li
                        key={eff.id}
                        onClick={() => onEdit(eff.id)}
                        className={`
                            flex items-center justify-between p-2
                            text-xl text-text-header-primary transition-all 
                            bg-sheet-header-fill ${tableBorderRounded}
                            ${eff.disabled ? 'opacity-50' : ''}
                        `}
                    >
                        {/* ICON & NAME */}
                        <div className="flex items-center gap-3">
                            <img
                                src={eff.img}
                                alt={eff.name}
                                className={`w-8 h-8 rounded object-cover`}
                            />
                            <span className={`${eff.disabled ? 'line-through' : ''}`}>
                                {eff.name}
                            </span>
                            {eff.isTransfer && (
                                <span className="text-[10px] bg-sheet-main-fill text-text-secondary px-1.5 py-0.5 rounded uppercase">
                                    Item
                                </span>
                            )}
                        </div>

                        {/* CONTROLS */}
                        <ActiveEffectButtons
                            effect={eff}
                            onToggle={() => onToggle(eff.id)}
                            onEdit={() => onEdit(eff.id)}
                            onDelete={() => onDelete(eff.id)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}