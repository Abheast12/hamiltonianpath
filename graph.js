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
var isRuntimeInitialized = false;
// var Module = {
//     locateFile: function(path) {
//       if (path.endsWith('.wasm')) {
//         return 'hamiltonian.wasm';
//       }
//       return path;
//     }
// }
// fetch('hamiltonian.wasm')
//   .then(response => response.arrayBuffer())
//   .then(bytes => {
//     Module['wasmBinary'] = bytes;
//     var script = document.createElement('script');
//     script.src = 'hamiltonian.js';
//     document.body.appendChild(script);
//   });
Module.onRuntimeInitialized = function() {
    console.log("Emscripten runtime initialized.");
    isRuntimeInitialized = true;
    generateGraph();
};
function generateGraph() {
    if (!isRuntimeInitialized) {
        console.log("Waiting for Emscripten runtime to initialize.");
        return;
    }
    // console.log("generateGraph is called");
    // console.log("time to die)");
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
    // console.log("here");
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

    // Extract ids from nodes and source, target from links
    let nodesIds = nodes.map(node => node.id);
    let linksFlat = links.flatMap(link => [link.source + 1, link.target + 1]); // Adding 1 because C++ array starts from 1

    // Allocate memory
    let nodesPtr = Module._malloc(nodesIds.length * 4);
    let linksPtr = Module._malloc(linksFlat.length * 4);

    // Create Int32Array views on the heap at the pointers
    let nodesHeap = new Int32Array(Module.HEAP32.buffer, nodesPtr, nodesIds.length);
    let linksHeap = new Int32Array(Module.HEAP32.buffer, linksPtr, linksFlat.length);
    
    // Copy data into memory
    nodesHeap.set(nodesIds);
    linksHeap.set(linksFlat);

    // var receiveData = Module.cwrap('receiveData', 'number', ['number', 'number', 'number', 'number']);

    // Call the C++ function
    var result = Module.ccall('receiveData', 'number', ['number', 'number', 'number', 'number'], [nodesPtr, nodesIds.length, linksPtr, linksFlat.length]);
    var pairs = [];
    for (var i = 0; i < linkPairs.length; i++) {
        var first = Module.getValue(result + i * 8, 'i32');
        var second = Module.getValue(result + i * 8 + 4, 'i32');
        pairs.push([first, second]);

    }
    console.log("pairs:");
    console.log(pairs);
        
    // Free memory
    Module._free(nodesPtr);
    Module._free(linksPtr);
    
    force = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).distance(200).strength(0.3))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2));

    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    pairs.forEach(pair => {
        link.filter(d => (d.source.id === pair[0] && d.target.id === pair[1]) || (d.source.id === pair[1] && d.target.id === pair[0]))
            .style("stroke", "red");
    });
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

function dragstarted(event, d) {
    if (!event.active) force.alphaTarget(0.3).restart();  // Set the alpha target to a non-zero value and restart the simulation
    d.fx = d.x;  // Fix the position of the node
    d.fy = d.y;
}

function dragged(event, d) {
    // var graphWidth = document.getElementById("graph").clientWidth;
    // var graphHeight = document.getElementById("graph").clientHeight;
    d.fx = d.x = Math.max(nodeRadius, Math.min(graphWidth - nodeRadius, event.x));
    d.fy = d.y = Math.max(nodeRadius, Math.min(graphHeight - nodeRadius, event.y));
}

function dragended(event, d) {
    if (!event.active) force.alphaTarget(0);  // Set the alpha target back to zero
    d.fx = null;  // Unfix the position of the node
    d.fy = null;
}
window.generateGraph = generateGraph;
