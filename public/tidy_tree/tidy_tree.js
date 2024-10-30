fetch( "/data/artist-without-members.json")
  .then(response => {
    // Ensure the response is in JSON format
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(artistsData => {    
    // Function to get artists by genre
    function getArtistsByGenre(data, genre) {
      return data.filter(artist => artist.genres.includes(genre));
    }

    const uniqueGenres = new Set();

    // Iterate through each artist and their genres
    artistsData.forEach(artist => {
      if (artist.dbp_genre) {
        artist.dbp_genre.forEach(genre => {
          uniqueGenres.add(genre);
        });
      }
    });

    const genreToFind = "J-Rock";
    const relatedArtists = getArtistsByGenre(artistsData, genreToFind);
    
    console.log(uniqueGenres);
    
    // Display the result
    console.log(`Artists related to ${genreToFind}:`);
    relatedArtists.forEach(artist => {
      console.log(`- ${artist.name} (ID: ${artist.id_artist_deezer})`);
    });
  const uniqueGenresArray = Array.from(uniqueGenres);

  const data = {
    name: genreToFind, // Main genre name
    children: uniqueGenresArray
        .map(genre => {
            const artists = getArtistsByGenre(artistsData, genre); // Get artists for the genre
            return artists.length > 0 // Only include genres with artists
                ? {
                      name: genre,
                      children: artists.map(artist => ({
                          name: artist.name,
                      })),
                  }
                : null; // Return null for genres with no artists
        })
        .filter(genreNode => genreNode !== null), // Filter out the null values
};

    const width = 928;

    // Compute the tree height; this approach will allow the height of the
    // SVG to scale according to the breadth (width) of the tree layout.
    const root = d3.hierarchy(data);
    const dx = 10;
    const dy = width / (root.height + 1);

    // Create a tree layout.
    const tree = d3.tree().nodeSize([dx, dy]);

    // Sort the tree and apply the layout.
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    tree(root);

    // Compute the extent of the tree. Note that x and y are swapped here
    // because in the tree layout, x is the breadth, but when displayed, the
    // tree extends right rather than down.
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
    });

    // Compute the adjusted height of the tree.
    const height = x1 - x0 + dx * 2;

    // Create the SVG element and append it to the body
    const svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-dy / 3, x0 - dx, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
    .selectAll()
        .data(root.links())
        .join("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    const node = svg.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
    .selectAll()
    .data(root.descendants())
    .join("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 2.5);

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .attr("stroke", "white")
        .attr("paint-order", "stroke");


})
.catch(error => {
  console.error("There was a problem with the fetch operation:", error);
});

Plot.plot({
    axis: null,
    margin: 10,
    marginLeft: 40,
    marginRight: 160,
    width: 928,
    height: 1800,
    marks: [
        Plot.tree(flare, {path: "name", delimiter: "."})
    ]
    })