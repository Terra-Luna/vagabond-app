import { RelicPowerProcessor } from "../../../../../apps/vagabond-tools/relic/RelicPowerProcessor"
import { appLang } from "../../../../../utils/lang"
import { Tooltip } from "../../../../component/Tooltip"

export const RelicEffectList = ({ relicPowers, textColor }: { relicPowers: any[], textColor?: string }) => {
    return (<div>
        {relicPowers && relicPowers.length > 0 && (
            <div className="flex flex-wrap gap-x-1">
                {relicPowers.map((relic: any, index: number) => {
                    const isProtection = ['protection-niche', 'protection-specific', 'protection-general'].includes(relic.id)
                    const typedLabel = isProtection ? 'Protection' : 'Bane'
                    const isNiche = RelicPowerProcessor.isNiche(relic)
                    const chosenTypes = ((RelicPowerProcessor.hasBeingTypeChoice(relic) || isNiche) ? (relic.power?.beingTypes ?? []) : []).filter(Boolean) as string[]
                    const typeNames = RelicPowerProcessor.usesBeingSubtype(relic) ? appLang.BeingSubtypes : appLang.BeingTypes
                    const resistType = RelicPowerProcessor.isResistance(relic) ? relic.power?.damageType : undefined
                    const name = resistType
                        ? `Resistance (${appLang.DamageTypes[resistType] ?? resistType})`
                        : chosenTypes.length > 0
                        ? `${typedLabel} (${chosenTypes.map(type => isNiche ? type : (typeNames[type] ?? type)).join(", ")})`
                        : RelicPowerProcessor.getFormattedRelicName(relic)
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