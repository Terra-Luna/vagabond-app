/** The tint of an area, matching the colors <DamageTypeIcon /> uses, as fixed values so they work without a themed DOM element. */
export class AreaColor {

  static readonly DEFAULT = "#9ca3af"

  private static readonly BY_DAMAGE_TYPE: Record<string, string> = {
    acid: "#80e31c",
    cold: "#00d0ff",
    coldiron: "#00d0ff",
    fire: "#de671e",
    holy: "#de671e",
    healing: "#00ff00",
    magical: "#155dfc",
    mana: "#155dfc",
    necrotic: "#009800",
    poison: "#3b680d",
    psychic: "#e938dd",
    shock: "#ffff56",
    fatigue: "#733e0a",
    adamant: "#c4c2c4",
    silvered: "#c4c2c4",
    physical: "#78706a",
    blunt: "#78706a",
    pierce: "#78706a",
    slash: "#78706a",
  }

  static of(damageType?: string) {
    return (
      (damageType && AreaColor.BY_DAMAGE_TYPE[damageType]) || AreaColor.DEFAULT
    )
  }

}
