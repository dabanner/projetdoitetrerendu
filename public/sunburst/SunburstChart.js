const width = 600;
const radius = width / 2;

const partition = d3.partition().size([2 * Math.PI, radius]);

fetch('/data/album.json')
    .then(response => response.json())
    .then(data => {
        const limitedAlbums = data.slice(0, 300);

        const root = d3.hierarchy({ children: limitedAlbums.map(album => ({
                name: album.title,
                artist: album.name, // Add the artist name
                value: album.deezerFans || 0,
                color: "#ccc" // Default color
            }))})
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        partition(root);

        const svg = d3.select("svg")
            .append("g")
            .attr("transform", `translate(${width / 2},${width / 2})`);

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        const path = svg.selectAll("path")
            .data(root.descendants())
            .enter().append("path")
            .attr("d", arc)
            .attr("fill", d => {
                while (d.depth > 1) d = d.parent;
                return d.data.color || '#ccc';
            })
            .attr("class", "arc")
            .attr("stroke-width", 1);

        // Add labels
        const label = svg.selectAll("text")
            .data(root.descendants())
            .enter().append("text")
            .attr("transform", d => {
                const angle = (d.x0 + d.x1) / 2; // Midpoint angle
                return `rotate(${(angle * 180 / Math.PI - 90)}) translate(${(d.y0 + d.y1) / 2})`;
            })
            .attr("text-anchor", "middle")
            .text(d => {
                return d.depth === 1 ? `${d.data.name} - ${d.data.artist}` : '';
            })
            .style("font-size", "10px")
            .style("fill", "#000");

        path.on("click", (event, d) => {
            // Handle click events to explore hierarchy
            console.log(d.data);
        });
    })
    .catch(error => {
        console.error('Error loading the JSON data:', error);
    });
