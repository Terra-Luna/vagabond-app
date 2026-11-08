import { FocusSurface } from "../../combat/spellcasting/FocusSurface"
import { FocusUpkeep } from "../../combat/spellcasting/FocusUpkeep"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { LightSourceUtil } from "../../util/LightSourceUtil"
import { canUseHeroActions } from "../../util/model-util"
import { centerOnFirstRender } from "../../util/sheet-util"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { changesFocusSpells, endsTurnOrRound, isHostile, isHostileTurn, isMovement, isRoundChange, isTurnOrRoundChange } from "./focus-hook-rules"
import { FocusManagerAppView } from "./FocusManagerAppView"

type Hero = Actor & { system: HeroDataModel }

/**
 * Per-round Focus upkeep for a Hero: pay mana and pass a Cast check per Focus,
 * then optionally deal damage at the cost of 1 mana per damage die.
 */
export class FocusManagerApp extends VagabondApplication {

  private hero: Hero
  private round: number
  private static openApps = new Map<string, FocusManagerApp>()

  constructor({ hero, round }: { hero: Hero; round: number }) {
    super({
      window: { title: `Focus: ${hero.name}` },
      position: { width: 340, height: "auto", top: 20 },
      actorId: hero.id,
      minSize: { width: 280, height: 80 },
      enforceSingleInstancePerActor: true,
      Component: FocusManagerAppView,
    } as VagabondAppArgs)
    this.hero = hero
    this.round = round
  }

  override getReactProps() {
    return { ...super.getReactProps(), hero: this.hero, round: this.round }
  }

  override async _onRender(context, options) {
    await super._onRender(context, options)
    centerOnFirstRender(this, window.innerHeight)
  }

  private static checkOwningPlayer(actor: any): boolean {
    if (!actor?.isOwner) return false
    if (!game.user?.isGM) return true
    return !(game.users?.contents ?? []).some(
      (u: any) => !u.isGM && u.active && actor.testUserPermission(u, "OWNER"),
    )
  }

  private static open(hero: Hero, round: number) {
    if (!canUseHeroActions(hero)) return
    const existing = FocusManagerApp.openApps.get(hero.id!)
    if (existing?.rendered) {
      existing.round = round
      existing.render({ force: true })
      existing.bringToFront()
      return
    }
    const app = new FocusManagerApp({ hero, round })
    FocusManagerApp.openApps.set(hero.id!, app)
    app.render({ force: true })
  }

  protected override _onClose(options): void {
    if (FocusManagerApp.openApps.get(this.hero.id!) === this)
      FocusManagerApp.openApps.delete(this.hero.id!)
    super._onClose(options)
  }

  /** Opens one app per Hero this user is responsible for that owes Focus upkeep. */
  static launchForRound(combat: any) {
    for (const combatant of combat.combatants ?? []) {
      const actor = combatant.actor as Hero | null
      if (!actor || (actor.type as string) !== "hero") continue
      if (!FocusManagerApp.checkOwningPlayer(actor)) continue
      const due = FocusUpkeep.dueInstances(actor, combat.round)
      if (!due.length) continue
      due.forEach((it) =>
        FocusManagerApp.autoOpened.add(FocusManagerApp.openKey(it.id)),
      )
      FocusManagerApp.open(actor, combat.round)
    }
  }

  private static autoOpened = new Set<string>()

  private static openKey(focusId: string) {
    return `${focusId}:${FocusUpkeep.currentKey()}`
  }

  /** Opens the app when an upkeep newly becomes owed mid-round (e.g. a Hostile entered a Focused light). */
  private static openForNewUpkeep(actor: Hero) {
    if (!(game.combat as any)?.started) return
    if (!FocusManagerApp.checkOwningPlayer(actor)) return
    const fresh = FocusUpkeep.unresolvedInstances(actor).filter(
      (it) => !FocusManagerApp.autoOpened.has(FocusManagerApp.openKey(it.id)),
    )
    if (!fresh.length) return
    fresh.forEach((it) =>
      FocusManagerApp.autoOpened.add(FocusManagerApp.openKey(it.id)),
    )
    FocusManagerApp.open(actor, (game.combat as any).round)
  }

  /** Opens the app for one Hero on demand, whether or not any Focus owes upkeep. */
  static launch(actor: Hero) {
    if (!canUseHeroActions(actor)) return
    if (!FocusSpellUtil.instances(actor).length) {
      ui.notifications?.info(appLang.Spellcasting.focusNothingDue)
      return
    }
    const round = (game.combat as any)?.started ? (game.combat as any).round : 0
    FocusManagerApp.open(actor, round)
  }

  static registerHooks() {
    FocusUpkeep.openManager = (actor) => {
      const round = (game.combat as any)?.round ?? 0
      FocusManagerApp.open(actor, round)
    }
    LightSourceUtil.holdBurn = () => FocusUpkeep.hasUnresolvedLightBurn()

    Hooks.on("updateCombat", FocusManagerApp.onUpdateCombat)
    Hooks.on("updateToken", FocusManagerApp.onUpdateToken)
    Hooks.on("updateActor", FocusManagerApp.onUpdateActor)
  }

  private static onUpdateCombat = async (combat: any, changed: any) => {
    if (!combat.started) return

    if (
      game.user?.isGM &&
      isTurnOrRoundChange(changed) &&
      isHostileTurn(combat.combatant)
    )
      FocusUpkeep.dropUnresolvedForHostileTurn()

    try {
      if (isRoundChange(changed)) {
        const round = combat.round
        await FocusUpkeep.evaluateRound(combat, round)
        if (
          game.combat?.id === combat.id &&
          combat.started &&
          combat.round === round
        )
          FocusManagerApp.launchForRound(combat)
      }
      else if (endsTurnOrRound(changed)) {
        await FocusUpkeep.evaluateExposures()
      }
    }
    catch (error) {
      console.error("Failed to process Focus combat exposure", error)
    }
  }

  private static onUpdateToken = (doc: any, changed: any) => {
    // A caster moving also moves their Aura/Cone, which can sweep Hostiles in. Surfaces affect any token.
    if (
      isMovement(changed) &&
      (isHostile(doc) || doc.actor?.type === "hero" || FocusSurface.hasAny())
    )
      FocusUpkeep.evaluateExposures(doc.object)
  }

  private static onUpdateActor = (actor: any, changed: any) => {
    if (actor.type !== "hero" || !changesFocusSpells(changed)) return
    FocusUpkeep.evaluateExposures()
    FocusManagerApp.openForNewUpkeep(actor)
  }

}
