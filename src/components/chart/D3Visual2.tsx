"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
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
  
  // Use first and middle points as initial centroids for determinism
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

// Smooth polygon by adding intermediate points
function smoothPolygon(points: [number, number][], tension: number = 0.3): [number, number][] {
  if (points.length < 3) return points;
  
  const smoothed: [number, number][] = [];
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    
    smoothed.push(p1);
    
    if (i < n - 1 || n > 3) {
      const t = tension;
      const x = p1[0] + (p2[0] - p0[0]) * t * 0.25;
      const y = p1[1] + (p2[1] - p0[1]) * t * 0.25;
      smoothed.push([x, y]);
    }
  }
  
  return smoothed;
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

// Check if a cluster is on the path to query point
function isClusterOnPath(cluster: ClusterNode, queryPoint: Point, currentDepth: number): boolean {
  // Check if query point is in this cluster
  const containsQuery = cluster.points.some(p => p.id === queryPoint.id);
  if (containsQuery) return true;
  
  // Check if any point in this cluster has the same path prefix as query point
  // up to current depth
  if (queryPoint.clusterPath.length === 0) return false;
  
  // Get the path prefix for this cluster by checking one of its points
  if (cluster.points.length === 0) return false;
  const samplePoint = cluster.points[0];
  
  // Check if paths match up to current depth
  for (let i = 0; i <= currentDepth; i++) {
    if (i >= queryPoint.clusterPath.length || i >= samplePoint.clusterPath.length) {
      return false;
    }
    if (queryPoint.clusterPath[i] !== samplePoint.clusterPath[i]) {
      return false;
    }
  }
  
  return true;
}

