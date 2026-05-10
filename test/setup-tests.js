export default async () => {
    global.foundry = {
        data: {
            fields: {
                NumberField: class { }
            }
        },
        abstract: {
            TypeDataModel: class { }
        }
    }
}