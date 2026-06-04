import { Brain, Cross, Droplets, Flame, Skull, Snowflake, Wand, Zap } from "lucide-react"

export const DamageTypeIcon = ({ dmgType }: { dmgType: string }) => {
    switch (dmgType) {
        case 'physical': {
            return (<div></div>)
        }
        case 'blunt': {
            return (<div></div>)
        }
        case 'piercing': {
            return (<div></div>)
        }
        case 'slashing': {
            return (<div></div>)
        }
        case 'magical': {
            return (<Wand />)
        }
        case 'fire': {
            return (<Flame />)
        }
        case 'cold': {
            return (<Snowflake />)
        }
        case 'shock': {
            return (<Zap /> )
        }
        case 'acid': {
            return (<Droplets /> )
        }
        case 'necrotic': {
            return (<Skull /> )
        }
        case 'psychic': {
            return (<Brain /> )
        }
        case 'healing': {
            return (<Cross /> )
        }
    }
    return <></>
}