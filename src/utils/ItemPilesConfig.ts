import { sys_id } from "./foundryUtils"

export class ItemPilesConfig {

    static configure = () => {
        const api = (game as any).itempiles?.API
        if (!api) return

        const config = {
            system: sys_id,
            VERSION: "1.0.0",

            ACTOR_CLASS_TYPE: "itemActor",
            ITEM_QUANTITY_ATTRIBUTE: "system.bulk.quantity",
            ITEM_PRICE_ATTRIBUTE: "system.copperValue",

            ITEM_CLASS_LOOT_TYPE: "sundry",
            ITEM_CLASS_WEAPON_TYPE: "weapon",
            ITEM_CLASS_EQUIPMENT_TYPE: "armor",

            itemTypes: ["alchemical", "weapon", "armor", "sundry"],

            ITEM_FILTERS: [
                { path: "type", filters: "class" },
                { path: "type", filters: "ancestry" },
                { path: "type", filters: "perk" },
                { path: "type", filters: "spell" },
                { path: "type", filters: "startingpack" }
            ],

            UNSTACKABLE_ITEM_TYPES: [
                "weapon",
                "armor",
                "alchemical",
                "sundry",
                "startingpack"
            ],

            ITEM_SIMILARITIES: ["name", "type"],

            CURRENCIES: [
                {
                    type: "attribute",
                    name: "Gold",
                    img: "/icons/commodities/currency/coin-plain-gold.webp",
                    abbreviation: "{#}G",
                    primary: false,
                    exchangeRate: 10000,
                    data: { path: "system.inventory.coins.g" }
                },
                {
                    type: "attribute",
                    name: "Silver",
                    img: "/icons/commodities/currency/coin-engraved-moon-silver.webp",
                    abbreviation: "{#}S",
                    primary: false,
                    exchangeRate: 100,
                    data: { path: "system.inventory.coins.s" }
                },
                {
                    type: "attribute",
                    name: "Copper",
                    img: "/icons/commodities/currency/coin-oval-rune-copper.webp",
                    abbreviation: "{#}C",
                    primary: true,
                    exchangeRate: 1,
                    data: { path: "system.inventory.coins.c" }
                }
            ],

            FLAGS: {
                CUSTOM_CATEGORY: "flags.item-piles.system.category",
                ITEM_PRICE_MODIFIER: "flags.item-piles.system.priceModifier",
                CUSTOM_PRICES: "flags.item-piles.system.prices"
            }
        }

        api.addSystemIntegration(config)
    }

}