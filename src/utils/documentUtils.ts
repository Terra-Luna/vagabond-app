export const updateDocument = async (actor: { system: any, update: any }, update: any) => {
    const updates = {}
    Object.entries(update).forEach(([key, value]) => {
        updates[`system.${key}`] = value
    })
    console.log("Updating: ", actor, updates)
    return await actor.update(updates)
}

export const updateDocumentAtPath = async (actor: { system: any, update: any }, path: string[], value: any) => {
    const updates = {}
    let currentUpdateLevel = updates
    for (let i = 0; i < path.length - 1; i++) {
        currentUpdateLevel[path[i]] = {}
        currentUpdateLevel = currentUpdateLevel[path[i]]
    }

    currentUpdateLevel[path[path.length - 1]] = value
    return await updateDocument(actor, updates)
}