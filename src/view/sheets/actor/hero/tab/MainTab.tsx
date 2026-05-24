import HeroDataModel from "../../../../../model/actor/HeroDataModel";
import lang from "../../../../../../public/lang/en.json"
import { Header } from "../../../../component/Header";
import { GridRow, GridItem } from "../../../../component/Grid";

export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="vglite-hero-sheet-main-tab">
            <GridRow>
                <GridItem lg={6} sm={6}>
                    <Skills hero={hero} />
                </GridItem>
                <GridItem lg={6} sm={6}>
                    <Attacks hero={hero} />
                </GridItem>
            </GridRow>
        </div>
    )
}

const Skills = ({ hero }: { hero: HeroDataModel }) => {
    const skills = ['arcana', 'brawl', 'craft', 'detect', 'finesse', 'influence', 'leadership', 'medicine', 'mysticism', 'performance', 'sneak', 'survival']
    return (
        <div className="vglite-skills">
            <Header title={lang.VGLITE.HeroSheet.skills} />
            {
                skills.map(sk => (
                    <span>{lang.VGLITE.Skills[sk].name}: {hero.skills[sk].value}{hero.skills[sk].isTrained ? '*' : ''}<br></br></span>
                ))
            }
        </div>
    )
}

const Attacks = ({ hero }: { hero: HeroDataModel }) => {
    const { melee, brawl, finesse, ranged } = hero.skills
    return (
        <div className="vglite-attacks">
            <Header title={lang.VGLITE.HeroSheet.attacks} />
            <Attack name={lang.VGLITE.Attacks.melee} value={melee.value!} />
            <Attack name={lang.VGLITE.Attacks.brawl} value={brawl.value!} />
            <Attack name={lang.VGLITE.Attacks.finesse} value={finesse.value!} />
            <Attack name={lang.VGLITE.Attacks.ranged} value={ranged.value!} />
        </div>
    )
}
const Attack = ({ name, value }: { name: string, value: number }) => {
    return (
        <GridRow className="vglite-attack">
            <GridItem lg={4} sm={3} className="attack-value">
                <span>{value}</span>
            </GridItem>
            <GridItem lg={9} sm={9} className="attack-name">
                {name}
            </GridItem>
        </GridRow>
    )
}

const Weapons = ({ hero }: { hero: HeroDataModel }) => {
    let equippedWeapons = () => {
        return hero.inventory.container.items.filter(it => it.isEquipped && it.category === "Weapon")
    }
    return (
        <div>

        </div>
    )
}

const Armor = ({ hero }: { hero: HeroDataModel }) => {
    let armor = () => {
        return hero.inventory.container.items.filter(it => it.isEquipped && it.category === "Armor")
    }
    return (
        <div>

        </div>
    )
}