export function D3Visual2() {
  const svgRef = useRef<SVGSVGElement>(null);
  const attentionSvgRef = useRef<SVGSVGElement>(null);
  const [depth, setDepth] = useState(0);
  const [maxDepth, setMaxDepth] = useState(0);
  const [treeExpanded, setTreeExpanded] = useState(false);
  
  // Generate data and build tree
  const { points, rootNodes, queryPoint, relatedPoints, calculatedMaxDepth } = useMemo(() => {
    const generatedPoints = generatePoints(2000);
    const tree = buildClusterTree(generatedPoints, 6);
    
    let maxDepthFound = 0;
    function findMaxDepth(node: ClusterNode) {
      maxDepthFound = Math.max(maxDepthFound, node.depth);
      node.children.forEach(findMaxDepth);
    }
    tree.forEach(findMaxDepth);
    
    // Pick a query point (deterministic - point 500)
    const query = generatedPoints[500];
    
    // Find related points (points in the same final cluster or nearby)
    if (query.clusterPath.length > 0) {
      const queryFinalCluster = query.clusterPath[query.clusterPath.length - 1];
      const related = generatedPoints
        .filter(p => {
          if (p.id === query.id) return false;
          // Points in same final cluster or nearby
          if (p.clusterPath.length > 0) {
            const sameFinalCluster = p.clusterPath[p.clusterPath.length - 1] === queryFinalCluster;
            const distance = Math.sqrt(
              Math.pow(p.x - query.x, 2) + Math.pow(p.y - query.y, 2)
            );
            return sameFinalCluster || distance < 30;
          }
          return false;
        })
        .slice(0, 10); // Limit to 10 related points
      
      return {
        points: generatedPoints,
        rootNodes: tree,
        queryPoint: query,
        relatedPoints: related,
        calculatedMaxDepth: maxDepthFound + 1,
      };
    }
    
    return {
      points: generatedPoints,
      rootNodes: tree,
      queryPoint: query,
      relatedPoints: [],
      calculatedMaxDepth: maxDepthFound + 1,
    };
  }, []);
  
  useEffect(() => {
    if (calculatedMaxDepth > 0) {
      setMaxDepth(calculatedMaxDepth);
    }
  }, [calculatedMaxDepth]);
  
  useEffect(() => {
    if (!svgRef.current || rootNodes.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 25, bottom: 45, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Normalize to 0-1 range
    const allX = points.map(p => p.x);
    const allY = points.map(p => p.y);
    const xMin = Math.min(...allX);
    const xMax = Math.max(...allX);
    const yMin = Math.min(...allY);
    const yMax = Math.max(...allY);
    
    const normalizedPoints = points.map(p => ({
      ...p,
      normalizedX: (p.x - xMin) / (xMax - xMin || 1),
      normalizedY: (p.y - yMin) / (yMax - yMin || 1),
    }));
    
    const queryNormalized = {
      ...queryPoint,
      normalizedX: (queryPoint.x - xMin) / (xMax - xMin || 1),
      normalizedY: (queryPoint.y - yMin) / (yMax - yMin || 1),
    };
    
    const relatedNormalized = relatedPoints.map(p => ({
      ...p,
      normalizedX: (p.x - xMin) / (xMax - xMin || 1),
      normalizedY: (p.y - yMin) / (yMax - yMin || 1),
    }));
    
    const padding = 0.05;
    
    const xScale = d3
      .scaleLinear()
      .domain([0 - padding, 1 + padding])
      .range([0, innerWidth]);
    
    const yScale = d3
      .scaleLinear()
      .domain([1 + padding, 0 - padding])
      .range([0, innerHeight]);
    
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Get clusters at current depth
    const clustersAtDepth = getClustersAtDepth(rootNodes, depth);
    
    // Color scale for clusters
    const getThemeColor = (index: number, total: number) => {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      
      if (theme === 'light') {
        const hue = 0;
        const saturation = 70;
        const lightness = 30 + (index / total) * 25;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      } else {
        const hue = 270;
        const saturation = 60;
        const lightness = 40 + (index / total) * 30;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      }
    };
    
    const colorScale = (index: number) => getThemeColor(index, Math.max(clustersAtDepth.length, 1));
    
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const targetColor = theme === 'light' ? '#06b6d4' : '#fbbf24'; // Bright turquoise/yellow (used for all targets)
    
    // Helper function to darken a hex color based on depth
    // Returns darker color for earlier depths, brightest for current depth
    const darkenColorByDepth = (hex: string, currentDepth: number, targetDepth: number): string => {
      if (currentDepth === 0 || targetDepth === currentDepth) {
        return hex; // Full brightness for current depth
      }
      
      // Parse hex color
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      // Calculate darkening factor: 0.4 (darkest) to 1.0 (brightest)
      const darkenFactor = 0.4 + (0.6 * (targetDepth / currentDepth));
      
      // Darken each channel
      const newR = Math.round(r * darkenFactor);
      const newG = Math.round(g * darkenFactor);
      const newB = Math.round(b * darkenFactor);
      
      // Convert back to hex
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };
    
    // Helper function to calculate size scaling based on depth
    // Returns smaller size for earlier depths, full size for current depth
    const getSizeScaleByDepth = (currentDepth: number, targetDepth: number): number => {
      if (currentDepth === 0 || targetDepth === currentDepth) {
        return 1.0; // Full size for current depth
      }
      // Calculate size factor: 0.6 (smallest) to 1.0 (largest for current depth)
      return 0.6 + (0.4 * (targetDepth / currentDepth));
    };
    
    // Normalize clusters
    const normalizedClusters = clustersAtDepth.map(cluster => ({
      ...cluster,
      normalizedCentroid: {
        x: (cluster.centroid.x - xMin) / (xMax - xMin || 1),
        y: (cluster.centroid.y - yMin) / (yMax - yMin || 1),
      },
      normalizedPoints: cluster.points.map(p => ({
        ...p,
        normalizedX: (p.x - xMin) / (xMax - xMin || 1),
        normalizedY: (p.y - yMin) / (yMax - yMin || 1),
      })),
      onPath: isClusterOnPath(cluster, queryPoint, depth),
    }));
    
    // Check which clusters contain related points
    const clustersWithRelated = normalizedClusters.map((cluster, idx) => {
      const hasRelated = relatedPoints.some(rp => 
        cluster.points.some(p => p.id === rp.id)
      );
      return { cluster, idx, hasRelated };
    });
    
    // Helper function to find the cluster containing a point at a specific depth
    const findClusterForPoint = (point: Point, targetDepth: number): ClusterNode | null => {
      const clustersAtTargetDepth = getClustersAtDepth(rootNodes, targetDepth);
      return clustersAtTargetDepth.find(cluster => 
        cluster.points.some(p => p.id === point.id)
      ) || null;
    };
    
    // Helper function to get centroid path for a point (returns centroids at each level)
    const getCentroidPath = (point: Point, maxDepth: number): Array<{x: number, y: number} | null> => {
      const path: Array<{x: number, y: number} | null> = [];
      for (let d = 0; d <= maxDepth; d++) {
        const cluster = findClusterForPoint(point, d);
        if (cluster) {
          path.push({
            x: (cluster.centroid.x - xMin) / (xMax - xMin || 1),
            y: (cluster.centroid.y - yMin) / (yMax - yMin || 1),
          });
        } else {
          path.push(null);
        }
      }
      return path;
    };
    
    // Store path data for drawing later (on top)
    const queryPath = getCentroidPath(queryPoint, depth);
    const relatedPaths: Array<Array<{x: number, y: number} | null>> = [];
    relatedPoints.forEach(relatedPoint => {
      relatedPaths.push(getCentroidPath(relatedPoint, depth));
    });
    
    // Draw cluster hulls - dim non-path clusters, bright path clusters, highlight related clusters
    normalizedClusters.forEach((cluster, idx) => {
      if (cluster.normalizedPoints.length < 3) return;
      
      const hullPoints = cluster.normalizedPoints.map(p => [xScale(p.normalizedX), yScale(p.normalizedY)]);
      const hull = d3.polygonHull(hullPoints as [number, number][]);
      
      if (hull && hull.length > 2) {
        const smoothHull = smoothPolygon(hull, 0.3);
        const isOnPath = cluster.onPath;
        const hasRelated = clustersWithRelated.find(c => c.idx === idx)?.hasRelated || false;
        
        // Determine opacity and stroke based on path and related status
        let fillOpacity = 0.08;
        let strokeWidth = 1.5;
        let strokeOpacity = 0.3;
        
        if (isOnPath && hasRelated) {
          fillOpacity = 0.3;
          strokeWidth = 4;
          strokeOpacity = 0.9;
        } else if (isOnPath) {
          fillOpacity = 0.25;
          strokeWidth = 3;
          strokeOpacity = 0.8;
        } else if (hasRelated) {
          fillOpacity = 0.2;
          strokeWidth = 2.5;
          strokeOpacity = 0.6;
        }
        
        g.append("path")
          .datum(smoothHull)
          .attr("fill", colorScale(idx))
          .attr("fill-opacity", fillOpacity)
          .attr("stroke", colorScale(idx))
          .attr("stroke-width", strokeWidth)
          .attr("stroke-opacity", strokeOpacity)
          .attr("d", d3.line()
            .curve(d3.curveCatmullRomClosed.alpha(0.5))
            .x(d => d[0])
            .y(d => d[1]));
      }
    });
    
    // Draw all points (regular points, dimmed)
    g.selectAll(".point")
      .data(normalizedPoints.filter(p => 
        p.id !== queryPoint.id && !relatedPoints.some(rp => rp.id === p.id)
      ))
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.normalizedX))
      .attr("cy", d => yScale(d.normalizedY))
      .attr("r", 1.2)
      .attr("fill", d => {
        if (d.clusterPath && d.clusterPath.length > depth && clustersAtDepth.length > 0) {
          const clusterIdx = clustersAtDepth.findIndex(cluster => 
            cluster.points.some(p => p.id === d.id)
          );
          if (clusterIdx >= 0) {
            return colorScale(clusterIdx);
          }
        }
        return "var(--neutral-text-weak)";
      })
      .attr("opacity", 0.5); // Dim regular points
    
    // Helper function to draw X marker with outline
    const drawX = (x: number, y: number, size: number, color: string, strokeWidth: number, opacity: number = 1) => {
      const halfSize = size / 2;
      const outlineColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--neutral-surface-strong').trim() || '#fff';
      const outlineWidth = 0.5; // Slight outline
      
      // Draw outline first (behind)
      const outline1 = g.append("line")
        .attr("x1", x - halfSize)
        .attr("y1", y - halfSize)
        .attr("x2", x + halfSize)
        .attr("y2", y + halfSize)
        .attr("stroke", outlineColor)
        .attr("stroke-width", strokeWidth + outlineWidth * 2)
        .attr("opacity", opacity * 0.8);
      
      const outline2 = g.append("line")
        .attr("x1", x - halfSize)
        .attr("y1", y + halfSize)
        .attr("x2", x + halfSize)
        .attr("y2", y - halfSize)
        .attr("stroke", outlineColor)
        .attr("stroke-width", strokeWidth + outlineWidth * 2)
        .attr("opacity", opacity * 0.8);
      
      // Draw main X on top
      const line1 = g.append("line")
        .attr("x1", x - halfSize)
        .attr("y1", y - halfSize)
        .attr("x2", x + halfSize)
        .attr("y2", y + halfSize)
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity);
      
      const line2 = g.append("line")
        .attr("x1", x - halfSize)
        .attr("y1", y + halfSize)
        .attr("x2", x + halfSize)
        .attr("y2", y - halfSize)
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity);
      
      return { line1, line2, outline1, outline2 };
    };
    
    // Draw related points as X markers (same style as query, just smaller)
    relatedNormalized.forEach(relPoint => {
      const x = xScale(relPoint.normalizedX);
      const y = yScale(relPoint.normalizedY);
      
      // Single X marker (no shadow overlay)
      drawX(x, y, 10, targetColor, 3, 1);
    });
    
    // Draw query point as X marker (same style but bigger)
    const queryX = xScale(queryNormalized.normalizedX);
    const queryY = yScale(queryNormalized.normalizedY);
    
    // Single X marker (no shadow overlay) - bigger size for query
    drawX(queryX, queryY, 16, targetColor, 3, 1);
    
    // Add CSS animation for flowing lines (flowing from start to end)
    const style = svg.append("style");
    style.text(`
      @keyframes flowLine {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -12; }
      }
      .flowing-line-query,
      .flowing-line-related {
        animation: flowLine 1s linear infinite;
      }
    `);
    
    // Draw lines from centroids along paths (on top of other elements)
    // Color darkens and size shrinks with depth: brightest/largest for current level, darker/smaller for previous depths
    // All paths use same styling
    // Draw query path with flowing animation
    for (let d = 1; d <= depth; d++) {
      const prevPoint = queryPath[d - 1];
      const currPoint = queryPath[d];
      if (prevPoint && currPoint) {
        // Darken color based on depth: brightest for current depth, darker for previous
        const lineColor = darkenColorByDepth(targetColor, depth, d);
        // Shrink size based on depth: largest for current depth, smaller for previous
        const sizeScale = getSizeScaleByDepth(depth, d);
        
        g.append("line")
          .attr("x1", xScale(prevPoint.x))
          .attr("y1", yScale(prevPoint.y))
          .attr("x2", xScale(currPoint.x))
          .attr("y2", yScale(currPoint.y))
          .attr("stroke", lineColor)
          .attr("stroke-width", 2 * sizeScale) // Scale stroke width
          .attr("stroke-opacity", 0.6) // Fixed opacity
          .attr("stroke-dasharray", "8,4")
          .attr("stroke-dashoffset", 0)
          .attr("class", "flowing-line-query");
      }
    }
    
    // Draw paths for each related point with flowing animation (same style as query)
    relatedPaths.forEach(relatedPath => {
      for (let d = 1; d <= depth; d++) {
        const prevPoint = relatedPath[d - 1];
        const currPoint = relatedPath[d];
        if (prevPoint && currPoint) {
          // Darken color based on depth: brightest for current depth, darker for previous
          const lineColor = darkenColorByDepth(targetColor, depth, d);
          // Shrink size based on depth: largest for current depth, smaller for previous
          const sizeScale = getSizeScaleByDepth(depth, d);
          
          g.append("line")
            .attr("x1", xScale(prevPoint.x))
            .attr("y1", yScale(prevPoint.y))
            .attr("x2", xScale(currPoint.x))
            .attr("y2", yScale(currPoint.y))
            .attr("stroke", lineColor)
            .attr("stroke-width", 2 * sizeScale) // Scale stroke width
            .attr("stroke-opacity", 0.6) // Fixed opacity
            .attr("stroke-dasharray", "8,4")
            .attr("stroke-dashoffset", 0)
            .attr("class", "flowing-line-related");
        }
      }
    });
    
    // Assign numbers to clusters on paths (for labeling)
    // Collect all clusters on paths across all depths
    const clustersOnPath: Array<{cluster: ClusterNode, depth: number, number: number}> = [];
    let clusterNumber = 1; // Start from 1 (0 is reserved for query)
    
    for (let d = 0; d <= depth; d++) {
      const clustersAtD = getClustersAtDepth(rootNodes, d);
      clustersAtD.forEach(cluster => {
        const isOnPath = isClusterOnPath(cluster, queryPoint, d);
        const hasRelated = relatedPoints.some(rp => 
          cluster.points.some(p => p.id === rp.id)
        );
        
        if (isOnPath || hasRelated) {
          clustersOnPath.push({ cluster, depth: d, number: clusterNumber++ });
        }
      });
    }
    
    // Create a map from cluster to number for easy lookup
    const clusterToNumber = new Map<ClusterNode, number>();
    clustersOnPath.forEach(({ cluster, number }) => {
      clusterToNumber.set(cluster, number);
    });
    
    // Draw centroids from all previous depths (on top of lines)
    // Color darkens and size shrinks with depth: brightest/largest for current level, darker/smaller for previous depths
    // All centroids at 100% opacity
    clustersOnPath.forEach(({ cluster, depth: d, number }) => {
      const normalizedCentroid = {
        x: (cluster.centroid.x - xMin) / (xMax - xMin || 1),
        y: (cluster.centroid.y - yMin) / (yMax - yMin || 1),
      };
      
      // Darken color based on depth: brightest for current depth, darker for previous
      const centroidColor = darkenColorByDepth(targetColor, depth, d);
      // Shrink size based on depth: largest for current depth, smaller for previous
      const sizeScale = getSizeScaleByDepth(depth, d);
      
      const strokeColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--neutral-surface-strong').trim() || '#fff';
      
      g.append("circle")
        .attr("cx", xScale(normalizedCentroid.x))
        .attr("cy", yScale(normalizedCentroid.y))
        .attr("r", 6 * sizeScale) // Scale radius based on depth
        .attr("fill", centroidColor) // Darkened based on depth
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2.5 * sizeScale) // Scale stroke width
        .attr("opacity", 1.0); // 100% opacity for all centroids
      
      // Add number label next to centroid - larger and more visible
      // Use targetColor (already computed from theme) for high visibility
      const numberColor = targetColor; // Use target color for high visibility
      // strokeColor already declared above for centroid circle
      
      const numberText = g.append("text")
        .attr("x", xScale(normalizedCentroid.x) + 12 * sizeScale)
        .attr("y", yScale(normalizedCentroid.y) + 5)
        .attr("fill", numberColor)
        .style("font-size", `${16 * sizeScale}px`) // Larger font size
        .style("font-weight", "bold")
        .style("stroke", strokeColor)
        .style("stroke-width", `${2 * sizeScale}px`)
        .style("stroke-opacity", 0.8)
        .style("paint-order", "stroke fill") // Draw stroke first, then fill
        .text(number.toString());
    });
    
    
    // Add axes - theme-aware text colors
    const axisColor = theme === 'light' ? '#000' : '#fff';
    
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => Number(d).toFixed(1)));
    
    xAxis.attr("color", axisColor)
      .selectAll("text")
      .style("fill", axisColor)
      .style("font-size", "12px");
    
    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", axisColor)
      .style("font-size", "14px")
      .style("text-anchor", "middle")
      .text("Normalized X");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => Number(d).toFixed(1)));
    
    yAxis.attr("color", axisColor)
      .selectAll("text")
      .style("fill", axisColor)
      .style("font-size", "12px");
    
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -innerHeight / 2)
      .attr("fill", axisColor)
      .style("font-size", "14px")
      .style("text-anchor", "middle")
      .text("Normalized Y");
    
    g.selectAll(".domain, .tick line")
      .attr("stroke", axisColor)
      .attr("stroke-opacity", 0.3);
    
    // Add legend in top-right corner
    const legendX = innerWidth - 190;
    const legendY = 10;
    const legendSpacing = 18;
    let legendYOffset = 0;
    
    const legend = g.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);
    
    // Legend background - theme-aware (explicit colors with subtle tint)
    // Reuse theme from above
    const legendBgColor = theme === 'light' ? '#f8f0f0' : '#1f1a25'; // Light red tint / dark purple tint
    const legendTextColor = theme === 'light' ? '#000' : '#fff';
    const legendBorderColor = theme === 'light' ? '#000' : '#fff'; // Match text color like tree
    
    legend.append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", 190)
      .attr("height", 100)
      .attr("fill", legendBgColor)
      .attr("stroke", legendBorderColor)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.5)
      .attr("rx", 6);
    
    // Legend title
    legend.append("text")
      .attr("x", 0)
      .attr("y", 5)
      .attr("fill", legendTextColor)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Legend");
    
    // Query point (large X)
    const drawLegendX = (x: number, y: number, size: number, color: string) => {
      const halfSize = size / 2;
      legend.append("line")
        .attr("x1", x - halfSize)
        .attr("y1", y - halfSize)
        .attr("x2", x + halfSize)
        .attr("y2", y + halfSize)
        .attr("stroke", color)
        .attr("stroke-width", 2);
      legend.append("line")
        .attr("x1", x - halfSize)
        .attr("y1", y + halfSize)
        .attr("x2", x + halfSize)
        .attr("y2", y - halfSize)
        .attr("stroke", color)
        .attr("stroke-width", 2);
    };
    
    drawLegendX(8, 20, 10, targetColor);
    legend.append("text")
      .attr("x", 18)
      .attr("y", 24)
      .attr("fill", legendTextColor)
      .style("font-size", "11px")
      .text("Query point");
    
    // Related points (small X)
    drawLegendX(8, 38, 6, targetColor);
    legend.append("text")
      .attr("x", 18)
      .attr("y", 41)
      .attr("fill", legendTextColor)
      .style("font-size", "11px")
      .text("Related points");
    
    // Path lines
    legend.append("line")
      .attr("x1", 0)
      .attr("y1", 54)
      .attr("x2", 12)
      .attr("y2", 54)
      .attr("stroke", targetColor)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", "4,2");
    
    legend.append("text")
      .attr("x", 18)
      .attr("y", 58)
      .attr("fill", legendTextColor)
      .style("font-size", "11px")
      .text("Paths");
    
    // Centroids
    const strokeColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--neutral-surface-strong').trim() || '#fff';
    legend.append("circle")
      .attr("cx", 6)
      .attr("cy", 72)
      .attr("r", 4)
      .attr("fill", targetColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 1.5);
    
    legend.append("text")
      .attr("x", 18)
      .attr("y", 75)
      .attr("fill", legendTextColor)
      .style("font-size", "11px")
      .text("Centroids (darker = deeper)");
    
  }, [points, rootNodes, depth, queryPoint, relatedPoints]);
  
  // Draw attention sequence visualization
  useEffect(() => {
    if (!attentionSvgRef.current || rootNodes.length === 0) return;
    
    const svg = d3.select(attentionSvgRef.current);
    svg.selectAll("*").remove();
    
    const width = 800;
    const height = 120;
    const margin = { top: 60, right: 20, bottom: 40, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const MAX_SEQ_LENGTH = 16;
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const targetColor = theme === 'light' ? '#06b6d4' : '#fbbf24';
    const axisColor = theme === 'light' ? '#000' : '#fff';
    
    // Get clusters that should be in attention at this depth
    // CHART works by: expand only top α fraction (α ~ 0.25) based on attention scores
    // The attention window contains: unexpanded nodes from previous level + children of expanded nodes
    // Example: at level 2 we have 8 nodes, 5 get expanded → level 3 shows: 3 (unexpanded from level 2) + 10 (children of 5 expanded)
    
    let clustersInAttention: ClusterNode[] = [];
    
    // Helper function to get clusters in attention at a given depth
    // Returns: unexpanded nodes from previous level + children of expanded nodes
    const getAttentionAtDepth = (targetDepth: number): {nodes: ClusterNode[], expanded: ClusterNode[], unexpanded: ClusterNode[]} => {
      if (targetDepth === 0) {
        // At root: show all root clusters (K₀ nodes), all are "in attention" (none expanded yet)
        const rootClusters = getClustersAtDepth(rootNodes, 0);
        return { nodes: rootClusters, expanded: [], unexpanded: rootClusters };
      } else {
        // Get attention from previous depth
        const prevAttention = getAttentionAtDepth(targetDepth - 1);
        const previousNodes = prevAttention.nodes;
        
        // Determine which nodes got expanded (on path = high attention = expanded)
        const expanded: ClusterNode[] = [];
        const unexpanded: ClusterNode[] = [];
        
        previousNodes.forEach(cluster => {
          const isOnPath = isClusterOnPath(cluster, queryPoint, targetDepth - 1);
          const hasRelated = relatedPoints.some(rp => 
            cluster.points.some(p => p.id === rp.id)
          );
          
          if ((isOnPath || hasRelated) && cluster.children.length > 0) {
            // This cluster got expanded (high attention)
            expanded.push(cluster);
          } else {
            // This cluster did NOT get expanded (stays in attention window)
            unexpanded.push(cluster);
          }
        });
        
        // Get children of expanded nodes
        const childrenOfExpanded: ClusterNode[] = [];
        expanded.forEach(cluster => {
          childrenOfExpanded.push(...cluster.children);
        });
        
        // Attention window = unexpanded nodes + children of expanded nodes
        const nodes = [...unexpanded, ...childrenOfExpanded];
        return { nodes, expanded, unexpanded };
      }
    };
    
    if (depth === 0) {
      // At root: show all root clusters (K₀ nodes)
      clustersInAttention = getClustersAtDepth(rootNodes, 0);
    } else if (depth === maxDepth - 1) {
      // At Leaves level: show both leaf clusters AND their parents that were NOT expanded
      const prevAttention = getAttentionAtDepth(depth - 1);
      const unexpandedParents = prevAttention.unexpanded;
      const leafClusters = getClustersAtDepth(rootNodes, depth);
      
      // Show: unexpanded parents + leaf clusters
      clustersInAttention = [...unexpandedParents, ...leafClusters];
    } else {
      // At intermediate depths: unexpanded nodes from previous + children of expanded nodes
      const attention = getAttentionAtDepth(depth);
      clustersInAttention = attention.nodes;
    }
    
    // Assign numbers to ALL clusters across all depths (for consistent labeling)
    const allClusters: Array<{cluster: ClusterNode, depth: number}> = [];
    for (let d = 0; d <= maxDepth; d++) {
      const clustersAtD = getClustersAtDepth(rootNodes, d);
      clustersAtD.forEach(cluster => {
        allClusters.push({ cluster, depth: d });
      });
    }
    
    // Create mapping: cluster -> number (1-based, 0 is query)
    // Number clusters depth-first: all at depth 0, then all at depth 1, etc.
    const clusterToNumber = new Map<ClusterNode, number>();
    allClusters.forEach(({ cluster }, idx) => {
      clusterToNumber.set(cluster, idx + 1);
    });
    
    // Build sequence: [Query, ...clusters in attention at this depth]
    const sequence: Array<{type: 'query' | 'cluster', cluster?: ClusterNode, number?: number, attention: number}> = [];
    
    // Position 0: Query (always highest attention)
    sequence.push({ type: 'query', attention: 1.0 });
    
    // Positions 1-15: Clusters in attention (expanded from previous level)
    clustersInAttention.forEach(cluster => {
      const number = clusterToNumber.get(cluster);
      if (number !== undefined) {
        // Attention decreases for later positions (simulate attention weights)
        const position = sequence.length;
        const attention = position < MAX_SEQ_LENGTH ? 1.0 - (position * 0.05) : 0.1;
        sequence.push({ type: 'cluster', cluster, number, attention: Math.max(0.1, attention) });
      }
    });
    
    // Better spacing: larger boxes with more space between them
    const clusterWidth = 45;
    const boxHeight = clusterWidth; // Make boxes square
    const clusterSpacing = 3; // Space between boxes
    const totalWidth = (MAX_SEQ_LENGTH * clusterWidth) + ((MAX_SEQ_LENGTH - 1) * clusterSpacing);
    const startX = (innerWidth - totalWidth) / 2; // Center the sequence
    
    // Draw all 16 positions
    for (let i = 0; i < MAX_SEQ_LENGTH; i++) {
      const x = startX + i * (clusterWidth + clusterSpacing);
      const y = innerHeight / 2;
      
      const item = sequence[i];
      const isEmpty = !item;
      
      if (isEmpty) {
        // Empty slot
        g.append("rect")
          .attr("x", x)
          .attr("y", y - boxHeight / 2)
          .attr("width", clusterWidth)
          .attr("height", boxHeight)
          .attr("fill", "none")
          .attr("stroke", axisColor)
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.2)
          .attr("stroke-dasharray", "2,2")
          .attr("rx", 4);
      } else if (item.type === 'query') {
        // Query position (always highest attention)
        g.append("rect")
          .attr("x", x)
          .attr("y", y - boxHeight / 2)
          .attr("width", clusterWidth)
          .attr("height", boxHeight)
          .attr("fill", "var(--neutral-surface-weak)")
          .attr("stroke", targetColor)
          .attr("stroke-width", 1) // Fixed 1px outline
          .attr("rx", 4);
        
        // Query X marker (centered in box) with outline
        const halfSize = 10;
        const outlineColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--neutral-surface-strong').trim() || '#fff';
        const outlineWidth = 0.5;
        
        // Draw outline first (behind)
        g.append("line")
          .attr("x1", x + clusterWidth / 2 - halfSize)
          .attr("y1", y - halfSize)
          .attr("x2", x + clusterWidth / 2 + halfSize)
          .attr("y2", y + halfSize)
          .attr("stroke", outlineColor)
          .attr("stroke-width", 2.5 + outlineWidth * 2)
          .attr("opacity", 0.8);
        g.append("line")
          .attr("x1", x + clusterWidth / 2 - halfSize)
          .attr("y1", y + halfSize)
          .attr("x2", x + clusterWidth / 2 + halfSize)
          .attr("y2", y - halfSize)
          .attr("stroke", outlineColor)
          .attr("stroke-width", 2.5 + outlineWidth * 2)
          .attr("opacity", 0.8);
        
        // Draw main X on top
        g.append("line")
          .attr("x1", x + clusterWidth / 2 - halfSize)
          .attr("y1", y - halfSize)
          .attr("x2", x + clusterWidth / 2 + halfSize)
          .attr("y2", y + halfSize)
          .attr("stroke", targetColor)
          .attr("stroke-width", 2.5);
        g.append("line")
          .attr("x1", x + clusterWidth / 2 - halfSize)
          .attr("y1", y + halfSize)
          .attr("x2", x + clusterWidth / 2 + halfSize)
          .attr("y2", y - halfSize)
          .attr("stroke", targetColor)
          .attr("stroke-width", 2.5);
        
        // Label
        g.append("text")
          .attr("x", x + clusterWidth / 2)
          .attr("y", y + boxHeight / 2 + 15)
          .attr("fill", axisColor)
          .style("font-size", "11px")
          .style("text-anchor", "middle")
          .style("font-weight", "bold")
          .text("Query");
        
        // Query token does not have a depth label
      } else {
        // Cluster position
        const attention = item.attention;
        const strokeWidth = 1; // Fixed 1px outline
        
        // Determine if this cluster will expand (on path = high attention = will expand)
        const clusterDepth = item.cluster?.depth ?? depth;
        const isOnPath = item.cluster ? isClusterOnPath(item.cluster, queryPoint, clusterDepth) : false;
        const hasRelated = item.cluster ? relatedPoints.some(rp => 
          item.cluster!.points.some(p => p.id === rp.id)
        ) : false;
        const willExpand = Boolean((isOnPath || hasRelated) && item.cluster && item.cluster.children.length > 0);
        
        // Get cluster color (need to find its index in clustersInAttention)
        const clusterIdx = clustersInAttention.findIndex(c => c === item.cluster);
        const getThemeColor = (index: number, total: number, expandBrightness: boolean) => {
          // Add randomness to brightness (simulate natural attention score variation)
          // Use cluster index as seed for deterministic randomness
          const randomSeed = (index * 17 + clusterDepth * 31) % 100;
          const randomVariation = (randomSeed / 100) * 8 - 4; // -4 to +4 variation
          
          if (theme === 'light') {
            const hue = 0;
            const saturation = 70;
            // Brighter if will expand, dimmer if not, with random variation
            const baseLightness = 30 + (index / total) * 25;
            const baseAdjustment = expandBrightness ? 15 : -10;
            const lightness = baseLightness + baseAdjustment + randomVariation;
            return `hsl(${hue}, ${saturation}%, ${Math.max(20, Math.min(60, lightness))}%)`;
          } else {
            const hue = 270;
            const saturation = 60;
            // Brighter if will expand, dimmer if not, with random variation
            const baseLightness = 40 + (index / total) * 30;
            const baseAdjustment = expandBrightness ? 15 : -15;
            const lightness = baseLightness + baseAdjustment + randomVariation;
            return `hsl(${hue}, ${saturation}%, ${Math.max(25, Math.min(70, lightness))}%)`;
          }
        };
        const bgColor = clusterIdx >= 0 ? getThemeColor(clusterIdx, clustersInAttention.length, willExpand) : "var(--neutral-surface-weak)";
        
        g.append("rect")
          .attr("x", x)
          .attr("y", y - boxHeight / 2)
          .attr("width", clusterWidth)
          .attr("height", boxHeight)
          .attr("fill", bgColor)
          .attr("stroke", targetColor)
          .attr("stroke-width", strokeWidth) // Fixed 1px outline
          .attr("rx", 4);
        
        // Centroid circle - apply depth-based darkening and size scaling
        // clusterDepth already declared above (used for willExpand calculation)
        
        // Darken color based on depth: brightest for current depth, darker for previous
        const darkenColorByDepth = (hex: string, currentDepth: number, targetDepth: number): string => {
          if (currentDepth === 0 || targetDepth === currentDepth) {
            return hex;
          }
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const darkenFactor = 0.4 + (0.6 * (targetDepth / currentDepth));
          const newR = Math.round(r * darkenFactor);
          const newG = Math.round(g * darkenFactor);
          const newB = Math.round(b * darkenFactor);
          return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        };
        // Shrink size based on depth: largest for current depth, smaller for previous
        const getSizeScaleByDepth = (currentDepth: number, targetDepth: number): number => {
          if (currentDepth === 0 || targetDepth === currentDepth) {
            return 1.0;
          }
          return 0.6 + (0.4 * (targetDepth / currentDepth));
        };
        
        const baseCentroidColor = theme === 'light' ? '#06b6d4' : '#fbbf24';
        const centroidColor = darkenColorByDepth(baseCentroidColor, depth, clusterDepth);
        const sizeScale = getSizeScaleByDepth(depth, clusterDepth);
        const strokeColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--neutral-surface-strong').trim() || '#fff';
        
        g.append("circle")
          .attr("cx", x + clusterWidth / 2)
          .attr("cy", y) // Centered vertically in box
          .attr("r", 6 * sizeScale) // Scale radius based on depth
          .attr("fill", centroidColor) // Darkened based on depth
          .attr("stroke", strokeColor)
          .attr("stroke-width", 1.5 * sizeScale); // Scale stroke width
        
        // Number label (from 2D visualization)
        g.append("text")
          .attr("x", x + clusterWidth / 2)
          .attr("y", y + boxHeight / 2 + 15)
          .attr("fill", axisColor)
          .style("font-size", "12px")
          .style("text-anchor", "middle")
          .style("font-weight", "bold")
          .text(item.number?.toString() || "");
        
        // Depth label - use actual cluster depth, not selected depth (clusterDepth already declared above)
        const depthLabel = clusterDepth === 0 ? "Root" : clusterDepth === maxDepth - 1 ? "Leaves" : clusterDepth.toString();
        g.append("text")
          .attr("x", x + clusterWidth / 2)
          .attr("y", y - boxHeight / 2 - 8)
          .attr("fill", axisColor)
          .style("font-size", "10px")
          .style("text-anchor", "middle")
          .style("font-weight", "bold")
          .text(depthLabel);
      }
    }
    
    // Title - positioned higher to avoid collision with depth labels (2x higher than before)
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -40)
      .attr("fill", axisColor)
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .text(`Attention Sequence (Depth ${depth})`);
    
  }, [rootNodes, depth, queryPoint, relatedPoints, maxDepth]);

  // TREE VISUALIZATION AS PICTURE-IN-PICTURE OVERLAY WITH PATH HIGHLIGHTING
  useEffect(() => {
    if (!svgRef.current || rootNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    
    // Remove existing tree overlay
    svg.selectAll(".tree-overlay").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 25, bottom: 45, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // TREE OVERLAY POSITION AND SIZE
    // When collapsed, show just a small tab in the corner
    const treeBoxWidth = treeExpanded ? 300 : 40; // Small tab when collapsed
    const treeBoxHeight = treeExpanded ? 300 : 30; // Small tab when collapsed
    const treeX = margin.left + 20; // Top-left corner (matches viz1)
    const treeY = margin.top + 10; // Top-left corner (matches viz1)
    
    // Create overlay group with background
    const treeOverlay = svg.append("g")
      .attr("class", "tree-overlay")
      .attr("transform", `translate(${treeX}, ${treeY})`);

    // Background box with border - theme-aware (explicit colors with subtle tint)
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const treeBgColor = theme === 'light' ? '#f8f0f0' : '#1f1a25'; // Light red tint / dark purple tint
    const treeBorderColor = theme === 'light' ? '#000' : '#fff'; // Match text color
    const treeTextColor = theme === 'light' ? '#000' : '#fff';
    
    treeOverlay.append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", treeBoxWidth)
      .attr("height", treeBoxHeight)
      .attr("fill", treeBgColor)
      .attr("stroke", treeBorderColor)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.5)
      .attr("rx", 6)
      .attr("opacity", 0.95)
      .style("cursor", "pointer")
      .on("click", () => setTreeExpanded(!treeExpanded));

    // Only show tree content when expanded
    if (treeExpanded) {
      // Tree container with appropriate size
      const treeWidth = treeBoxWidth - 20;
      const treeHeight = treeBoxHeight - 30; // Leave room for title
      const treeMargin = { top: 25, right: 10, bottom: 10, left: 10 };
      const treeInnerWidth = treeWidth - treeMargin.left - treeMargin.right;
      const treeInnerHeight = treeHeight - treeMargin.top - treeMargin.bottom;

      const treeG = treeOverlay.append("g")
        .attr("transform", `translate(${treeMargin.left}, ${treeMargin.top})`);

      // CONVERT CLUSTER TREE TO D3 HIERARCHY FORMAT - SHOW FULL TREE
      interface D3Node extends d3.HierarchyNode<any> {
        clusterNode?: ClusterNode;
        x?: number;
        y?: number;
      }

      // Create a virtual root that contains all root clusters as children
      const virtualRoot: any = {
        id: -1,
        depth: -1,
        children: rootNodes.map((node, idx) => ({
          id: node.id,
          depth: node.depth,
          clusterNode: node,
          children: [],
        })),
      };

      // Recursively build the FULL hierarchy (all depths)
      function buildFullHierarchy(node: ClusterNode): any {
        return {
          id: node.id,
          depth: node.depth,
          clusterNode: node,
          children: node.children.map(child => buildFullHierarchy(child)),
        };
      }

      virtualRoot.children = rootNodes.map(node => buildFullHierarchy(node));

      // Create D3 hierarchy
      const root = d3.hierarchy(virtualRoot) as D3Node;
      
      // Create tree layout
      const treeLayout = d3.tree<D3Node>()
        .size([treeInnerHeight, treeInnerWidth])
        .separation((a, b) => {
          return (a.parent === b.parent ? 1 : 1.5) / Math.max(a.depth, 1);
        });

      const treeData = treeLayout(root);

      // COLOR SCALE
      const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, Math.max(rootNodes.length - 1, 1)]);
      
      const linkColor = theme === 'light' ? '#000' : '#fff'; // Match text color
      const pathColor = theme === 'light' ? '#06b6d4' : '#fbbf24';
      const nodeColor = pathColor;
      const strokeColor = theme === 'light' ? '#000' : '#fff'; // Match text color

      // Helper to check if a cluster is on the query path OR any related point path
      // Only highlight paths up to the current depth
      const isNodeOnPath = (node: any): boolean => {
        if (!node.data.clusterNode) return false;
        // Only highlight if node depth <= current depth (path up to current level)
        if (node.data.depth > depth) return false;
        
        // Check if on path to query point
        if (isClusterOnPath(node.data.clusterNode, queryPoint, node.data.depth)) {
          return true;
        }
        // Check if on path to any related point
        return relatedPoints.some(rp => 
          isClusterOnPath(node.data.clusterNode, rp, node.data.depth)
        );
      };

      // DRAW LINKS (edges) - highlight paths
      const links = treeData.links();
      treeG.selectAll(".tree-link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "tree-link")
        .attr("d", d3.linkHorizontal<any, D3Node>()
          .x((d: any) => d.y)
          .y((d: any) => d.x))
        .attr("fill", "none")
        .attr("stroke", (d: any) => {
          // Highlight links on the query path, but only up to current depth
          const sourceOnPath = isNodeOnPath(d.source);
          const targetOnPath = isNodeOnPath(d.target);
          // Only highlight if both nodes are on path AND target depth <= current depth
          if (sourceOnPath && targetOnPath && d.target.data.depth <= depth) {
            return pathColor;
          }
          return linkColor;
        })
        .attr("stroke-width", (d: any) => {
          const sourceOnPath = isNodeOnPath(d.source);
          const targetOnPath = isNodeOnPath(d.target);
          if (sourceOnPath && targetOnPath && d.target.data.depth <= depth) {
            return 3;
          }
          return 1;
        })
        .attr("stroke-opacity", (d: any) => {
          const sourceOnPath = isNodeOnPath(d.source);
          const targetOnPath = isNodeOnPath(d.target);
          if (sourceOnPath && targetOnPath && d.target.data.depth <= depth) {
            return 0.8;
          }
          // Dim links to nodes deeper than current depth
          if (d.target.data.depth > depth) {
            return 0.2;
          }
          return 0.3;
        });

      // DRAW NODES
      const nodes = treeData.descendants();
      const nodeGroups = treeG.selectAll(".tree-node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "tree-node")
        .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
        .style("cursor", "pointer");

      // Draw node circles - SIZE DECREASES WITH DEPTH
      const baseRadius = 5;
      
      nodeGroups
        .filter((d: any) => d.data.id !== -1) // Skip virtual root
        .append("circle")
        .attr("r", (d: any) => {
          // Nodes get smaller as depth increases
          if (d.data.depth === 0) return baseRadius;
          const scaleFactor = Math.max(0.3, 1 - (d.data.depth * 0.2));
          return baseRadius * scaleFactor;
        })
        .attr("fill", (d: any) => {
          const onPath = isNodeOnPath(d);
          if (onPath) return pathColor;
          if (d.data.depth === 0) {
            const rootIdx = rootNodes.findIndex(r => r.id === d.data.id);
            return rootIdx >= 0 ? colorScale(rootIdx) : nodeColor;
          }
          return nodeColor;
        })
        .attr("stroke", strokeColor)
        .attr("stroke-width", (d: any) => {
          const onPath = isNodeOnPath(d);
          return (d.data.depth === depth || onPath) ? 2 : 1;
        })
        .attr("opacity", (d: any) => {
          const onPath = isNodeOnPath(d);
          // Highlight nodes at current depth or on path up to current depth
          if (d.data.depth === depth || onPath) return 1;
          // For nodes deeper than current depth, make them dimmer
          if (d.data.depth > depth) return 0.3;
          return 0.6;
        });
    }

    // Add title - show full text when expanded, just "Tree" when collapsed
    const titleText = treeOverlay.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", treeTextColor)
      .style("font-size", treeExpanded ? "11px" : "10px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text(treeExpanded ? "Tree View (click to collapse)" : "Tree");
    
    // Center text - adjust position based on expanded/collapsed state
    if (treeExpanded) {
      titleText.attr("x", treeBoxWidth / 2);
      titleText.attr("y", 8);
    } else {
      // For collapsed, center in the box
      // Rect is at -10, -10 with width treeBoxWidth, height treeBoxHeight
      // Geometric center of rect: x = -10 + treeBoxWidth/2, y = -10 + treeBoxHeight/2
      // For a 40x30 box: center is at x=10, y=5
      titleText.attr("x", treeBoxWidth / 2 - 10);
      titleText.attr("y", treeBoxHeight / 2 - 10);
      titleText.style("dominant-baseline", "middle");
      titleText.style("text-anchor", "middle");
    }

  }, [rootNodes, depth, queryPoint, relatedPoints, treeExpanded]);
  
  const maxDepthValue = Math.max(maxDepth - 1, 0);
  // Create buttons for ALL depths from 0 to maxDepthValue
  // If maxDepthValue is 5, we need 6 buttons: [0, 1, 2, 3, 4, 5]
  const numButtons = maxDepthValue + 1;
  const buttonDepths = Array.from({ length: numButtons }, (_, i) => i);

  return (
    <Column gap="m" horizontal="center" style={{ marginTop: "24px", marginBottom: "24px" }}>
      <Column gap="s" horizontal="center" style={{ width: "100%" }}>
        {/* Attention sequence visualization */}
        <svg
          ref={attentionSvgRef}
          width={800}
          height={120}
          style={{
            border: "1px solid var(--neutral-border-medium)",
            borderRadius: "8px",
            backgroundColor: "var(--neutral-surface-weak)",
            marginBottom: "12px",
          }}
        />
        <div className={styles.depthButtons}>
          {buttonDepths.map((buttonDepth, idx) => {
            // First button shows "Roots", last button shows "Leaves" only if it's the max depth, others show depth number
            let buttonLabel: string;
            if (idx === 0) {
              buttonLabel = "Roots";
            } else if (idx === buttonDepths.length - 1 && buttonDepth === maxDepthValue) {
              // Only show "Leaves" if this button is at the actual maximum depth
              buttonLabel = "Leaves";
            } else {
              buttonLabel = buttonDepth.toString();
            }
            return (
              <button
                key={idx}
                onClick={() => setDepth(buttonDepth)}
                className={`${styles.depthButton} ${depth === buttonDepth ? styles.active : ''}`}
                aria-label={`Set depth to ${buttonDepth}`}
              >
                {buttonLabel}
              </button>
            );
          })}
        </div>
      </Column>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
        <svg
          ref={svgRef}
          width={800}
          height={600}
          style={{
            border: "1px solid var(--neutral-border-medium)",
            borderRadius: "8px",
            backgroundColor: "var(--neutral-surface-weak)",
          }}
        />
      </div>
    </Column>
  );
}

