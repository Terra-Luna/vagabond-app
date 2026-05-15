import HeroDataModel from "../../../model/actor/HeroDataModel";
import { Avatar } from "../../component/character/Avatar";

export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return <Avatar hero={hero} />
}