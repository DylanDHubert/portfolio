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
  const [depth, setDepth] = useState(0);
  const [maxDepth, setMaxDepth] = useState(0);
  
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
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
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
    
    // Helper function to draw X marker
    const drawX = (x: number, y: number, size: number, color: string, strokeWidth: number, opacity: number = 1) => {
      const halfSize = size / 2;
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
      
      return { line1, line2 };
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
      if (queryPath[d - 1] && queryPath[d]) {
        // Darken color based on depth: brightest for current depth, darker for previous
        const lineColor = darkenColorByDepth(targetColor, depth, d);
        // Shrink size based on depth: largest for current depth, smaller for previous
        const sizeScale = getSizeScaleByDepth(depth, d);
        
        g.append("line")
          .attr("x1", xScale(queryPath[d - 1].x))
          .attr("y1", yScale(queryPath[d - 1].y))
          .attr("x2", xScale(queryPath[d].x))
          .attr("y2", yScale(queryPath[d].y))
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
        if (relatedPath[d - 1] && relatedPath[d]) {
          // Darken color based on depth: brightest for current depth, darker for previous
          const lineColor = darkenColorByDepth(targetColor, depth, d);
          // Shrink size based on depth: largest for current depth, smaller for previous
          const sizeScale = getSizeScaleByDepth(depth, d);
          
          g.append("line")
            .attr("x1", xScale(relatedPath[d - 1].x))
            .attr("y1", yScale(relatedPath[d - 1].y))
            .attr("x2", xScale(relatedPath[d].x))
            .attr("y2", yScale(relatedPath[d].y))
            .attr("stroke", lineColor)
            .attr("stroke-width", 2 * sizeScale) // Scale stroke width
            .attr("stroke-opacity", 0.6) // Fixed opacity
            .attr("stroke-dasharray", "8,4")
            .attr("stroke-dashoffset", 0)
            .attr("class", "flowing-line-related");
        }
      }
    });
    
    // Draw centroids from all previous depths (on top of lines)
    // Color darkens and size shrinks with depth: brightest/largest for current level, darker/smaller for previous depths
    // All centroids at 100% opacity
    for (let d = 0; d <= depth; d++) {
      const clustersAtD = getClustersAtDepth(rootNodes, d);
      clustersAtD.forEach(cluster => {
        const isOnPath = isClusterOnPath(cluster, queryPoint, d);
        const hasRelated = relatedPoints.some(rp => 
          cluster.points.some(p => p.id === rp.id)
        );
        
        // Only draw centroids that are on a path
        if (isOnPath || hasRelated) {
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
        }
      });
    }
    
    
    // Add axes
    const axisColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--neutral-text-medium') || '#666';
    
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d.toFixed(1)));
    
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
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d.toFixed(1)));
    
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
    
  }, [points, rootNodes, depth, queryPoint, relatedPoints]);
  
  const maxDepthValue = Math.max(maxDepth - 1, 0);
  const buttonDepths = Array.from({ length: 5 }, (_, i) => {
    if (maxDepthValue === 0) return 0;
    return Math.floor((i / 4) * maxDepthValue);
  });

  return (
    <Column gap="m" horizontal="center" style={{ marginTop: "24px", marginBottom: "24px" }}>
      <Column gap="s" horizontal="center" style={{ width: "100%" }}>
        <div className={styles.depthButtons}>
          {buttonDepths.map((buttonDepth, idx) => {
            // First button shows "Roots", last button shows "Leaves", others show depth number
            const buttonLabel = idx === 0 ? "Roots" : idx === buttonDepths.length - 1 ? "Leaves" : buttonDepth.toString();
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
    </Column>
  );
}

