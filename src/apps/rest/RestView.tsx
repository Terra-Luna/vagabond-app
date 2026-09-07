import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { tableBorder } from "../../view/common/border-styles"
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { Header } from "../../view/component/Header"

export const LodgingTypes = {
    horrible: 1,
    poor: 2,
    modest: 10,
    comfortable: 20,
    luxury: 40,
    opulent: 100,
} as const

export const isRation = (item) => item.name === "Ration" || item.name === "Rations" || item.system.isRation

export const RestView = ({ onCancel, rest, breather, actor }: {
    onCancel: () => void,
    rest: (lodging: keyof typeof LodgingTypes) => void,
    breather: () => void,
    actor: Actor & { system: HeroDataModel }
}) => {
    const allRations = actor.items.filter(isRation)
    const rationItem = allRations[0]
    const numRations = allRations.reduce((sum, it) => sum + ((it.system as any).bulk?.quantity ?? 1), 0)

    return (
        <div className="grid grid-cols-2">
            <div className="p-2">
                <Header title="Breather"></Header>
                <div className={`${tableBorder} text-lg text-center border-t-0`}>
                    Once per shift, eat a ration and drink some water to regain
                    <span className="text-ic-luck"> {actor.system.stats.might} </span>
                    (your MIT) HP.

                    <div>
                        {rationItem ? (
                            <Ration rationItem={rationItem} numRations={numRations} />
                        ) : (
                            <></>
                        )}
                    </div>
                    <div className="flex justify-center py-2">
                        <PrimaryButton onClick={breather}>
                            Take a Breather
                        </PrimaryButton>
                    </div>
                </div>
            </div>
            <div className="">Rest</div>
        </div >
    )
}

const Ration = ({ rationItem, numRations }) => {
    return <div className="flex p-2 text-4xl justify-center items-center">
        <img className="opacity-50" src={rationItem.img} width={64} height={64} />
        <div className="relative right-[40px]">
            {numRations}
        </div>
        <div className="text-ic-hp">-1</div>
    </div>
}