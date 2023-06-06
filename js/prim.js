var nodes = [];
var links = [];

function clickGenerator() {
  var numN = document.getElementById("numNodes").value;
  var numL = document.getElementById("numLinks").value;
  if (numL < numN - 1 || numL > (numN * (numN - 1)) / 2) {
    alert("ERROR");
    return;
  }
  generateRandomGraph(parseInt(numN), parseInt(numL));
  restart();
}

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

generateRandomGraph(6, 8);

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
      .strength(-2000)
      .distanceMax(w / 2)
  )
  .force("link", d3.forceLink().distance(120))
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
    .on("click", clickNode)
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
  weights = weights.data(links, (d) => d.weight);
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

function clickNode(d) {
  if (typeof minTree == "undefined" || minTree == null) {
    const startInfo = document.getElementById("start");
    startInfo.style.display = "none";
    var button = document.getElementById("buttonRandomize");
    button.classList.add("disabled");
    var button2 = document.getElementById("buttonRandomize2");
    button2.classList.add("disabled");
    minTree = prim(d);
    d3.select(this)
      .transition()
      .duration(400)
      .attr("r", 30)
      .transition()
      .style("fill", "red")
      .transition()
      .duration(350)
      .attr("r", rad);
  }
}

function click(d) {
  if (d == minTree.minimumSpanningTree[i]) {
    d3.select(this).transition().style("stroke", "red");
    var firstNodeID = minTree.minimumSpanningTree[i].source.id;
    var secondNodeID = minTree.minimumSpanningTree[i].target.id;
    d3.select(`#node_${firstNodeID}`).transition().style("fill", "red");
    d3.select(`#node_${secondNodeID}`).transition().style("fill", "red");
    i++;
  } else {
    alert("ERROR");
  }
  if (i >= minTree.minimumSpanningTree.length) {
    var congratz = document.getElementById("afterSol");
    congratz.textContent = "Правильно!...";

    setTimeout(() => {
      location.reload();
    }, 2000);
  }
}

function prim(startNode) {
  //fixer, idk why??
  links[links.length - 1].weight = bugResolver;
  const visited = new Set();
  const minimumSpanningTree = [];
  visited.add(startNode);
  let totalWeight = 0;
  while (visited.size < nodes.length) {
    let minWeight = Infinity;
    let minLink = null;
    for (var link of links) {
      let source = link.source;
      let target = link.target;
      let weight = link.weight;
      if (
        (visited.has(source) && !visited.has(target)) ||
        (visited.has(target) && !visited.has(source))
      ) {
        if (weight < minWeight) {
          minWeight = weight;
          minLink = link;
        }
      }
    }
    minimumSpanningTree.push(minLink);
    totalWeight += minWeight;
    if (!visited.has(minLink.source)) {
      visited.add(minLink.source);
    } else {
      visited.add(minLink.target);
    }
  }
  return { minimumSpanningTree, totalWeight };
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
