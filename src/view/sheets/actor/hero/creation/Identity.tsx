import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { Header } from "../../../../component/Header"

const locale = lang.VGLITE.HeroSheet;

export const Identity = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div style={{ display: 'flex' }}>
            <div></div>
            <Header title={locale.Identity}></Header>
        </div>
    )
}