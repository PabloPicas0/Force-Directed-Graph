import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = 1024;
const height = 768;
const colors = d3.quantize(d3.interpolateHslLong("purple", "orange"), 168);

const darwGraph = async () => {
  const dataset = await d3.json(
    "https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json"
  );

  console.log(dataset);

  const { nodes, links } = dataset;

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
    .force("charge", d3.forceManyBody().strength(-5))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", tick);

  const node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(newNodes)
    .join("circle")
    .attr("r", 5)
    .attr("fill", (node, index) => colors[index])
    .attr("data-country", (node) => node.country)

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll()
    .data(newLinks)
    .join("line")
    .attr("stroke-width", 0.5);

  function tick() {
    link
      .attr("x1", (links) => links.source.x)
      .attr("y1", (links) => links.source.y)
      .attr("x2", (links) => links.target.x)
      .attr("y2", (links) => links.target.y);

    node.attr("cx", (nodes) => nodes.x).attr("cy", (nodes) => nodes.y);
    console.log("tick occured");
  }

  console.log(newLinks, newNodes);
};

darwGraph();
