var nodes = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

var links = [
  { source: 0, target: 1 },
  { source: 1, target: 3 },
  { source: 2, target: 0 },
  { source: 2, target: 4 },
];

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

//arrowhead
var markerBoxWidth = 5;
var markerBoxHeight = 5;
var refX = rad / 2;
var refY = markerBoxHeight / 2;
var markerWidth = markerBoxHeight / 2;
var markerHeight = markerBoxHeight / 2;
var arrowPoints = [
  [0, 0],
  [0, 5],
  [5, 2.5],
];
svg
  .append("defs")
  .append("marker")
  .attr("id", "arrow")
  .attr("viewBox", [0, 0, markerBoxWidth, markerBoxHeight])
  .attr("refX", refX)
  .attr("refY", refY)
  .attr("markerWidth", markerBoxWidth)
  .attr("markerHeight", markerBoxHeight)
  .attr("orient", "auto-start-reverse")
  .append("path")
  .attr("d", d3.line()(arrowPoints));
//

var dragLine = svg
  .append("path")
  .attr("class", "dragLine hidden")
  //.attr("marker-end", "url(#arrow)")
  .attr("d", "M0,0L0,0");

var edges = svg.append("g").selectAll(".edge");
var vertices = svg.append("g").selectAll(".vertex");
var titles = svg.append("g").selectAll(".title");

var simulation = d3
  .forceSimulation()
  .force(
    "charge",
    d3
      .forceManyBody()
      .strength(-600)
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
}

function restart() {
  edges = edges.data(links);
  edges.exit().remove();
  edges = edges
    .enter()
    .append("line")
    .attr("class", "edge")
    .attr("marker-end", "url(#arrow)")
    .on("mousedown", () => {
      d3.event.stopPropagation();
    })
    .on("contextmenu", removeEdge)
    .merge(edges);

  vertices = vertices.data(nodes, (d) => d.id);
  vertices.exit().remove();
  vertices = vertices
    .enter()
    .append("circle")
    .attr("r", rad)
    .attr("class", "vertex")
    .style("fill", (d) => "white")
    .on("click", click)
    .on("mousedown", beginDragLine)
    .on("mouseup", endDragLine)
    .on("mouseover", function (d) {
      var thisVertex = d3.select(this);
      if (thisVertex.select("title").empty()) {
        thisVertex.append("title").text(d.id);
      }
    })
    .on("contextmenu", removeNode)
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
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(1).restart();
}

restart();

var i = 1;

function click(d) {
  /*
  var matrixTable = d3.select("#matrix").append("table");
  var matrixRows = matrixTable
    .selectAll("tr")
    .data(nodes)
    .enter()
    .append("tr")
    .text((d) => d.id);
  matrixRows
    .selectAll("td")
    .data((rowIndex) =>
      nodes.map((columnIndex) => {
        var link = links.find(
          (l) => l.source === rowIndex && l.target === columnIndex
        );
        return {
          rowIndex,
          columnIndex,
          linkExists: !!link,
        };
      })
    )
    .enter()
    .append("td")
    .style("background-color", (d) => (d.linkExists ? "green" : "white"))
    .text((d) => (d.linkExists ? "1" : "0"));
  */
  if (typeof visited == "undefined" || visited.length == 0) {
    var toggleSwitch = document.getElementById("toggleSwitch");
    var isChecked = toggleSwitch.checked;
    if (isChecked) {
      visited = dfs(d.id);
    } else {
      visited = bfs(d.id);
    }
    d3.select(this).transition().style("fill", "green");
  } else {
    if (visited[i] == d.id) {
      i++;
      d3.select(this).transition().style("fill", "green");
    } else {
      alert("ERROR");
    }
  }
  if (i >= visited.length) {
    var congratz = document.getElementById("afterSol");
    congratz.textContent = "Правильно!...";

    setTimeout(() => clearSvg(), 2400);
  }
}

