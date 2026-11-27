"use client"

/**
 * Peta arsitektur website dalam tampilan isometrik (gaya Isoflow), untuk tab
 * Arsitektur di Admin → Audit Log. Three.js dimuat hanya di komponen ini
 * (lewat next/dynamic di halaman), jadi tidak membebani halaman lain.
 * Data perangkat, zona, kabel, dan alur ada di lib/architecture-map.ts.
 */

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { RotateCcw, RotateCw, Maximize, Play, X, Camera, Minus, Plus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  ARCH_FLOWS,
  ARCH_LINKS,
  ARCH_NODES,
  ARCH_NODE_MAP,
  ARCH_ZONES,
  PACKET_TYPES,
  type ArchFlowKey,
  type ArchNodeKind,
} from "@/lib/architecture-map"

type MapApi = {
  startFlow: (key: ArchFlowKey) => void
  rotate: (dir: 1 | -1) => void
  fit: () => void
  highlight: (id: string | null) => void
  zoomBy: (factor: number) => void
  exportImage: (opts: ExportOpts) => string | null
}

type ExportOpts = { grid: boolean; labels: boolean; zones: boolean }
const EXPORT_TOGGLES: { key: keyof ExportOpts; label: string; hint: string }[] = [
  { key: "grid", label: "Tampilkan kisi", hint: "Garis kisi di latar belakang" },
  { key: "labels", label: "Tampilkan label perangkat", hint: "Nama setiap perangkat" },
  { key: "zones", label: "Tampilkan label zona", hint: "Pengunjung, Internet, Server Agendain" },
]

const ZONE_TONES = {
  light: { blue: "#dfe7fb", peach: "#fbe8d4", grid: "#e3e8ee", blueEdge: 0x6b86c9, peachEdge: 0xc8955c },
  dark: { blue: "#1b2a4a", peach: "#3a2a1b", grid: "#262f38", blueEdge: 0x6b86c9, peachEdge: 0xc8955c },
}
const LINK_COLORS = { net: 0x2f6fe0, server: 0xd2782d, wa: 0x25d366 }
const HOME = new THREE.Vector3(-0.5, 0, -1)

const TAG_BASE =
  "pointer-events-auto absolute cursor-pointer whitespace-nowrap rounded-md border bg-card px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm max-sm:px-1.5 max-sm:text-[9.5px] [transform:translate(-50%,calc(-100%_-_24px))] after:absolute after:left-1/2 after:top-full after:h-6 after:w-px after:bg-muted-foreground/50 after:content-[''] focus-visible:outline-2 focus-visible:outline-primary"
const TAG_ACTIVE = ["border-primary", "bg-primary", "text-primary-foreground"]
const TAG_SELECTED = ["ring-2", "ring-amber-400"]
const ZONE_LABEL =
  "pointer-events-none absolute whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs font-bold text-background max-sm:px-1.5 max-sm:py-0.5 max-sm:text-[9.5px]"

