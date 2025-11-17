"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { Column, Text } from "@once-ui-system/core";
import styles from "./D3Visual1.module.scss";

interface Point {
  x: number;
  y: number;
  id: number;
  clusterPath: number[]; // Path through the tree: [depth0_cluster, depth1_cluster, ...]
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
    // Mostly random distribution with slight Gaussian tendency toward center
    const angle = rng.next() * Math.PI * 2;
    const radius = rng.next() * 200 + rng.next() * 100; // Slight bias toward center
    const x = Math.cos(angle) * radius + (rng.next() - 0.5) * 50;
    const y = Math.sin(angle) * radius + (rng.next() - 0.5) * 50;
    
    // Add some very subtle local structure (tiny bit of clustering tendency)
    const localBias = rng.next() < 0.3 ? 20 : 0; // 30% chance of slight local grouping
    const biasAngle = rng.next() * Math.PI * 2;
    const finalX = x + Math.cos(biasAngle) * localBias * rng.next();
    const finalY = y + Math.sin(biasAngle) * localBias * rng.next();
    
    points.push({
      x: finalX,
      y: finalY,
      id: i,
      clusterPath: [], // Will be filled by clustering
    });
  }
  
  return points;
}

// K-means clustering (k=2)
function kMeans(points: Point[], k: number = 2, iterations: number = 10): Point[][] {
  if (points.length === 0) return [];
  if (points.length <= k) return points.map(p => [p]);
  
  // Initialize centroids randomly
  let centroids = points
    .sort(() => Math.random() - 0.5)
    .slice(0, k)
    .map(p => ({ x: p.x, y: p.y }));
  
  for (let iter = 0; iter < iterations; iter++) {
    // Assign points to nearest centroid
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
    
    // Update centroids
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
  
  // Final assignment
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
    // Update cluster path for all points in this cluster
    clusterPoints.forEach(point => {
      // Build the full path: parent path + current cluster index
      const currentPath = [...parentPath, idx];
      // Ensure clusterPath is long enough
      while (point.clusterPath.length <= currentDepth) {
        point.clusterPath.push(0);
      }
      // Update the path at this depth
      point.clusterPath[currentDepth] = idx;
      // Also store the full path for reference
      point.clusterPath = currentPath;
    });
    
    // Calculate centroid
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
    
    // Recursively cluster children if we have enough points
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
    
    // Add the original point
    smoothed.push(p1);
    
    // Add an intermediate point between p1 and p2 for smoother curves
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

export function D3Visual1() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [depth, setDepth] = useState(0);
  const [maxDepth, setMaxDepth] = useState(0);
  
  // Generate data and build tree
  const { points, rootNodes, calculatedMaxDepth } = useMemo(() => {
    const generatedPoints = generatePoints(2000);
    const tree = buildClusterTree(generatedPoints, 6);
    
    // Find max depth in tree
    let maxDepthFound = 0;
    function findMaxDepth(node: ClusterNode) {
      maxDepthFound = Math.max(maxDepthFound, node.depth);
      node.children.forEach(findMaxDepth);
    }
    tree.forEach(findMaxDepth);
    
    return {
      points: generatedPoints,
      rootNodes: tree,
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
    
    // Normalize to 0-1 range for both axes
    const allX = points.map(p => p.x);
    const allY = points.map(p => p.y);
    const xMin = Math.min(...allX);
    const xMax = Math.max(...allX);
    const yMin = Math.min(...allY);
    const yMax = Math.max(...allY);
    
    // Normalize points to 0-1
    const normalizedPoints = points.map(p => ({
      ...p,
      normalizedX: (p.x - xMin) / (xMax - xMin || 1),
      normalizedY: (p.y - yMin) / (yMax - yMin || 1),
    }));
    
    // Add padding
    const padding = 0.05;
    
    const xScale = d3
      .scaleLinear()
      .domain([0 - padding, 1 + padding])
      .range([0, innerWidth]);
    
    const yScale = d3
      .scaleLinear()
      .domain([1 + padding, 0 - padding]) // Inverted for SVG coordinates
      .range([0, innerHeight]);
    
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Get clusters at current depth
    const clustersAtDepth = getClustersAtDepth(rootNodes, depth);
    
    // Color scale for clusters - use theme colors
    const getThemeColor = (index: number, total: number) => {
      // Use CSS custom properties for theme-aware colors
      const style = getComputedStyle(document.documentElement);
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      
      // Create a gradient of theme colors based on active theme
      if (theme === 'light') {
        // Light theme: maroon/red gradient
        const hue = 0; // Red
        const saturation = 70;
        const lightness = 30 + (index / total) * 25;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      } else {
        // Dark theme: purple gradient
        const hue = 270; // Purple
        const saturation = 60;
        const lightness = 40 + (index / total) * 30;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      }
    };
    
    const colorScale = (index: number) => getThemeColor(index, Math.max(clustersAtDepth.length, 1));
    
    // Normalize centroids
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
    }));
    
    // Draw cluster hulls (convex hulls with smoothing)
    normalizedClusters.forEach((cluster, idx) => {
      if (cluster.normalizedPoints.length < 3) return;
      
      // Create convex hull
      const hullPoints = cluster.normalizedPoints.map(p => [xScale(p.normalizedX), yScale(p.normalizedY)]);
      const hull = d3.polygonHull(hullPoints as [number, number][]);
      
      if (hull && hull.length > 2) {
        // Smooth the hull by adding intermediate points and using a smoother curve
        const smoothHull = smoothPolygon(hull, 0.3);
        
        g.append("path")
          .datum(smoothHull)
          .attr("fill", colorScale(idx))
          .attr("fill-opacity", 0.15)
          .attr("stroke", colorScale(idx))
          .attr("stroke-width", 2)
          .attr("stroke-opacity", 0.6)
          .attr("d", d3.line()
            .curve(d3.curveCatmullRomClosed.alpha(0.5))
            .x(d => d[0])
            .y(d => d[1]));
      }
      
    });
    
    // Draw all points using normalized coordinates FIRST (so centroids appear on top)
    g.selectAll(".point")
      .data(normalizedPoints)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.normalizedX))
      .attr("cy", d => yScale(d.normalizedY))
      .attr("r", 1.2)
      .attr("fill", d => {
        // Color point based on its cluster at current depth
        if (d.clusterPath && d.clusterPath.length > depth && clustersAtDepth.length > 0) {
          // Find which cluster at this depth contains this point
          const clusterIdx = clustersAtDepth.findIndex(cluster => 
            cluster.points.some(p => p.id === d.id)
          );
          if (clusterIdx >= 0) {
            return colorScale(clusterIdx);
          }
        }
        return "var(--neutral-text-weak)";
      })
      .attr("opacity", 0.7);
    
    // Draw centroids AFTER points so they appear on top
    normalizedClusters.forEach((cluster, idx) => {
      // Draw centroids with contrast colors (yellow for dark, turquoise for light)
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      const centroidColor = theme === 'light' 
        ? '#06b6d4' // Turquoise for light mode
        : '#fbbf24'; // Yellow for dark mode
      const strokeColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--neutral-surface-strong').trim() || '#fff';
      g.append("circle")
        .attr("cx", xScale(cluster.normalizedCentroid.x))
        .attr("cy", yScale(cluster.normalizedCentroid.y))
        .attr("r", 6)
        .attr("fill", centroidColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);
    });
    
    // Add axes with proper styling
    const axisColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--neutral-text-medium') || '#666';
    
    // X-axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d.toFixed(1)));
    
    xAxis.attr("color", axisColor)
      .selectAll("text")
      .style("fill", axisColor)
      .style("font-size", "12px");
    
    // X-axis label
    xAxis.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", axisColor)
      .style("font-size", "14px")
      .style("text-anchor", "middle")
      .text("Normalized X");
    
    // Y-axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d.toFixed(1)));
    
    yAxis.attr("color", axisColor)
      .selectAll("text")
      .style("fill", axisColor)
      .style("font-size", "12px");
    
    // Y-axis label
    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -innerHeight / 2)
      .attr("fill", axisColor)
      .style("font-size", "14px")
      .style("text-anchor", "middle")
      .text("Normalized Y");
    
    // Style axis lines and ticks
    g.selectAll(".domain, .tick line")
      .attr("stroke", axisColor)
      .attr("stroke-opacity", 0.3);
    
    // Add legend in top-right corner
    const legendX = innerWidth - 180;
    const legendY = 20;
    const legendSpacing = 20;
    
    const legend = g.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);
    
    // Legend background
    legend.append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", 170)
      .attr("height", 60)
      .attr("fill", "var(--neutral-surface-weak)")
      .attr("stroke", axisColor)
      .attr("stroke-opacity", 0.3)
      .attr("rx", 4);
    
    // Legend title
    legend.append("text")
      .attr("x", 0)
      .attr("y", 5)
      .attr("fill", axisColor)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Legend");
    
    // Cluster example
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 15)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", colorScale(0))
      .attr("stroke", axisColor)
      .attr("stroke-opacity", 0.3);
    
    legend.append("text")
      .attr("x", 18)
      .attr("y", 25)
      .attr("fill", axisColor)
      .style("font-size", "11px")
      .text("Clusters");
    
    // Centroid example
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const centroidColor = theme === 'light' ? '#06b6d4' : '#fbbf24';
    const strokeColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--neutral-surface-strong').trim() || '#fff';
    
    legend.append("circle")
      .attr("cx", 6)
      .attr("cy", 35)
      .attr("r", 4)
      .attr("fill", centroidColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 1.5);
    
    legend.append("text")
      .attr("x", 18)
      .attr("y", 38)
      .attr("fill", axisColor)
      .style("font-size", "11px")
      .text("Centroids");
    
  }, [points, rootNodes, depth]);
  
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

