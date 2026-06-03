import { Star } from "lucide-react";
import HeroDataModel from "../../../../../model/actor/HeroDataModel";
import lang from "../../../../../../public/lang/en.json"
import { Header } from "../../../../component/Header";
import { rollDamage, rollSkillCheck } from "../../../../../combat/dice-rolls";

export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 ml-1 mt-1 gap-1">
            <div className="">
                <Skills hero={hero} />
            </div>
            <div className="flex flex-col items-center mx-1 gap-y-2">
                <Attacks hero={hero} />
            </div>
        </div>
    )
}

const Skills = ({ hero }: { hero: HeroDataModel }) => {
    const skills = ['arcana', 'brawl', 'craft', 'detect', 'finesse', 'influence', 'leadership', 'medicine', 'mysticism', 'performance', 'sneak', 'survival']
    return (
        <div>
            <Header title={lang.VGLITE.HeroSheet.skills} />
            {
                skills.map(sk => (                    
                    <Skill key={sk} hero={hero} isTrained={hero.skills[sk].isTrained} name={lang.VGLITE.Skills[sk].name} value={hero.skills[sk].value} isAttack={false} />
                ))
            }
        </div>
    )
}

const Attacks = ({ hero }: { hero: HeroDataModel }) => {
    const { melee, brawl, finesse, ranged } = hero.skills
    return (
        <div className="w-full">
            <Header title={lang.VGLITE.HeroSheet.attacks} />
            <Skill hero={hero} name={lang.VGLITE.Attacks.melee} value={melee.value!} isTrained={melee.isTrained} isAttack={true} />
            <Skill hero={hero} name={lang.VGLITE.Attacks.brawl} value={brawl.value!} isTrained={brawl.isTrained} isAttack={true} />
            <Skill hero={hero} name={lang.VGLITE.Attacks.finesse} value={finesse.value!} isTrained={finesse.isTrained} isAttack={true} />
            <Skill hero={hero} name={lang.VGLITE.Attacks.ranged} value={ranged.value!} isTrained={ranged.isTrained} isAttack={true} />
        </div>
    )
}

const Skill = ({ hero, isTrained, name, value, isAttack }: { hero: HeroDataModel, isTrained: boolean, name: string, value: number, isAttack: boolean }) => {
    return (
        <>
            <div className="flex items-center">
                <Star className={(isTrained ? 'text-ic-skill-trained fill-ic-skill-trained' : 'text-ic-skill-untrained')} size={18} />
                <div className="flex justify-between ml-2 mt-1 w-full font-eskapade font-bold align-middle cursor-pointer" onClick={
                    async (e: React.MouseEvent<HTMLDivElement>) => {
                        rollSkillCheck(hero.parent, name, value, e)
                        if (isAttack) {
                            rollDamage(hero.parent, '8d8', '2d4', 1, 1, true, [1,2,7,8])
                        }
                    }
                }>
                    <div>{name}</div>
                    <div className={(isAttack ? 'bg-section-header-fill font-bold text-xl text-text-section-header w-1/5 text-center flex items-center justify-center': 'text-xl mr-2')}>{value}</div>
                </div>
            </div>
            <div className="h-px bg-skill-divider w-full" />
        </>
    )
}

const Weapons = ({ hero }: { hero: HeroDataModel }) => {
    let equippedWeapons = () => {
        return hero.inventory.items.filter(it => it.isEquipped && it.category === "Weapon")
    }
    return (
        <div>

        </div>
    )
}

const Armor = ({ hero }: { hero: HeroDataModel }) => {
    let armor = () => {
        return hero.inventory.items.filter(it => it.isEquipped && it.category === "Armor")
    }
    return (
        <div>

        </div>
    )
}