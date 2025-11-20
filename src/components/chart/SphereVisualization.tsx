"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Column } from "@once-ui-system/core";
import styles from "./D3Visual1.module.scss";

interface Point {
  x: number;
  y: number;
  id: number;
  clusterPath: number[];
}

interface ClusterNode {
  id: number;
  depth: number;
  points: Point[];
  centroid: { x: number; y: number };
  children: ClusterNode[];
  parent?: ClusterNode;
}

// Seeded random number generator for deterministic data
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate ~2K points as a random cloud with minimal structure (deterministic)
function generatePoints(count: number = 2000, seed: number = 12345): Point[] {
  const points: Point[] = [];
  const rng = new SeededRandom(seed);
  
  for (let i = 0; i < count; i++) {
    const angle = rng.next() * Math.PI * 2;
    const radius = rng.next() * 200 + rng.next() * 100;
    const x = Math.cos(angle) * radius + (rng.next() - 0.5) * 50;
    const y = Math.sin(angle) * radius + (rng.next() - 0.5) * 50;
    
    const localBias = rng.next() < 0.3 ? 20 : 0;
    const biasAngle = rng.next() * Math.PI * 2;
    const finalX = x + Math.cos(biasAngle) * localBias * rng.next();
    const finalY = y + Math.sin(biasAngle) * localBias * rng.next();
    
    points.push({
      x: finalX,
      y: finalY,
      id: i,
      clusterPath: [],
    });
  }
  
  return points;
}

// K-means clustering (k=2) - using deterministic approach
function kMeans(points: Point[], k: number = 2, iterations: number = 10): Point[][] {
  if (points.length === 0) return [];
  if (points.length <= k) return points.map(p => [p]);
  
  let centroids = [
    { x: points[0].x, y: points[0].y },
    { x: points[Math.floor(points.length / 2)].x, y: points[Math.floor(points.length / 2)].y }
  ];
  
  for (let iter = 0; iter < iterations; iter++) {
    const clusters: Point[][] = Array(k).fill(null).map(() => []);
    
    points.forEach(point => {
      let minDist = Infinity;
      let nearestCluster = 0;
      
      centroids.forEach((centroid, idx) => {
        const dist = Math.sqrt(
          Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = idx;
        }
      });
      
      clusters[nearestCluster].push(point);
    });
    
    const newCentroids = clusters.map(cluster => {
      if (cluster.length === 0) {
        return centroids[clusters.indexOf(cluster)];
      }
      const sumX = cluster.reduce((sum, p) => sum + p.x, 0);
      const sumY = cluster.reduce((sum, p) => sum + p.y, 0);
      return {
        x: sumX / cluster.length,
        y: sumY / cluster.length,
      };
    });
    
    centroids = newCentroids;
  }
  
  const finalClusters: Point[][] = Array(k).fill(null).map(() => []);
  points.forEach(point => {
    let minDist = Infinity;
    let nearestCluster = 0;
    
    centroids.forEach((centroid, idx) => {
      const dist = Math.sqrt(
        Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearestCluster = idx;
      }
    });
    
    finalClusters[nearestCluster].push(point);
  });
  
  return finalClusters.filter(cluster => cluster.length > 0);
}

// Recursive clustering to build tree
function buildClusterTree(
  points: Point[], 
  maxDepth: number = 6, 
  currentDepth: number = 0,
  parentPath: number[] = []
): ClusterNode[] {
  if (currentDepth >= maxDepth || points.length < 2) {
    return [];
  }
  
  const clusters = kMeans(points, 2, 15);
  const nodes: ClusterNode[] = [];
  
  clusters.forEach((clusterPoints, idx) => {
    clusterPoints.forEach(point => {
      const currentPath = [...parentPath, idx];
      while (point.clusterPath.length <= currentDepth) {
        point.clusterPath.push(0);
      }
      point.clusterPath[currentDepth] = idx;
      point.clusterPath = currentPath;
    });
    
    const centroid = {
      x: clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length,
      y: clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length,
    };
    
    const node: ClusterNode = {
      id: currentDepth * 1000 + idx,
      depth: currentDepth,
      points: clusterPoints,
      centroid,
      children: [],
    };
    
    if (clusterPoints.length > 2 && currentDepth < maxDepth - 1) {
      const childPath = [...parentPath, idx];
      node.children = buildClusterTree(clusterPoints, maxDepth, currentDepth + 1, childPath);
      node.children.forEach(child => {
        child.parent = node;
      });
    }
    
    nodes.push(node);
  });
  
  return nodes;
}

