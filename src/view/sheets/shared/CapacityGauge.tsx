import { Gauge } from "../../component/Gauge"

const infoBoxLayout = "items-center bg-wealth-fill/50 border border-solid border-table-border w-full py-1"
const infoBoxText = "text-text-encumbrance text-sm"

export interface CapacityInfo {
    bulk: number, capacity: number, isOverEncumbered: boolean
}

export const CapacityGauge = ({ label, capacityInfo }: { label: string, capacityInfo: CapacityInfo }) => {
    return (
        <div className={infoBoxLayout + " px-2 " + infoBoxText}>
            <div className="flex justify-between mb-1">
            {label}
                <span className="text-sm">
                {capacityInfo.bulk} / {capacityInfo.capacity}
                </span>
            </div>
            <div className="flex w-full">
                <Gauge
                    value={capacityInfo.bulk}
                    max={capacityInfo.capacity}
                    fillColorClassName="bg-text-encumbrance"
                    maxColorClassName="bg-destructive-action"
                />
            </div>
        </div>
    )
}