import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = 1024;
const height = 768;
const flagOffset = 15

// Good reference to recreate directed graph
// https://observablehq.com/@d3/force-directed-graph/2?intent=fork
const darwGraph = async () => {
  const dataset = await d3.json(
    "https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json"
  );

  const { nodes, links } = dataset;

  // Create copy of nodes and links for inpure simulation
  const newNodes = nodes.map((node) => {
    return { ...node };
  });
  const newLinks = links.map((link) => {
    return { ...link };
  });

  const svg = d3
    .select(".wrapper")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  const simulation = d3
    .forceSimulation(newNodes)
    .force("link", d3.forceLink(newLinks))
    .force("charge", d3.forceManyBody())
    .force("x", d3.forceX(width / 2))
    .force("y", d3.forceY(height / 2))
    .on("tick", tick);

  const drag = d3
    .drag()
    .on("start", (e) => {
      if (!e.active) simulation.alphaTarget(0.3).restart();
      // Specify two additional properties to fix a node in a given position
      // See: https://d3js.org/d3-force/simulation#simulation_restart
      e.subject.fx = e.subject.x;
      e.subject.fy = e.subject.y;
    })
    .on("drag", (e) => {
      e.subject.fx = e.x;
      e.subject.fy = e.y;
    })
    .on("end", (e) => {
      if (!e.active) simulation.alphaTarget(0);
      e.subject.fx = null;
      e.subject.fy = null;
    });

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll()
    .data(newLinks)
    .join("line")
    .attr("stroke-width", 0.5);

  const node = d3
    .select(".flags")
    .selectAll()
    .data(newNodes)
    .join("span")
    .attr("class", (node) => `flag flag-${node.code}`)
    .attr("data-country", (node) => node.country)
    .style("transform", "scale(0.5)")
    .on("mouseover", (e) => console.log(e))
    .call(drag);

  function tick() {
    link
      .attr("x1", (links) => links.source.x)
      .attr("y1", (links) => links.source.y)
      .attr("x2", (links) => links.target.x)
      .attr("y2", (links) => links.target.y);


    node
      .style("left", (node) => `${node.x - flagOffset}px`)
      .style("top", (node) => `${node.y - flagOffset}px`)
  }
};

darwGraph();
