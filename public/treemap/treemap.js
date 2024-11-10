// Configuration
const width = 1000;
const height = 600;
const padding = 10;

// Color scale
const colorScale = {
    'Rock': '#2C3E50',
    'Pop': '#E74C3C',
    'Alternative Rock': '#3498DB',
    'Electronic': '#27AE60',
    'Classical': '#F1C40F',
    'Jazz': '#9B59B6',
    'Other': '#95A5A6'
};

// Select DOM elements
const canvas = d3.select('#canvas');
const tooltip = d3.select('#tooltip');

// Main drawing function
const drawTreeMap = (data) => {
    // Create hierarchy
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    // Create treemap layout
    const createTreeMap = d3.treemap()
        .size([width, height])
        .padding(1);

    createTreeMap(hierarchy);

    // Get all leaf nodes
    const tiles = hierarchy.leaves();

    // Create groups for each tile
    const block = canvas.selectAll('g')
        .data(tiles)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    block.append('rect')
        .attr('class', 'tile')
        .attr('fill', d => {
            const genre = d.data.genre || 'Other';
            return colorScale[genre] || colorScale['Other'];
        })
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('data-name', d => d.data.name)
        .attr('data-value', d => d.value)
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .style('visibility', 'visible');
            
            tooltip.html(`
                <strong>${d.data.name}</strong><br>
                Artist: ${d.data.artist || 'Unknown'}<br>
                Fans: ${d.value.toLocaleString()}<br>
                Genre: ${d.data.genre || 'Unknown'}
            `);
            
            tooltip.attr('data-value', d.value);
        })
        .on('mouseout', () => {
            tooltip.transition()
                .style('visibility', 'hidden');
        });

    // Add text labels
    block.append('text')
        .attr('class', 'tile-text')
        .selectAll('tspan')
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append('tspan')
        .attr('x', 4)
        .attr('y', (d, i) => 13 + i * 10)
        .text(d => d);
};

// Process the album data into a hierarchical structure
const processData = (albums) => {
    // Group by genre first
    const genreGroups = {};
    
    albums.forEach(album => {
        const genre = album.genre || 'Other';
        if (!genreGroups[genre]) {
            genreGroups[genre] = [];
        }
        genreGroups[genre].push({
            name: album.title,
            artist: album.name,
            genre: genre,
            value: album.deezerFans || 1,
            cover: album.cover
        });
    });

    // Create hierarchical structure
    return {
        name: "Albums",
        children: Object.entries(genreGroups).map(([genre, albums]) => ({
            name: genre,
            children: albums
        }))
    };
};

// Load data
fetch('../data/album.json')
    .then(response => response.json())
    .then(albums => {
        console.log('Loaded albums:', albums.length);
        const hierarchicalData = processData(albums);
        console.log('Processed data:', hierarchicalData);
        drawTreeMap(hierarchicalData);
    })
    .catch(error => {
        console.error('Error loading data:', error);
        document.getElementById('title').textContent = 'Error loading data. Check console for details.';
    });