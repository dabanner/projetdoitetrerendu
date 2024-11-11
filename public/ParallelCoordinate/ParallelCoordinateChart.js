// Function to display the parallel coordinate chart
function displayParallelCoordinateChart(data) {
  // Extract unique genres and countries from the data for the dropdown selector
  const genres = Array.from(new Set(data.map(d => d.genre)));
  const countries = Array.from(new Set(data.map(d => d.country)));

  // Define the dimensions for the axes, excluding the country axis
  const dimensions = ["length", "publicationDate", "deezerFans", "language"]; // Removed 'country' from dimensions

  // Color scale for explicit and non-explicit lyrics
  const colorExplicit = d3.scaleOrdinal()
    .domain([true, false])
    .range(["#ff7f0e", "#1f77b4"]); // Orange for explicit, blue for non-explicit

  const margin = { top: 30, right: 10, bottom: 10, left: 10 },
    width = 1400 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

  // Create a flex container for the graph
  const container = d3.select("body").append("div")
    .attr("class", "container");

  // SVG for the chart
  const svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define the scales for each dimension
  const y = {};
  dimensions.forEach(dimension => {
    if (dimension === "publicationDate") {
      y[dimension] = d3.scaleLinear()
        .domain([d3.max(data, d => d[dimension]), d3.min(data, d => d[dimension])])
        .range([0, height]);
    } else if (dimension === "deezerFans") {
      y[dimension] = d3.scaleLog()
        .domain([1, d3.max(data, d => d[dimension])])
        .range([height, 0])
        .nice();
    } else if (dimension === "language") {
      y[dimension] = d3.scalePoint()
        .domain(data.map(d => d[dimension]))
        .range([height, 0])
        .padding(1);
    } else {
      y[dimension] = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[dimension])])
        .range([height, 0]);
    }
  });

  // X scale for the dimensions
  const x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  // Define opacity scale based on publication date
  const opacityScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.publicationDate), d3.max(data, d => d.publicationDate)])
    .range([0.1, 1.0]); // Older dates get lower opacity, recent dates get higher opacity

  // Function to draw each line
  function path(d) {
    return d3.line()(dimensions.map(p => [x(p), y[p](d[p])]));
  }

  // Draw paths initially (filtered by genre and country selection)
  const paths = svg.selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("d", path)
    .attr("class", d => `line genre-${d.genre} country-${d.country}`)
    .style("fill", "none")
    .style("stroke", d => colorExplicit(d.explicitLyrics)) // Color based on explicit or non-explicit
    .style("opacity", d => opacityScale(d.publicationDate)) // Opacity based on publication date
    .style("stroke-width", "1px")
    .on("mouseover", function (event, d) {
      svg.selectAll("path")
        .style("opacity", p => p === d ? 1 : opacityScale(p.publicationDate) * 0.2) // Boosted visibility on hover
        .style("stroke-width", p => p === d ? "2px" : "1px");

      d3.select(this).style("opacity", 1).style("stroke-width", "2px");
    })
    .on("mouseout", function () {
      svg.selectAll("path")
        .style("opacity", d => opacityScale(d.publicationDate))
        .style("stroke-width", "1px");
    });

  // Add axes for each dimension
  svg.selectAll("g.axis")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "axis")
    .attr("transform", d => `translate(${x(d)})`)
    .each(function (d) { d3.select(this).call(d3.axisLeft(y[d])); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(d => d)
    .style("fill", "black");

  // Add dropdown for genre selection
  const genreSelector = container.append("select")
    .attr("id", "genreSelector")
    .on("change", updatePaths);

  // Add options to the dropdown
  genreSelector.selectAll("option")
    .data(["All Genres", ...genres])
    .enter().append("option")
    .text(d => d);

  // Function to update displayed paths based on selected genre
  function updatePaths() {
    const selectedGenre = d3.select("#genreSelector").property("value");

    // Update path visibility based on selected genre
    paths.style("display", d => {
      return selectedGenre === "All Genres" || d.genre === selectedGenre ? null : "none";
    });
  }

  // Add dropdown for country selection (new filter)
  const countrySelector = container.append("select")
    .attr("id", "countrySelector")
    .on("change", updatePathsByCountry);

  // Add options to the dropdown
  countrySelector.selectAll("option")
    .data(["All Countries", ...countries])
    .enter().append("option")
    .text(d => d);

  // Function to update displayed paths based on selected country
  function updatePathsByCountry() {
    const selectedCountry = d3.select("#countrySelector").property("value");

    // Update path visibility based on selected country
    paths.style("display", d => {
      return selectedCountry === "All Countries" || d.country === selectedCountry ? null : "none";
    });
  }

  // Add legend for explicit and non-explicit colors
  const legend = container.append("div")
    .attr("class", "legend");

  const explicitLegend = legend.append("div")
    .attr("class", "explicit-legend");

  ["Explicit", "Non-Explicit"].forEach((label, i) => {
    const color = i === 0 ? colorExplicit(true) : colorExplicit(false);
    explicitLegend.append("span")
      .style("display", "inline-block")
      .style("width", "18px")
      .style("height", "18px")
      .style("background-color", color)
      .style("margin-right", "5px");
    explicitLegend.append("span")
      .text(label)
      .style("margin-right", "15px");
  });
}
