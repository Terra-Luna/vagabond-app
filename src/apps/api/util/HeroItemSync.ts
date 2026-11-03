import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { sys_id } from "../../../util/foundry-util"
import { appLang } from "../../../util/lang"
import { localizeString } from "../../../util/locale-util"

export class HeroItemSync {

  static async syncAncestryAndClass(
    actor: Actor & { system: HeroDataModel },
    sendChat = true,
  ): Promise<void> {
    if (!actor || (actor.type as string) !== "hero") {
      ui.notifications?.warn(appLang.Notifications.syncHeroRequiresHero)
      return
    }

    const recordedUuid = (item: Item): string | null => {
      const coreFlags = item.flags.core as Record<string, unknown> | undefined
      const sourceId = coreFlags?.sourceId
      if (typeof sourceId === "string") return sourceId

      const compendiumSource = item._stats?.compendiumSource
      return typeof compendiumSource === "string" ? compendiumSource : null
    }

    type SyncRule = {
      id?: string
      key?: string
      label?: string
      channel?: string
      choices?: ({ value?: string } | string)[]
      selections?: unknown[]
    }

    const findSource = async (
      item: Item,
    ): Promise<{ doc: Item; source: string } | null> => {
      const uuid = recordedUuid(item)
      if (uuid) {
        try {
          const doc = await fromUuid(uuid)
          if (doc && "documentName" in doc && doc.documentName === "Item") {
            const source = doc as Item
            if (
              (source.type as string) === (item.type as string) &&
              source !== item
            ) {
              return { doc: source, source: "compendium source" }
            }
          }
        }
        catch {
          /* Ignore and use name lookup */
        }
      }

      for (const pack of game.packs?.filter(
        (pack) =>
          pack.documentName === "Item" && pack.metadata.packageName === sys_id,
      ) ?? []) {
        const index = await pack.getIndex({ fields: ["name"] })
        const entry = index.find((candidate) => candidate.name === item.name)
        if (entry) {
          const doc = await pack.getDocument(entry._id)
          const source = doc as Item | null
          if (source && source.type === item.type && source !== item) {
            return { doc: source, source: `compendium ${pack.collection}` }
          }
        }
      }

      const worldItem = game.items?.find(
        (candidate) =>
          candidate.type === item.type && candidate.name === item.name,
      )
      return worldItem && worldItem !== item
        ? { doc: worldItem, source: "world item source" }
        : null
    }

    const isHeroAddedRule = (rule: SyncRule) =>
      rule.key === "ChoiceSet" &&
      rule.channel === "path" &&
      (rule.label === appLang.RulesEditor.electiveTrainings ||
        (rule.choices ?? []).some((choice) =>
          (typeof choice === "string"
            ? choice
            : (choice?.value ?? "")
          ).includes("skills."),
        ))

    const sameRule = (a: SyncRule, b: SyncRule) => {
      return (
        a.id === b.id ||
        Boolean(a.key === b.key && a.label && a.label === b.label)
      )
    }

    const items = actor.items.filter(
      (item) =>
        (item.type as string) === "ancestry" ||
        (item.type as string) === "class",
    )
    if (items.length === 0) {
      ui.notifications?.warn(
        localizeString(appLang.Notifications.syncHeroNoItems, {
          name: actor.name,
        }),
      )
      return
    }

    const report: string[] = []
    for (const item of items) {
      try {
        const found = await findSource(item)
        if (!found) {
          report.push(
            `<li><b>${item.name}</b> (${item.type}): ${appLang.Notifications.syncHeroSourceMissing}</li>`,
          )
          continue
        }

        const { doc: source, source: sourceDescription } = found
        const itemSystem = item.system as { rules?: SyncRule[] }
        const oldRules = foundry.utils.deepClone(itemSystem.rules ?? [])
        const oldSelections = foundry.utils.deepClone(
          item.getFlag(sys_id, "ruleSelections") ?? {},
        ) as Record<string, unknown>
        const sourceSystem = source.system as {
          toObject: () => { rules?: SyncRule[] }
        }
        const newSystem = foundry.utils.deepClone(sourceSystem.toObject())
        if (!Array.isArray(newSystem.rules)) newSystem.rules = []

        const mergedSelections = foundry.utils.deepClone(oldSelections)

        for (const rule of newSystem.rules) {
          const oldRule = oldRules.find((candidate) =>
            sameRule(candidate, rule),
          )
          if (!oldRule) continue

          const priorSelections = oldRule.id
            ? oldSelections[oldRule.id]
            : undefined
          if (
            oldRule.id !== rule.id &&
            oldRule.id &&
            rule.id &&
            Array.isArray(priorSelections) &&
            priorSelections.length > 0
          ) {
            mergedSelections[rule.id] = foundry.utils.deepClone(priorSelections)
          }

          const ruleSelections = rule.id ? mergedSelections[rule.id] : undefined
          if (
            Array.isArray(oldRule.selections) &&
            oldRule.selections.length &&
            !(Array.isArray(ruleSelections) && ruleSelections.length > 0)
          ) {
            rule.selections = foundry.utils.deepClone(oldRule.selections)
          }
        }

        for (const oldRule of oldRules) {
          if (
            newSystem.rules.some((rule) => sameRule(rule, oldRule)) ||
            !isHeroAddedRule(oldRule)
          )
            continue
          newSystem.rules.push(foundry.utils.deepClone(oldRule))
        }

        if (!source.uuid)
          throw new Error(appLang.Notifications.syncHeroSourceMissingUuid)
        await item.update(
          { name: source.name, img: source.img, system: newSystem },
          { diff: false },
        )
        await item.setFlag(sys_id, "ruleSelections", mergedSelections)
        await item.update({ "flags.core.sourceId": source.uuid } as Record<
          string,
          any
        >)

        const success = localizeString(
          appLang.Notifications.syncHeroSourceUpdated,
          { source: sourceDescription },
        )
        report.push(
          `<li><b>${source.name}</b> (${item.type as string}): ${success}</li>`,
        )
      }
      catch (error) {
        console.error(
          `Failed to refresh ${item.type as string} "${item.name}" for Hero "${actor.name}".`,
          error,
        )
        const reason = error instanceof Error ? error.message : String(error)
        const failure = localizeString(
          appLang.Notifications.syncHeroSourceFailed,
          { reason },
        )
        report.push(
          `<li><b>${item.name}</b> (${item.type as string}): ${failure}</li>`,
        )
      }
    }

    await actor.system.forceUpdate?.()
    actor.prepareData()
    actor.sheet?.render()

    if (sendChat) {
      const title = localizeString(appLang.Notifications.syncHeroReportTitle, {
        name: actor.name,
      })
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        whisper: game.user?.id ? [game.user.id] : [],
        content: `<p><b>${title}</b></p><ul>${report.join("")}</ul>`,
      })
    }
  }

}
