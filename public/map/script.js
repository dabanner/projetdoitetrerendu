let genresData;
let worldMap;
let selectedGenre;

async function loadData() {
    try {
        const [genresResponse, worldMapResponse] = await Promise.all([
            fetch('./genres.json'),
            fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        ]);

        genresData = await genresResponse.json();
        worldMap = await worldMapResponse.json();

        populateGenreList();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function populateGenreList() {
    const genreList = document.getElementById('genre-list');
    genresData.forEach((genre, index) => {
        const li = document.createElement('li');
        li.textContent = genre.name;
        li.addEventListener('click', () => selectGenre(index));
        genreList.appendChild(li);
    });
}

function selectGenre(index) {
    selectedGenre = genresData[index];
    document.querySelectorAll('#genre-list li').forEach((li, i) => {
        li.classList.toggle('active', i === index);
    });
    document.getElementById('selected-genre').textContent = selectedGenre.name;
    drawMap();
}

function drawMap() {
    if (!worldMap || !selectedGenre) return;

    const artistDistribution = selectedGenre.artists.reduce((acc, artist) => {
        acc[artist.location] = (acc[artist.location] || 0) + 1;
        return acc;
    }, {});

    d3.select('#map').html('');

    const width = document.getElementById('map').clientWidth;
    const height = document.getElementById('map').clientHeight;

    const svg = d3.select('#map').append('svg')
        .attr('width', width)
        .attr('height', height);

    const projection = d3.geoMercator()
        .scale(width / 6)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Adjust color scale for more pronounced differences
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, Math.max(1, d3.max(Object.values(artistDistribution)))])
        .clamp(true);

    svg.selectAll('.country')
        .data(worldMap.features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('d', path)
        .style('fill', d => {
            const countryName = d.properties.name;
            const artistCount = artistDistribution[countryName] || 0;
            return colorScale(Math.pow(artistCount, 0.5)); // Use square root scale for more pronounced differences
        });

    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip');

    svg.selectAll('.country')
        .on('mouseover', (event, d) => {
            const countryName = d.properties.name;
            const artistCount = artistDistribution[countryName] || 0;
            tooltip.html(`${countryName}: ${artistCount} artists`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px')
                .style('opacity', 1);
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });

    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg.append('g')
        .attr('transform', `translate(${width - legendWidth - 20}, ${height - 50})`);

    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(artistDistribution))])
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
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(Math.pow(t, 0.5)) })))
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);

    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)');
}

loadData();

window.addEventListener('resize', () => {
    if (selectedGenre) {
        drawMap();
    }
});