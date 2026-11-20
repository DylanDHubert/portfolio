"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// SHELLS: INNERMOST = COARSEST LEVEL, SURFACE = FINEST (EVERY DOCUMENT)
const RADII = [0.36, 0.58, 0.8, 1.0];
const LEVELS = RADII.length;
const CYCLE = 9; // SECONDS PER ANIMATION LOOP (DRAW, THEN HOLD)
const DRAW = 6;

type V = THREE.Vector3;

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

function randomDir(r: () => number): V {
  const z = r() * 2 - 1;
  const t = r() * Math.PI * 2;
  const q = Math.sqrt(1 - z * z);
  return new THREE.Vector3(q * Math.cos(t), z, q * Math.sin(t));
}

// POINTS ALONG THE GREAT-CIRCLE ARC BETWEEN TWO DIRECTIONS AT RADIUS r
function arc(a: V, b: V, r: number, steps = 10): V[] {
  const out: V[] = [];
  for (let k = 0; k <= steps; k++) out.push(new THREE.Vector3().copy(a).lerp(b, k / steps).normalize().multiplyScalar(r));
  return out;
}

const QUERY = new THREE.Vector3(0.45, 0.55, 0.7).normalize();
const RELATED = new THREE.Vector3(-0.35, 0.25, 0.9).normalize();

// ---------- HNSW: REAL GREEDY SEARCH OVER RANDOMLY SAMPLED LAYERS ----------
function buildHnsw() {
  // SEED, SIZE AND LINK COUNT CHOSEN SO THE GREEDY SEARCH ENDS AT THE TRUE NEAREST POINT
  const r = rng(11);
  const N = 140;
  const dirs = Array.from({ length: N }, () => randomDir(r));
  // HNSW LEVEL SAMPLING: EACH POINT REACHES LEVEL l WITH PROBABILITY ~ (1/4)^l
  const top = dirs.map(() => {
    let l = 0;
    while (l < LEVELS - 1 && r() < 0.25) l++;
    return l;
  });
  top[0] = LEVELS - 1; // GUARANTEE AN ENTRY POINT ON THE TOP LAYER
  top[1] = Math.max(top[1], LEVELS - 1);
  top[2] = Math.max(top[2], LEVELS - 1);

  // HNSW LEVEL l (0 = DENSE BOTTOM) IS DRAWN ON SHELL (LEVELS - 1 - l)
  const shellOf = (l: number) => RADII[LEVELS - 1 - l];
  const M = 6;
  const layers: { members: number[]; edges: [number, number][] }[] = [];
  for (let l = 0; l < LEVELS; l++) {
    const members = dirs.map((_, i) => i).filter((i) => top[i] >= l);
    const edges: [number, number][] = [];
    const seen = new Set<string>();
    for (const i of members) {
      const near = members.filter((j) => j !== i).sort((a, b) => dirs[b].dot(dirs[i]) - dirs[a].dot(dirs[i])).slice(0, Math.min(M, members.length - 1));
      for (const j of near) {
        const k = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(k)) {
          seen.add(k);
          edges.push([i, j]);
        }
      }
    }
    layers.push({ members, edges });
  }
  const nbrs = (l: number, i: number) => layers[l].edges.filter(([a, b]) => a === i || b === i).map(([a, b]) => (a === i ? b : a));

  // GREEDY SEARCH (ef = 1): HOP TO A CLOSER NEIGHBOR UNTIL STUCK, THEN DROP A LAYER
  const path: V[] = [];
  let cur = 0;
  path.push(dirs[cur].clone().multiplyScalar(shellOf(LEVELS - 1)));
  for (let l = LEVELS - 1; l >= 0; l--) {
    if (l < LEVELS - 1) path.push(dirs[cur].clone().multiplyScalar(shellOf(l)));
    for (;;) {
      const best = nbrs(l, cur).reduce((b, j) => (dirs[j].dot(QUERY) > dirs[b].dot(QUERY) ? j : b), cur);
      if (best === cur) break;
      path.push(...arc(dirs[cur], dirs[best], shellOf(l)).slice(1));
      cur = best;
    }
  }

  // EDGES PER LAYER SO THE DENSE BOTTOM LAYER CAN BE DRAWN FAINTER THAN THE SPARSE UPPER ONES
  const layerSegs: V[][] = layers.map((layer, l) => {
    const out: V[] = [];
    layer.edges.forEach(([a, b]) => {
      const pts = arc(dirs[a], dirs[b], shellOf(l), 6);
      for (let k = 0; k < pts.length - 1; k++) out.push(pts[k], pts[k + 1]);
    });
    return out;
  });
  const segs = layerSegs[0];
  // FAINT RADIAL LINKS: THE SAME POINT APPEARS ON EVERY LAYER IT REACHES
  const links: V[] = [];
  dirs.forEach((d, i) => {
    for (let l = 1; l <= top[i]; l++) links.push(d.clone().multiplyScalar(shellOf(l)), d.clone().multiplyScalar(shellOf(l - 1)));
  });
  const nodes = dirs.flatMap((d, i) => Array.from({ length: top[i] + 1 }, (_, l) => d.clone().multiplyScalar(shellOf(l))));
  return { paths: [path], segs, upper: layerSegs.slice(1).flat(), links, nodes, found: dirs[cur].clone() };
}

