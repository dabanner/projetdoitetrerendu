const canvas = d3.select('#canvas');
const tooltip = d3.select('#tooltip');
const backButton = d3.select('#back-button');
const emotionTitle = d3.select('#emotion-title');

const emotionColors = d3.scaleOrdinal()
    .range([
        '#4ECDC4', '#95A5A6', '#FF69B4', '#FFD93D', '#FF7979',
        '#FF6B6B', '#2C3E50', '#8E44AD', '#3498DB', '#E67E22',
        '#16A085', '#2980B9', '#8E44AD', '#2C3E50', '#F1C40F'
    ]);

let originalData = null;
let currentView = 'main';
let currentEmotion = null;

const drawTreeMap = (data, emotion = null) => {
    canvas.selectAll('*').remove();

    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    const totalValue = hierarchy.value;

    const treemap = d3.treemap()
        .size([1400, 800])
        .paddingOuter(3)
        .paddingTop(emotion ? 40 : 28)
        .paddingInner(2)
        .round(true);

    treemap(hierarchy);

    const nodes = hierarchy.descendants();

    const cell = canvas.selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    cell.append('rect')
        .attr('class', 'tile')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => {
            if (d.depth === 0) return '#1D1F20';
            if (emotion) {
                return d3.rgb(emotionColors(emotion)).brighter(0.3);
            }
            if (d.depth === 1) return emotionColors(d.data.name);
            return d3.rgb(emotionColors(d.parent.data.name)).brighter(0.3);
        })
        .attr('stroke', '#1D1F20')
        .attr('stroke-width', 1)
        .on('click', d => {
            if (d.depth === 1 && currentView === 'main') {
                currentView = 'emotion';
                currentEmotion = d.data.name;
                backButton.style('display', 'block');
                emotionTitle.text(d.data.name)
                    .style('color', emotionColors(d.data.name))
                    .style('display', 'block');
                
                const emotionData = {
                    name: "root",
                    children: d.children.map(child => ({
                        name: child.data.name,
                        value: child.data.value,
                        emotion: d.data.name
                    }))
                };
                
                drawTreeMap(emotionData, d.data.name);
            }
        })
        .on('mouseover', (d) => {
            tooltip.style('opacity', 1);
            
            let content = '';
            if (d.depth === 1 && currentView === 'main') {
                const total = d3.sum(d.children, c => c.value);
                content = `
                    <strong>${d.data.name}</strong><br>
                    Total Strength: ${total.toLocaleString()}<br>
                    Click to explore genres
                `;
            } else if ((d.depth === 2 && currentView === 'main') || 
                      (d.depth === 1 && currentView === 'emotion')) {
                const emotionName = currentView === 'emotion' ? currentEmotion : d.parent.data.name;
                const parentValue = currentView === 'emotion' ? totalValue : d.parent.value;
                const percentage = ((d.value / parentValue) * 100).toFixed(1);
                content = `
                    <strong>Genre:</strong> ${d.data.name}<br>
                    <strong>Emotion:</strong> ${emotionName}<br>
                    <strong>Strength:</strong> ${d.value.toLocaleString()}<br>
                    <strong>Percentage of ${emotionName}:</strong> ${percentage}%
                `;
            }
            
            tooltip.html(content)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mousemove', () => {
            tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });

    const tempText = canvas.append('text')
        .attr('class', 'tile-text')
        .style('visibility', 'hidden')
        .style('font-size', currentView === 'emotion' ? '16px' : '12px');

    cell.each(function(d) {
        const group = d3.select(this);
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        
        if (d.depth === 0) return;

        if (d.depth === 1 && currentView === 'main') {
            if (width > 30) {
                group.append('text')
                    .attr('class', 'tile-text')
                    .attr('x', 4)
                    .attr('y', 4)
                    .style('fill', 'white')
                    .style('font-size', '16px')
                    .style('font-weight', 'bold')
                    .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
                    .append('tspan')
                    .attr('x', 4)
                    .attr('dy', '1em')
                    .text(d.data.name);
            }
            return;
        }

        const parentValue = currentView === 'emotion' ? totalValue : d.parent.value;
        const percentage = ((d.value / parentValue) * 100).toFixed(1);
        
        const textElement = group.append('text')
            .attr('class', 'tile-text')
            .attr('x', 4)
            .attr('y', 4)
            .style('fill', 'white')
            .style('font-size', currentView === 'emotion' ? '16px' : '12px')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)');

        const name = d.data.name;
        tempText.text(name);
        const textWidth = tempText.node().getComputedTextLength();
        const requiredWidth = textWidth * 1.2;
        
        if (width > requiredWidth && height >= 40) {
            textElement.append('tspan')
                .attr('x', 4)
                .attr('dy', '1em')
                .text(name);

            textElement.append('tspan')
                .attr('x', 4)
                .attr('dy', '1.2em')
                .attr('class', 'percentage-text')
                .style('font-size', currentView === 'emotion' ? '14px' : '11px')
                .text(`${percentage}%`);
        }
    });

    tempText.remove();
};

backButton.on('click', () => {
    if (currentView === 'emotion') {
        currentView = 'main';
        currentEmotion = null;
        backButton.style('display', 'none');
        emotionTitle.style('display', 'none');
        drawTreeMap(originalData);
    }
});

fetch('/data/emotion_genre_map.json')
    .then(response => response.json())
    .then(data => {
        console.log('Data loaded:', data);
        originalData = data;
        drawTreeMap(data);
    })
    .catch(error => {
        console.error('Error loading data:', error);
        document.getElementById('title').textContent = 'Error loading data';
    });