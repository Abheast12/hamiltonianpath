// var width = window.innerWidth;
// var height = window.innerHeight;
// import * as d3 from 'd3';
var userHasInteractedNodes = false;
var userHasInteractedEdges = false;
window.userHasInteractedNodes = userHasInteractedNodes;
window.userHasInteractedEdges = userHasInteractedEdges;
var nodeRadius = 20;
var force, graphWidth, graphHeight;
// var Module = {
//     onRuntimeInitialized: function() {
//         generateGraph();
//     }
// };
function generateGraph() {
    console.log("generateGraph is called");
    d3.select("svg").remove();
    var svg = d3.select("#graph").append("svg")  // Append the SVG to the #graph div
        .attr("width", "100%")
        .attr("height", "100%");

    var numNodes = document.getElementById("nodes").value;
    var linksText = document.getElementById("links").value.trim();
    // console.log("numNodes:", numNodes);
    // console.log("linksText:", linksText);
    // console.log(userHasInteractedNodes);
    if (!window.userHasInteractedNodes || !window.userHasInteractedNodes) {
        return;
    }
    // console.log("hi");
    // console.log(Module._receiveData);
    // console.log(Module);
    graphWidth = document.getElementById("graph").clientWidth;
    graphHeight = document.getElementById("graph").clientHeight;
    var nodes = Array.from({length: numNodes}, (_, i) => ({id: i + 1}));
    var linkNumbers = linksText.split(/\s+/);
    var linkPairs = [];
    for (var i = 0; i < linkNumbers.length; i += 2) {
        linkPairs.push([+linkNumbers[i], +linkNumbers[i + 1]]);
    }

    // Filter out any pairs that contain a number outside the range 1-n
    linkPairs = linkPairs.filter(function(pair) {
        return pair[0] >= 1 && pair[0] <= numNodes && pair[1] >= 1 && pair[1] <= numNodes && pair[0] != pair[1];
    });
    // Create the links
    var links = linkPairs.map(function(pair) {
        return {source: pair[0] - 1, target: pair[1] - 1};
    });
    const nodesLength = nodes.length;
    const nodesNumBytes = nodesLength * Int32Array.BYTES_PER_ELEMENT;
    // Module._free(nodesNumBytes);
    // console.log(Module);
    const nodesPtr = Module._malloc(nodesNumBytes);
    const nodesHeapBytes = new Uint8Array(Module.HEAP32.buffer, nodesPtr, nodesNumBytes);
    nodesHeapBytes.set(new Int32Array(nodes));

    // Prepare linkPairs data
    const linkPairsLength = linkPairs.length;
    const linkPairsNumBytes = linkPairsLength * Int32Array.BYTES_PER_ELEMENT;
    const linkPairsPtr = Module._malloc(linkPairsNumBytes);
    const linkPairsHeapBytes = new Uint8Array(Module.HEAP32.buffer, linkPairsPtr, linkPairsNumBytes);
    linkPairsHeapBytes.set(new Int32Array(linkPairs.flat()));

    // Call the C++ function
    Module._receiveData(nodesHeapBytes.byteOffset, nodesLength, linkPairsHeapBytes.byteOffset, linkPairsLength);

    // Free the memory
    Module._free(nodesHeapBytes.byteOffset);
    Module._free(linkPairsHeapBytes.byteOffset);
    force = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).distance(200).strength(0.3))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2));

    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
        
    node.append("circle")
        .attr("r", nodeRadius);

    node.append("text")
        .text(function(d) { return d.id; })
        .attr("dy", ".35em");

    force.on("tick", function() {
        link.attr("x1", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    theta = Math.atan2(dy, dx)
                return d.source.x + nodeRadius * Math.cos(theta);
            })
            .attr("y1", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    theta = Math.atan2(dy, dx)
                return d.source.y + nodeRadius * Math.sin(theta);
            })
            .attr("x2", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    theta = Math.atan2(dy, dx),
                    offsetX = nodeRadius * Math.cos(theta)
                return d.target.x - offsetX;
            })
            .attr("y2", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    theta = Math.atan2(dy, dx),
                    offsetY = nodeRadius * Math.sin(theta);
                return d.target.y - offsetY;
            });

        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
}

function dragstarted(d) {
    if (!d3.event.active) force.alphaTarget(0.3).restart();  // Set the alpha target to a non-zero value and restart the simulation
    d.fx = d.x;  // Fix the position of the node
    d.fy = d.y;
}

function dragged(d) {
    // var graphWidth = document.getElementById("graph").clientWidth;
    // var graphHeight = document.getElementById("graph").clientHeight;
    d.fx = d.x = Math.max(nodeRadius, Math.min(graphWidth - nodeRadius, d3.event.x));
    d.fy = d.y = Math.max(nodeRadius, Math.min(graphHeight - nodeRadius, d3.event.y));
}

function dragended(d) {
    if (!d3.event.active) force.alphaTarget(0);  // Set the alpha target back to zero
    d.fx = null;  // Unfix the position of the node
    d.fy = null;
}
window.generateGraph = generateGraph;
