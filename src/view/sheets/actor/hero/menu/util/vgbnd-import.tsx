import { importHero } from "../../../../../../apps/importer/TagalongImporter"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"

export async function importFromVgbndApp(hero: HeroDataModel) {
    const tagalongLink = prompt('Enter character link from Vagabond Tagalong App', '')
    if (tagalongLink != null) {
        await importHero(hero as HeroDataModel, tagalongLink)
    }
}