import { Star } from "lucide-react";
import HeroDataModel from "../../../../../model/actor/HeroDataModel";
import lang from "../../../../../../public/lang/en.json"
import { Header } from "../../../../component/Header";
import { GridRow, GridItem } from "../../../../component/Grid";
import { skillCheck } from "../../../../../combat/skillCheck";

export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="vglite-hero-sheet-main-tab">
            <GridRow>
                <GridItem lg={5} sm={5}>
                    <Skills hero={hero} />
                </GridItem>
                <GridItem lg={7} sm={7}>
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
                    <Skill key={sk} hero={hero} isTrained={hero.skills[sk].isTrained} name={lang.VGLITE.Skills[sk].name} value={hero.skills[sk].value} />
                ))
            }
        </div>
    )
}

const Skill = ({ hero, isTrained, name, value }: { hero: HeroDataModel, isTrained: boolean, name: string, value: number }) => {
    return (
        <>
            <div className="vglite-skill-row">
                <Star className={(isTrained ? 'vglite-ic-skill-trained' : 'vglite-ic-skill-untrained')} size={18} />
                <div className="vglite-skill-text" onClick={
                    async (e: React.MouseEvent<HTMLDivElement>) => {
                        skillCheck(hero.parent, name, value, e)
                    }
                }>
                    <div>{name}</div>
                    <div>{value}</div>
                </div>
            </div>
            <div className="vglite-data-row-divider" />
        </>
    )
}

const Attacks = ({ hero }: { hero: HeroDataModel }) => {
    const { melee, brawl, finesse, ranged } = hero.skills
    return (
        <div className="vglite-attacks">
            <Header title={lang.VGLITE.HeroSheet.attacks} />
            <Attack hero={hero} name={lang.VGLITE.Attacks.melee} value={melee.value!} />
            <Attack hero={hero} name={lang.VGLITE.Attacks.brawl} value={brawl.value!} />
            <Attack hero={hero} name={lang.VGLITE.Attacks.finesse} value={finesse.value!} />
            <Attack hero={hero} name={lang.VGLITE.Attacks.ranged} value={ranged.value!} />
        </div>
    )
}
const Attack = ({ hero, name, value }: { hero: HeroDataModel, name: string, value: number }) => {
    return (
        <GridRow className="vglite-attack" onClick={
            async (e: React.MouseEvent<HTMLDivElement>) => {
                skillCheck(hero.parent, name, value, e)
            }
        }>
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