// Get clusters at a specific depth
function getClustersAtDepth(rootNodes: ClusterNode[], targetDepth: number): ClusterNode[] {
  const result: ClusterNode[] = [];
  
  function traverse(node: ClusterNode) {
    if (node.depth === targetDepth) {
      result.push(node);
    } else {
      node.children.forEach(traverse);
    }
  }
  
  rootNodes.forEach(traverse);
  return result;
}

// Map 2D point to sphere surface (spherical coordinates)
function mapToSphere(point: { x: number; y: number }, xMin: number, xMax: number, yMin: number, yMax: number, radius: number): THREE.Vector3 {
  // Normalize to [0, 1]
  const normalizedX = (point.x - xMin) / (xMax - xMin || 1);
  const normalizedY = (point.y - yMin) / (yMax - yMin || 1);
  
  // Map to spherical coordinates
  const theta = normalizedX * Math.PI * 2; // Azimuth (longitude) [0, 2π]
  const phi = normalizedY * Math.PI; // Polar (latitude) [0, π]
  
  // Convert to Cartesian coordinates on sphere surface
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// Get theme color for cluster
function getThemeColor(index: number, total: number, theme: 'light' | 'dark'): THREE.Color {
  if (theme === 'light') {
    const hue = 0;
    const saturation = 70;
    const lightness = 30 + (index / total) * 25;
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    return new THREE.Color(r / 255, g / 255, b / 255);
  } else {
    const hue = 270;
    const saturation = 60;
    const lightness = 40 + (index / total) * 30;
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    return new THREE.Color(r / 255, g / 255, b / 255);
  }
}

// Get centroid path for a point (returns centroids at each level)
function getCentroidPath(point: Point, rootNodes: ClusterNode[], maxDepth: number, xMin: number, xMax: number, yMin: number, yMax: number): Array<{x: number, y: number} | null> {
  const path: Array<{x: number, y: number} | null> = [];
  
  for (let d = 0; d <= maxDepth; d++) {
    const clustersAtD = getClustersAtDepth(rootNodes, d);
    const cluster = clustersAtD.find(c => 
      c.points.some(p => p.id === point.id)
    );
    if (cluster) {
      path.push(cluster.centroid);
    } else {
      path.push(null);
    }
  }
  
  return path;
}

export function SphereVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Track theme changes
  useEffect(() => {
    const updateTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(currentTheme as 'light' | 'dark');
    };
    
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);
  
  // Generate data and build tree
  const { points, rootNodes, maxDepthValue, xMin, xMax, yMin, yMax } = useMemo(() => {
    const generatedPoints = generatePoints(2000);
    const tree = buildClusterTree(generatedPoints, 6);
    
    let maxDepthFound = 0;
    function findMaxDepth(node: ClusterNode) {
      maxDepthFound = Math.max(maxDepthFound, node.depth);
      node.children.forEach(findMaxDepth);
    }
    tree.forEach(findMaxDepth);
    
    const allX = generatedPoints.map(p => p.x);
    const allY = generatedPoints.map(p => p.y);
    const xMin = Math.min(...allX);
    const xMax = Math.max(...allX);
    const yMin = Math.min(...allY);
    const yMax = Math.max(...allY);
    
    return {
      points: generatedPoints,
      rootNodes: tree,
      maxDepthValue: maxDepthFound,
      xMin,
      xMax,
      yMin,
      yMax,
    };
  }, []);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    const width = 550;
    const height = 550;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // Clear/transparent background
    
    // Add depth fog for atmospheric effect
    // Fog starts at near distance and fully obscures at far distance
    const fogNear = 2; // Start fading at distance 2
    const fogFar = 6; // Fully fogged at distance 6
    scene.fog = new THREE.Fog(0x000000, fogNear, fogFar); // Black fog for transparent background
    
    sceneRef.current = scene;
    
    // Camera - positioned to view sphere centered at origin
    // Outer sphere radius is 1.5, so camera at z=3.5 gives good view
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.5);
    camera.lookAt(0, 0, 0); // Look at center where sphere is
    cameraRef.current = camera;
    
    // Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Clear background with alpha 0
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lighting - brighter for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);
    
    // Cleanup
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  // Update visualization - show ALL depths at once
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) {
      return;
    }
    
    if (rootNodes.length === 0 || points.length === 0) {
      return;
    }
    
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    
    // Clear existing objects (except lights)
    const objectsToRemove: THREE.Object3D[] = [];
    scene.children.forEach(child => {
      if (child.type !== 'AmbientLight' && child.type !== 'DirectionalLight') {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => {
      scene.remove(obj);
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      }
    });
    
    // Keep background clear/transparent but add fog for depth
    scene.background = null;
    const fogNear = 2; // Start fading at distance 2
    const fogFar = 6; // Fully fogged at distance 6
    scene.fog = new THREE.Fog(0x000000, fogNear, fogFar); // Black fog for transparent background
    
    // Sphere radii for nested spheres
    // REVERSED: Leaves (max depth) on outer, roots (depth 0) on inner
    // Use equal gaps between sphere surfaces for visually linear spacing
    const outerRadius = 1.1; // Points on outer sphere (reduced to fit viewport)
    const minRadius = 0.06; // Smallest inner radius (for root, scaled proportionally)
    const numInnerSpheres = 6; // Number of inner sphere levels
    
    // Calculate equal gaps between sphere surfaces for linear visual spacing
    // Total gap = outerRadius - minRadius
    // Gap per level = totalGap / numInnerSpheres
    const totalGap = outerRadius - minRadius;
    const gapPerLevel = totalGap / numInnerSpheres;
    
    // Generate radii with equal gaps: r[i] = minRadius + gapPerLevel * (i + 1)
    const generateInnerRadii = (count: number): number[] => {
      const radii: number[] = [];
      for (let i = 0; i < count; i++) {
        const radius = minRadius + gapPerLevel * (i + 1);
        radii.push(radius);
      }
      return radii;
    };
    
    const innerRadii = generateInnerRadii(numInnerSpheres);
    
    // Create points geometry for outer sphere (all points, no coloring by depth)
    const pointGeometry = new THREE.BufferGeometry();
    const pointPositions: number[] = [];
    const pointColor = theme === 'light' ? new THREE.Color(0.5, 0.5, 0.5) : new THREE.Color(0.8, 0.8, 0.8);
    
    // Map all points to sphere surface (outer sphere)
    points.forEach(point => {
      const position = mapToSphere(point, xMin, xMax, yMin, yMax, outerRadius);
      pointPositions.push(position.x, position.y, position.z);
    });
    
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));
    
    // Create circular texture for points
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    
    const pointMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: pointColor,
      sizeAttenuation: true,
      map: texture,
      transparent: true,
      opacity: 0.7,
      alphaTest: 0.1,
    });
    
    const pointsMesh = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(pointsMesh);
    
    // Generate gradient colors: Purple (roots) -> Red -> Orange -> Orange-Yellow (leaves)
    // Using dark theme colors: Purple (#6d3fd6 / rgb(109, 63, 214)) -> Red -> Orange -> Yellow (#fbbf24 / rgb(251, 191, 36))
    const depthColors = new Map<number, THREE.Color>();
    const getCentroidColor = (depth: number): THREE.Color => {
      if (!depthColors.has(depth)) {
        // Interpolate from purple (roots) to orange-yellow (leaves)
        // Use actual RGB values from theme to avoid green
        const ratio = maxDepthValue === 0 ? 0 : depth / maxDepthValue;
        
        // Theme colors (RGB 0-255)
        // Purple (roots): rgb(109, 63, 214) - from rgba(109, 63, 214, 0.9)
        // Red: rgb(255, 0, 0)
        // Orange: rgb(255, 165, 0)
        // Yellow (leaves): rgb(251, 191, 36) - from rgba(251, 191, 36, 0.8)
        
        let r: number, g: number, b: number;
        
        if (ratio <= 0.33) {
          // Purple to Red: rgb(109, 63, 214) -> rgb(255, 0, 0)
          const t = ratio / 0.33;
          r = 109 + (t * (255 - 109));
          g = 63 - (t * 63);
          b = 214 - (t * 214);
        } else if (ratio <= 0.66) {
          // Red to Orange: rgb(255, 0, 0) -> rgb(255, 165, 0)
          const t = (ratio - 0.33) / 0.33;
          r = 255;
          g = t * 165;
          b = 0;
        } else {
          // Orange to Yellow: rgb(255, 165, 0) -> rgb(251, 191, 36)
          const t = (ratio - 0.66) / 0.34;
          r = 255 - (t * (255 - 251));
          g = 165 + (t * (191 - 165));
          b = t * 36;
        }
        
        // Convert to 0-1 range for THREE.Color
        depthColors.set(depth, new THREE.Color(r / 255, g / 255, b / 255));
      }
      return depthColors.get(depth)!;
    };
    
    // Show all depths
    for (let d = 0; d <= maxDepthValue; d++) {
      const clustersAtD = getClustersAtDepth(rootNodes, d);
      
      // Calculate radius: depth 0 (root) = innermost, max depth (leaves) = outermost
      // innerRadii = [0.1, 0.2, 0.4, 0.8, 1.2, 1.6] for depths 1, 2, 3, 4, 5, 6
      // depth 0 should use the smallest radius (0.1 or first in array)
      // max depth should use outerRadius (2.0)
      let radius: number;
      if (d === 0) {
        // Root: use smallest inner radius
        radius = innerRadii[0] || 0.1;
      } else if (d === maxDepthValue) {
        // Leaves: use outer radius (same as points)
        radius = outerRadius;
      } else {
        // Intermediate: use innerRadii based on depth
        // depth 1 -> innerRadii[0] (0.1), depth 2 -> innerRadii[1] (0.2), etc.
        const radiusIndex = Math.min(d - 1, innerRadii.length - 1);
        radius = innerRadii[radiusIndex] || 0.1;
      }
      
      // Get color for this depth level
      const centroidColor = getCentroidColor(d);
      
      clustersAtD.forEach((cluster) => {
        // Map centroid to sphere
        const centroidPos = mapToSphere(cluster.centroid, xMin, xMax, yMin, yMax, radius);
        
        // Scale size by inverse of depth: leaves (max depth) = 1.0, root (depth 0) = 0.1
        // Linear interpolation: size = 0.1 + (d / maxDepthValue) * 0.9
        const sizeScale = maxDepthValue === 0 ? 1.0 : 0.1 + (d / maxDepthValue) * 0.9;
        const centroidRadius = 0.04 * sizeScale; // 50% smaller (was 0.08, now 0.04)
        
        // Create centroid sphere with glow effect
        const centroidGeometry = new THREE.SphereGeometry(centroidRadius, 16, 16);
        
        // Create a brighter emissive color for glow
        const glowColor = centroidColor.clone();
        glowColor.r = Math.min(glowColor.r * 1.5, 1);
        glowColor.g = Math.min(glowColor.g * 1.5, 1);
        glowColor.b = Math.min(glowColor.b * 1.5, 1);
        
        const centroidMaterial = new THREE.MeshStandardMaterial({
          color: centroidColor,
          emissive: glowColor,
          emissiveIntensity: 0.8, // Increased from 0.3 for stronger glow
        });
        const centroidMesh = new THREE.Mesh(centroidGeometry, centroidMaterial);
        centroidMesh.position.copy(centroidPos);
        scene.add(centroidMesh);
        
        // Draw lines to parent centroids
        // Each cluster at depth d connects to its parent at depth d-1
        if (cluster.parent) {
          const parentDepth = cluster.parent.depth;
          
          // Calculate parent radius using same logic as above
          let parentRadius: number;
          if (parentDepth === 0) {
            parentRadius = innerRadii[0] || 0.1;
          } else if (parentDepth === maxDepthValue) {
            parentRadius = outerRadius;
          } else {
            const radiusIndex = Math.min(parentDepth - 1, innerRadii.length - 1);
            parentRadius = innerRadii[radiusIndex] || 0.1;
          }
          
          const parentPos = mapToSphere(cluster.parent.centroid, xMin, xMax, yMin, yMax, parentRadius);
          
          // Use the child's color for the line (or interpolate between parent and child)
          const lineColor = centroidColor; // Use child's color
          
          // Create lines using cylinder geometry
          const lineDirection = new THREE.Vector3().subVectors(centroidPos, parentPos);
          const lineLength = lineDirection.length();
          const lineGeometry = new THREE.CylinderGeometry(0.01, 0.01, lineLength, 8); // Slightly thinner (0.01 instead of 0.015)
          
          const lineMaterial = new THREE.MeshStandardMaterial({
            color: lineColor,
            opacity: 0.75, // Less transparent (0.75 instead of 0.5)
            transparent: true,
          });
          
          const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
          
          // Position at midpoint and orient toward centroid
          const midpoint = new THREE.Vector3().addVectors(parentPos, centroidPos).multiplyScalar(0.5);
          lineMesh.position.copy(midpoint);
          
          // Create a quaternion to orient the cylinder along the line
          const up = new THREE.Vector3(0, 1, 0);
          const direction = lineDirection.normalize();
          const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
          lineMesh.setRotationFromQuaternion(quaternion);
          
          scene.add(lineMesh);
        }
      });
    }
    
    // Draw wireframe spheres for reference - colored by depth
    // Outer sphere wireframe (max depth - leaves)
    const outerSphereColor = getCentroidColor(maxDepthValue);
    const outerWireframeMaterial = new THREE.MeshBasicMaterial({
      color: outerSphereColor,
      wireframe: true,
      opacity: 0.15,
      transparent: true,
    });
    const outerSphereGeometry = new THREE.SphereGeometry(outerRadius, 32, 32);
    const outerSphere = new THREE.Mesh(outerSphereGeometry, outerWireframeMaterial);
    scene.add(outerSphere);
    
    // Inner sphere wireframes for all depths
    for (let d = 0; d <= maxDepthValue; d++) {
      // Skip outer sphere wireframe (already drawn above)
      if (d === maxDepthValue) {
        continue;
      }
      
      let wireframeRadius: number;
      if (d === 0) {
        wireframeRadius = innerRadii[0] || 0.1;
      } else {
        const radiusIndex = Math.min(d - 1, innerRadii.length - 1);
        wireframeRadius = innerRadii[radiusIndex] || 0.1;
      }
      
      // Get color for this depth level
      const depthColor = getCentroidColor(d);
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: depthColor,
        wireframe: true,
        opacity: 0.15,
        transparent: true,
      });
      
      const innerSphereGeometry = new THREE.SphereGeometry(wireframeRadius, 32, 32);
      const innerSphere = new THREE.Mesh(innerSphereGeometry, wireframeMaterial);
      scene.add(innerSphere);
    }
    
    // Render after adding objects
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    
  }, [points, rootNodes, maxDepthValue, xMin, xMax, yMin, yMax, theme]);

  // Animation loop for rotation
  useEffect(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    let animationFrameId: number;
    let rotationAngle = 0;
    const rotationSpeed = 0.005; // Adjust speed here (slower = smaller number)
    const cameraDistance = 3.5;

    const animate = () => {
      rotationAngle += rotationSpeed;
      
      // Rotate camera around Y axis (vertical rotation)
      cameraRef.current!.position.x = Math.sin(rotationAngle) * cameraDistance;
      cameraRef.current!.position.z = Math.cos(rotationAngle) * cameraDistance;
      cameraRef.current!.lookAt(0, 0, 0);
      
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [points, rootNodes, maxDepthValue, xMin, xMax, yMin, yMax, theme]);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: "transparent",
        width: "550px",
        height: "550px",
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
      }}
    />
  );
}

