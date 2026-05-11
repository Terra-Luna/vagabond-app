console.log("FOUNDRY IS BEING DEFINED")
global.foundry = {
    data: {
        fields: {
            ArrayField: class { },
            BooleanField: class { },
            NumberField: class { },
            SchemaField: class { },
            StringField: class { },
            TypedSchemaField: class { }
        }
    },
    abstract: {
        TypeDataModel: class { }
    }
}