// ---------- CHART: TREE OF NESTED CONES, FIXED FRONTIER, SEVERAL BRANCHES ----------
function buildChart() {
  // SEED AND FRONTIER SIZE CHOSEN SO THE ILLUSTRATION REACHES BOTH THE QUERY AND THE RELATED DOCUMENT
  const r = rng(9);
  type TNode = { dir: V; level: number; parent: number; kids: number[] };
  const nodes: TNode[] = [];
  const SPREAD = [0, 0.62, 0.34, 0.18];
  for (let i = 0; i < 6; i++) nodes.push({ dir: randomDir(r), level: 0, parent: -1, kids: [] });
  nodes[0].dir = QUERY.clone().add(new THREE.Vector3(0.25, -0.3, 0.1)).normalize();
  nodes[1].dir = RELATED.clone().add(new THREE.Vector3(-0.2, 0.25, 0)).normalize();
  for (let l = 1; l < LEVELS; l++) {
    const parents = nodes.map((n, i) => (n.level === l - 1 ? i : -1)).filter((i) => i >= 0);
    for (const p of parents) {
      for (let c = 0; c < 3; c++) {
        const dir = nodes[p].dir.clone().add(randomDir(r).multiplyScalar(SPREAD[l])).normalize();
        nodes[p].kids.push(nodes.length);
        nodes.push({ dir, level: l, parent: p, kids: [] });
      }
    }
  }
  // NUDGE ONE LEAF ONTO EACH TARGET SO THE ILLUSTRATION ENDS WHERE IT SHOULD
  const leaves = nodes.map((n, i) => (n.level === LEVELS - 1 ? i : -1)).filter((i) => i >= 0);
  const nearest = (t: V) => leaves.reduce((b, i) => (nodes[i].dir.dot(t) > nodes[b].dir.dot(t) ? i : b), leaves[0]);
  nodes[nearest(QUERY)].dir.copy(QUERY);
  nodes[nearest(RELATED)].dir.copy(RELATED);

  const pos = (i: number) => nodes[i].dir.clone().multiplyScalar(RADII[nodes[i].level]);
  // ILLUSTRATIVE SCORE: SIMILARITY TO THE QUERY OR TO A RELATED DOCUMENT
  const score = (i: number) => Math.max(nodes[i].dir.dot(QUERY), nodes[i].dir.dot(RELATED));

  const WINDOW = 8;
  const EXPAND = 3;
  let frontier = nodes.map((n, i) => (n.level === 0 ? i : -1)).filter((i) => i >= 0);
  const lit: [number, number][] = [];
  for (let step = 0; step < LEVELS - 1; step++) {
    const expandable = frontier.filter((i) => nodes[i].kids.length).sort((a, b) => score(b) - score(a)).slice(0, EXPAND);
    for (const p of expandable) nodes[p].kids.forEach((k) => lit.push([p, k]));
    frontier = [...frontier.filter((i) => !expandable.includes(i)), ...expandable.flatMap((p) => nodes[p].kids)];
    frontier = frontier.sort((a, b) => score(b) - score(a)).slice(0, WINDOW);
  }
  // ONLY KEEP LIT BRANCHES THAT LEAD TO A NODE STILL IN THE FINAL FRONTIER
  const keep = new Set<number>();
  for (const f of frontier) for (let i = f; i >= 0; i = nodes[i].parent) keep.add(i);
  const branches = lit.filter(([p, k]) => keep.has(p) && keep.has(k));
  const paths = branches.sort((a, b) => nodes[a[0]].level - nodes[b[0]].level).map(([p, k]) => [pos(p), pos(k)]);

  const segs: V[] = [];
  nodes.forEach((n, i) => {
    if (n.parent >= 0) segs.push(pos(n.parent), pos(i));
  });
  const ends = frontier.filter((i) => nodes[i].level === LEVELS - 1).map(pos);
  return { paths, segs, upper: [] as V[], links: [] as V[], nodes: nodes.map((_, i) => pos(i)), ends, levels: branches.map(([p]) => nodes[p].level) };
}

