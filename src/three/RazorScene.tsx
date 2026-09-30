import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, PerformanceMonitor } from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import * as THREE from 'three'
import url from '../assets/models/razor.glb?url'
import { craft } from '../lib/store'
import { isCoarse, reducedMotion } from '../lib/env'

const damp = THREE.MathUtils.damp

/** PBR-материалы задаём здесь: полированная сталь, эбеновые накладки с лаком, латунные штифты. */
function useRazor() {
  const { scene } = useGLTF(url)
  const model = useMemo(() => {
    const m = scene.clone(true)
    const steel = new THREE.MeshPhysicalMaterial({ color: '#d0d0cc', metalness: 1, roughness: 0.18, envMapIntensity: 1.1 })
    const ebony = new THREE.MeshPhysicalMaterial({ color: '#050404', metalness: 0, roughness: 0.32, envMapIntensity: 0.12 })
    const brass = new THREE.MeshPhysicalMaterial({ color: '#c9ad7f', metalness: 1, roughness: 0.28, envMapIntensity: 1.3 })
    m.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const n = (mesh.material as THREE.Material).name
      mesh.material = n === 'Steel' ? steel : n === 'Ebony' ? ebony : brass
    })
    // центрируем по габариту раскрытой бритвы
    const box = new THREE.Box3().setFromObject(m), c = box.getCenter(new THREE.Vector3())
    m.position.sub(c)
    return { model: m, handle: m.getObjectByName('Handle')!, mats: [steel, ebony, brass] }
  }, [scene])
  useEffect(() => () => { model.mats.forEach((x) => x.dispose()) }, [model])
  return model
}

function Razor() {
  const { model, handle } = useRazor()
  const root = useRef<THREE.Group>(null)
  const size = useThree((s) => s.size)
  const s = useRef({ rx: 0, ry: 0, open: 0.35 })

  useFrame((state, dt) => {
    const g = root.current!, t = state.clock.elapsedTime, p = craft.progress, st = s.current
    dt = Math.min(dt, 0.05)
    // раскрытие рукояти от скролла: 25° → 180°
    const openTarget = THREE.MathUtils.lerp(0.45, Math.PI, THREE.MathUtils.smoothstep(p, 0.05, 0.7))
    st.open = reducedMotion ? Math.PI : damp(st.open, openTarget, 5, dt)
    handle.rotation.y = Math.PI - st.open  // в модели 0 = раскрыта, π = сложена
    const live = !isCoarse && !reducedMotion
    st.ry = damp(st.ry, live ? craft.mx * 0.45 : 0, 3, dt)
    st.rx = damp(st.rx, live ? craft.my * 0.3 : 0, 3, dt)
    const idle = reducedMotion ? 0 : t * 0.12
    g.rotation.set(1.05 + st.rx - p * 0.35, -0.35 + Math.sin(idle) * 0.35 + st.ry + p * 0.9, -0.28 + Math.sin(t * 0.4) * 0.03)
    g.position.y = reducedMotion ? 0 : Math.sin(t * 0.7) * 0.18
    const fit = Math.min(0.9, (size.width / size.height) * 0.5)
    g.scale.setScalar(fit * (0.92 + p * 0.12))
  })

  return <group ref={root}><primitive object={model} /></group>
}

/** Окружение для отражений: процедурная «студия» (RoomEnvironment) → PMREM. Без внешних HDR-файлов. */
function Studio() {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene)
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const rt = pm.fromScene(room, 0.03)
    scene.environment = rt.texture
    scene.environmentRotation.set(0, 0.6, 0)
    room.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose() } })
    pm.dispose()
    return () => { scene.environment = null; rt.dispose() }
  }, [gl, scene])
  return null
}

function Frameloop() {
  const set = useThree((s) => s.setFrameloop)
  useEffect(() => {
    const id = setInterval(() => set(craft.visible && !reducedMotion ? 'always' : 'demand'), 300)
    return () => clearInterval(id)
  }, [set])
  return null
}

/** Студийный свет без HDR-файлов: большой ключ сверху-слева, узкие контровые полосы — сталь «горит» по кромкам. */
export default function RazorScene() {
  const [dpr, setDpr] = useState(Math.min(1.75, window.devicePixelRatio))
  return (
    <Canvas dpr={dpr} camera={{ position: [0, 0, 26], fov: 30 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }} frameloop="demand" aria-hidden>
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio))} flipflops={3} onFallback={() => setDpr(1)} />
      <Frameloop />
      <Studio />
      <directionalLight position={[-4, 6, 8]} intensity={1.4} color="#fff3e2" />
      <directionalLight position={[8, -2, -6]} intensity={2.5} color="#d9bf93" />
      <Razor />
    </Canvas>
  )
}
useGLTF.preload(url)
