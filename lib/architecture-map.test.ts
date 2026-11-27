import { describe, expect, it } from "vitest"
import { ARCH_FLOWS, ARCH_LINKS, ARCH_NODES, ARCH_NODE_MAP, ARCH_ZONES } from "./architecture-map"

describe("architecture map data", () => {
  it("setiap perangkat punya id unik serta kegunaan dan perumpamaan", () => {
    const ids = ARCH_NODES.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const n of ARCH_NODES) {
      expect(n.use.length).toBeGreaterThan(20)
      expect(n.ana.startsWith("Ibaratnya")).toBe(true)
    }
  })

  it("setiap perangkat berada di dalam salah satu zona", () => {
    for (const n of ARCH_NODES) {
      const [x, z] = n.pos
      const inside = ARCH_ZONES.some((zone) => x > zone.x[0] && x < zone.x[1] && z > zone.z[0] && z < zone.z[1])
      expect(inside, n.id).toBe(true)
    }
  })

  it("kabel hanya menghubungkan perangkat yang ada", () => {
    for (const [from, to] of ARCH_LINKS) {
      expect(ARCH_NODE_MAP[from], from).toBeDefined()
      expect(ARCH_NODE_MAP[to], to).toBeDefined()
    }
  })

  it("setiap alur bersambung dan hanya melewati kabel yang ada", () => {
    const linked = (a: string, b: string) => ARCH_LINKS.some(([f, t]) => (f === a && t === b) || (f === b && t === a))
    for (const flow of ARCH_FLOWS) {
      expect(flow.hops.length).toBeGreaterThan(0)
      flow.hops.forEach(([from, to], i) => {
        expect(linked(from, to), `${flow.key} langkah ${i + 1}`).toBe(true)
        if (i > 0) expect(flow.hops[i - 1][1], `${flow.key} langkah ${i + 1}`).toBe(from)
      })
    }
  })

  it("tidak memuat detail sensitif server", () => {
    const text = JSON.stringify({ ARCH_NODES, ARCH_ZONES, ARCH_FLOWS })
    for (const word of [":3005", ":443", "aaPanel", "Mumbai", "Hostinger", "/www/"]) {
      expect(text).not.toContain(word)
    }
  })
})
