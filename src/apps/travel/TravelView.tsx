
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../utils/lang"
import { localizeString } from "../../utils/localeUtils"
import { tableBorder } from "../../view/common/border-styles"
import { DynamicGrid } from "../../view/component/DynamicGrid"
import { Header } from "../../view/component/Header"

export const TravelView = ({ onCancel, actor }: {
    onCancel: () => void,
    actor: Actor & { system: HeroDataModel }
}) => {

    return (
        <div className="flex flex-col h-full p-2 gap-8 overflow-y-scroll w-full">
            <TravelSpeed actor={actor} />
            <DynamicGrid itemsStart widthIncrement={3}>
                <TimeInfo />
                <Speeds />
            </DynamicGrid>
            <DynamicGrid itemsStart widthIncrement={3}>
                <Mounts />
                <WaterTravel />
            </DynamicGrid>
        </div >
    )
}

const sectionCss = "flex flex-col px-2 mt-2"

const TravelSection = ({ children }) => <div className={sectionCss}>{children}</div>

const WaterTravel = () => {
    return (
        <TravelSection>
            <Header title={appLang.Travel.waterTravel} />
            <Table headers={[appLang.Travel.headers.vessel, appLang.Travel.headers.travelSpeedPerShift, appLang.Travel.headers.cost, appLang.Travel.headers.capacity]} data={appLang.Travel.watercraft} />
        </TravelSection>
    )
}

const Mounts = () => {
    return (
        <TravelSection>
            <Header title={appLang.Travel.ridingAnimals} />
            <Table headers={[appLang.Travel.headers.beast, appLang.Travel.headers.travelSpeed, appLang.Travel.headers.cost, appLang.Travel.headers.capacity]} data={appLang.Travel.mounts} />
        </TravelSection>
    )
}

const TimeInfo = () => {
    return (
        <TravelSection>
            <Header title={appLang.Travel.measuringTime} />
            <Table headers={[appLang.Travel.headers.term, appLang.Travel.headers.approximateTime, appLang.Travel.headers.exampleTask]} data={appLang.Travel.times} />
        </TravelSection>
    )
}

const Speeds = () => {
    return (
        <TravelSection>
            <Header title={appLang.Travel.movementSpeeds} />
            <Table headers={[appLang.Travel.headers.term, appLang.Travel.headers.description]} data={appLang.Travel.speeds} />
        </TravelSection>
    )
}

const TravelSpeed = ({ actor }) => {
    return (
        <div className="px-2">
            <div>
                {localizeString(appLang.Travel.travelSpeedDescription, { speed: actor.system.speed.travel.toString() })}
            </div>
            <div className="max-w-[300px]">
                <Table headers={[appLang.Travel.headers.pace, appLang.Travel.headers.multiplier]} data={appLang.Travel.travelPaces} />
            </div>
        </div>
    )
}

const Table = ({ headers, data }: { headers: string[], data: string[][] }) => {
    return (
        <table className={`table-fixed w-full ${tableBorder} mt-2`}>
            <thead className="bg-section-header-fill text-text-section-header text-sm">
                <tr>
                    <th className="text-left pl-2 w-1/10">{headers[0]}</th>
                    {headers.slice(1).map(h => <th key={h} className="text-center">{h}</th>)}
                </tr>
            </thead>
            <tbody className="font-eskapade">
                {data.map(d => (
                    <tr
                        key={`time-${d[0]}`}
                        className={
                            `even:bg-table-row-even/50 odd:bg-table-row-odd/50 hover-glow draggable`
                        }
                    >
                        <td className="p-1">
                            {d[0]}
                        </td>

                        {d.slice(1).map((item) =>
                            <td key={item} className="text-center font-normal">
                                {item}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}