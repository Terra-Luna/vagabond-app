import { afterAll, beforeAll, describe, expect, jest, test } from "@jest/globals";

(globalThis as any).ActiveEffect = class { }
let FlankStatusManager: typeof import("../../../../src/combat/engine/util/FlankStatusManager").FlankStatusManager

beforeAll(async () => {
    ({ FlankStatusManager } = await import("../../../../src/combat/engine/util/FlankStatusManager"))
})

const DISPOSITION = { SECRET: -2, HOSTILE: -1, NEUTRAL: 0, FRIENDLY: 1 }

type Size = "small" | "medium" | "large" | "huge" | "giant" | "colossal"

const adversary = (disposition: number, size?: Size) => ({
    document: { disposition },
    actor: { type: "adversary", system: size ? { beingSize: size } : {} }
}) as any

const npc = (disposition: number, size?: Size) => ({
    document: { disposition },
    actor: { type: "npc", system: size ? { beingSize: size } : {} }
}) as any

const hero = (disposition: number, size?: Size) => ({
    document: { disposition },
    actor: { type: "hero", system: { ancestry: size ? { beingSize: size } : {} } }
}) as any

const noActor = (disposition: number) => ({ document: { disposition } }) as any

const flanked = (subject: any, nearby: any[]) => {
    const spy = jest.spyOn(FlankStatusManager, "getProximalTokens").mockReturnValue(nearby)
    try {
        return FlankStatusManager.isFlanked(subject)
    } finally {
        spy.mockRestore()
    }
}

