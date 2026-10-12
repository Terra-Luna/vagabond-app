
import { Table } from "../../combat/ui/Table"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../utils/lang"
import { localizeString } from "../../utils/localeUtils"
import { DynamicGrid } from "../../view/component/DynamicGrid"
import { Header } from "../../view/component/Header"

export const TravelView = ({ actor }: {
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

const sectionCss = "flex flex-col px-2"

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
        <div className="flex flex-col justify-center text-center px-2 w-full">
            <div className="w-3/4 mx-auto mb-2">
                {localizeString(appLang.Travel.travelSpeedDescription, { speed: actor.system.speed.travel.toString() })}
            </div>
            <div className="max-w-[300px] mx-auto">
                <Table headers={[appLang.Travel.headers.pace, appLang.Travel.headers.multiplier]} data={appLang.Travel.travelPaces} />
            </div>
        </div>
    )
}

