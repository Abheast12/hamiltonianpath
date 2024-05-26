var width = window.innerWidth;
var height = window.innerHeight;
var nodeRadius = 20;
var force;
function generateGraph() {
    d3.select("svg").remove();
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var numNodes = document.getElementById("nodes").value;
    var linksText = document.getElementById("links").value;

    var nodes = Array.from({length: numNodes}, (_, i) => ({id: i + 1}));
    var links = linksText.split("\n").map(function(link) {
        var nodes = link.split(" ");
        return {source: nodes[0] - 1, target: nodes[1] - 1};
    });

    force = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).distance(200).strength(0.1))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2));

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
    d.fx = d3.event.x;  // Update the fixed position of the node
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) force.alphaTarget(0);  // Set the alpha target back to zero
    d.fx = null;  // Unfix the position of the node
    d.fy = null;
}
generateGraph();
console.log("test");