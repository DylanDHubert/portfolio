"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import data from "./sceneData.json";

// SCENE UNITS: THE BOARD IS 10 x 10; 1 KM OF HEIGHT = KM_TO_UNITS (EXAGGERATED)
const BOARD = 10;
const N = data.grid;
const CELL = BOARD / N;
const KM_TO_UNITS = 0.32;
const CURTAIN_KM = 8;

// SIMULATED CLOUDSAT TRACK IN GRID COORDINATES (ROW, COL): A DIAGONAL POLAR-ORBIT PASS
const TRACK_START = { r: 0, c: 17 };
const TRACK_END = { r: N - 1, c: 47 };

export type Targets = { curtain: number; chips: number; rise: number };

function cellXZ(r: number, c: number): [number, number] {
  return [-BOARD / 2 + (c + 0.5) * CELL, -BOARD / 2 + (r + 0.5) * CELL];
}

// ILLUSTRATIVE THICKNESS: LOW CLOUDS ~1 KM THICK, DEEPER CLOUDS REACH DOWN TO 40% OF THEIR TOP
function baseKm(top: number) {
  return top < 3 ? Math.max(0.3, top - 1.0) : top * 0.4;
}

function sample(r: number, c: number) {
  const rr = Math.max(0, Math.min(N - 1, Math.round(r)));
  const cc = Math.max(0, Math.min(N - 1, Math.round(c)));
  const i = rr * N + cc;
  return { frac: data.frac[i] / 100, top: data.topKm[i] };
}

