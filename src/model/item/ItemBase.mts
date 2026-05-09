export default abstract class ItemBase extends foundry.abstract.TypeDataModel<any, any> {
    static defineSchema(extras = {}) {
        const f = foundry.data.fields
        return {
            description: new f.HTMLField()
        }
    }
}