export default function ArchitectureMap() {
  const stageRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<MapApi | null>(null)
  const selectedRef = useRef<string | null>(null)

  const [flowKey, setFlowKey] = useState<ArchFlowKey>("home")
  const [step, setStep] = useState(-1)
  const [times, setTimes] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [zoomPct, setZoomPct] = useState(100)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportOpts, setExportOpts] = useState<ExportOpts>({ grid: true, labels: true, zones: true })
  const [preview, setPreview] = useState<string | null>(null)

  const flow = ARCH_FLOWS.find((f) => f.key === flowKey) ?? ARCH_FLOWS[0]
  const node = selected ? ARCH_NODE_MAP[selected] : null

  useEffect(() => {
    selectedRef.current = selected
    apiRef.current?.highlight(selected)
  }, [selected])

  useEffect(() => {
    const stage = stageRef.current
    const labelsEl = labelsRef.current
    if (!stage || !labelsEl) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      queueMicrotask(() => setFailed(true))
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.touchAction = "none"
    renderer.domElement.className = "block h-full w-full"
    stage.insertBefore(renderer.domElement, labelsEl)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, -200, 400)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableRotate = false
    controls.screenSpacePanning = true
    controls.enableDamping = true
    controls.dampingFactor = 0.12
    controls.minZoom = 0.5
    controls.maxZoom = 4
    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
    controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }
    controls.target.copy(HOME)
    let lastZoom = 100
    const syncZoom = () => {
      const z = Math.round(camera.zoom * 100)
      if (z !== lastZoom) {
        lastZoom = z
        setZoomPct(z)
      }
    }
    controls.addEventListener("change", syncZoom)

    scene.add(new THREE.AmbientLight(0xffffff, 1.9))
    const key = new THREE.DirectionalLight(0xffffff, 1.5)
    key.position.set(-4, 10, 7)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.6)
    fill.position.set(8, 6, -3)
    scene.add(fill)

    // Lantai kisi putih ala kanvas Isoflow. Zona berada sedikit di atas kisi.
    let grid: THREE.GridHelper | null = null
    const zoneMats: { mat: THREE.MeshBasicMaterial; edge: THREE.LineDashedMaterial; tone: "blue" | "peach" }[] = []
    const zoneLabels: { el: HTMLDivElement; a: THREE.Vector3; b: THREE.Vector3; at: THREE.Vector3 }[] = []
    for (const z of ARCH_ZONES) {
      const w = z.x[1] - z.x[0]
      const d = z.z[1] - z.z[0]
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat)
      plane.rotation.x = -Math.PI / 2
      plane.position.set((z.x[0] + z.x[1]) / 2, 0.01, (z.z[0] + z.z[1]) / 2)
      scene.add(plane)
      const corners = [
        [z.x[0], z.z[0]], [z.x[1], z.z[0]], [z.x[1], z.z[1]], [z.x[0], z.z[1]], [z.x[0], z.z[0]],
      ].map(([x, zz]) => new THREE.Vector3(x, 0.03, zz))
      const edge = new THREE.LineDashedMaterial({ color: 0x6b86c9, dashSize: 0.55, gapSize: 0.35 })
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(corners), edge)
      line.computeLineDistances()
      scene.add(line)
      zoneMats.push({ mat, edge, tone: z.tone })
      const el = document.createElement("div")
      el.className = ZONE_LABEL
      el.textContent = z.name
      labelsEl.appendChild(el)
      zoneLabels.push({
        el,
        a: new THREE.Vector3(z.x[0], 0, z.z[1]),
        b: new THREE.Vector3(z.x[1], 0, z.z[1]),
        at: new THREE.Vector3(z.x[0] + Math.min(w * 0.5, 3.2), 0, z.z[1] + 0.9),
      })
    }
    const isDark = () => !!stage.closest(".dark") || document.documentElement.classList.contains("dark")
    const applyTheme = () => {
      const t = isDark() ? ZONE_TONES.dark : ZONE_TONES.light
      for (const z of zoneMats) {
        z.mat.color.set(t[z.tone])
        z.edge.color.set(z.tone === "blue" ? t.blueEdge : t.peachEdge)
      }
      if (grid) {
        scene.remove(grid)
        grid.dispose()
      }
      const gc = new THREE.Color(t.grid)
      grid = new THREE.GridHelper(160, 160, gc, gc)
      scene.add(grid)
    }
    applyTheme()
    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    // Ikon perangkat dari bentuk sederhana; tinggi ikon dikembalikan untuk posisi label.
    const lambert = (color: number, emissive = 0x000000, ei = 1) =>
      new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: ei })
    const LED = lambert(0x47f08f, 0x2bd66b, 0.9)
    const SCREEN = lambert(0x1b2b38, 0x3a7db0, 0.55)
    const WHITE = lambert(0xffffff)
    const DARK = lambert(0x1d2a33)
    const box = (g: THREE.Group, w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
      mesh.position.set(x, y, z)
      g.add(mesh)
      return mesh
    }
    const cyl = (g: THREE.Group, r: number, h: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 36), m)
      mesh.position.set(x, y, z)
      g.add(mesh)
      return mesh
    }
    const BUILD: Record<ArchNodeKind, (g: THREE.Group, c: number) => number> = {
      phone: (g, c) => {
        box(g, 0.85, 1.6, 0.12, lambert(c), 0, 0.85, 0)
        box(g, 0.74, 1.36, 0.02, SCREEN, 0, 0.87, 0.07)
        return 1.75
      },
      pc: (g, c) => {
        box(g, 0.7, 1.5, 1.5, lambert(c), -1, 0.75, 0)
        box(g, 0.1, 0.5, 0.1, lambert(0x555f66), 0.35, 0.25, 0)
        box(g, 1.8, 1.1, 0.09, lambert(c), 0.35, 1.02, 0)
        box(g, 1.62, 0.92, 0.02, SCREEN, 0.35, 1.02, 0.05)
        return 1.6
      },
      cloud: (g) => {
        const m = lambert(0xf4f7fb)
        for (const [x, y, z, r] of [[0, 1.1, 0, 1.15], [1.05, 0.85, 0.25, 0.85], [-1.05, 0.85, -0.15, 0.9], [0.4, 1.65, -0.2, 0.8], [-0.45, 1.5, 0.4, 0.72]]) {
          const s = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), m)
          s.position.set(x, y, z)
          g.add(s)
        }
        const rim = new THREE.Mesh(new THREE.SphereGeometry(1.2, 28, 20), new THREE.MeshBasicMaterial({ color: 0x8fa3b5, side: THREE.BackSide }))
        rim.position.set(0, 1.1, 0)
        g.add(rim)
        return 2.5
      },
      router: (g, c) => {
        cyl(g, 1.1, 0.8, lambert(c), 0, 0.4, 0)
        cyl(g, 1.12, 0.1, WHITE, 0, 0.82, 0)
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.07, 8, 32), WHITE)
        ring.rotation.x = Math.PI / 2
        ring.position.y = 0.9
        g.add(ring)
        return 1.1
      },
      server: (g, c) => {
        for (let i = 0; i < 3; i++) {
          const y = 0.25 + i * 0.48
          box(g, 2, 0.42, 1.5, lambert(c), 0, y, 0)
          box(g, 0.07, 0.07, 0.02, LED, -0.8, y, 0.76)
          box(g, 0.07, 0.07, 0.02, LED, -0.66, y, 0.76)
          box(g, 0.95, 0.05, 0.02, DARK, 0.35, y, 0.76)
        }
        return 1.6
      },
      db: (g, c) => {
        for (let i = 0; i < 3; i++) {
          cyl(g, 0.95, 0.46, lambert(c), 0, 0.25 + i * 0.55, 0)
          cyl(g, 0.96, 0.05, WHITE, 0, 0.5 + i * 0.55, 0)
        }
        return 1.75
      },
      chat: (g, c) => {
        box(g, 1.6, 1.1, 0.22, lambert(c), 0, 1, 0)
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 3), lambert(c))
        tail.rotation.z = Math.PI
        tail.position.set(-0.45, 0.33, 0)
        g.add(tail)
        for (let i = 0; i < 3; i++) box(g, 0.18, 0.18, 0.04, WHITE, -0.35 + i * 0.35, 1, 0.12)
        return 1.65
      },
    }

    const pickables: THREE.Object3D[] = []
    const tags: Record<string, HTMLButtonElement> = {}
    const heights: Record<string, number> = {}
    for (const n of ARCH_NODES) {
      const g = new THREE.Group()
      g.position.set(n.pos[0], 0, n.pos[1])
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.25, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 }))
      shadow.rotation.x = -Math.PI / 2
      shadow.position.y = 0.02
      shadow.scale.set(1.1, 0.8, 1)
      g.add(shadow)
      heights[n.id] = BUILD[n.kind](g, n.color ?? 0x5f7384)
      g.traverse((o) => {
        if ((o as THREE.Mesh).isMesh && o !== shadow) {
          o.userData.id = n.id
          pickables.push(o)
        }
      })
      scene.add(g)
      const tag = document.createElement("button")
      tag.type = "button"
      tag.className = TAG_BASE
      tag.textContent = n.name
      tag.setAttribute("aria-label", `Lihat kegunaan ${n.name}`)
      tag.addEventListener("click", () => setSelected(n.id))
      labelsEl.appendChild(tag)
      tags[n.id] = tag
    }

    // Kabel melengkung rata di lantai, dengan panah di ujung tujuan.
    const flatCurve = (a: string, b: string, bend: number) => {
      const A = new THREE.Vector3(ARCH_NODE_MAP[a].pos[0], 0.12, ARCH_NODE_MAP[a].pos[1])
      const B = new THREE.Vector3(ARCH_NODE_MAP[b].pos[0], 0.12, ARCH_NODE_MAP[b].pos[1])
      const dir = B.clone().sub(A)
      const len = dir.length()
      dir.normalize()
      A.add(dir.clone().multiplyScalar(1.15))
      B.sub(dir.clone().multiplyScalar(1.25))
      const mid = A.clone().add(B).multiplyScalar(0.5)
      mid.add(new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(bend * len))
      return new THREE.QuadraticBezierCurve3(A, mid, B)
    }
    for (const [a, b, kind, bend] of ARCH_LINKS) {
      const curve = flatCurve(a, b, bend)
      const mat = new THREE.MeshBasicMaterial({ color: LINK_COLORS[kind] })
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.06, 8, false), mat))
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 12), mat)
      cone.position.copy(curve.getPoint(1))
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangent(1).normalize())
      scene.add(cone)
    }

    // Paket berbentuk amplop. Satu amplop dipakai sepanjang alur supaya geraknya
    // menyambung: tiap langkah berjalan dari pusat perangkat ke pusat perangkat
    // berikutnya dengan kecepatan tetap, melambat di ujung, lalu singgah sebentar.
    const pktBody = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const pkt = new THREE.Group()
    pkt.add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.52, 0.08), pktBody))
    const flap = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.26, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }))
    flap.rotation.set(Math.PI, 0, Math.PI / 4)
    flap.scale.set(1, 1, 0.1)
    flap.position.set(0, 0.16, 0.06)
    pkt.add(flap)
    pkt.visible = false
    scene.add(pkt)
    const centerCurve = (a: string, b: string, bend: number) => {
      const A = new THREE.Vector3(ARCH_NODE_MAP[a].pos[0], 0, ARCH_NODE_MAP[a].pos[1])
      const B = new THREE.Vector3(ARCH_NODE_MAP[b].pos[0], 0, ARCH_NODE_MAP[b].pos[1])
      const dir = B.clone().sub(A)
      const len = dir.length()
      dir.normalize()
      const mid = A.clone().add(B).multiplyScalar(0.5).add(new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(bend * len))
      return new THREE.QuadraticBezierCurve3(A, mid, B)
    }
    const packetCurve = (a: string, b: string): THREE.Curve<THREE.Vector3> => {
      for (const [f, t, , bend] of ARCH_LINKS) {
        if (f === a && t === b) return centerCurve(a, b, bend)
        if (f === b && t === a) {
          const c = centerCurve(b, a, bend)
          return new THREE.QuadraticBezierCurve3(c.v2.clone(), c.v1.clone(), c.v0.clone())
        }
      }
      return centerCurve(a, b, 0)
    }
    type Run = {
      key: ArchFlowKey; i: number; t: number; t0: number; dur: number; dwell: number
      from: string; to: string; curve: THREE.Curve<THREE.Vector3> | null; wait: number
    }
    let run: Run | null = null
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const SPEED = reduce ? 16 : 7
    const DWELL = reduce ? 0.05 : 0.25
    const clearActive = () => Object.values(tags).forEach((t) => t.classList.remove(...TAG_ACTIVE))
    const nextHop = () => {
      if (!run) return
      clearActive()
      const f = ARCH_FLOWS.find((x) => x.key === run!.key)!
      if (run.i >= f.hops.length) {
        const k = run.key
        pkt.visible = false
        run.curve = null
        setStep(-1)
        run.wait = window.setTimeout(() => startFlow(k), 2200)
        return
      }
      const [from, to, type] = f.hops[run.i]
      run.from = from
      run.to = to
      run.curve = packetCurve(from, to)
      run.dur = Math.max(0.55, run.curve.getLength() / SPEED)
      run.t = 0
      run.dwell = 0
      pktBody.color.setHex(PACKET_TYPES[type].color)
      pkt.visible = true
      tags[from].classList.add(...TAG_ACTIVE)
      tags[to].classList.add(...TAG_ACTIVE)
      const idx = run.i
      const stamp = ((performance.now() - run.t0) / 1000).toFixed(2)
      setStep(idx)
      setTimes((prev) => {
        const next = [...prev]
        next[idx] = stamp
        return next
      })
    }
    const startFlow = (k: ArchFlowKey) => {
      if (run) window.clearTimeout(run.wait)
      setTimes([])
      run = { key: k, i: 0, t: 0, t0: performance.now(), dur: 1, dwell: 0, from: "", to: "", curve: null, wait: 0 }
      nextHop()
    }
    const easeInOut = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x)
    const smoothstep = (e0: number, e1: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
      return t * t * (3 - 2 * t)
    }
    const pktPos = new THREE.Vector3()

    // Kamera isometrik: hanya geser dan zoom; putar per 90° lewat tombol.
    let az = Math.PI / 4
    let azTarget = az
    const placeCamera = () => {
      const d = new THREE.Vector3(Math.sin(az), 0.62, Math.cos(az)).normalize().multiplyScalar(100)
      camera.position.copy(controls.target).add(d)
      camera.lookAt(controls.target)
    }
    const resize = () => {
      const w = stage.clientWidth
      const h = stage.clientHeight
      const asp = w / h
      const vh = Math.max(22, 42 / asp)
      camera.left = (-vh * asp) / 2
      camera.right = (vh * asp) / 2
      camera.top = vh / 2
      camera.bottom = -vh / 2
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(stage)
    resize()
    placeCamera()

    // Klik perangkat (bukan seret) membuka kartu kegunaan; klik kosong menutupnya.
    const ray = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let down: [number, number] | null = null
    let hover: PointerEvent | null = null
    const toNdc = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect()
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(mouse, camera)
    }
    const onDown = (e: PointerEvent) => { down = [e.clientX, e.clientY] }
    const onUp = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - down[0]
      const dy = e.clientY - down[1]
      down = null
      if (dx * dx + dy * dy > 25) return
      toNdc(e)
      const hit = ray.intersectObjects(pickables, false)[0]
      setSelected(hit ? (hit.object.userData.id as string) : null)
    }
    const onMove = (e: PointerEvent) => { hover = e }
    renderer.domElement.addEventListener("pointerdown", onDown)
    renderer.domElement.addEventListener("pointerup", onUp)
    renderer.domElement.addEventListener("pointermove", onMove)

    const v = new THREE.Vector3()
    const proj = (p: THREE.Vector3): [number, number] => {
      v.copy(p).project(camera)
      return [((v.x + 1) / 2) * stage.clientWidth, ((1 - v.y) / 2) * stage.clientHeight]
    }
    const upright = (deg: number) => (deg > 90 ? deg - 180 : deg < -90 ? deg + 180 : deg)
    const p3 = new THREE.Vector3()
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (Math.abs(azTarget - az) > 0.001) az += (azTarget - az) * Math.min(1, dt * 7)
      controls.update()
      placeCamera()
      if (run && run.curve) {
        if (run.t < run.dur) run.t = Math.min(run.dur, run.t + dt)
        else {
          run.dwell += dt
          if (run.dwell >= DWELL) {
            run.i++
            nextHop()
          }
        }
      }
      if (run && run.curve) {
        const u = easeInOut(run.t / run.dur)
        run.curve.getPointAt(u, pktPos)
        // Di ujung langkah amplop naik ke atas ikon, di tengah turun mengikuti kabel.
        const wA = 1 - smoothstep(0, 0.25, u)
        const wB = smoothstep(0.75, 1, u)
        const lift = (id: string) => heights[id] + 0.35 - 0.6
        pkt.position.set(pktPos.x, 0.6 + wA * lift(run.from) + wB * lift(run.to), pktPos.z)
        pkt.quaternion.copy(camera.quaternion)
      }
      if (hover) {
        toNdc(hover)
        renderer.domElement.style.cursor = ray.intersectObjects(pickables, false).length ? "pointer" : "grab"
        hover = null
      }
      for (const n of ARCH_NODES) {
        const [x, y] = proj(p3.set(n.pos[0], heights[n.id] + 0.15, n.pos[1]))
        tags[n.id].style.left = `${x}px`
        tags[n.id].style.top = `${y}px`
      }
      for (const z of zoneLabels) {
        const a = proj(z.a)
        const b = proj(z.b)
        const m = proj(z.at)
        z.el.style.left = `${m[0]}px`
        z.el.style.top = `${m[1]}px`
        z.el.style.transform = `translate(-50%,-50%) rotate(${upright((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI)}deg)`
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }

    // Ekspor PNG: bingkai seluruh peta, render 2x lebih tajam, lalu gambar ulang
    // label (yang aslinya elemen HTML) ke kanvas 2D. Kamera dikembalikan sesudahnya.
    const exportImage = (opts: ExportOpts): string | null => {
      const W = stage.clientWidth
      const H = stage.clientHeight
      if (!W || !H) return null
      const scale = 2
      const saved = { target: controls.target.clone(), zoom: camera.zoom }
      const gridWas = grid?.visible ?? true
      const pktWas = pkt.visible
      controls.target.copy(HOME)
      camera.zoom = 1
      camera.updateProjectionMatrix()
      placeCamera()
      if (grid) grid.visible = opts.grid
      pkt.visible = false
      renderer.setPixelRatio(scale)
      renderer.setSize(W, H, false)
      renderer.render(scene, camera)
      const out = document.createElement("canvas")
      out.width = W * scale
      out.height = H * scale
      const ctx = out.getContext("2d")
      const dark = isDark()
      let url: string | null = null
      if (ctx) {
        ctx.fillStyle = dark ? "#09090b" : "#ffffff"
        ctx.fillRect(0, 0, out.width, out.height)
        ctx.drawImage(renderer.domElement, 0, 0, out.width, out.height)
        ctx.scale(scale, scale)
        const font = getComputedStyle(stage).fontFamily
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        if (opts.zones) {
          ctx.font = `700 12px ${font}`
          for (const z of zoneLabels) {
            const a = proj(z.a)
            const b = proj(z.b)
            const m = proj(z.at)
            const text = z.el.textContent ?? ""
            const w = ctx.measureText(text).width + 20
            ctx.save()
            ctx.translate(m[0], m[1])
            ctx.rotate((upright((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI) * Math.PI) / 180)
            ctx.fillStyle = dark ? "#f4f4f5" : "#18181b"
            ctx.beginPath()
            ctx.roundRect(-w / 2, -11, w, 22, 5)
            ctx.fill()
            ctx.fillStyle = dark ? "#18181b" : "#ffffff"
            ctx.fillText(text, 0, 0.5)
            ctx.restore()
          }
        }
        if (opts.labels) {
          ctx.font = `600 11px ${font}`
          for (const n of ARCH_NODES) {
            const [x, y] = proj(p3.set(n.pos[0], heights[n.id] + 0.15, n.pos[1]))
            const w = ctx.measureText(n.name).width + 16
            ctx.strokeStyle = dark ? "#52525b" : "#94a3b8"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x, y - 24)
            ctx.stroke()
            ctx.fillStyle = dark ? "#18181b" : "#ffffff"
            ctx.strokeStyle = dark ? "#3f3f46" : "#e2e8f0"
            ctx.beginPath()
            ctx.roundRect(x - w / 2, y - 44, w, 20, 5)
            ctx.fill()
            ctx.stroke()
            ctx.fillStyle = dark ? "#fafafa" : "#0f172a"
            ctx.fillText(n.name, x, y - 33.5)
          }
        }
        url = out.toDataURL("image/png")
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(W, H, false)
      if (grid) grid.visible = gridWas
      pkt.visible = pktWas
      controls.target.copy(saved.target)
      camera.zoom = saved.zoom
      camera.updateProjectionMatrix()
      placeCamera()
      return url
    }

    apiRef.current = {
      startFlow,
      rotate: (dir) => { azTarget += (dir * Math.PI) / 2 },
      fit: () => {
        controls.target.copy(HOME)
        camera.zoom = 1
        camera.updateProjectionMatrix()
        syncZoom()
      },
      zoomBy: (factor) => {
        camera.zoom = Math.min(controls.maxZoom, Math.max(controls.minZoom, camera.zoom * factor))
        camera.updateProjectionMatrix()
        syncZoom()
      },
      exportImage,
      highlight: (id) => {
        for (const [k, t] of Object.entries(tags)) {
          if (k === id) t.classList.add(...TAG_SELECTED)
          else t.classList.remove(...TAG_SELECTED)
        }
      },
    }
    apiRef.current.highlight(selectedRef.current)
    startFlow("home")
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      if (run) window.clearTimeout(run.wait)
      apiRef.current = null
      resizeObserver.disconnect()
      themeObserver.disconnect()
      renderer.domElement.removeEventListener("pointerdown", onDown)
      renderer.domElement.removeEventListener("pointerup", onUp)
      renderer.domElement.removeEventListener("pointermove", onMove)
      controls.removeEventListener("change", syncZoom)
      controls.dispose()
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(m)) m.forEach((x) => x.dispose())
        else m?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
      labelsEl.replaceChildren()
    }
  }, [])

  const openExport = () => {
    setPreview(apiRef.current?.exportImage(exportOpts) ?? null)
    setExportOpen(true)
  }
  const toggleExport = (key: keyof ExportOpts, value: boolean) => {
    const next = { ...exportOpts, [key]: value }
    setExportOpts(next)
    setPreview(apiRef.current?.exportImage(next) ?? null)
  }
  const downloadExport = () => {
    if (!preview) return
    const a = document.createElement("a")
    a.href = preview
    a.download = "arsitektur-agendain.png"
    a.click()
    setExportOpen(false)
  }

  const chooseFlow = (key: ArchFlowKey) => {
    setFlowKey(key)
    setStep(-1)
    apiRef.current?.startFlow(key)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pilih simulasi alur">
        <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Simulasi</span>
        {ARCH_FLOWS.map((f) => (
          <Button
            key={f.key}
            type="button"
            size="sm"
            variant={f.key === flowKey ? "default" : "outline"}
            aria-pressed={f.key === flowKey}
            onClick={() => chooseFlow(f.key)}
            className="rounded-full"
          >
            {f.label}
          </Button>
        ))}
        <Button type="button" size="sm" variant="ghost" onClick={() => chooseFlow(flowKey)} className="rounded-full">
          <Play className="mr-1.5 h-3.5 w-3.5" /> Putar ulang
        </Button>
      </div>

      <div
        ref={stageRef}
        className="relative h-[min(68vh,620px)] min-h-[420px] overflow-hidden rounded-xl border bg-white dark:bg-zinc-950"
      >
        <div ref={labelsRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
        {failed && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted-foreground">
            Browser ini tidak mendukung tampilan 3D (WebGL), jadi peta arsitektur tidak bisa ditampilkan.
          </div>
        )}
        {node && (
          <div
            role="dialog"
            aria-labelledby="arch-pop-title"
            className="absolute right-3 top-3 z-10 flex w-80 flex-col gap-1.5 rounded-xl border-2 border-primary bg-card p-4 pr-9 shadow-lg max-sm:inset-x-2 max-sm:bottom-2 max-sm:top-auto max-sm:w-auto"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Tutup"
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <p id="arch-pop-title" className="text-sm font-bold text-foreground">{node.name}</p>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Kegunaan</p>
            <p className="text-[13px] leading-relaxed text-foreground">{node.use}</p>
            <p className="text-[13px] italic leading-relaxed text-muted-foreground">{node.ana}</p>
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-0.5 rounded-xl border bg-card p-1 shadow-sm">
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => apiRef.current?.rotate(-1)} aria-label="Putar tampilan ke kiri" title="Putar ke kiri">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => apiRef.current?.rotate(1)} aria-label="Putar tampilan ke kanan" title="Putar ke kanan">
            <RotateCw className="h-4 w-4" />
          </Button>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={openExport} aria-label="Ekspor gambar" title="Ekspor gambar">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-xl border bg-card p-1 shadow-sm">
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => apiRef.current?.zoomBy(1 / 1.2)} aria-label="Perkecil" title="Perkecil">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs font-semibold tabular-nums text-foreground" aria-live="polite">{zoomPct}%</span>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => apiRef.current?.zoomBy(1.2)} aria-label="Perbesar" title="Perbesar">
            <Plus className="h-4 w-4" />
          </Button>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => apiRef.current?.fit()} aria-label="Kembalikan tampilan awal" title="Pas layar">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 hidden rounded-md border bg-card px-2 py-0.5 text-[11px] text-muted-foreground md:block">
          Klik perangkat untuk melihat kegunaannya · seret untuk geser · scroll untuk zoom
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <Card className="border-0 shadow-sm bg-zinc-50/50 dark:bg-zinc-900/50">
          <CardContent className="flex flex-col gap-2 p-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Detail perangkat</p>
            {node ? (
              <>
                <h3 className="text-base font-bold text-foreground">{node.name}</h3>
                <p className="text-xs font-medium text-primary dark:text-sky-300">{node.sub}</p>
                <p className="text-sm text-foreground">{node.use}</p>
                <p className="text-sm italic text-muted-foreground">{node.ana}</p>
                {node.facts.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-1">
                    {node.facts.map((f) => (
                      <li key={f} className="relative pl-4 text-sm text-foreground before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400 before:content-['']">
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Klik salah satu perangkat di peta untuk melihat kegunaannya.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-zinc-50/50 dark:bg-zinc-900/50">
          <CardContent className="flex flex-col gap-2 p-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Daftar paket</p>
            <h3 className="text-base font-bold text-foreground">{flow.title}</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-[12.5px] tabular-nums">
                <thead>
                  <tr className="border-b text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-2 py-1.5 font-medium">Detik</th>
                    <th className="px-2 py-1.5 font-medium">Dari</th>
                    <th className="px-2 py-1.5 font-medium">Ke</th>
                    <th className="px-2 py-1.5 font-medium">Jenis</th>
                    <th className="px-2 py-1.5 font-medium">Isi</th>
                  </tr>
                </thead>
                <tbody>
                  {flow.hops.map(([from, to, type, text], i) => (
                    <tr key={`${flow.key}-${i}`} className={`border-b last:border-0 ${i === step ? "bg-primary/10" : ""}`}>
                      <td className="px-2 py-1.5 text-muted-foreground">{times[i] ?? "—"}</td>
                      <td className="px-2 py-1.5">{ARCH_NODE_MAP[from].name}</td>
                      <td className="px-2 py-1.5">{ARCH_NODE_MAP[to].name}</td>
                      <td className="px-2 py-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="inline-block h-2 w-2.5 rounded-sm" style={{ background: `#${PACKET_TYPES[type].color.toString(16).padStart(6, "0")}` }} />
                          {PACKET_TYPES[type].label}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ekspor gambar</DialogTitle>
            <DialogDescription>Simpan peta arsitektur sebagai gambar PNG, misalnya untuk laporan atau presentasi.</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- pratinjau data URL hasil kanvas, bukan aset
              <img src={preview} alt="Pratinjau gambar peta arsitektur" className="block h-auto w-full" />
            ) : (
              <div className="grid h-48 place-items-center text-sm text-muted-foreground">Pratinjau tidak bisa dibuat di browser ini.</div>
            )}
          </div>
          <div className="flex flex-col divide-y rounded-lg border">
            {EXPORT_TOGGLES.map((t) => (
              <div key={t.key} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex flex-col">
                  <Label htmlFor={`export-${t.key}`} className="text-sm font-semibold">{t.label}</Label>
                  <span className="text-xs text-muted-foreground">{t.hint}</span>
                </div>
                <Switch id={`export-${t.key}`} checked={exportOpts[t.key]} onCheckedChange={(v) => toggleExport(t.key, v)} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExportOpen(false)}>Batal</Button>
            <Button type="button" onClick={downloadExport} disabled={!preview}>
              <Download className="mr-2 h-4 w-4" /> Unduh PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
