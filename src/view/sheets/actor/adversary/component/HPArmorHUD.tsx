import { Shield } from "lucide-react"
import { useCallback } from "react"
import { AdversaryDataModel } from "../../../../../model/actor/AdversaryDataModel"
import { updateDocument } from "../../../../../utils/documentUtils"
import { EditableTextField } from "../../../../component/EditableTextField"
import { glowOnHover } from "../../../../common/text-styles"
import { vgLiteLang as locale } from "../../../../../utils/lang"

export const HPArmorHUD = ({ adv }: { adv: AdversaryDataModel }) => {
    const headerStyle = "text-sm font-eskapade text-text-header-secondary"
    const hp = adv.health.current

    const incrementHP = useCallback((auxClick: boolean) => {
        updateDocument(adv.parent, { health: { current: (hp ?? 0) + (auxClick ? 1 : -1) } })
    }, [hp])

    return (
        <div className="space-y-4 mt-0.5">
            <div>
                {/* THREAT LEVEL */}
                <div className="flex space-x-2 text-text-primary content-center">
                    <p className={`${headerStyle} content-center`}>{locale.AdversarySheet.tl}</p>
                    <div className={`text-lg text-text-header-primary font-eskapade font-bold`}>
                        <EditableTextField
                            boundValue={adv.threatLevelOverride?.toString() ?? adv.threatLevel?.toString() ?? ''}
                            updateProps={{ object: adv.parent, path: ['threatLevelOverride'] }}
                            placeholder={adv.threatLevel?.toString() ?? '1.00'}
                        />
                    </div>
                </div>

                {/* HIT DICE */}
                <div className="flex space-x-2 text-text-primary content-center">
                    <p className={`${headerStyle} content-center`}>{locale.AdversarySheet.hd}</p>
                    <div className={`text-lg text-text-header-primary font-eskapade font-bold`}>
                        <EditableTextField
                            boundValue={adv.hitDice?.toString() ?? '1'}
                            updateProps={{ object: adv.parent, path: ['hitDice'] }}
                            placeholder="1"
                        />
                    </div>
                </div>
            </div>

            {/* HP CURRENT / MAX */}
            <div>
                <p className={`${headerStyle} ${glowOnHover} line-clamp-1 min-w-[12ch]`} onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}>
                    {locale.AdversarySheet.hp}
                </p>
                <div className="flex font-eskapade font-bold">
                    <div className={`text-text-hp-current text-4xl text-right ${glowOnHover}`}>
                        <EditableTextField
                            boundValue={adv.health.current?.toString() ?? ''}
                            updateProps={{ object: adv.parent, path: ['health', 'current'] }}
                            placeholder="0"
                            hideBorderOnEditMode={true}
                        />
                    </div>
                    <p className="text-text-primary text-5xl font-normal">/</p>
                    <p className={`text-text-hp-max text-3xl mt-3 ${glowOnHover}`} onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}>
                        {adv.health.max}
                    </p>
                </div>
            </div>

            {/* ARMOR RATING & INFO */}
            <div className="text-text-primary w-full justify-center mr-6">
                <p className={headerStyle}>{locale.AdversarySheet.armor}</p>
                <div className="relative w-[52px] h-[52px]">
                    <Shield className="w-full h-full text-ic-armor-border fill-ic-armor-fill" strokeWidth={1} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-4xl text-text-armor font-eskapade font-bold`}>
                            <EditableTextField
                                boundValue={adv.armor.rating?.toString() ?? ''}
                                updateProps={{ object: adv.parent, path: ['armor', 'rating'] }}
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <p className={`absolute bottom-0 -right-1.5 text-sm text-text-primary font-paradigm font-normal`}>{locale.AdversarySheet.as}</p>
                </div>
            </div>
            <div className="flex pl-1 -mt-4">
                <div className="font-eskapade">
                    <EditableTextField
                        boundValue={adv.armor.as ?? 'Unarmored'}
                        updateProps={{ object: adv.parent, path: ['armor', 'as'] }}
                        placeholder="Unarmored"
                    />
                </div>
            </div>
        </div>
    )
}