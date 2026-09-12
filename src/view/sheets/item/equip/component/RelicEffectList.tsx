import { RelicPowerProcessor } from "../../../../../apps/vagabond-tools/relic/RelicPowerProcessor"

export const RelicEffectList = ({ relicPowers, textColor }: { relicPowers: any[], textColor?: string }) => {
    return (<>
        {relicPowers && relicPowers.length > 0 && (
            <div className="flex flex-wrap gap-x-1">
                {relicPowers.map((relic: any, index: number) => (
                    <p
                        key={relic.id || index}
                        title={relic.description}
                        className={`text-xs font-paradigm font-normal italic ${textColor ?? "text-text-header-secondary"}`}
                    >
                        {RelicPowerProcessor.getFormattedRelicName(relic)}
                        {index < relicPowers.length - 1 && ","}
                    </p>
                ))}
            </div>
        )}
    </>)
}