import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = 1024;
const height = 768;
const flagOffset = 15;

let activeBorders = [];
let unactiveBorders = [];

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
    .force("link", d3.forceLink(newLinks).strength(1.4))
    .force("charge", d3.forceManyBody())
    .force("collide", d3.forceCollide(20))
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("y", d3.forceY(height / 2).strength(0.05))
    .on("tick", tick);

  const drag = d3
    .drag()
    .on("start", (e) => {
      if (!e.active) simulation.alphaTarget(0.05).restart();
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
    .selectAll()
    .data(newLinks)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 1);

  const node = d3
    .select(".flags")
    .selectAll()
    .data(newNodes)
    .join("span")
    .attr("class", (node) => `flag flag-${node.code}`)
    .style("transform", "scale(0.5)")
    .on("mouseover", (e) => {
      const [data] = d3.select(e.target).data();

      activeBorders = newLinks
        .filter((link) => link.target.code === data.code || link.source.code === data.code)
        .map((link) => {
          return link.target.code === data.code ? link.source.code : link.target.code;
        });

      activeBorders.unshift(data.code);

      unactiveBorders = newNodes
        .map((node) => node.code)
        .filter((nodeCode) => {
          for (const flagCode of activeBorders) {
            if (flagCode === nodeCode) return false;
          }
          return true;
        });

      // console.log(unactiveBorders);
      // console.log(activeBorders);

      for (const flagCode of activeBorders) {
        d3.select(`.flag-${flagCode}`).style("transform", "scale(1)");
      }

      for (const flagCode of unactiveBorders) {
        d3.select(`.flag-${flagCode}`).style("transform", "scale(0.4)");
      }
    })
    .on("mouseout", () => {
      d3.selectAll(`.flag`).style("transform", "scale(0.5)");
    })
    .call(drag);

  function tick() {
    link
      .attr("x1", (links) => links.source.x)
      .attr("y1", (links) => links.source.y)
      .attr("x2", (links) => links.target.x)
      .attr("y2", (links) => links.target.y);

    node
      .style("left", (node) => `${node.x - flagOffset}px`)
      .style("top", (node) => `${node.y - flagOffset}px`);
  }
};

darwGraph();
