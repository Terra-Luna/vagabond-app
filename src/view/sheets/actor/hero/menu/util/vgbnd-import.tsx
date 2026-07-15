import { importHero } from "../../../../../../apps/importer/TagalongImporter"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"

export async function importFromVgbndApp(hero) {
    const tagalongLink = prompt(
        'Enter character link from Vagabond Tagalong App',
        'https://www.vgbnd.app/character/e38db88c-ec28-4b67-a44c-09f0fe199d01'
    )
    if (tagalongLink != null) {
        importHero(hero as HeroDataModel, tagalongLink)
    }
}