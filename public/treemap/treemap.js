// Configuration
const width = 1000;
const height = 600;
const DATA_LIMIT = 200;

const canvas = d3.select('#canvas');
const tooltip = d3.select('#tooltip');

const emotionColors = {
    'happy': '#FFD93D',
    'mellow': '#6B4423',
    'sad': '#95A5A6',
    'party': '#FF6B6B',
    'energetic': '#FF8E00',
    'relaxed': '#4ECDC4',
    'dark': '#2C3E50',
    'peaceful': '#9BD7D1',
    'angry': '#E74C3C',
    'romantic': '#FF7C7C'
};

const processData = (emotions, albums) => {
    console.log(`Processing ${emotions.length} emotions and ${albums.length} albums`);

    // Filter out entries without emotions
    const validEmotions = emotions.filter(entry => 
        entry.emotions && 
        Array.isArray(entry.emotions) && 
        entry.emotions.length > 0 &&
        entry.song_id &&
        entry.song_id.$oid
    );

    console.log(`Found ${validEmotions.length} valid emotion entries`);

    // Create album lookup map
    const albumMap = new Map();
    albums.forEach(album => {
        if (album._id && album._id.$oid) {
            albumMap.set(album._id.$oid, {
                title: album.title || 'Unknown Title',
                genre: album.genre || 'Unclassified',
                artist: album.name || 'Unknown Artist'
            });
        }
    });

    console.log(`Created album map with ${albumMap.size} entries`);

    // Group by emotions
    const emotionGroups = {};

    validEmotions.slice(0, DATA_LIMIT).forEach(entry => {
        entry.emotions.forEach(emotion => {
            if (!emotion.emotion_tag || emotion.nbr_tags <= 0) return;

            const emotionTag = emotion.emotion_tag;
            if (!emotionGroups[emotionTag]) {
                emotionGroups[emotionTag] = {
                    name: emotionTag,
                    children: []
                };
            }

            const albumInfo = albumMap.get(entry.song_id.$oid);
            if (!albumInfo) return;

            emotionGroups[emotionTag].children.push({
                name: albumInfo.title,
                value: emotion.nbr_tags,
                genre: albumInfo.genre,
                artist: albumInfo.artist
            });
        });
    });

    // Convert to array and sort by number of songs
    const emotionArray = Object.values(emotionGroups)
        .filter(emotion => emotion.children.length > 0)
        .sort((a, b) => b.children.length - a.children.length);

    console.log('Emotion groups created:', emotionArray.map(e => ({
        emotion: e.name,
        songs: e.children.length
    })));

    return {
        name: "Music Emotions",
        children: emotionArray
    };
};

const drawTreeMap = (data) => {
    console.log('Drawing treemap with data:', data);

    // Clear existing content
    canvas.selectAll("*").remove();

    const root = d3.hierarchy(data)
        .sum(d => d.value || 0)
        .sort((a, b) => b.value - a.value);

    console.log('Hierarchy created with', root.descendants().length, 'nodes');

    const treemap = d3.treemap()
        .size([width, height])
        .paddingTop(15)
        .paddingRight(2)
        .paddingBottom(2)
        .paddingLeft(2);

    treemap(root);

    // Create cells
    const cell = canvas.selectAll('g')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    cell.append('rect')
        .attr('width', d => Math.max(0, d.x1 - d.x0))
        .attr('height', d => Math.max(0, d.y1 - d.y0))
        .attr('fill', d => {
            if (d.depth === 0) return '#fff';
            if (d.depth === 1) return emotionColors[d.data.name] || '#ccc';
            return d3.color(emotionColors[d.parent.data.name]).brighter(0.35);
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('class', 'tile');

    // Add text labels
    cell.append('text')
        .filter(d => d.depth > 0)
        .attr('class', 'tile-text')
        .attr('x', 4)
        .attr('y', 13)
        .text(d => {
            const width = d.x1 - d.x0;
            const height = d.y1 - d.y0;
            if (width < 40 || height < 20) return '';
            return d.data.name;
        });

    // Add tooltips
    cell.on('mouseover', (event, d) => {
        if (d.depth === 0) return;

        tooltip.transition()
            .style('visibility', 'visible');

        const content = d.depth === 1 
            ? `<strong>Emotion: ${d.data.name}</strong><br>Songs: ${d.children?.length || 0}`
            : `<strong>${d.data.name}</strong><br>
               Artist: ${d.data.artist}<br>
               Genre: ${d.data.genre}<br>
               Emotion Strength: ${d.data.value}`;

        tooltip.html(content);
    })
    .on('mouseout', () => {
        tooltip.transition()
            .style('visibility', 'hidden');
    });
};

// Initialize visualization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Loading data...');

    Promise.all([
        fetch('/data/emotion-tags.json').then(res => res.json()),
        fetch('/data/album.json').then(res => res.json())
    ])
    .then(([emotions, albums]) => {
        console.log('Data loaded:', {
            emotions: emotions.length,
            albums: albums.length
        });

        const hierarchicalData = processData(emotions, albums);
        drawTreeMap(hierarchicalData);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('title').textContent = 'Error loading data. Check console for details.';
    });
});