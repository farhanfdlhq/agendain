// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import ChangelogList from "@/components/admin/ChangelogList"
import { CHANGELOG } from "@/lib/changelog"

afterEach(() => {
  cleanup()
})

describe("ChangelogList Timeline", () => {
  it("merender garis timeline yang menghubungkan rilis tanpa menembus lingkaran", () => {
    const { container } = render(<ChangelogList />)
    const releaseItems = container.querySelectorAll("ol > li")
    expect(releaseItems.length).toBe(CHANGELOG.length)

    // Item pertama (versi saat ini)
    const firstLi = releaseItems[0]
    const firstLine = firstLi.querySelector("span[aria-hidden='true']:first-child")
    const firstDot = firstLi.querySelector("span[aria-hidden='true']:nth-child(2)")

    expect(firstLine).toHaveClass("top-3", "-bottom-3", "group-last:hidden")
    expect(firstDot).toHaveClass("z-10", "bg-primary")

    // Item kedua (versi lama)
    const secondLi = releaseItems[1]
    const secondLine = secondLi.querySelector("span[aria-hidden='true']:first-child")
    const secondDot = secondLi.querySelector("span[aria-hidden='true']:nth-child(2)")

    expect(secondLine).toHaveClass("top-3", "-bottom-3")
    expect(secondDot).toHaveClass("z-10", "bg-white", "dark:bg-zinc-900")
    // Memiliki inner span pengisi navy lembut di atas latar solid
    const innerDot = secondDot?.querySelector("span")
    expect(innerDot).toHaveClass("bg-primary/25")

    // Item terakhir: garis disembunyikan lewat group-last:hidden
    const lastLi = releaseItems[releaseItems.length - 1]
    const lastLine = lastLi.querySelector("span[aria-hidden='true']:first-child")
    expect(lastLine).toHaveClass("group-last:hidden")
  })
})

