console.log("Preparing globals for testing...")
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