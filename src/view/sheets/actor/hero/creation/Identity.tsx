import HeroDataModel from "../../../../../model/actor/HeroDataModel"
import { Header } from "../../../../component/Header"
import lang from "../../../../../../public/lang/en.json" // todo correct language import

const locale = lang.VGLITE.HeroSheet;

export const Identity = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div style={{ display: 'flex' }}>
            <div></div>
            <Header title={locale.Identity}></Header>
        </div>
    )
}