// DISTANCE FROM A CELL CENTER TO THE TRACK LINE, IN CELLS
function distToTrack(r: number, c: number) {
  const ax = TRACK_START.c, ay = TRACK_START.r, bx = TRACK_END.c, by = TRACK_END.r;
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((c - ax) * dx + (r - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(c - (ax + t * dx), r - (ay + t * dy));
}

// COLORMAP LOOSELY LIKE A RADAR REFLECTIVITY PLOT: BLUE -> CYAN -> YELLOW -> RED
function radarColor(v: number): [number, number, number] {
  const stops: [number, [number, number, number]][] = [
    [0, [30, 64, 175]], [0.35, [34, 211, 238]], [0.65, [250, 204, 21]], [1, [239, 68, 68]],
  ];
  for (let k = 1; k < stops.length; k++) {
    if (v <= stops[k][0]) {
      const [p0, c0] = stops[k - 1];
      const [p1, c1] = stops[k];
      const t = (v - p0) / (p1 - p0);
      return [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * t)) as [number, number, number];
    }
  }
  return stops[stops.length - 1][1];
}

function useCurtainTexture() {
  return useMemo(() => {
    const W = 256, H = 96;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const img = ctx.createImageData(W, H);
    // DETERMINISTIC TEXTURE NOISE SO THE CURTAIN LOOKS LIKE MEASURED DATA, NOT FLAT BARS
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let x = 0; x < W; x++) {
      const t = x / (W - 1);
      const { frac, top } = sample(
        TRACK_START.r + (TRACK_END.r - TRACK_START.r) * t,
        TRACK_START.c + (TRACK_END.c - TRACK_START.c) * t,
      );
      const base = baseKm(top);
      for (let y = 0; y < H; y++) {
        const km = ((H - 1 - y) / (H - 1)) * CURTAIN_KM;
        const o = (y * W + x) * 4;
        let a = 26;
        let col: [number, number, number] = [148, 163, 184];
        if (frac > 0.15 && top > 0 && km >= base && km <= top) {
          const mid = (km - base) / Math.max(0.2, top - base);
          const dens = Math.min(1, frac * (0.55 + 0.45 * Math.sin(Math.PI * mid)) * (0.85 + 0.3 * rnd()));
          col = radarColor(dens);
          a = 235;
        }
        img.data[o] = col[0];
        img.data[o + 1] = col[1];
        img.data[o + 2] = col[2];
        img.data[o + 3] = a;
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, []);
}

function Board() {
  const tex = useTexture("/images/nasa/cloud/board.webp");
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return (
    <group>
      <mesh position={[0, -0.09, 0]}>
        <boxGeometry args={[BOARD + 0.12, 0.16, BOARD + 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[BOARD, BOARD]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Track({ targets }: { targets: React.MutableRefObject<Targets> }) {
  const lineRef = useRef<THREE.Mesh>(null);
  const curtainRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const tex = useCurtainTexture();

  const [sx, sz] = cellXZ(TRACK_START.r, TRACK_START.c);
  const [ex, ez] = cellXZ(TRACK_END.r, TRACK_END.c);
  const len = Math.hypot(ex - sx, ez - sz);
  const angle = -Math.atan2(ez - sz, ex - sx);
  const height = CURTAIN_KM * KM_TO_UNITS;

  useFrame((_, dt) => {
    progress.current = THREE.MathUtils.damp(progress.current, targets.current.curtain, 2.2, dt);
    const p = Math.max(0.0001, progress.current);
    // HIDE WHEN COLLAPSED: THE FRAME'S 1PX EDGES WOULD OTHERWISE LEAVE A VERTICAL LINE
    const visible = progress.current > 0.005;
    if (lineRef.current) lineRef.current.visible = visible;
    if (curtainRef.current) curtainRef.current.visible = visible;
    if (lineRef.current) {
      lineRef.current.scale.x = p;
      lineRef.current.position.x = (len * p) / 2;
    }
    if (curtainRef.current) {
      curtainRef.current.scale.x = p;
      curtainRef.current.position.x = (len * p) / 2;
      tex.repeat.x = p;
    }
  });

  return (
    <group position={[sx, 0, sz]} rotation={[0, angle, 0]}>
      <mesh ref={lineRef} position={[0, 0.02, 0]}>
        <boxGeometry args={[len, 0.03, 0.06]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>
      <mesh ref={curtainRef} position={[0, height / 2, 0]}>
        <planeGeometry args={[len, height]} />
        <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
        {/* THIN FRAME SO THE CURTAIN READS AS A MEASURED PANEL */}
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(len, height)]} />
          <lineBasicMaterial color="#cbd5e1" transparent opacity={0.45} />
        </lineSegments>
      </mesh>
    </group>
  );
}

function Chips({ targets }: { targets: React.MutableRefObject<Targets> }) {
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const chips = useMemo(
    () =>
      [0.12, 0.37, 0.63, 0.88].map((t) => {
        const r = TRACK_START.r + (TRACK_END.r - TRACK_START.r) * t;
        const c = TRACK_START.c + (TRACK_END.c - TRACK_START.c) * t;
        return cellXZ(r, c);
      }),
    [],
  );
  const size = CELL * 14;

  useFrame((_, dt) => {
    progress.current = THREE.MathUtils.damp(progress.current, targets.current.chips, 3, dt);
    groupRef.current?.children.forEach((child, k) => {
      // CHIPS APPEAR ONE AFTER ANOTHER ALONG THE TRACK
      const local = THREE.MathUtils.clamp(progress.current * 4 - k * 0.6, 0, 1);
      child.visible = local > 0.01;
      child.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material & { opacity: number };
        if (m && "opacity" in m) m.opacity = local * (o.userData.base ?? 1);
      });
      child.position.y = 0.03 + (1 - local) * 0.6;
    });
  });

  return (
    <group ref={groupRef}>
      {chips.map(([x, z], k) => (
        <group key={k} position={[x, 0.03, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ base: 0.18 }}>
            <planeGeometry args={[size, size]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.18} depthWrite={false} />
          </mesh>
          <lineSegments userData={{ base: 1 }}>
            <edgesGeometry args={[new THREE.BoxGeometry(size, 0.001, size)]} />
            <lineBasicMaterial color="#f59e0b" transparent />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function Clouds({ targets }: { targets: React.MutableRefObject<Targets> }) {
  const groupRef = useRef<THREE.Group>(null);
  const knownRef = useRef<THREE.InstancedMesh>(null);
  const predRef = useRef<THREE.InstancedMesh>(null);
  const progress = useRef(0);

  // SPLIT CLOUDY CELLS INTO "KNOWN" (UNDER THE TRACK) AND "PREDICTED" (EVERYWHERE ELSE)
  const { known, pred } = useMemo(() => {
    const known: THREE.Matrix4[] = [];
    const pred: THREE.Matrix4[] = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const { frac, top } = sample(r, c);
        if (frac < 0.3 || top <= 0) continue;
        const base = baseKm(top);
        const h = (top - base) * KM_TO_UNITS;
        const w = CELL * (0.55 + 0.4 * frac);
        const [x, z] = cellXZ(r, c);
        const m = new THREE.Matrix4().compose(
          new THREE.Vector3(x, base * KM_TO_UNITS + h / 2, z),
          new THREE.Quaternion(),
          new THREE.Vector3(w, h, w),
        );
        (distToTrack(r, c) <= 0.85 ? known : pred).push(m);
      }
    }
    return { known, pred };
  }, []);

  useEffect(() => {
    known.forEach((m, k) => knownRef.current?.setMatrixAt(k, m));
    pred.forEach((m, k) => predRef.current?.setMatrixAt(k, m));
    if (knownRef.current) knownRef.current.instanceMatrix.needsUpdate = true;
    if (predRef.current) predRef.current.instanceMatrix.needsUpdate = true;
  }, [known, pred]);

  useFrame((_, dt) => {
    progress.current = THREE.MathUtils.damp(progress.current, targets.current.rise, 2, dt);
    if (groupRef.current) {
      groupRef.current.scale.y = Math.max(0.0001, progress.current);
      groupRef.current.visible = progress.current > 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={knownRef} args={[undefined, undefined, known.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={predRef} args={[undefined, undefined, pred.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7dd3fc" roughness={1} transparent opacity={0.28} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

function Sway({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current && enabled) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.22;
  });
  return <group ref={ref}>{children}</group>;
}

export default function CloudSceneCanvas({ targets, interactive }: { targets: React.MutableRefObject<Targets>; interactive: boolean }) {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas camera={{ position: [0, 8.2, 10.2], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 10, 4]} intensity={1.4} />
      <Suspense fallback={null}>
        <Sway enabled={!reduce}>
          <Board />
          <Track targets={targets} />
          <Chips targets={targets} />
          <Clouds targets={targets} />
        </Sway>
      </Suspense>
      <OrbitControls
        enabled={interactive}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0.3}
        maxPolarAngle={1.25}
        target={[0, 0.6, 0]}
      />
    </Canvas>
  );
}
