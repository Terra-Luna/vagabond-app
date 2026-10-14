import { useState } from "react"

import { SkillCheckResult } from "../../combat/engine/roll/SkillCheck"
import { Table } from "../../combat/ui/Table"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../utils/lang"
import { localizeString } from "../../utils/localeUtils"
import { CollapsibleSection } from "../../view/component/Collapsible"
import { DiceRollEnrichedText } from "../../view/component/DiceRollEnrichedText"
import { DynamicGrid } from "../../view/component/DynamicGrid"
import { Header } from "../../view/component/Header"
import { SkillCheckEnrichedText } from "../../view/component/SkillCheckEnrichedText"
import { Studied } from "../../view/sheets/actor/hero/tab/TopSection"

const locale = appLang.Downtime

const sectionCss = "flex flex-col px-2 gap-2"
const textCss = "py-2 whitespace-pre-line"

const Section = ({ children }) => <div className={sectionCss}>{children}</div>

export const DowntimeView = ({ onCancel, actor }: {
    onCancel: () => void,
    actor: Actor & { system: HeroDataModel }
}) => {

    return (
        <div className="flex flex-col h-full p-2 gap-4 overflow-y-auto w-full">
            {locale.subtitle}
            <DynamicGrid itemsStart widthIncrement={2}>
                <div className="flex-1 flex flex-col min-w-[50%] gap-2">
                    <Craft actor={actor} />
                    <Foraging actor={actor} />
                </div>
                <div className="flex-1 flex flex-col min-w-[50%] gap-2">
                    <Hunting actor={actor} />
                    <Study actor={actor} />
                </div>
            </DynamicGrid>
        </div>
    )
}

const getHighlightedCraftingRow = (craftSkill) => {
    switch (craftSkill) {
        case 18:
        case 17:
            return 0;
        case 16:
        case 15:
            return 1;
        case 14:
        case 13:
            return 2;
        case 12:
        case 11:
            return 3;
        case 10:
        case 9:
            return 4;
        case 8:
        case 7:
            return 5;
        case 6:
            return 6;
        default:
            return undefined;
    }
}

const Craft = ({ actor }) => {
    const craftSkill = actor.system.skills.craft.value

    return (
        <Section>
            <Header title={locale.Craft.title} />
            <CollapsibleSection startCollapsed useClearHeader title={locale.Craft.craftingInfo} content={
                <div className="px-4">
                    <div className={textCss}>{locale.Craft.body}</div>
                    <div className={textCss}>{locale.Craft.scrap}</div>
                </div>

            } />
            {localizeString(locale.Craft.yourDC, { dc: craftSkill })}
            <Table headers={locale.Craft.tableHeaders} data={locale.Craft.table} highlightedRow={getHighlightedCraftingRow(craftSkill)} />
        </Section>
    )
}

const Foraging = ({ actor }) => {
    return (
        <Section>
            <Header title={locale.Foraging.title} />
            <div className={textCss}>
                <SkillCheckEnrichedText actor={actor} content={locale.Foraging.body} /><br />
                <DiceRollEnrichedText actor={actor} content={locale.Foraging.rations + " " + locale.Foraging.rationsExplainer} />
                <DiceRollEnrichedText actor={actor} content={locale.Foraging.materials + " " + locale.Foraging.materialsExplainer} />
            </div>
        </Section>
    )
}

const Hunting = ({ actor }) => {
    const [rollResult, setRollResult] = useState<SkillCheckResult | Roll>()
    const wildGameResult = (rollResult instanceof Roll) ? rollResult : undefined
    return (
        <Section>
            <Header title={locale.Hunting.title} />
            <SkillCheckEnrichedText content={locale.Hunting.body} actor={actor} setRollResult={setRollResult} />
            <CollapsibleSection startCollapsed useClearHeader title={locale.Hunting.huntingInfo} content={
                <div className="px-4">
                    {locale.Hunting.additionalInfo}<br /><br />
                    <b>{locale.Hunting.rations}</b> {locale.Hunting.rationsExplainer}<br />
                    <b>{locale.Hunting.materials}</b> {locale.Hunting.materialsExplainer}
                </div>
            } />
            <Table headers={locale.Hunting.tableHeaders} data={locale.Hunting.table} highlightedRow={wildGameResult ? parseInt(wildGameResult.result) - 1 : undefined} />
        </Section>
    )
}

const Study = ({ actor }) => {
    return (
        <Section>
            <Header title={locale.Study.title} />
            <div className={textCss}>
                {locale.Study.body}
            </div>

            <Studied hero={actor.system} />
        </Section>
    )
}