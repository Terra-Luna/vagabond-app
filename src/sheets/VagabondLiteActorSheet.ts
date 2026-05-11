const { api, sheets } = foundry.applications

export class VagabondLiteActorSheet extends api.HandlebarsApplicationMixin(
    sheets.ActorSheetV2
) {
    static DEFAULT_OPTIONS = {
        classes: ['vagabond-lite', 'actor'],
        position: {
            width: 430,
        },
        actions: {
            viewDoc: this._viewDoc,
        }
    }

    static async _viewDoc(event, target) {
        const doc = this._getEmbeddedDocument(target, this.actor)
        if (doc) doc.sheet.render(true)
    }
}