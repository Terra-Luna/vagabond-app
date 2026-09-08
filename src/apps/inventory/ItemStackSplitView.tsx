import { useRef, useState } from "react"

import { EquipmentDataModel, EquipmentSchema } from "../../model/item/equip/EquipmentDataModel"
import { appLang } from "../../utils/lang"
import { tableBorder, tableBorderRounded } from "../../view/common/border-styles"
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { Divider } from "../../view/component/Header"

export const ItemStackSplitView = ({ item, onCancel, onSave }: {
    item: Item & { system: EquipmentDataModel<EquipmentSchema>},
    onCancel: () => void,
    onSave: (value: number, remainder: number) => Promise<void>
}) => {
    const range = item.system.bulk.quantity
    const { value, remainder, barRef, handlePointerDown } = useDragScaleBar(range)
    const leftPercentage = range > 0 ? (value / range) * 100 : 50

    return (
        <div className={`flex flex-col gap-y-4 pt-2 pb-2 text-xl text-center font-eskapade select-none ${tableBorder} border-2`}>
            {appLang.HeroSheet.Inventory.splittingStack}: {item.name}


            <div className="flex gap-x-4 px-4 text-2xl font-eskapade items-center">
                <p className={`w-12 text-center ${tableBorderRounded}`}>{value}</p>

                <div
                    ref={barRef}
                    onPointerDown={handlePointerDown}
                    className="relative flex items-center w-full h-8 touch-none"
                >
                    <Divider />
                    <div
                        className="absolute transform -translate-x-1/2 pointer-events-none"
                        style={{ left: `${leftPercentage}%` }}
                    >
                        <SplitDragHandle />
                    </div>
                </div>

                <p className={`w-12 text-center ${tableBorderRounded}`}>{remainder}</p>
            </div>

            {/* BUTTON SET */}
            <div className="flex justify-between px-4">
                <SecondaryButton onClick={onCancel}>
                    {appLang.ButtonActions.cancel}
                </SecondaryButton>
                <PrimaryButton onClick={async () => await onSave(value, remainder)}>
                    {appLang.ButtonActions.split}
                </PrimaryButton>
            </div>
        </div>
    )
}

const useDragScaleBar = (range: number) => {
    const [remainder, setRemainder] = useState(Math.ceil(range / 2))
    const [value, setValue] = useState(range - Math.ceil(range / 2))
    const barRef = useRef<HTMLDivElement>(null)

    const handlePointerDown = (e: React.PointerEvent) => {
        const bar = barRef.current
        if (!bar) return

        bar.setPointerCapture(e.pointerId)

        const updateValues = (clientX: number) => {
            const rect = bar.getBoundingClientRect()

            const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
            const rawValue = Math.round(position * range)
            const newValue = Math.max(1, Math.min(range - 1, rawValue))
            const newRemainder = range - newValue

            setValue(newValue)
            setRemainder(newRemainder)
        }

        updateValues(e.clientX)

        const handlePointerMove = (moveEvent: PointerEvent) => {
            updateValues(moveEvent.clientX)
        }

        const handlePointerUp = (upEvent: PointerEvent) => {
            if (barRef.current) {
                barRef.current.releasePointerCapture(upEvent.pointerId)
            }
            window.removeEventListener("pointermove", handlePointerMove)
            window.removeEventListener("pointerup", handlePointerUp)
        }

        window.addEventListener("pointermove", handlePointerMove)
        window.addEventListener("pointerup", handlePointerUp)
    }

    return {
        value,
        remainder,
        barRef,
        handlePointerDown
    }
}

const SplitDragHandle = () => {
    return (
        <div className="w-[6px] h-[24px] bg-current rounded-full cursor-grab" />
    )
}