describe("FlankStatusManager.isFlanked", () => {
    const originalConst = (globalThis as any).CONST

    beforeAll(() => {
        (globalThis as any).CONST = { TOKEN_DISPOSITIONS: DISPOSITION }
    })

    afterAll(() => {
        (globalThis as any).CONST = originalConst
    })

    describe("guard clauses", () => {
        test("returns false when there is no subject", () => {
            expect(flanked(undefined as any, [adversary(DISPOSITION.HOSTILE), adversary(DISPOSITION.HOSTILE)])).toBe(false)
        })

        test("returns false when proximal tokens are empty", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY), [])).toBe(false)
        })

        test("looks up proximal tokens for the subject itself", () => {
            const subject = hero(DISPOSITION.FRIENDLY, "medium")
            const spy = jest.spyOn(FlankStatusManager, "getProximalTokens").mockReturnValue([
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])
            expect(FlankStatusManager.isFlanked(subject)).toBe(true)
            expect(spy).toHaveBeenCalledWith(subject)
            spy.mockRestore()
        })
    })

    describe("friendly subject", () => {
        const subject = () => hero(DISPOSITION.FRIENDLY, "medium")

        test("is not flanked by a single hostile token", () => {
            expect(flanked(subject(), [adversary(DISPOSITION.HOSTILE, "medium")])).toBe(false)
        })

        test("is flanked by two hostile tokens", () => {
            expect(flanked(subject(), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])).toBe(true)
        })

        test("is flanked by more than two hostile tokens", () => {
            expect(flanked(subject(), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])).toBe(true)
        })

        test("is not flanked by friendly tokens", () => {
            expect(flanked(subject(), [
                hero(DISPOSITION.FRIENDLY, "medium"),
                hero(DISPOSITION.FRIENDLY, "medium")
            ])).toBe(false)
        })

        test("is not flanked by neutral tokens", () => {
            expect(flanked(subject(), [
                npc(DISPOSITION.NEUTRAL, "medium"),
                npc(DISPOSITION.NEUTRAL, "medium")
            ])).toBe(false)
        })

        test("does not count one hostile plus allies as flanking", () => {
            expect(flanked(subject(), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                hero(DISPOSITION.FRIENDLY, "medium"),
                npc(DISPOSITION.NEUTRAL, "medium")
            ])).toBe(false)
        })

        test("counts only the hostile tokens in a mixed group", () => {
            expect(flanked(subject(), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                hero(DISPOSITION.FRIENDLY, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])).toBe(true)
        })

        test("does not count secret tokens", () => {
            expect(flanked(subject(), [
                adversary(DISPOSITION.SECRET, "medium"),
                adversary(DISPOSITION.SECRET, "medium")
            ])).toBe(false)
        })
    })

    describe("hostile subject", () => {
        const subject = () => adversary(DISPOSITION.HOSTILE, "medium")

        test("is not flanked by a single friendly token", () => {
            expect(flanked(subject(), [hero(DISPOSITION.FRIENDLY, "medium")])).toBe(false)
        })

        test("is flanked by two friendly tokens", () => {
            expect(flanked(subject(), [
                hero(DISPOSITION.FRIENDLY, "medium"),
                hero(DISPOSITION.FRIENDLY, "medium")
            ])).toBe(true)
        })

        test("is flanked by two neutral tokens", () => {
            expect(flanked(subject(), [
                npc(DISPOSITION.NEUTRAL, "medium"),
                npc(DISPOSITION.NEUTRAL, "medium")
            ])).toBe(true)
        })

        test("is flanked by one friendly and one neutral token", () => {
            expect(flanked(subject(), [
                hero(DISPOSITION.FRIENDLY, "medium"),
                npc(DISPOSITION.NEUTRAL, "medium")
            ])).toBe(true)
        })

        test("is not flanked by other hostile tokens", () => {
            expect(flanked(subject(), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])).toBe(false)
        })

        test("is not flanked by a lone friendly token among hostile tokens", () => {
            expect(flanked(subject(), [
                hero(DISPOSITION.FRIENDLY, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])).toBe(false)
        })

        test("does not count secret tokens", () => {
            expect(flanked(subject(), [
                hero(DISPOSITION.FRIENDLY, "medium"),
                adversary(DISPOSITION.SECRET, "medium")
            ])).toBe(false)
        })
    })

    describe("neutral subject", () => {
        const subject = () => npc(DISPOSITION.NEUTRAL, "medium")

        test("is flanked by two hostile tokens", () => {
            expect(flanked(subject(), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])).toBe(true)
        })

        test("is not flanked by one hostile token", () => {
            expect(flanked(subject(), [adversary(DISPOSITION.HOSTILE, "medium")])).toBe(false)
        })

        test("is not flanked by friendly, neutral or secret tokens", () => {
            expect(flanked(subject(), [
                hero(DISPOSITION.FRIENDLY, "medium"),
                hero(DISPOSITION.FRIENDLY, "medium"),
                npc(DISPOSITION.NEUTRAL, "medium"),
                npc(DISPOSITION.SECRET, "medium")
            ])).toBe(false)
        })

        test("ignores hostile tokens more than one size smaller", () => {
            expect(flanked(npc(DISPOSITION.NEUTRAL, "large"), [
                adversary(DISPOSITION.HOSTILE, "small"),
                adversary(DISPOSITION.HOSTILE, "small")
            ])).toBe(false)
        })

        test("counts hostile tokens one size smaller or larger", () => {
            expect(flanked(npc(DISPOSITION.NEUTRAL, "large"), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "huge")
            ])).toBe(true)
        })

        test("only counts size-eligible hostile tokens", () => {
            expect(flanked(npc(DISPOSITION.NEUTRAL, "large"), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "small")
            ])).toBe(false)
        })
    })

    describe("secret subject", () => {

        test("a secret subject is never flanked", () => {
            expect(flanked(adversary(DISPOSITION.SECRET, "medium"), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium"),
                hero(DISPOSITION.FRIENDLY, "medium"),
                hero(DISPOSITION.FRIENDLY, "medium")
            ])).toBe(false)
        })
    })

    describe("solo flanking modifier", () => {
        const solo = (disposition: number, size: Size = "medium") => {
            const t = adversary(disposition, size)
            t.actor.system.modifiers = { combat: { constant: { flanking: { solo: true } } } }
            return t
        }

        test("a friendly subject with no allies is flanked by one hostile solo token", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "medium"), [solo(DISPOSITION.HOSTILE)])).toBe(true)
        })

        test("a hostile subject with no allies is flanked by one friendly solo token", () => {
            expect(flanked(adversary(DISPOSITION.HOSTILE, "medium"), [solo(DISPOSITION.FRIENDLY)])).toBe(true)
        })

        test("a neutral subject with no allies is flanked by a hostile solo token", () => {
            expect(flanked(npc(DISPOSITION.NEUTRAL, "medium"), [solo(DISPOSITION.HOSTILE)])).toBe(true)
        })

        test("is not flanked when a proximal ally exists", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "medium"), [
                solo(DISPOSITION.HOSTILE),
                hero(DISPOSITION.FRIENDLY, "medium")
            ])).toBe(false)
        })

        test("a neutral token counts as an ally of a friendly subject", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "medium"), [
                solo(DISPOSITION.HOSTILE),
                npc(DISPOSITION.NEUTRAL, "medium")
            ])).toBe(false)
        })

        test("hostile tokens do not count as allies of a hostile subject's enemies", () => {
            expect(flanked(adversary(DISPOSITION.HOSTILE, "medium"), [
                solo(DISPOSITION.FRIENDLY),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])).toBe(false)
        })

        test("a non-solo lone enemy does not flank", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "medium"), [adversary(DISPOSITION.HOSTILE, "medium")])).toBe(false)
        })

        test("a solo token on the same side does not flank", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "medium"), [solo(DISPOSITION.FRIENDLY)])).toBe(false)
        })

        test("a solo token too small to flank is ignored", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "large"), [solo(DISPOSITION.HOSTILE, "small")])).toBe(false)
        })

        test("a secret subject is never flanked", () => {
            expect(flanked(adversary(DISPOSITION.SECRET, "medium"), [solo(DISPOSITION.HOSTILE)])).toBe(false)
        })
    })

    describe("being sizes", () => {
        test("flankers one size smaller than the subject still count", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "large"), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])).toBe(true)
        })

        test("flankers two sizes smaller than the subject do not count", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "huge"), [
                adversary(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "medium")
            ])).toBe(false)
        })

        test("flankers larger than the subject count", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "small"), [
                adversary(DISPOSITION.HOSTILE, "huge"),
                adversary(DISPOSITION.HOSTILE, "colossal")
            ])).toBe(true)
        })

        test("only flankers of a sufficient size are counted", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "huge"), [
                adversary(DISPOSITION.HOSTILE, "large"),
                adversary(DISPOSITION.HOSTILE, "small")
            ])).toBe(false)
        })

        test("a sufficiently sized pair flanks even alongside undersized tokens", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "huge"), [
                adversary(DISPOSITION.HOSTILE, "large"),
                adversary(DISPOSITION.HOSTILE, "huge"),
                adversary(DISPOSITION.HOSTILE, "small")
            ])).toBe(true)
        })

        test("size thresholds apply to hostile subjects too", () => {
            expect(flanked(adversary(DISPOSITION.HOSTILE, "giant"), [
                hero(DISPOSITION.FRIENDLY, "medium"),
                hero(DISPOSITION.FRIENDLY, "medium")
            ])).toBe(false)

            expect(flanked(adversary(DISPOSITION.HOSTILE, "giant"), [
                hero(DISPOSITION.FRIENDLY, "huge"),
                npc(DISPOSITION.NEUTRAL, "giant")
            ])).toBe(true)
        })

        test("small flankers count against a small subject", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "small"), [
                adversary(DISPOSITION.HOSTILE, "small"),
                adversary(DISPOSITION.HOSTILE, "small")
            ])).toBe(true)
        })

        test("heroes read their size from their ancestry", () => {
            expect(flanked(adversary(DISPOSITION.HOSTILE, "large"), [
                hero(DISPOSITION.FRIENDLY, "small"),
                hero(DISPOSITION.FRIENDLY, "small")
            ])).toBe(false)

            expect(flanked(adversary(DISPOSITION.HOSTILE, "large"), [
                hero(DISPOSITION.FRIENDLY, "medium"),
                hero(DISPOSITION.FRIENDLY, "medium")
            ])).toBe(true)
        })

        test("adversaries and npcs read their size from the system", () => {
            expect(flanked(hero(DISPOSITION.FRIENDLY, "large"), [
                npc(DISPOSITION.HOSTILE, "small"),
                adversary(DISPOSITION.HOSTILE, "small")
            ])).toBe(false)

            expect(flanked(hero(DISPOSITION.FRIENDLY, "large"), [
                npc(DISPOSITION.HOSTILE, "medium"),
                adversary(DISPOSITION.HOSTILE, "large")
            ])).toBe(true)
        })

        test("tokens with no size default to medium", () => {
            // Medium subject: a medium (default) flanker counts.
            expect(flanked(hero(DISPOSITION.FRIENDLY), [
                adversary(DISPOSITION.HOSTILE),
                adversary(DISPOSITION.HOSTILE)
            ])).toBe(true)

            // Large subject: a medium (default) flanker is within one size.
            expect(flanked(hero(DISPOSITION.FRIENDLY, "large"), [
                adversary(DISPOSITION.HOSTILE),
                adversary(DISPOSITION.HOSTILE)
            ])).toBe(true)

            // Huge subject: a medium (default) flanker is too small.
            expect(flanked(hero(DISPOSITION.FRIENDLY, "huge"), [
                adversary(DISPOSITION.HOSTILE),
                adversary(DISPOSITION.HOSTILE)
            ])).toBe(false)
        })

        test("tokens without an actor default to medium", () => {
            expect(flanked(noActor(DISPOSITION.FRIENDLY), [
                noActor(DISPOSITION.HOSTILE),
                noActor(DISPOSITION.HOSTILE)
            ])).toBe(true)
        })
    })
})

