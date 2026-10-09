
import { HeroDataModel } from "../../model/actor/HeroDataModel"
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
            <DynamicGrid itemsStart widthIncrement={4}>
                <TimeInfo />
                <Speeds />
                <Mounts />
                <WaterTravel />
            </DynamicGrid>
        </div >
    )
}

const times = [
    ["Round", "10 Seconds", "Move and take an Action"],
    ["Minute", "6 Rounds", "Fight, pick a lock"],
    ["Scene", "10 Minutes", "Search a room, a Breather"],
    ["Hour", "6 Scenes", "Burn out a torch, research"],
    ["Shift", "6 Hours", "Travel, Rest"],
    ["Day", "4 Shifts", "Recover from Fatigue"]
]

const speeds = [
    ["Climb", "Ignores Difficult Terrain due to climbing"],
    ["Cling", "As Climb, but it can also Move on ceilings."],
    ["Fly", "Can Move through the air at full Speed."],
    ["Phase", "Can Move through occupied space. Is shunted to the nearest open space and takes 5 damage if it ends its Turn in occupied space."],
    ["Swim", "Ignores Difficult Terrain due to liquid."]
]

const mounts = [
    ["Camel", "10 mi", "10g", "12 Slots"],
    ["Elephant", "8 mi", "20g", "96 Slots"],
    ["Horse, draft", "6 mi", "4g", "14 Slots"],
    ["Horse, pony", "6 mi", "3g 50s", "10 Slots"],
    ["Horse, riding", "16 mi", "7g 50s", "12 Slots"],
    ["Horse, war", "8 mi", "25g", "16 Slots"],
    ["Mule", "6 mi", "3g ", "11 Slots"]
]

const water = [
    ["Canoe", "12 mi", "5g", "5 Slots"],
    ["Caravel", "30 mi", "1000g", "1000 Slots"],
    ["Galley", "24 mi", "3000g", "3000 Slots"],
    ["Keelboat", "6 mi", "300g", "300 Slots"],
    ["Longship", "30 mi", "1000g", "1000 Slots"],
    ["Rowboat", "6 mi", "5g", "30 Slots"],
    ["Sailboat", "30 mi", "1000g", "1000 Slots"],
    ["Warship", "24 mi", "2500g", "2500 Slots"],
]

const travelSpeed = [
    ["Slow", "x0.5", "Add a d6, use two highest"],
    ["Normal", "x1", "Normal"],
    ["Fast", "x2", "Add a d6, use two lowest"]
]

const sectionCss = "flex flex-col gap-2 px-2 mt-2"

const TravelSection = ({ children }) => <div className={sectionCss}>{children}</div>

const WaterTravel = () => {
    return (
        <TravelSection>
            <Header title="Water Travel" />
            <Table headers={["Vessel", "Travel Speed (mi/shift)", "Cost", "Capacity"]} data={water} />
        </TravelSection>
    )
}

const Mounts = () => {
    return (
        <TravelSection>
            <Header title="Riding Animals" />
            <Table headers={["Beast", "Travel Speed", "Cost", "Capacity"]} data={mounts} />
        </TravelSection>
    )
}

const TimeInfo = () => {
    return (
        <TravelSection>
            <Header title="Measuring Time" />
            <Table headers={["Term", "Time (approx)", "Example Task"]} data={times} />
        </TravelSection>
    )
}

const Speeds = () => {
    return (
        <TravelSection>
            <Header title="Movement Speeds" />
            <Table headers={["Term", "Description"]} data={speeds} />
        </TravelSection>
    )
}

const TravelSpeed = ({ actor }) => {
    return (
        <div>
            <div>
                Your Travel Speed is equal to <span className="text-ic-luck">{actor.system.speed.travel}</span> (your Speed ÷
                5). A Group uses the Navigator's Speed. Your
                Pace multiplies the distance you Move that
                Shift by the Multiplier (Mult.).
            </div>
            <Table headers={["Pace", "Mult.", "Complication Roll"]} data={travelSpeed} />
        </div>
    )
}

const Table = ({ headers, data }: { headers: string[], data: string[][] }) => {
    return (
        <table className={`table-fixed w-full ${tableBorder} mt-2`}>
            <thead className="bg-section-header-fill text-text-section-header text-sm">
                <tr>
                    <th className="text-left pl-2 w-1/10">{headers[0]}</th>
                    {headers.slice(1).map(h => <th className="text-center">{h}</th>)}
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

                        {d.slice(1).map(item =>
                            <td className="text-center font-normal">
                                {item}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}