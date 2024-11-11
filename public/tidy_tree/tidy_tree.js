fetch("/data/filtered_artists.json").then(response => {
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
})
.then((artistsData) => {
    artistsData = artistsData.artists
    // Function to get artists by genre
    function getArtistsByGenre(genre) {
      return artistsData.filter(artist => artist.genres.includes(genre));
    }

    function getArtistAlbums(artist) {      
      return artistsData
        .filter(a => a.name === artist.name)  // Filter artists by name
        .flatMap(a => a.albums.map(album => ({  // Flatten the albums array
          name: album
        })));
    }
    
    const uniqueGenres = new Set();

    artistsData.forEach(artist => {
      console.log(artist);      
      artist.genres.forEach(genre => uniqueGenres.add(genre));
    });
  

    
    
  const uniqueGenresArray = Array.from(uniqueGenres);

  var treeData = [{
    name: "Genres", 
    children: uniqueGenresArray
        .map(genre => {
            const artists = getArtistsByGenre(genre); // Get artists for the genre            
            if(artists.length>0){
              console.log(artists[0]);
            }
            
            return artists.length > 0 // Only include genres with artists
                ? {
                      name: genre,
                      children: artists.map(artist => ({                          
                          name: artist.name,
                          children: getArtistAlbums(artist)
                      })),
                  }
                : null; // Return null for genres with no artists
        })
        .filter(genreNode => genreNode !== null), // Filter out the null values
    }];

  // ************** Generate the tree diagram	 *****************
  var margin = {top: 2, right: 120, bottom: 20, left: 120},
    width = 9000 - margin.right - margin.left,
    height = 15000 - margin.top - margin.bottom;
    
  var i = 0,
    duration = 750,
    root;

  var tree = d3.layout.tree()
    .size([height, width]);

  var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  root = treeData[0];
  function removeChildren(node) {
    if (node.children) {
        node._children = node.children; // Store immediate children
        node.children = null; // Remove immediate children

        // Recursively remove children from all descendants
        node._children.forEach(removeChildren);
    }
  }

  // Apply to root
  root.children.forEach(removeChildren);



  
  root.x0 = height / 2;
  root.y0 = 0;
    
  update(root);
  

  d3.select(self.frameElement).style("height", "500px");

  function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 300;});


    // Update the nodes…
    var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

    nodeEnter.append("circle")
      .attr("r", 1e-2)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
      

    nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
      .attr("dy", ".350em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
      .attr("r", 10)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
      .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

    nodeExit.select("circle")
      .attr("r", 1e-6);

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
      var o = {x: source.x0, y: source.y0};
      return diagonal({source: o, target: o});
      });

    // Transition links to their new position.
    link.transition()
      .duration(duration)
      .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
      var o = {x: source.x+30, y: source.y};
      return diagonal({source: o, target: o});
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
    d._children = d.children;
    d.children = null;
    } else {
    d.children = d._children;
    d._children = null;
    }
    update(d);
  }
  })
