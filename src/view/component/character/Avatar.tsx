import HeroDataModel from "../../../model/actor/HeroDataModel"

export const Avatar = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <img className="vglite-thumbnail" src="icons/svg/mystery-man.svg" alt={hero.parent.name} />
    );
}