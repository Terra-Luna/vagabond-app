import HeroDataModel from "../../../model/actor/HeroDataModel";
import { Avatar } from "../../component/character/Avatar";
import { GridItem, GridRow } from "../../component/Grid";

export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <GridRow>
            <GridItem style={{ backgroundColor: "black" }} lg={6}>
                <Avatar hero={hero} />
            </GridItem>
        </GridRow>
    )
}