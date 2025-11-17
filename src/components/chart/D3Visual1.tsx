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
  const [treeExpanded, setTreeExpanded] = useState(false);
  
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
    
    // Get theme once at the start
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    const width = 810;
    const height = 610;
    const margin = { top: 20, right: 25, bottom: 45, left: 45 };
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
    
    // Add axes with proper styling - theme-aware text colors
    const axisColor = theme === 'light' ? '#000' : '#fff';
    
    // X-axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => Number(d).toFixed(1)));
    
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
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => Number(d).toFixed(1)));
    
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
    const legendX = innerWidth - 160;
    const legendY = 10;
    const legendSpacing = 20;
    
    const legend = g.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);
    
    // Legend background - theme-aware (explicit colors with subtle tint)
    // Slightly more colorful background - subtle tint
    const legendBgColor = theme === 'light' ? '#f8f0f0' : '#1f1a25'; // Light red tint / dark purple tint
    const legendTextColor = theme === 'light' ? '#000' : '#fff';
    const legendBorderColor = theme === 'light' ? '#000' : '#fff'; // Match text color like tree
    
    legend.append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", 170)
      .attr("height", 60)
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
    
    // Cluster example
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 15)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", colorScale(0))
      .attr("stroke", legendBorderColor)
      .attr("stroke-opacity", 0.3);
    
    legend.append("text")
      .attr("x", 18)
      .attr("y", 25)
      .attr("fill", legendTextColor)
      .style("font-size", "11px")
      .text("Clusters");
    
    // Centroid example
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
      .attr("fill", legendTextColor)
      .style("font-size", "11px")
      .text("Centroids");
    
  }, [points, rootNodes, depth]);

  // TREE VISUALIZATION AS PICTURE-IN-PICTURE OVERLAY
  useEffect(() => {
    if (!svgRef.current || rootNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    
    // Remove existing tree overlay
    svg.selectAll(".tree-overlay").remove();

    const width = 810;
    const height = 610;
    const margin = { top: 20, right: 25, bottom: 45, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // TREE OVERLAY POSITION AND SIZE
    // When collapsed, show just a small tab in the corner
    const treeBoxWidth = treeExpanded ? 300 : 40; // Small tab when collapsed
    const treeBoxHeight = treeExpanded ? 300 : 30; // Small tab when collapsed
    const treeX = margin.left + 20; // Top-left corner
    const treeY = margin.top + 10;
    
    // Create overlay group with background
    const treeOverlay = svg.append("g")
      .attr("class", "tree-overlay")
      .attr("transform", `translate(${treeX}, ${treeY})`);

    // Background box with border - theme-aware (explicit colors with subtle tint)
    // Get theme for tree overlay
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    // Slightly more colorful background - subtle tint matching legend
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

    // COLOR SCALE (same as scatter plot)
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, Math.max(rootNodes.length - 1, 1)]);
    
    const linkColor = theme === 'light' ? '#000' : '#fff'; // Match text color
    const nodeColor = theme === 'light' ? '#06b6d4' : '#fbbf24';
    const strokeColor = theme === 'light' ? '#000' : '#fff'; // Match text color
    const highlightColor = theme === 'light' ? '#06b6d4' : '#fbbf24';

    // DRAW LINKS (edges) - dim links to nodes deeper than current depth
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
      .attr("stroke", linkColor)
      .attr("stroke-width", 1)
      .attr("stroke-opacity", (d: any) => {
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
    const baseRadius = treeExpanded ? 5 : 3;
    
    nodeGroups
      .filter((d: any) => d.data.id !== -1) // Skip virtual root
      .append("circle")
      .attr("r", (d: any) => {
        // Nodes get smaller as depth increases
        // Root (depth 0) = baseRadius, deeper nodes scale down
        if (d.data.depth === 0) return baseRadius;
        // Scale down: depth 1 = 0.8x, depth 2 = 0.6x, depth 3 = 0.4x, etc.
        const scaleFactor = Math.max(0.3, 1 - (d.data.depth * 0.2));
        return baseRadius * scaleFactor;
      })
      .attr("fill", (d: any) => {
        // Highlight nodes at current depth with glow color
        if (d.data.depth === depth) return highlightColor;
        // Root nodes use the same node color (not colorScale)
        if (d.data.depth === 0) return nodeColor;
        return nodeColor;
      })
      .attr("stroke", strokeColor)
      .attr("stroke-width", (d: any) => {
        // Slightly thicker stroke for current depth, but not size increase
        return d.data.depth === depth ? 1.5 : 1;
      })
      .attr("opacity", (d: any) => {
        // Highlight nodes at current depth or on path up to current depth
        // Only highlight if node depth <= current depth (path up to current level)
        if (d.data.depth === depth) return 1;
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

  }, [rootNodes, depth, treeExpanded]);
  
  const maxDepthValue = Math.max(maxDepth - 1, 0);
  // Create buttons for ALL depths from 0 to maxDepthValue
  // If maxDepthValue is 5, we need 6 buttons: [0, 1, 2, 3, 4, 5]
  const numButtons = maxDepthValue + 1;
  const buttonDepths = Array.from({ length: numButtons }, (_, i) => i);

  return (
    <Column gap="m" horizontal="center" style={{ marginTop: "24px", marginBottom: "24px" }}>
      <Column gap="s" horizontal="center" style={{ width: "100%" }}>
        <div className={styles.depthButtons}>
          {buttonDepths.map((buttonDepth, idx) => {
            // First button shows "Roots", last button shows "Leaves" only if it's the actual max depth (not just maxDepthValue)
            // maxDepthValue = maxDepth - 1, so if maxDepth is 6, maxDepthValue is 5
            // We want "Leaves" only when buttonDepth equals the actual maximum depth in the tree
            let buttonLabel: string;
            if (idx === 0) {
              buttonLabel = "Roots";
            } else if (idx === buttonDepths.length - 1 && buttonDepth === maxDepthValue && maxDepthValue === maxDepth - 1) {
              // Only show "Leaves" if this button is at the actual maximum depth
              // Check if maxDepthValue represents the true leaves (maxDepth - 1)
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
      <svg
        ref={svgRef}
        width={810}
        height={610}
        style={{
          border: "1px solid var(--neutral-border-medium)",
          borderRadius: "8px",
          backgroundColor: "var(--neutral-surface-weak)",
        }}
      />
    </Column>
  );
}

