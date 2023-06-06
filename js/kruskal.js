var nodes = [];
var links = [];

function generateRandomGraph(numNodes, numLinks) {
  nodes = [];
  links = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({ id: i });
  }
  for (let i = 0; i < numLinks; i++) {
    var sRandom = getRandomInt(0, numNodes - 1);
    var tRandom = getRandomInt(0, numNodes - 1);
    while (sRandom == tRandom) {
      tRandom = getRandomInt(0, numNodes - 1);
    }
    const source = sRandom;
    const target = tRandom;
    const weight = getRandomInt(1, 17);

    var randomLink = { source, target, weight };
    var existingLink = links.find(
      (link) =>
        (link.source === source && link.target === target) ||
        (link.source === target && link.target === source)
    );
    if (!existingLink) {
      links.push(randomLink);
    } else i--;
  }
  return { nodes, links };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

generateRandomGraph(7, 9);
console.log(links);
minTree = kruskal();

//dont touch it's somehow fixes problem
var bugResolver = links[links.length - 1].weight;

var lastNodeId = nodes.length - 1;
var viewWid = document.documentElement.clientWidth;
var viewH = document.documentElement.clientHeight;
var w = 800;
var h = 600;
var rad = 18;
var colors = d3.schemeSet1;

var svg = d3
  .select("#svg-wrap")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

var edges = svg.append("g").selectAll(".edge");
var vertices = svg.append("g").selectAll(".vertex");
var titles = svg.append("g").selectAll(".title");
var weights = svg.append("g").selectAll(".weight");

var simulation = d3
  .forceSimulation()
  .force(
    "charge",
    d3
      .forceManyBody()
      .strength(-1000)
      .distanceMax(w / 2)
  )
  .force("link", d3.forceLink().distance(125))
  .force("x", d3.forceX(w / 2))
  .force("y", d3.forceY(h / 2))
  .on("tick", tick);

function tick() {
  edges
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);
  vertices.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  titles.attr("x", (d) => d.x).attr("y", (d) => d.y);
  weights
    .attr("x", (d) => (d.source.x + d.target.x) / 2)
    .attr("y", (d) => (d.source.y + d.target.y) / 2);
}

function restart() {
  edges = edges.data(links);
  edges.exit().remove();
  edges = edges
    .enter()
    .append("line")
    .attr("class", "edge")
    .on("click", click)
    //.attr("marker-end", "url(#arrow)")
    .on("mousedown", () => {
      d3.event.stopPropagation();
    })
    .merge(edges);
  vertices = vertices.data(nodes, (d) => d.id);
  vertices.exit().remove();
  vertices = vertices
    .enter()
    .append("circle")
    .attr("r", rad)
    .attr("class", "vertex")
    .attr("id", (d) => "node_" + d.id)
    .style("fill", "white")
    .merge(vertices);
  titles = titles.data(nodes, (d) => d.id);
  titles.exit().remove();
  titles = titles
    .enter()
    .append("text")
    .attr("class", "title")
    .text((d) => d.id)
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("id", (d) => "l" + d.id)
    .style("pointer-events", "none")
    .merge(titles);
  weights = weights.data(links);
  weights.exit().remove();
  weights = weights
    .enter()
    .append("text")
    .text((d) => d.weight)
    .attr("text-anchor", "middle")
    .attr("class", "weight")
    .style("pointer-events", "none")
    .attr("fill", "black")
    .merge(weights);
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(0.8).restart();
}

restart();

var i = 0;

function click(d) {
  if (d == minTree[i]) {
    var button = document.getElementById("buttonRandomize");
    button.classList.add("disabled");
    d3.select(this).transition().style("stroke", "red");
    var firstNodeID = d.source.id;
    var secondNodeID = d.target.id;
    d3.select(`#node_${firstNodeID}`).transition().style("fill", "red");
    d3.select(`#node_${secondNodeID}`).transition().style("fill", "red");
    i++;
  } else {
    alert("ERROR");
  }
  if (i >= minTree.length) {
    var congratz = document.getElementById("afterSol");
    congratz.textContent = "Правильно!...";

    setTimeout(() => {
      location.reload();
    }, 2000);
  }
}

function kruskal() {
  var minTree = [];
  const sortedLinks = links.sort((a, b) => a.weight - b.weight);
  const parent = nodes.map((node) => node.id);
  function findRoot(node) {
    if (parent[node] !== node) {
      parent[node] = findRoot(parent[node]);
    }
    return parent[node];
  }
  function union(x, y) {
    const xRoot = findRoot(x);
    const yRoot = findRoot(y);
    if (xRoot !== yRoot) {
      parent[yRoot] = xRoot;
    }
  }
  for (const link of sortedLinks) {
    const { source, target } = link;
    if (findRoot(source) !== findRoot(target)) {
      minTree.push(link);
      union(source, target);
    }
  }

  return minTree;
}

svg.on("contextmenu", () => {
  d3.event.preventDefault();
});

//CLEAR
d3.select("#clear").on("click", () => {
  nodes.splice(0);
  links.splice(0);
  d3.selectAll("text").remove();
  lastNodeId = -1;
  visited = [];
  i = 1;
  restart();
});
