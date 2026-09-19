
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { tableBorder } from "../../view/common/border-styles"
import { Header } from "../../view/component/Header"

export const TravelView = ({ onCancel, actor }: {
    onCancel: () => void,
    actor: Actor & { system: HeroDataModel }
}) => {

    return (
        <div className="flex flex-col h-full p-2 gap-4 overflow-y-scroll">
            <TimeInfo />
            <Speeds />
        </div>
    )
}

const times = [
    ["Minute", "6 Rounds", "Fight, pick a lock"],
    ["Scene", "10 Minutes", "Search a room, take a Breather"],
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
    ["Camel", "10mi", "10g", "12 Slots"],
    ["Elephant", "8mi", "20g", "96 Slots"],
    ["Horse, draft", "6mi", "4g", "14 Slots"],
    ["Horse, pony", "6mi", "3g 50s", "10 Slots"],
    ["Horse, riding", "16 mi", "7g 50s", "12 Slots"],
    ["Horse, war", "8 mi", "25g", "16 Slots"],
    ["Mule", "6 mi", "3g ", "11 Slots"]
]

const TimeInfo = () => {
    return (
        <div>
            <Header title="Measuring Time" />
            <Table headers={["Term", "Time (approx)", "Example Task"]} data={times} />
        </div>
    )
}

const Speeds = () => {
    return (
        <div>
            <Header title="Movement Speeds" />
            <Table headers={["Term", "Description"]} data={speeds} />
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