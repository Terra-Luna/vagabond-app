import { VGLITE as locale } from "../../../../../../public/lang/en.json"
import { Shield } from "lucide-react"
import { useCallback } from "react"
import AdversaryDataModel from "../../../../../model/actor/AdversaryDataModel"
import { updateDocument } from "../../../../../utils/documentUtils"
import { EditableTextField } from "../../../../component/EditableTextField"
import { glowOnHover } from "../../../VgLiteSheet"

export const HPArmorHUD = ({ adv, isEditMode }: { adv: AdversaryDataModel, isEditMode: boolean }) => {
    const headerStyle = "text-xs font-paradigm"
    const hp = adv.health.current
    const statLabelStyle = `text-sm text-text-primary font-paradigm font-normal`

    const incrementHP = useCallback((auxClick: boolean) => {
        updateDocument(adv.parent, { health: { current: (hp??0) + (auxClick ? 1 : -1) }})
    }, [hp])

    return (
        <div className="text-center space-y-4 mt-0.5">
            {/* THREAT LEVEL */}
            <div className="flex space-x-2 text-text-primary justify-center content-center w-full mx-auto">
                <p className={`${headerStyle} content-center`}>{locale.AdversarySheet.tl}</p>
                <div className={`text-lg text-stat-block-fill font-eskapade font-bold`}>
                    <EditableTextField
                        boundValue={adv.threatLevelOverride?.toString() ?? adv.threatLevel?.toString() ?? ''}
                        updateProps={{ object: adv.parent, path: ['threatLevelOverride'] }}
                        placeholder={adv.threatLevel?.toString() ?? '1.00'}
                        isGlobalEditMode={isEditMode}
                    />
                </div>
            </div>

            {/* HIT DICE */}
            <div className="text-text-primary justify-center content-center w-full mx-auto mt-4">
                <p className={headerStyle}>{locale.AdversarySheet.hd}</p>
                <div className={`text-3xl text-stat-block-fill font-eskapade font-bold mx-4`}>
                    <EditableTextField
                        boundValue={adv.hitDice?.toString() ?? '1'}
                        updateProps={{ object: adv.parent, path: ['hitDice'] }}
                        placeholder="1"
                        isGlobalEditMode={isEditMode}
                    />
                </div>
            </div>
            
            {/* HP CURRENT / MAX */}
            <div className="text-text-primary w-full">
                <p className={`${headerStyle} ${glowOnHover}`} onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}>
                    {locale.AdversarySheet.hp}
                </p>
                <div className="flex font-eskapade font-bold w-full justify-center">
                    <div className={`text-text-hp-current text-3xl min-w-[3ch] ${glowOnHover}`}>
                        <EditableTextField
                            boundValue={adv.health.current?.toString() ?? ''}
                            updateProps={{ object: adv.parent, path: ['health', 'current'] }}
                            placeholder="0"
                            hideBorderOnEditMode={true}
                        />
                    </div>
                    <p className="text-text-primary text-5xl font-normal">/</p>
                    <p className={`text-text-hp-max text-xl mt-3 ${glowOnHover}`} onClick={() => incrementHP(false)} onAuxClick={() => incrementHP(true)}>
                        {adv.health.max}
                    </p>
                </div>
            </div>

            {/* ARMOR RATING & INFO */}
            <div className="text-text-primary w-full justify-center">
                <p className={headerStyle}>{locale.AdversarySheet.armor}</p>
                <div className="relative w-[52px] h-[52px] mx-auto">
                    <Shield className="w-full h-full text-ic-armor-border fill-ic-armor-fill" strokeWidth={1} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-4xl text-text-armor font-eskapade font-bold`}>
                            <EditableTextField
                                boundValue={adv.armor.rating?.toString() ?? ''}
                                updateProps={{ object: adv.parent, path: ['armor', 'rating'] }}
                                placeholder="0"
                                isGlobalEditMode={isEditMode}
                            />
                        </div>
                    </div>
                    <p className={`absolute bottom-0 -right-1.5 ${statLabelStyle}`}>{locale.AdversarySheet.as}</p>
                </div>
            </div>
            <div className="flex w-full justify-center -mt-4">
                <div className={`content-center`}>
                    <EditableTextField
                        boundValue={adv.armor.as ?? 'Unarmored'}
                        updateProps={{ object: adv.parent, path: ['armor', 'as'] }}
                        placeholder="Unarmored"
                        isGlobalEditMode={isEditMode}
                    />
                </div>
            </div>
        </div>
    )
}