import { Star } from "lucide-react";
import HeroDataModel from "../../../../../model/actor/HeroDataModel";
import lang from "../../../../../../public/lang/en.json"
import { Header } from "../../../../component/Header";
import { rollDamage, rollSkillCheck } from "../../../../../combat/dice-rolls";

export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="vglite-hero-sheet-main-tab">
            <div>
                <div lg={5} sm={5}>
                    <Skills hero={hero} />
                </div>
                <div lg={7} sm={7}>
                    <Attacks hero={hero} />
                </div>
            </div>
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
                        rollSkillCheck(hero.parent, name, value, e)
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
        <div className="vglite-attack" onClick={
            async (e: React.MouseEvent<HTMLDivElement>) => {
                await rollSkillCheck(hero.parent, name, value, e)
                await rollDamage(hero.parent, '6d6', '2d4', 10, 1, true, [1,2,5,6])
                await rollDamage(hero.parent, '6d8', '0', 0, 2)
            }
        }>
            <div className="attack-value">
                <span>{value}</span>
            </div>
            <div className="attack-name">
                {name}
            </div>
        </div>
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