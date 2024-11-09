async function drawMap(jsonData) {
    // Filter data for 'French Hip Hop' genre
    const frenchHipHopArtists = jsonData
        .find(genre => genre.name === 'French Hip Hop')
        .artists.reduce((acc, artist) => {
            acc[artist.location] = (acc[artist.location] || 0) + 1;
            return acc;
        }, {});

    // Load world map data
    const worldMap = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(response => response.json());

    // Set up the map
    const width = document.getElementById('map').clientWidth;
    const height = 600;

    const svg = d3.select('#map').append('svg')
        .attr('width', width)
        .attr('height', height);

    const projection = d3.geoMercator()
        .scale(width / 6)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Create color scale
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, d3.max(Object.values(frenchHipHopArtists))]);

    // Draw the map
    svg.selectAll('.country')
        .data(worldMap.features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('d', path)
        .style('fill', d => {
            const countryName = d.properties.name;
            const artistCount = frenchHipHopArtists[countryName] || 0;
            return colorScale(artistCount);
        });

    // Add tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip');

    svg.selectAll('.country')
        .on('mouseover', (event, d) => {
            const countryName = d.properties.name;
            const artistCount = frenchHipHopArtists[countryName] || 0;
            tooltip.html(`${countryName}: ${artistCount} artists`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .style('opacity', 1);
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });

    // Add legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg.append('g')
        .attr('transform', `translate(${width - legendWidth - 20}, ${height - 50})`);

    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(frenchHipHopArtists))])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickSize(legendHeight);

    legend.append('g')
        .call(legendAxis);

    const legendGradient = legend.append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

    legendGradient.selectAll('stop')
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)');
}

// Fetch your JSON data and draw the map
fetch('./genres.json')
    .then(response => response.json())
    .then(jsonData => drawMap(jsonData))
    .catch(error => console.error(error));

// Add responsiveness
window.addEventListener('resize', () => {
    d3.select('#map').html('');
    fetch('./genres.json')
        .then(response => response.json())
        .then(jsonData => drawMap(jsonData))
        .catch(error => console.error(error));
});