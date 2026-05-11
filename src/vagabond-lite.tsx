import AlchemicalItemDataModel from "./model/item/equip/AlchemicalItemDataModel"
import AdversaryDataModel from "./model/actor/AdversaryDataModel"
import HeroDataModel from "./model/actor/HeroDataModel"
import ClassDataModel from "./model/item/character/ClassDataModel"
import ArmorDataModel from "./model/item/equip/ArmorDataModel"
import WeaponDataModel from "./model/item/equip/WeaponDataModel"
import SundryDataModel from "./model/item/equip/SundryDataModel"
import AncestryDataModel from "./model/item/character/ancestry/AncestryDataModel"
import SpellDataModel from "./model/item/character/SpellDataModel"
import PerkDataModel from "./model/item/character/PerkDataModel"
import NpcDataModel from "./model/actor/NpcDataModel"
import GearDataModel from "./model/item/equip/GearDataModel"
import ReactDom from "react-dom/client"
import React, { useEffect } from "react"
import VagabondLiteHeroSheet from "./sheets/VagabondLiteHeroSheet"

Hooks.once("init", () => {
    Object.assign(
        // Actors
        CONFIG.Actor.dataModels.hero = HeroDataModel,
        CONFIG.Actor.dataModels.adversary = AdversaryDataModel,
        CONFIG.Actor.dataModels.npc = NpcDataModel,
        // Items
        CONFIG.Item.dataModels.armor = ArmorDataModel,
        CONFIG.Item.dataModels.weapon = WeaponDataModel,
        CONFIG.Item.dataModels.alchemical = AlchemicalItemDataModel,
        CONFIG.Item.dataModels.gear = GearDataModel,
        CONFIG.Item.dataModels.sundry = SundryDataModel,
        CONFIG.Item.dataModels.ancestry = AncestryDataModel,
        CONFIG.Item.dataModels.class = ClassDataModel,
        CONFIG.Item.dataModels.perk = PerkDataModel,
        CONFIG.Item.dataModels.spell = SpellDataModel
    )
})

Hooks.on("ready", () => {
    const reactRoot = document.createElement("vagabond-lite-root")

    const root = ReactDom.createRoot(document.body.appendChild(reactRoot))
    root.render(
        <React.StrictMode>
            <div id="tw-portal-root" className="tw" />
        </React.StrictMode>
    );
})

const BigBlueBox = () => {
    return <div id="adasdiv" style={{backgroundColor: 'blue', height: 400, width: 400}}></div>
}

// register sheets
foundry.documents.collections.Actors.registerSheet('vagabond-lite', VagabondLiteHeroSheet, {
    types: ['hero'],
    makeDefault: true
})