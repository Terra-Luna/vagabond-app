import { Shield, Undo2 } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"

import { getTokenImg } from "../../../utils/modelUtil"
import { DamageTypeIcon } from "../../../view/component/DamageTypeIcon"
import { FoundryHotkeyBlocker } from "../../../view/component/FoundryHotkeyBlocker"
import { ClearHeader, ItemDivider } from "../../../view/component/Header"
import { IconOnlyButton } from "../../../view/component/IconOnlyButton"
import { Attack, AttackResolutionArgs, damageOverrideKey, TargetDamageSummary } from "../../engine/Attack"

/**
 * Displays a per-target "preview" of the damage each target will take if Applied.
 * The active GM can double-click a total to override it.
 */
export const AttackDamageSummary = ({ attack, args, onOverrideChange }: {
    attack: Attack
    args: AttackResolutionArgs
    onOverrideChange: (key: string, value: number | undefined) => void
}) => {
    const rows = attack.getDamageSummary(args)
    if (rows.length === 0) return null

    return (
        <div className="px-1 pb-1">
            <ClearHeader title={`${attack.isResolved ? "Summary" : "Review"}`} />
            <div className="flex flex-col gap-1 mt-1 px-1">
                {rows.map((row, index) =>
                    <SummaryRow
                        key={`${row.subIndex}-${row.targetId}-${index}`}
                        row={row}
                        isResolved={attack.isResolved}
                        onOverrideChange={value => onOverrideChange(damageOverrideKey(row.targetId, row.subIndex), value)}
                    />
                )}
            </div>
        </div>
    )
}

const SummaryRow = ({ row, isResolved, onOverrideChange }: { row: TargetDamageSummary, isResolved: boolean, onOverrideChange: (value: number | undefined) => void }) => {
    const token = canvas?.scene?.tokens?.get(row.targetId)
    const actor = token?.actor
    const name = token?.name ?? actor?.name
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState("")
    const nameRef = useRef<HTMLDivElement>(null)
    const damageRef = useRef<HTMLDivElement>(null)
    const [wrapped, setWrapped] = useState(false)

    useLayoutEffect(() => {
        const container = nameRef.current?.parentElement
        if (!container) return
        const measure = () => {
            const nameEl = nameRef.current
            const damageEl = damageRef.current
            if (nameEl && damageEl) setWrapped(damageEl.offsetTop >= nameEl.offsetTop + nameEl.offsetHeight / 2)
        }
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(container)
        return () => observer.disconnect()
    }, [])
    const commit = () => {
        const value = Number.parseInt(draft, 10)
        if (!Number.isNaN(value) && value >= 0) {
            onOverrideChange(value === row.calculatedTotal ? undefined : value)
        }
        setIsEditing(false)
    }

    return (
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-1 gap-y-0 font-normal">
            {/* TOKEN IMG AND NAME */}
            <div ref={nameRef} className="flex items-center gap-1">
                <img
                    src={actor ? getTokenImg(actor) : undefined}
                    alt={name}
                    title={name}
                    className="object-contain h-[28px] w-[28px] shrink-0"
                />
                <p className="min-w-0 max-w-[4.5rem] truncate mr-1" title={name}>{name}</p>
            </div>

            <ItemDivider />

            {/* DAMAGE LABEL AND VALUE */}
            <div ref={damageRef} className={`flex shrink-0 items-center gap-1 whitespace-nowrap ml-auto ${wrapped ? "-mt-2" : ""}`}>
                {row.label && <p className="min-w-0 truncate" title={row.label}>{row.label}:</p>}
                {row.saveHalved && <p>(</p>}
                <p>{row.resistanceDivisor > 1 ? `${row.damageBeforeHalving}/${row.resistanceDivisor}` : row.damage}</p>
                {row.bonus !== 0 && <p title="Bonus damage">{row.bonus > 0 ? `+ ${row.bonus}` : `− ${Math.abs(row.bonus)}`}</p>}
                {row.imbueParts.map((part, index) => {
                    const tip = `${part.label ?? part.dmgType}: ${part.bonus > 0 ? `${part.amount - part.bonus} + ${part.bonus}` : part.amount} damage`
                    return <div key={index} className="flex items-center gap-0.5" title={tip}>
                        <p>+</p>
                        <DamageTypeIcon dmgType={part.dmgType} size={24} title={tip} />
                    </div>
                })}
                {row.healing && <>
                    {row.healing.setValue > 0
                        ? <p title="Healing is set to a fixed amount per die">→ {row.healing.setValue}</p>
                        : <>
                            {row.healing.flat !== 0 && <p title="Flat healing modifier">{row.healing.flat > 0 ? `+ ${row.healing.flat}` : `− ${Math.abs(row.healing.flat)}`}</p>}
                            {row.healing.perDie !== 0 && <p title="Per-die healing modifier">{row.healing.perDie > 0 ? `+ ${row.healing.perDie}` : `− ${Math.abs(row.healing.perDie)}`}</p>}
                        </>
                    }
                </>}

                {!row.healing && <div className="flex items-center gap-1">
                    {row.otherMitigation !== 0 && (
                        <p title={row.otherMitigation > 0 ? "Bonus mitigation" : "Bonus damage"}>
                            {row.otherMitigation > 0 ? `− ${row.otherMitigation}` : `+ ${Math.abs(row.otherMitigation)}`}
                        </p>
                    )}

                    <div className="flex items-center gap-0.5" title={row.armorPiercing > 0 ? `Armor after ${row.armorPiercing} armor piercing` : "Armor"}>
                        <p>−</p>
                        <div className="relative w-[24px] h-[24px] shrink-0">
                            <Shield className="w-full h-full text-ic-armor-border fill-ic-armor-fill" strokeWidth={1} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm leading-none text-text-armor font-eskapade font-bold">{row.armor}</span>
                            </div>
                        </div>
                    </div>
                </div>}

                {row.saveHalved && <p>) / 2</p>}
                <p>=</p>
                {isEditing
                    ? <FoundryHotkeyBlocker>
                        <input
                            autoFocus
                            type="number"
                            min={0}
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onBlur={commit}
                            onKeyDown={e => {
                                if (e.key === "Enter") commit()
                                else if (e.key === "Escape") setIsEditing(false)
                            }}
                            className="w-12 text-center font-bold"
                        />
                    </FoundryHotkeyBlocker>
                    : <p
                        className={`font-bold ${row.isOverridden ? "text-ic-luck" : ""}`}
                        title={row.isOverridden ? `Overridden (calculated: ${row.calculatedTotal})` : `${row.healing ? "Total healing" : "Total damage"}\n(Double-click to override)`}
                        onDoubleClick={game.user?.isActiveGM && !isResolved
                            ? () => { setDraft(String(row.total)); setIsEditing(true) }
                            : undefined}
                    >{row.total}</p>
                }
                {row.isOverridden && game.user?.isActiveGM && !isResolved &&
                    <IconOnlyButton Icon={Undo2} size={14} title="Undo override" onClick={() => onOverrideChange(undefined)} />
                }
            </div>
        </div>
    )
}