function Shells({ light }: { light: boolean }) {
  return (
    <>
      {RADII.map((r, k) => (
        <mesh key={r}>
          <sphereGeometry args={[r, 48, 32]} />
          <meshBasicMaterial color={light ? "#0891b2" : "#7dd3fc"} transparent opacity={k === LEVELS - 1 ? 0.07 : 0.045} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function Segments({ pts, color, opacity }: { pts: V[]; color: string; opacity: number }) {
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pts), [pts]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
}

function Dots({ pts, color, size }: { pts: V[]; color: string; size: number }) {
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pts), [pts]);
  return (
    <points geometry={geo}>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  );
}

// REVEALS EACH POLYLINE IN ORDER OVER THE DRAW PHASE (INSTANCE COUNT OF THE FAT LINE)
function AnimatedPaths({ paths, color, starts }: { paths: V[][]; color: string; starts: number[] }) {
  const refs = useRef<(THREE.Object3D | null)[]>([]);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useFrame(() => {
    // SHARED PAGE CLOCK SO BOTH SPHERES DRAW IN SYNC
    const t = reduce ? DRAW : (performance.now() / 1000) % CYCLE;
    paths.forEach((p, k) => {
      const obj = refs.current[k] as unknown as { geometry?: { instanceCount: number } } | null;
      if (!obj?.geometry) return;
      const segCount = p.length - 1;
      const local = THREE.MathUtils.clamp((t / DRAW - starts[k]) / (1 / Math.max(1, paths.length === 1 ? 1 : 3)), 0, 1);
      obj.geometry.instanceCount = Math.round(local * segCount);
    });
  });
  return (
    <>
      {paths.map((p, k) => (
        <Line
          key={k}
          ref={(el) => {
            refs.current[k] = el as unknown as THREE.Object3D;
          }}
          points={p}
          color={color}
          lineWidth={3}
          transparent
          depthTest={false}
        />
      ))}
    </>
  );
}

// TRIANGLE MARKERS THAT MATCH THE FRONTIER STEPPER: SOLID = QUERY, HOLLOW = RELATED DOCUMENT
function triangle(size: number, inner = 0) {
  const pts = [0, 1, 2].map((k) => {
    const a = Math.PI / 2 + (k * 2 * Math.PI) / 3;
    return new THREE.Vector2(Math.cos(a) * size, Math.sin(a) * size);
  });
  const shape = new THREE.Shape(pts);
  if (inner > 0) {
    // HOLLOW VERSION: CUT A SMALLER TRIANGLE OUT OF THE MIDDLE
    const hole = [0, 2, 1].map((k) => {
      const a = Math.PI / 2 + (k * 2 * Math.PI) / 3;
      return new THREE.Vector2(Math.cos(a) * inner, Math.sin(a) * inner);
    });
    shape.holes.push(new THREE.Path(hole));
  }
  return new THREE.ShapeGeometry(shape);
}

function Marker({ dir, color, hollow }: { dir: V; color: string; hollow?: boolean }) {
  const geo = useMemo(() => (hollow ? triangle(0.075, 0.042) : triangle(0.065)), [hollow]);
  // SIT JUST OUTSIDE THE SURFACE AND ALWAYS FACE THE CAMERA
  return (
    <Billboard position={dir.clone().multiplyScalar(1.03)}>
      <mesh geometry={geo} renderOrder={10}>
        <meshBasicMaterial color={color} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
    </Billboard>
  );
}

// FOLLOW THE SITE'S LIGHT/DARK THEME (THE html data-theme ATTRIBUTE)
function useSiteTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const read = () => setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

function Spin({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = -0.5 + Math.sin(clock.elapsedTime * 0.15) * 0.35;
  });
  return <group ref={ref}>{children}</group>;
}

export default function HierarchySpheresCanvas({ kind, interactive }: { kind: "chart" | "hnsw"; interactive: boolean }) {
  const data = useMemo(() => (kind === "hnsw" ? buildHnsw() : buildChart()), [kind]);
  const theme = useSiteTheme();
  const light = theme === "light";
  // PATHS ARE WHITE ON THE DARK BACKGROUND, NEAR-BLACK ON THE WHITE ONE
  const pathColor = light ? "#0f172a" : "#ffffff";
  const markColor = light ? "#e11d48" : "#f43f5e";
  const starts = useMemo(() => {
    if (kind === "hnsw") return [0];
    // CHART BRANCHES AT THE SAME LEVEL GROW TOGETHER: LEVEL k STARTS AT k/3 OF THE DRAW PHASE
    const lv = (data as ReturnType<typeof buildChart>).levels;
    return lv.map((l) => l / 3);
  }, [kind, data]);

  return (
    <Canvas camera={{ position: [0, 0.35, 3.05], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <Spin>
        <Shells light={light} />
        <Segments pts={data.segs} color={light ? "#94a3b8" : "#64748b"} opacity={kind === "hnsw" ? (light ? 0.18 : 0.1) : 0.32} />
        {data.upper.length > 0 && <Segments pts={data.upper} color={light ? "#475569" : "#a5f3fc"} opacity={0.3} />}
        {data.links.length > 0 && <Segments pts={data.links} color="#94a3b8" opacity={0.25} />}
        <Dots pts={data.nodes} color={light ? "#64748b" : "#94a3b8"} size={0.025} />
        <AnimatedPaths key={pathColor} paths={data.paths} color={pathColor} starts={starts} />
        <Marker dir={QUERY} color={markColor} />
        {kind === "chart" && <Marker dir={RELATED} color={markColor} hollow />}
      </Spin>
      <OrbitControls enabled={interactive} enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
