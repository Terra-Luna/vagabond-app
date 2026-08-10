/* eslint-disable react-refresh/only-export-components */
import { CountdownRoll } from "../../combat/engine/CountdownRoll"
import { DiceRollComponent } from "../../view/chat/component/DiceRollComponent"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"

export class CountdownApp extends VagabondApplication {

    initialDuration: number
    countdown: CountdownRoll

    constructor(label: string, duration: number) {
        super({
            enforceSingleInstance: false,
            window: {
                frame: true,
                resizable: false,
                minimizable: false
            },
            position: {
                width: 60,
                height: 60,
                left: 200,
                top: 200
            },
            Component: CountdownAppView,
        } as VagabondAppArgs)

        this.initialDuration = duration
        this.countdown = new CountdownRoll({ name: label, duration: duration })
    }

    private onRoll = async () => {
        const result = await this.countdown.roll()
        if (result.duration === 0) {
            this.close()
        }
        else {
            this.countdown = new CountdownRoll(result)
            this.render({ force: false })
        }
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            duration: this.countdown.result.duration ?? this.initialDuration,
            rollCountdown: () => this.onRoll()
        }
    }

}

const CountdownAppView = ({ duration, rollCountdown }) => {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center bg-transparent m-auto select-none">
            <button
                title="Click to trigger countdown"
                className="cursor-pointer hover-glow pointer-events-auto transition-transform active:scale-95"
                onClick={() => rollCountdown()}
            >
                <DiceRollComponent faces={duration} result={duration} />
            </button>
        </div>
    )
}
