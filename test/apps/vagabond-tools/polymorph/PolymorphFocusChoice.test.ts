import { beforeEach, describe, expect, it, jest } from "@jest/globals"

import { PolymorphFocusChoice } from "../../../../src/apps/vagabond-tools/polymorph/PolymorphFocusChoice"

describe("PolymorphFocusChoice", () => {
  const listeners: ((id: string, focused: boolean) => void)[] = []

  beforeEach(() => {
    listeners.length = 0
    ;(globalThis as any).Hooks = {
      on: (_name: string, fn: any) => listeners.push(fn),
      off: jest.fn(),
      callAll: (_name: string, id: string, focused: boolean) =>
        listeners.forEach((fn) => fn(id, focused)),
    }
    PolymorphFocusChoice.take("a")
  })

  it("holds a choice made before the tool opens until it takes it", () => {
    PolymorphFocusChoice.set("a", false)

    expect(PolymorphFocusChoice.take("a")).toBe(false)
    expect(PolymorphFocusChoice.take("a")).toBeUndefined()
  })

  it("updates a tool that is already open, and only for its own actor", () => {
    const listener = jest.fn()
    PolymorphFocusChoice.onChange("a", listener)

    PolymorphFocusChoice.set("b", false)
    PolymorphFocusChoice.set("a", false)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(false)
    expect(PolymorphFocusChoice.take("a")).toBeUndefined()
    PolymorphFocusChoice.take("b")
  })
})