describe("FlankStatusManager.getProximalTokens", () => {
    const originalCanvas = (globalThis as any).canvas

    afterAll(() => {
        (globalThis as any).canvas = originalCanvas
    })

    const gridToken = (i: number, j: number, width = 1, height = 1) => ({
        document: { x: i * 100, y: j * 100, width, height },
        bounds: { left: -9999, top: -9999, right: -9899, bottom: -9899 },
        center: { x: -9950, y: -9950 }
    }) as any

    const squareNeighbors = ({ i, j }: { i: number, j: number }) => {
        const out: { i: number, j: number }[] = []
        for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) if (di || dj) out.push({ i: i + di, j: j + dj })
        return out
    }

    const setGrid = (tokens: any[]) => {
        (globalThis as any).canvas = {
            grid: {
                isGridless: false,
                size: 100,
                getAdjacentOffsets: squareNeighbors,
                getOffset: ({ x, y }: { x: number, y: number }) => ({ i: Math.floor(x / 100), j: Math.floor(y / 100) })
            },
            tokens: { placeables: tokens }
        }
    }

    test("returns an empty list without a subject", () => {
        expect(FlankStatusManager.getProximalTokens(undefined as any)).toEqual([])
    })

    test("returns an empty list when there is no canvas", () => {
        (globalThis as any).canvas = undefined
        expect(FlankStatusManager.getProximalTokens(gridToken(0, 0))).toEqual([])
    })

    test("includes orthogonal and diagonal neighbors, excluding the subject and distant tokens", () => {
        const subject = gridToken(5, 5)
        const orth = gridToken(5, 6)
        const diag = gridToken(4, 4)
        const far = gridToken(7, 5)
        setGrid([subject, orth, diag, far])
        expect(FlankStatusManager.getProximalTokens(subject)).toEqual([orth, diag])
    })

    test("uses the document's new position rather than the placeable's stale one", () => {
        const subject = gridToken(5, 5)
        const neighbor = gridToken(6, 5)
        setGrid([subject, neighbor])
        expect(FlankStatusManager.getProximalTokens(subject)).toEqual([neighbor])
        subject.document.x = 1500
        expect(FlankStatusManager.getProximalTokens(subject)).toEqual([])
    })

    test("handles multi-space tokens on either side", () => {
        const subject = gridToken(0, 0, 2, 2)
        const touching = gridToken(2, 2)
        const large = gridToken(2, 0, 1, 2)
        const apart = gridToken(4, 4)
        setGrid([subject, touching, large, apart])
        expect(FlankStatusManager.getProximalTokens(subject)).toEqual([touching, large])
    })

    describe("gridless", () => {
        const box = (left: number, top: number, size = 100) => ({
            document: { x: left, y: top, width: size / 100, height: size / 100 },
            bounds: { left: -9999, top: -9999, right: -9899, bottom: -9899 }
        }) as any

        const setGridless = (tokens: any[], distance = 5) => {
            (globalThis as any).canvas = {
                grid: { isGridless: true, distance, size: 100 },
                tokens: { placeables: tokens }
            }
        }

        test("includes tokens within 5 ft, excluding the subject", () => {
            const subject = box(0, 0)
            const touching = box(100, 0)
            const at5ft = box(200, 0)
            const diagonalClose = box(130, 130)
            setGridless([subject, touching, at5ft, diagonalClose])
            expect(FlankStatusManager.getProximalTokens(subject)).toEqual([touching, at5ft, diagonalClose])
        })

        test("excludes tokens more than 5 ft away", () => {
            const subject = box(0, 0)
            const far = box(201, 0)
            setGridless([subject, far])
            expect(FlankStatusManager.getProximalTokens(subject)).toEqual([])
        })

        test("scales the distance by the scene's grid distance", () => {
            const subject = box(0, 0)
            const other = box(150, 0)
            // 50px gap at 10ft per 100px = 5ft
            setGridless([subject, other], 10)
            expect(FlankStatusManager.getProximalTokens(subject)).toEqual([other])
        })

        test("uses the document's new position rather than the placeable's stale one", () => {
            const subject = box(0, 0)
            const other = box(100, 0)
            setGridless([subject, other])
            expect(FlankStatusManager.getProximalTokens(subject)).toEqual([other])
            subject.document.x = 5000
            expect(FlankStatusManager.getProximalTokens(subject)).toEqual([])
        })
    })
})

