'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ─── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    // ─── Scene & Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 12)

    // ─── Lights ────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    const l1 = new THREE.DirectionalLight(0x8b5cf6, 1.4)
    l1.position.set(6, 8, 6)
    scene.add(l1)

    const l2 = new THREE.DirectionalLight(0xc4b5fd, 0.9)
    l2.position.set(-8, -4, 4)
    scene.add(l2)

    const l3 = new THREE.PointLight(0xa78bfa, 0.7, 30)
    l3.position.set(0, 4, 8)
    scene.add(l3)

    // ─── Geometry factory ─────────────────────────────────────────────────
    type ShapeSpec = { geo: THREE.BufferGeometry; x: number; y: number; z: number; rx: number; ry: number; rz: number; rvx: number; rvy: number; rvz: number; floatSpeed: number; floatOffset: number }

    const geoList: THREE.BufferGeometry[] = [
      new THREE.IcosahedronGeometry(0.7, 0),
      new THREE.OctahedronGeometry(0.6, 0),
      new THREE.TetrahedronGeometry(0.65, 0),
      new THREE.IcosahedronGeometry(0.45, 0),
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.DodecahedronGeometry(0.55, 0),
      new THREE.IcosahedronGeometry(0.38, 0),
      new THREE.TetrahedronGeometry(0.5, 0),
      new THREE.OctahedronGeometry(0.42, 0),
      new THREE.IcosahedronGeometry(0.6, 1),
      new THREE.DodecahedronGeometry(0.42, 0),
      new THREE.IcosahedronGeometry(0.32, 0),
      new THREE.OctahedronGeometry(0.35, 0),
      new THREE.TetrahedronGeometry(0.38, 0),
    ]

    const colorPalette = [0x8b5cf6, 0xa78bfa, 0x7c3aed, 0xc4b5fd, 0x6d28d9]

    const shapes: ShapeSpec[] = geoList.map((geo, i) => ({
      geo,
      x: (Math.random() - 0.5) * 22,
      y: (Math.random() - 0.5) * 14,
      z: (Math.random() - 0.5) * 8 - 1,
      rx: Math.random() * Math.PI * 2,
      ry: Math.random() * Math.PI * 2,
      rz: Math.random() * Math.PI * 2,
      rvx: (Math.random() - 0.5) * 0.007,
      rvy: (Math.random() - 0.5) * 0.009,
      rvz: (Math.random() - 0.5) * 0.005,
      floatSpeed: 0.2 + Math.random() * 0.3,
      floatOffset: Math.random() * Math.PI * 2,
    }))

    // For each shape: solid mesh (very transparent) + wireframe edges
    const meshes: THREE.Mesh[] = []
    const edges: THREE.LineSegments[] = []

    shapes.forEach((s, i) => {
      const color = colorPalette[i % colorPalette.length]
      const solidOpacity = 0.04 + Math.random() * 0.07

      // Solid fill
      const mat = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: solidOpacity,
        shininess: 80,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(s.geo, mat)
      mesh.position.set(s.x, s.y, s.z)
      mesh.rotation.set(s.rx, s.ry, s.rz)
      scene.add(mesh)
      meshes.push(mesh)

      // Wireframe edges
      const edgeGeo = new THREE.EdgesGeometry(s.geo, 10)
      const edgeMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.18 + Math.random() * 0.18,
      })
      const wire = new THREE.LineSegments(edgeGeo, edgeMat)
      wire.position.copy(mesh.position)
      wire.rotation.copy(mesh.rotation)
      scene.add(wire)
      edges.push(wire)
    })

    // ─── Mouse parallax ────────────────────────────────────────────────────
    let mx = 0, my = 0
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // ─── Animation loop ────────────────────────────────────────────────────
    let raf: number
    const clock = new THREE.Clock()

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      shapes.forEach((s, i) => {
        const mesh = meshes[i]
        const wire = edges[i]

        s.rx += s.rvx
        s.ry += s.rvy
        s.rz += s.rvz

        const fy = Math.sin(t * s.floatSpeed + s.floatOffset) * 0.3
        const fx = Math.cos(t * s.floatSpeed * 0.7 + s.floatOffset) * 0.15

        mesh.position.y = s.y + fy
        mesh.position.x = s.x + fx
        mesh.rotation.set(s.rx, s.ry, s.rz)

        wire.position.copy(mesh.position)
        wire.rotation.copy(mesh.rotation)
      })

      // Gentle camera follow mouse
      camera.position.x += (mx * 0.8 - camera.position.x) * 0.025
      camera.position.y += (-my * 0.5 - camera.position.y) * 0.025
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    // ─── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      geoList.forEach(g => g.dispose())
      meshes.forEach(m => (m.material as THREE.Material).dispose())
      edges.forEach(e => { e.geometry.dispose(); (e.material as THREE.Material).dispose() })
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