function dfs(startNodeId) {
  turnOff();
  const visited = [];
  const adjacencyList = new Map();
  for (const node of nodes) {
    adjacencyList[node.id] = [];
  }
  for (const link of links) {
    adjacencyList[link.source.id].push(link.target.id);
  }
  for (const node of nodes) {
    adjacencyList[node.id] = adjacencyList[node.id].toSorted((a, b) => a - b);
  }
  console.log(adjacencyList);
  displayAdj(adjacencyList);
  function dfsHelper(nodeId) {
    visited.push(nodeId);
    for (const neighborId of adjacencyList[nodeId]) {
      if (!visited.includes(neighborId)) {
        dfsHelper(neighborId);
      }
    }
  }
  dfsHelper(startNodeId);
  return visited;
}
function bfs(startNodeId) {
  console.log(startNodeId);
  turnOff();
  const visited = [];
  const adjacencyList = new Map();
  for (const node of nodes) {
    adjacencyList[node.id] = [];
  }
  for (const link of links) {
    adjacencyList[link.source.id].push(link.target.id);
  }
  for (const node of nodes) {
    adjacencyList[node.id] = adjacencyList[node.id].toSorted((a, b) => a - b);
  }
  console.log(adjacencyList);
  displayAdj(adjacencyList);
  const queue = [];
  visited.push(startNodeId);
  queue.push(startNodeId);
  while (queue.length > 0) {
    const currentNodeId = queue.shift();
    for (const neighborId of adjacencyList[currentNodeId]) {
      if (!visited.includes(neighborId)) {
        visited.push(neighborId);
        queue.push(neighborId);
      }
    }
  }
  return visited;
}

function displayAdj(adjacencyList) {
  var adjacencyMapContainer = document.getElementById(
    "adjacency-map-container"
  );

  var adjacencyTable = document.createElement("table");
  adjacencyTable.className = "adjacency-table";

  Object.keys(adjacencyList).forEach(function (nodeId) {
    var neighbors = adjacencyList[nodeId];
    var row = adjacencyTable.insertRow();
    var nodeIdCell = row.insertCell();
    nodeIdCell.textContent = "Вершина " + nodeId + ":";
    var neighborCell = row.insertCell();
    neighborCell.textContent = neighbors.join(", ");
  });

  adjacencyMapContainer.appendChild(adjacencyTable);
}

function turnOff() {
  svg.on("mousedown", null).on("mousemove", null);
  d3.selectAll("circle").on("mousedown", null).on("mouseup", null);
  d3.selectAll("line").on("contextmenu", null);
}

//

svg
  .on("mousedown", addNode)
  .on("mousemove", updateDragLine)
  .on("mouseup", hideDragLine)
  .on("contextmenu", () => {
    d3.event.preventDefault();
  })
  .on("mouseleave", hideDragLine);

function addNode() {
  if (d3.event.button == 0) {
    var coords = d3.mouse(this);
    var newNode = { x: coords[0], y: coords[1], id: ++lastNodeId };
    nodes.push(newNode);
    restart();
  }
}

function removeNode(d) {
  nodes.splice(nodes.indexOf(d), 1);
  d3.selectAll(`#title${d.id}`).remove();
  var linksToRemove = links.filter((l) => l.source === d || l.target === d);
  linksToRemove.map((l) => {
    links.splice(links.indexOf(l), 1);
  });
  d3.event.preventDefault();
  restart();
}

function removeEdge(d) {
  links.splice(links.indexOf(d), 1);
  d3.event.preventDefault();
  restart();
}

var mousedownNode = null;

function resetMouseVar() {
  mousedownNode = null;
}

function hideDragLine() {
  dragLine.classed("hidden", true);
  resetMouseVar();
  restart();
}

function beginDragLine(d) {
  d3.event.stopPropagation();
  if (d3.event.ctrlKey) return;
  mousedownNode = d;
  dragLine
    .classed("hidden", false)
    .attr(
      "d",
      "M" +
        mousedownNode.x +
        "," +
        mousedownNode.y +
        "L" +
        mousedownNode.x +
        "," +
        mousedownNode.y
    );
}

function updateDragLine() {
  if (!mousedownNode) return;
  dragLine.attr(
    "d",
    "M" +
      mousedownNode.x +
      "," +
      mousedownNode.y +
      "L" +
      d3.mouse(this)[0] +
      "," +
      d3.mouse(this)[1]
  );
}

function endDragLine(d) {
  if (!mousedownNode || mousedownNode === d) return;
  for (var i = 0; i < links.length; i++) {
    var l = links[i];
    if (l.source === mousedownNode && l.target === d) {
      return;
    }
  }
  var newLink = { source: mousedownNode, target: d };
  links.push(newLink);
}

//CLEAR
d3.select("#clear").on("click", () => clearSvg());

function clearSvg() {
  document.getElementById("afterSol").textContent = "";
  svg.on("mousedown", addNode).on("mousemove", updateDragLine);

  //Чистка данных
  nodes.splice(0);
  links.splice(0);

  //Удаление отображения списка смежности и всех элементов с тегом text
  d3.selectAll("table").remove();
  d3.selectAll("text").remove();

  //
  lastNodeId = -1;
  visited = [];
  i = 1;
  restart();
}
