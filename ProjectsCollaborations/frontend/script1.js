var darkMode = false;
const nodeCountsInternal = {}
const nodeCountsExternal = {};
document.body.style.overflow = 'hidden';

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    updateTextColors();
    updateLegendStyle(); // Add this line to update the legend style
}

function updateTextColors() {
    var textColor = darkMode ? '#fff' : '#000';
    d3.selectAll('text')
        .style('fill', textColor);
}

function updateLegendStyle() {
    var legendBackgroundColor = darkMode ? '#444' : '#fff';
    var legendTextColor = darkMode ? '#fff' : '#000';

    document.getElementById('school-legend').style.backgroundColor = legendBackgroundColor;
    document.getElementById('school-legend').style.color = legendTextColor;

    document.getElementById('rules-legend').style.backgroundColor = legendBackgroundColor;
    document.getElementById('rules-legend').style.color = legendTextColor;

}



var svgWidthPercentage = 100;
var svgHeightPercentage = 100;

var width = window.innerWidth * (svgWidthPercentage / 100);
var height = window.innerWidth * (svgHeightPercentage / 100);

var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMidYMid meet");

// var color = d3.scaleOrdinal()
//     .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
//         '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5',
//         '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173', '#5254a3', '#6b6ecf', '#9c9ede', '#1c0a15', '#80757f',
//         '#bd9e39', '#f55d42', '#e7ba52', '#f5ec42', '#A133FF', '#33FF33', '#D133FF', '#c8f542', '#FFD133', '#6BFF33']);

var colorInternal = d3.scaleOrdinal()
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']);
var colorANUExternal = d3.scaleOrdinal()
    .range(['#D0C8C7']);

