function createStackedAreaChart(data) {
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const width = 1600 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const years = Array.from(new Set(data.map(d => d.year)));
  const genres = Array.from(new Set(data.map(d => d.genre)));

  const nestedData = d3.groups(data, d => d.year);

  const x = d3.scaleBand()
    .domain(years)
    .range([0, width])
    .padding(0.1);

  const color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(genres);

  const area = d3.area()
    .x((d, i) => x(years[i]))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

  const y = d3.scaleLinear()
    .range([height, 0]);

  const totalAlbumsByGenre = genres.map(genre => {
    const total = data.filter(d => d.genre === genre)
      .reduce((sum, d) => sum + d.nbAlbums, 0);
    return { genre, total };
  });

  totalAlbumsByGenre.sort((a, b) => b.total - a.total);

  const legend = d3.select("body").append("div")
    .attr("class", "legend")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("margin", "10px 0");

  const genreVisibility = {};

  totalAlbumsByGenre.forEach(({ genre }) => {
    const legendItem = legend.append("div").attr("class", "legend-item")
      .style("margin-right", "20px");

    const colorBox = legendItem.append("span")
      .style("background-color", color(genre))
      .style("width", "20px")
      .style("height", "20px")
      .style("display", "inline-block")
      .style("margin-right", "5px");

    legendItem.append("label")
      .attr("for", genre)
      .text(genre)
      .style("cursor", "pointer")
      .on("click", function() {
        genreVisibility[genre] = !genreVisibility[genre];
        
        if (genreVisibility[genre]) {
          colorBox.style("opacity", 1);
        } else {
          colorBox.style("opacity", 0.3);
        }

        updateChart();
      });

    genreVisibility[genre] = true;
  });

  function updateChart() {
    const visibleGenres = genres.filter(genre => genreVisibility[genre]);

    const filteredData = nestedData.map(([year, items]) => {
      return items.filter(item => visibleGenres.includes(item.genre));
    });

    let stackedData = d3.stack()
      .keys(visibleGenres)
      .value((d, key) => {
        const genreData = d.find(g => g.genre === key);
        return genreData ? genreData.nbAlbums : 0;
      })
      (filteredData);

    y.domain([0, d3.max(stackedData, series => d3.max(series, d => d[1]))]);

    svg.selectAll("path").remove();

    svg.selectAll("path")
      .data(stackedData)
      .enter().append("path")
      .attr("fill", (d, i) => color(visibleGenres[i]))
      .attr("d", area)
      .on("mouseover", function(event, d) {
        const genre = visibleGenres[d3.select(this).datum().key];
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(genre)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    svg.selectAll(".y-axis").remove();
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    svg.selectAll(".grid-y")
      .data(y.ticks(5))
      .enter().append("line")
      .attr("class", "grid-y")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .style("stroke", "#ccc")
      .style("stroke-dasharray", "4,4")
      .style("shape-rendering", "crispEdges");

    svg.selectAll(".grid-x")
      .data(x.domain())
      .enter().append("line")
      .attr("class", "grid-x")
      .attr("x1", d => x(d) + x.bandwidth() / 2)
      .attr("x2", d => x(d) + x.bandwidth() / 2)
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", "#ccc")
      .style("stroke-dasharray", "4,4")
      .style("shape-rendering", "crispEdges");
  }

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("opacity", 0)
    .style("background-color", "rgba(0,0,0,0.6)")
    .style("color", "#fff")
    .style("padding", "5px")
    .style("border-radius", "5px");

  updateChart();


  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .selectAll("text")
    .style("font-size", "8px");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .text("Year");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .text("Number of Albums");
}
