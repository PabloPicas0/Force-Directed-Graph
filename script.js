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
    .force("charge", d3.forceManyBody())
    .force("link", d3.forceLink(newLinks))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .selectAll("circle")
    .data(newNodes)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("fill", (node, index) => colors[index])
    .attr("cx", (node) => node.x)
    .attr("cy", (node) => node.y);

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(newLinks)
    .enter()
    .append("line")
    .attr("stroke-width", 0.5);

  console.log(newLinks, newNodes);
};

darwGraph();
