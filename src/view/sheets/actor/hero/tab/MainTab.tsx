import { Shield, Star } from "lucide-react";
import HeroDataModel from "../../../../../model/actor/HeroDataModel";
import lang from "../../../../../../public/lang/en.json"
import { Header, ItemDivider } from "../../../../component/Header";
import { rollDamage, rollSkillCheck } from "../../../../../combat/dice-rolls";
import WeaponDataModel from "../../../../../model/item/equip/WeaponDataModel";
import ArmorDataModel from "../../../../../model/item/equip/ArmorDataModel";

export const MainTab = ({ hero }: { hero: HeroDataModel }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[44%_56%] my-1">
            <Skills hero={hero} />
            <div className="flex flex-col items-center mx-1 gap-y-2">
                <Attacks hero={hero} />
                <Weapons hero={hero} />
                <Armor hero={hero} />
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
            <div className="flex items-center ml-1">
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
            <ItemDivider />
        </>
    )
}

const Weapons = ({ hero }: { hero: HeroDataModel }) => {
    const equippedWeapons = hero.inventory.items.filter(it => it.isEquippedWeaponOrShield) as unknown[] as WeaponDataModel[]
    const gripStyle = "text-text-aux text-center font-eskapade"
    const dmgStyle = "text-text-dmg font-eskapade text-xl text-right line-clamp-1"
    const propsStyle = "text-text-aux text-sm italic line-clamp-1"
    return (
        <div className="w-full">
            <Header title={lang.VGLITE.HeroSheet.weapons} />
            {
                equippedWeapons.map(w => (<>
                    <div className="grid grid-cols-[55%_45%] place-content-between -gap-y-1">
                        <div className="line-clamp-1">{w.name}</div>
                        <div className="flex justify-end">
                            <div className={gripStyle + " mr-2"}>{w.grip.style}</div>
                            <div className="flex content-right">
                                <div className={dmgStyle}>{w.damage.oneHand}</div>
                                {w.damage.twoHand !== w.damage.oneHand ? <><div>&nbsp;|&nbsp;</div><div className={dmgStyle}>{w.damage.twoHand}</div></> : <></>}
                            </div>
                        </div>
                        <div className={propsStyle}>{w.properties.reduce((props, p) => { return props + p + ', ' }, '').replace(/,\s*$/, "")}</div>
                        <div className={propsStyle + " text-right mr-1"}>{w.range}</div>
                    </div>
                    <ItemDivider />
                </>))
            }
        </div>
    )
}

const Armor = ({ hero }: { hero: HeroDataModel }) => {
    const armor = hero.inventory.items.find(it => it.isEquippedArmor) as unknown as ArmorDataModel
    const propsStyle = "text-text-aux text-sm italic line-clamp-1"
    return (
        <div className="w-full">
            <Header title={lang.VGLITE.HeroSheet.armor} />
            <div className="grid grid-cols-[55%_45%] place-content-between -gap-y-1">
                <div className="line-clamp-1">{armor.name}</div>
                <div className="flex justify-end items-center">
                    <Shield className="mr-1" size={16} />
                    <div className="line-clamp-1 text-right mr-1">{armor.rating}</div>
                </div>
                <div className={propsStyle}>{armor.category}</div>
                <div className={propsStyle + " text-right mr-1"}>{armor.material}</div>
            </div>
            <ItemDivider />
        </div>
    )
}