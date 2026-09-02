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
    },
    applications: {
        api: {
            ApplicationV2: class ApplicationV2 {
                static DEFAULT_OPTIONS = {
                    window: {},
                    position: {},
                    classes: []
                }

                constructor(options = {}) {
                    this.options = options
                    this.state = 'OPEN'
                    this.id = 'test-app'
                    this.element = null
                }

                bringToFront() { }
                close() { }
                _onClose() { }
                _canRender() { return true }
                _updatePosition(position) { return position }
            }
        },
        instances: new Map(),
        sidebar: {
            tabs: {
                CombatTracker: class { }
            }
        },
        ux: {
            TextEditor: {
                enrichHTML: async (content) => content,
                getDragEventData: () => ({})
            }
        }
    },
    utils: {
        randomID: () => 'test-id',
        getProperty: (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj)
    }
}

global.game = {
    settings: {
        get: () => 'normal',
        set: async () => undefined
    },
    user: { id: 'test-user', isActiveGM: true },
    combat: { combatants: { contents: [] } },
    actors: [],
    settings: {
        get: () => 'normal',
        set: async () => undefined
    }
}

global.ui = {
    notifications: {
        warn: () => undefined
    }
}