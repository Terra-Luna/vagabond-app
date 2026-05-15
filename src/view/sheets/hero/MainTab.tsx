import HeroDataModel from "../../../model/actor/HeroDataModel";
import { Avatar } from "../../component/character/Avatar";
import { GridItem, GridRow } from "../../component/Grid";
import HPDisplay from "../../component/HPDisplay";

export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="vglite-container">
            <GridRow>
                <GridItem lg={6}>
                    <Avatar hero={hero} />
                </GridItem>
            </GridRow>
            <div style={{ display: 'flex', padding: "10px", paddingLeft: "20px", alignItems: 'center', position: 'relative', bottom: '12px', gap: '6px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="vglite-hp" width={24} height={24} stroke="currentColor" strokeWidth="2">
                    <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                </svg>
                <HPDisplay health={hero.health} />

                <svg xmlns="http://www.w3.org/2000/svg" className="vglite-armor" width={24} height={24} stroke="currentColor" strokeWidth="2">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
                <span className="vglite-text">{hero.armor.rating}</span>
            </div>
        </div>
    )
}