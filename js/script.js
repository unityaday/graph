var nodes = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
];

var links = [
  { source: 0, target: 1 },
  { source: 2, target: 0 },
  { source: 0, target: 3 },
  { source: 1, target: 4 },
  { source: 3, target: 5 },
  { source: 3, target: 6 },
];

var lastNodeId = nodes.length;
var viewWid = document.documentElement.clientWidth;
var viewH = document.documentElement.clientHeight;
var w = 800;
var h = 600;
var rad = 15;
var colors = d3.schemeSet1;

var svg = d3
  .select("#svg-wrap")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

//arrowhead
var markerBoxWidth = 5;
var markerBoxHeight = 5;
var refX = rad / 2 + 1;
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
      .strength(-250)
      .distanceMax(w / 2)
  )
  .force("link", d3.forceLink().distance(100))
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
}

function restart() {
  edges = edges.data(links);
  edges.exit().remove();
  edges = edges
    .enter()
    .append("line")
    .attr("class", "edge")
    //.attr("marker-end", "url(#arrow)")
    .on("mousedown", () => {
      d3.event.stopPropagation();
    })
    .on("contextmenu", removeEdge)
    .on("mouseover", (d) => {})
    .merge(edges);

  vertices = vertices.data(nodes, (d) => d.id);
  vertices.exit().remove();
  vertices = vertices
    .enter()
    .append("circle")
    .attr("r", rad)
    .attr("class", "vertex")
    .style("fill", (d) => colors[d.id % 9])
    .on("click", click)
    .on("mousedown", beginDragLine)
    .on("mouseup", endDragLine)
    .on("mouseover", function (d) {
      var thisVertex = d3.select(this);
      if (thisVertex.select("title").empty()) {
        thisVertex.append("title").text("v" + d.id);
      }
    })
    .on("contextmenu", removeNode)
    .merge(vertices);

  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(1).restart();
}

restart();

//

svg
  .on("mousedown", addNode)
  .on("mousemove", updateDragLine)
  .on("mouseup", hideDragLine)
  .on("contextmenu", () => {
    d3.event.preventDefault();
  })
  .on("mouseleave", hideDragLine);

function click(d) {
  console.log("Clicked on node " + d.id);
}

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
var mouseupNode = null;

function resetMouseVar() {
  mousedownNode = null;
  mouseupNode = null;
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
    if (
      (l.source === mousedownNode && l.target === d) ||
      (l.source === d && l.target === mousedownNode)
    ) {
      return;
    }
  }
  var newLink = { source: mousedownNode, target: d };
  links.push(newLink);
}
//

/*
var lastKeyDown = -1;

d3.select(window).on("keydown", keydown).on("keyup", keyup);

function keydown() {
  if (lastKeyDown !== -1) return;
  lastKeyDown = d3.event.key;
  if (lastKeyDown === "Control") {
    vertices.call(
      d3
        .drag()
        .on("start", (d) => {
          if (!d3.event.active) simulation.alphaTarget(1).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (d) => {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        })
        .on("end", (d) => {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );
  }
}

function keyup() {
  lastKeyDown = -1;
  if (d3.event.key === "Control") {
    vertices.on("mousedown", null);
  }
}
*/
