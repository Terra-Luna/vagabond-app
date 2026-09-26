import { RelicPowerProcessor } from "../../../../../apps/vagabond-tools/relic/RelicPowerProcessor"
import { Tooltip } from "../../../../component/Tooltip"

export const RelicEffectList = ({ relicPowers, textColor }: { relicPowers: any[], textColor?: string }) => {
    return (<div>
        {relicPowers && relicPowers.length > 0 && (
            <div className="flex flex-wrap gap-x-1">
                {relicPowers.map((relic: any, index: number) => {
                    const name = RelicPowerProcessor.getFormattedRelicName(relic)
                    return (
                        <Tooltip key={index} title={name} content={relic.description}>
                            <p className={`text-xs font-paradigm font-normal italic ${textColor ?? "text-text-header-secondary"}`}>
                                {name}
                                {index < relicPowers.length - 1 && ","}
                            </p>
                        </Tooltip>
                    )
                })}
            </div>
        )}
    </div>)
}