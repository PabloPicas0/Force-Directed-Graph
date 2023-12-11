import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = 1024;
const height = 768;
const flagOffset = 15;
let flagCodes = [];

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

      flagCodes = newLinks
        .filter((link) => link.target.code === data.code || link.source.code === data.code)
        .map((link) => {
          console.log(link);
          return link.target.code === data.code
            ? { code: link.source.code, x1: link.source.x, x2: link.target.x }
            : { code: link.target.code, x1: link.source.x, x2: link.target.x };
        });

      flagCodes.unshift({ code: data.code, x1: null, x2: null });

      for (const flagCode of flagCodes) {
        d3.select(`.flag-${flagCode.code}`).style("transform", "scale(0.8)");

        if (flagCode.x1 && flagCode.x2) {
          d3.select(`line[x1="${flagCode.x1}"][x2="${flagCode.x2}"]`)
            .style("stroke", "#fff")
            .style("stroke-width", 2.5);
        }
      }
    })
    .on("mouseout", () => {
      for (const flagCode of flagCodes) {
        d3.select(`.flag-${flagCode.code}`).style("transform", "scale(0.5)");

        // TODO: add style remove 
        if (flagCode.x1 && flagCode.x2) {
          d3.select(`line[x1="${flagCode.x1}"][x2="${flagCode.x2}"]`)
            .style("stroke", false)
            .style("stroke-width", false);
        }
      }
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
