export const updateDocument = async (actor: { system: any, update: any }, update: any) => {
    const updates = {}
    Object.entries(update).forEach(([key, value]) => {
        if (key === 'name' || key === 'prototypeToken') {
            updates[`${key}`] = value
        }
        else {
            updates[`system.${key}`] = value
        }
    })
    return actor.update(updates)
}

export const updateDocumentAtPath = async (actor: { system: any, update: any }, path: string[], value: any) => {
    const updates = {}
    let currentUpdateLevel = updates
    for (let i = 0; i < path.length - 1; i++) {
        currentUpdateLevel[path[i]] = {}
        currentUpdateLevel = currentUpdateLevel[path[i]]
    }

    currentUpdateLevel[path[path.length - 1]] = value
    return updateDocument(actor, updates)
}

export const getDocumentAtPath = (doc: { system: any }, path: string[]) => {
    let currentNode = doc.system
    for (const nextStep of path) {
        currentNode = currentNode[nextStep]
        if (currentNode == null) return currentNode
    }
    return currentNode
}