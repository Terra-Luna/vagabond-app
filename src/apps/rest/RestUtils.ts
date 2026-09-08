export const LodgingTypes = {
    none: 0,
    horrible: 1,
    poor: 2,
    modest: 10,
    comfortable: 20,
    luxury: 40,
    opulent: 100,
} as const

export const isRation = (item) => item.name === "Ration" || item.name === "Rations" || item.system.isRation