var colorExternal = d3.scaleOrdinal()
    .range(['#80757f']);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(100).strength(0.1).id(function (d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var originalGraph; // Store the original graph data

d3.json("https://raw.githubusercontent.com/Officialshubham/ProjectCollaborationGraph/master/project_internal_new.json", function (error, graph) {
    if (error) throw error;

    originalGraph = graph; // Save the original graph data
    flag = false
    renderGraph(graph, flag);
});



function displaySchoolColors() {
    // Get unique school names
    var uniqueSchools = Array.from(new Set(originalGraph.nodes.map(node => node.school)));
    var internal = [];
    var anuExternal = [];
    var externalColleges = [];
    for(var i=0; i<uniqueSchools.length;i++){
        if(uniqueSchools[i].includes("CHM")){
            internal.push(uniqueSchools[i]);
        }else{
            if(uniqueSchools[i].includes("ACAD") || uniqueSchools[i].includes("CASS") || uniqueSchools[i].includes("CECC") || uniqueSchools[i].includes("CAP") || uniqueSchools[i].includes("COBE") || uniqueSchools[i].includes("CoS") || uniqueSchools[i].includes("ANU") || uniqueSchools[i].includes("RSCH") || uniqueSchools[i].includes("OTH") || uniqueSchools[i].includes("COL") || uniqueSchools[i].includes("SERVICES")){
                anuExternal.push(uniqueSchools[i]);
            }
            else{
                externalColleges.push(uniqueSchools[i]);
            }
        }
    }

    internal.sort();
    anuExternal.sort();
    externalColleges.sort();
    // Create HTML content for the legend
    var htmlContentInternal = internal.map(s => `<div><span style="background-color: ${colorInternal(s)};"></span>${s}</div>`).join('');
    var htmlContentANUExternal = anuExternal.map(school => `<div><span style="background-color: ${colorANUExternal(school)};"></span>${school}</div>`).join('');
    var htmlContentExternal = externalColleges.map(school => `<div><span style="background-color: ${colorExternal(school)};"></span>${school}</div>`).join('');


    // Display the legend
    document.getElementById("school-legend").innerHTML = htmlContentInternal+htmlContentANUExternal+htmlContentExternal;
    document.getElementById("school-legend").style.display = "block";
}

function hideSchoolColors() {
    // Hide the legend
    document.getElementById("school-legend").style.display = "none";
}

function showLegend() {
    // Show the legend
    document.getElementById("school-legend").style.display = "block";
}

function hideLegend() {
    // Hide the legend
    document.getElementById("school-legend").style.display = "none";
}

function displayRules() {
    var content = "<ul><li>This network graph shows how our faculty members collaborate with other ANU faculty members.</li> <li>It is based on ARIES contract/grant data extracted on 28 Sept 2023.</li> <li> This graph has only included projects with the following status: <ol><li>active</li> <li>completed</li> <li>completed-pending reports</li> <li>offer of award</li> </ol> <br>with grant start date or awarded date in or after 2017.</ul>";
    //Display the legend
    document.getElementById("rules-legend").innerHTML = content;
    document.getElementById("rules-legend").style.display = "block";

}
function unDisplayRules() {
    // Hide the legend
    document.getElementById("rules-legend").style.display = "none";
}


function showRules() {
    // Show the legend
    document.getElementById("rules-legend").style.display = "block";
}
function hideRules() {
    // Hide the legend
    document.getElementById("rules-legend").style.display = "none";
}


function setupSimulation() {
    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().distance(150).strength(0.1).id(function (d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));
}

function segregateSchoolTypes(internal,anuExternal, externalColleges){
       // Get unique school names
       var uniqueSchools = Array.from(new Set(originalGraph.nodes.map(node => node.school)));
    
       for(var i=0; i<uniqueSchools.length;i++){
           if(uniqueSchools[i].includes("CHM")){
               internal.push(uniqueSchools[i]);
           }else{
               if(uniqueSchools[i].includes("ACAD") || uniqueSchools[i].includes("CASS") || uniqueSchools[i].includes("CECC") || uniqueSchools[i].includes("CAP") || uniqueSchools[i].includes("COBE") || uniqueSchools[i].includes("CoS") || uniqueSchools[i].includes("ANU") || uniqueSchools[i].includes("RSCH") || uniqueSchools[i].includes("OTH") || uniqueSchools[i].includes("COL") || uniqueSchools[i].includes("SERVICES")){
                   anuExternal.push(uniqueSchools[i]);
               }
               else{
                   externalColleges.push(uniqueSchools[i]);
               }
           }
       }
}

// // Calculate the count for each node based on the links
// const nodeCountsInternal = {};


function renderGraph(graph, flag) {

  
    var internal =[];
    var anuExternal = [];
    var externalColleges = [];

    segregateSchoolTypes(internal,anuExternal,externalColleges);
    // Clear previous graph
    svg.selectAll("*").remove();

    //Setup simulation
    setupSimulation();

    originalGraph.links.forEach(function (link) {
        // nodeCountsInternal[link.source] = (nodeCountsInternal[link.source] || 0) + 1;
        var result1 = nodeCountsInternal[link.source] === undefined;
        // var result2 = nodeCountsInternal[link.target] === undefined;
 
        if(result1){
         nodeCountsInternal[link.source] = 1;
        }
        // if(result2){
        //  nodeCountsInternal[link.target] = 1;
        // }
 
        if(!result1){
         nodeCountsInternal[link.source]+=1;
        }
        // if(!result2){
        //  nodeCountsInternal[link.target] += 1;
        // }
    });

    console.log(nodeCountsInternal);
 

    // // Calculate the count for each node based on the links
    // var nodeCountsInternal = {};
    // graph.links.forEach(function (link) {
    //     nodeCountsInternal[link.source] = (nodeCountsInternal[link.source] || 0) + 1;
    // });


    // function wrap(text, width) {
    //     text.each(function () {
    //         var text = d3.select(this),
    //             words = text.text().split(/\s+/).reverse(),
    //             word,
    //             line = [],
    //             lineNumber = 0,
    //             lineHeight = 1.1, // ems
    //             y = text.attr("y"),
    //             dy = parseFloat(text.attr("dy") || 0),
    //             tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

    //         while (word = words.pop()) {
    //             line.push(word);
    //             tspan.text(line.join(" "));
    //             if (tspan.node().getComputedTextLength() > width) {
    //                 line.pop();
    //                 tspan.text(line.join(" "));
    //                 line = [word];
    //                 tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
    //             }
    //         }
    //     });
    // }


    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        // .attr("stroke-width", function (d) { return nodeCountsInternal[d.source.id] * 3; });
      

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g");

    if (flag == true) {
      
        var circles = node.append("circle")
            // .attr("r", function (d) { return Math.sqrt(nodeCountsInternal[d.id]) * 3})
            .attr("r", function (d) { return Math.sqrt(nodeCountsInternal[d.id]) * 3})
            .attr("fill", function (d) { 
                if(internal.includes(d.school)){
                    return colorInternal(d.school);
                }else if(anuExternal.includes(d.school)){
                    return colorANUExternal(d.school);
                }
                else if(externalColleges.includes(d.school)){
                    return colorExternal(d.school); 
                }
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
    }
    else {
        // console.log(internal);
        var circles = node.append("circle")
            .attr("r", function (d) { return Math.sqrt(nodeCountsInternal[d.id]) * 3 })
            .attr("fill", function (d) { 
                if(internal.includes(d.school)){
                    return colorInternal(d.school);
                }else if(anuExternal.includes(d.school)){
                    return colorANUExternal(d.school);
                }
                else if(externalColleges.includes(d.school)){
                    return colorExternal(d.school); 
                }
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

    }



    var labels = node.append("text")
        .text(function (d) {
            return d.name;
        })
        .attr('x', 15)
        .attr('y', 3);
    // .call(wrap,100);

    if (flag == true) {
        // Add a label force to the simulation
        var labelForce = d3.forceManyBody().strength(-180); // You can adjust the strength as needed

        // Add the label force to the simulation
        simulation.force("label", labelForce);

        // Start the simulation
        simulation.alpha(1).restart();

    }


    // node.append("title")
    //     .text(function (d) { return d.name; });
   
    node.append("title")
        .text(function (d) { 
            if(nodeCountsInternal[d.id]===undefined){
                return d.name + " (" + d.school + ") "+ "Total Collaboration: "+ 0; 
            }
            else{
                return d.name + " (" + d.school + ") "+ "Total Collaboration: "+nodeCountsInternal[d.id]; 
            }
           });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    // Add zoom behavior
    var zoom = d3.zoom()
        .scaleExtent([-1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);

    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }

    function zoomed() {
        svg.selectAll(".nodes, .links")
            .attr("transform", d3.event.transform);
    }

    // Update text colors based on dark mode
    updateTextColors();
}



function searchRenderGraph(graph, flag) {

    //Setup simulation
    setupSimulation();
    renderGraph(graph, flag)

}


function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.4).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}



function searchNodes() {
    // if(document.getElementById("search").value==null)

    var searchValue = document.getElementById("search").value.toLowerCase();

    if(searchValue==""){
        window.alert("Enter valid value in search box!");
    }

    else{

        var values = searchValue.split(" ");
        let text = ""
        for (let i = 0; i < values.length; i++) {
            if (i == values.length - 1) {
                text += values[i];
            }
            else {
                text += values[i] + " ";
            }
        }


    // Filter nodes based on the search value
    var filteredNodes = originalGraph.nodes.filter(function (node) {
        // console.log(node.name.toLowerCase());
        // console.log(node.name.toLowerCase().includes(text));

        return node.name.toLowerCase().includes(text);
    });




    var filterNodesSchool = originalGraph.nodes.filter(function (node) {
        return node.school.toLowerCase().includes(searchValue);
    });


    if (filteredNodes.length == 0 && filterNodesSchool.length == 0) {
        window.alert("No such name can be found!!");
    }
    else if(filteredNodes.length == 0){
        filteredNodes = filterNodesSchool;
    }

    // Filter links based on the filtered nodes
    var filteredLinks = originalGraph.links.filter(function (link) {
        return filteredNodes.some(function (node) {
            return node.id === link.source.id || node.id === link.target.id;
        });
    });

    // Extract unique connected nodes from the filtered links
    var connectedNodes = filteredLinks.reduce(function (acc, link) {
        acc.add(link.source.id);
        acc.add(link.target.id);
        return acc;
    }, new Set());


    // Merge the connected nodes with the filtered nodes
    var allFilteredNodes = filteredNodes.concat(Array.from(connectedNodes).map(function (id) {
        return originalGraph.nodes.find(function (node) {
            return node.id === id;
        });
    }));

    // document.getElementById("contribution").style.display = "flex";
    // document.getElementById("myContri").innerHTML = allFilteredNodes.length-2;
    

    // Create a new graph with filtered nodes and links
    var filteredGraph = {
        nodes: allFilteredNodes,
        links: filteredLinks
    };

    // Render the graph with the filtered data

   
    searchRenderGraph(filteredGraph, true);
   
        
    

    

    // // Update the simulation with the filtered nodes
    // simulation.nodes(allFilteredNodes);

    // // Restart the simulation
    // simulation.alpha(1).restart();

    }

    
}