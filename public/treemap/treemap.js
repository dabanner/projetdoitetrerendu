// Configuration
const config = {
    width: 1000,
    height: 600,
    padding: 10,
    colorScale: {
        'Rock': '#2C3E50',
        'Pop': '#E74C3C',
        'Electronic': '#3498DB',
        'Jazz': '#27AE60',
        'Classical': '#F1C40F'
    }
};

// Select DOM elements
const canvas = d3.select('#canvas');
const tooltip = d3.select('#tooltip');

// Function to transform raw data into hierarchical structure
const transformData = (albums, artists, emotions, socialTags) => {
    // Group albums by artist
    const artistAlbums = {};
    albums.forEach(album => {
        const artistId = album.id_artist.$oid;
        if (!artistAlbums[artistId]) {
            artistAlbums[artistId] = [];
        }
        artistAlbums[artistId].push({
            name: album.title,
            value: album.deezerFans || 1, // Use deezer fans as value, default to 1 if none
            genre: album.genre
        });
    });

    // Create hierarchy
    return {
        name: "Music",
        children: Object.entries(artistAlbums).map(([artistId, albums]) => {
            const artist = artists.find(a => a._id.$oid === artistId);
            return {
                name: artist ? artist.name : "Unknown Artist",
                children: albums
            };
        })
    };
};

// Main drawing function
const drawTreeMap = (data) => {
    // Create hierarchy
    const hierarchy = d3.hierarchy(data, node => node.children)
        .sum(node => node.value)
        .sort((a, b) => b.value - a.value);

    // Create treemap layout
    const createTreeMap = d3.treemap()
        .size([config.width, config.height])
        .padding(1);

    createTreeMap(hierarchy);

    // Get all leaf nodes
    const leaves = hierarchy.leaves();

    // Create groups for each tile
    const tiles = canvas.selectAll('g')
        .data(leaves)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    tiles.append('rect')
        .attr('class', 'tile')
        .attr('fill', d => {
            const genre = d.data.genre || 'Rock'; // Default to Rock if no genre
            return config.colorScale[genre] || '#888'; // Default color if genre not in colorScale
        })
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('data-name', d => d.data.name)
        .attr('data-value', d => d.value)
        .on('mouseover', (d) => {
            tooltip.transition()
                .style('visibility', 'visible');
            
            tooltip.html(`
                <strong>${d.data.name}</strong><br>
                Artist: ${d.parent.data.name}<br>
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
    tiles.append('text')
        .attr('class', 'tile-text')
        .selectAll('tspan')
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append('tspan')
        .attr('x', 4)
        .attr('y', (d, i) => 13 + i * 10)
        .text(d => d);
};

// Load and process data
const loadData = async () => {
    try {
        // Load all required JSON files
        const [albums, artists, emotions, socialTags] = await Promise.all([
            d3.json('/data/album.json'),
            d3.json('/data/artist-without-members.json'),
            d3.json('/data/emotion-tags.json'),
            d3.json('/data/social-tags.json')
        ]);

        console.log('Loaded data:', { albums, artists, emotions, socialTags });

        // Transform the data into hierarchical structure
        const hierarchicalData = transformData(albums, artists, emotions, socialTags);
        
        console.log('Transformed data:', hierarchicalData);
        
        // Draw the treemap
        drawTreeMap(hierarchicalData);
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('title').textContent = 'Error loading data. Check console for details.';
    }
};

// Initialize visualization
loadData();