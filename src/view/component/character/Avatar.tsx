import { useContext } from "react";
import HeroDataModel from "../../../model/actor/HeroDataModel"
import { ActorSheetContext } from "../../sheets/VagabondLiteActorSheet";
import { useSmallAndLarge } from "../../hooks";

export const Avatar = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="vglite-row">
            <img className={"vglite-thumbnail " + useSmallAndLarge({ lg: 6, sm: 12 })} src="icons/svg/mystery-man.svg" alt={hero.parent.name} style={{ backgroundColor: 'black' }} />
            <div className={useSmallAndLarge({ lg: 3, sm: 6 })}>Other content</div>
            <div className={useSmallAndLarge({ lg: 3, sm: 6 })}>Even more content</div>
        </div>
    );
}