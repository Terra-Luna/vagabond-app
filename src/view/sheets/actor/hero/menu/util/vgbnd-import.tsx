import { importHero } from "../../../../../../apps/importer/TagalongImporter"
import { showInputDialog } from "../../../../../../apps/vagabond-tools/dialog/ConfirmationDialogUseCase"
import { HeroDataModel } from "../../../../../../model/actor/HeroDataModel"

export async function importFromVgbndApp(hero: HeroDataModel) {
    const tagalongLink = await showInputDialog({
        title: 'Import Character',
        description: 'Enter character link from Vagabond Tagalong App',
    })
    if (tagalongLink != null) {
        await importHero(hero as HeroDataModel, tagalongLink)
    }
}