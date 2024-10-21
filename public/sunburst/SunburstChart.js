const width = 800;
const radius = width / 2;

// Set up the partition layout.
const partition = d3.partition().size([2 * Math.PI, radius]);

// Fetch the data and process it to group albums by country.
fetch('/data/album.json')
    .then(response => response.json())
    .then(data => {
        const limitedAlbums = data.slice(0, 1000);

        // Group the limited albums by country, assigning "Unknown" for empty or undefined countries.
        const albumsByCountry = d3.group(limitedAlbums, d => {
            if (!d.country) {
                return "Unknown"; // Assign to "Unknown" if country is not defined
            }
            return d.country; // Otherwise, return the actual country
        });

        // Format the data in a hierarchical structure.
        const root = d3.hierarchy({
            children: Array.from(albumsByCountry, ([country, albums]) => ({
                name: country,
                children: albums.map(album => ({
                    name: album.title,
                    artist: album.name,
                    value: album.deezerFans || 0, // Default value for deezerFans
                    color: "#ccc",
                    country: album.country || "Unknown", // Assign "Unknown" if country is not defined
                    cover: album.cover
                }))
            }))
        })
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        partition(root);

        // Store the root so we can reset to the full view.
        let currentRoot = root;

        // Create the SVG container.
        const svg = d3.select("svg")
            .attr("width", width)
            .attr("height", width)
            .append("g")
            .attr("transform", `translate(${width / 2},${width / 2})`);

        // Define the arc generator.
        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        // Create a function to update the chart with new data.
        function updateChart(root) {
            const path = svg.selectAll("path")
                .data(root.descendants(), d => d.data.name);

            // Update existing paths.
            path.transition()
                .duration(750)
                .attr("d", arc);

            // Enter new paths.
            path.enter().append("path")
                .attr("d", arc)
                .attr("fill", d => {
                    while (d.depth > 1) d = d.parent;
                    return d.data.color || '#c0c8cb';
                })
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .on("mouseover", function (event, d) {
                    // Change fill color on hover.
                    d3.select(this)
                        .attr("fill", "orange"); // Change to the desired hover color.
                })
                .on("mouseout", function (event, d) {
                    // Reset the fill color when mouse leaves.
                    d3.select(this)
                        .attr("fill", d => {
                            while (d.depth > 1) d = d.parent;
                            return d.data.color || '#c0c8cb'; // Reset to the original color.
                        });
                })
                .on("click", (event, d) => {
                    console.log("Clicked on:", d.data.name, "Depth:", d.depth);
                    if (d.children !== undefined) {
                        focusOnCountry(d, d.depth);
                    } else {
                        console.log("Album clicked:", d.data);
                        displayAlbumInfo(d.data);
                    }
                });

            // Remove old paths.
            path.exit().remove();

            // Add labels for countries and albums.
            const label = svg.selectAll("text")
                .data(root.descendants(), d => d.data.name);

            label.transition()
                .duration(750)
                .attr("transform", d => {
                    const angle = (d.x0 + d.x1) / 2;
                    return `rotate(${(angle * 180 / Math.PI - 90)}) translate(${(d.y0 + d.y1) / 2})`;
                })
                .attr("text-anchor", "middle")
                .text(d => {
                    return d.depth === 1 ? `${d.data.name}` : (d.depth === 2 ? `${d.data.name} - ${d.data.artist}` : '');
                })
                .style("font-size", "10px")
                .style("fill", "#000");

            // Enter new labels.
            label.enter().append("text")
                .attr("transform", d => {
                    const angle = (d.x0 + d.x1) / 2;
                    return `rotate(${(angle * 180 / Math.PI - 90)}) translate(${(d.y0 + d.y1) / 2})`;
                })
                .attr("text-anchor", "middle")
                .text(d => {
                    return d.depth === 1 ? `${d.data.name}` : (d.depth === 2 ? `${d.data.name} - ${d.data.artist}` : '');
                })
                .style("font-size", "10px")
                .style("fill", "#000");

            // Remove old labels.
            label.exit().remove();
        }

        // Function to focus on a specific country and show its albums.
        function focusOnCountry(d, depth) {
            const countryAlbums = d.data.children;

            // Create a new hierarchy for the selected country.
            const countryRoot = d3.hierarchy({
                name: d.data.name,
                children: countryAlbums
            })
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

            partition(countryRoot);

            // Update the chart with the new country-focused hierarchy.
            updateChart(countryRoot);
        }

        function displayAlbumInfo(albumData) {
            // Update the album cover image and details.
            const albumInfoContainer = document.getElementById('album-info');
            const albumCover = document.getElementById('album-cover');
            const albumDetails = document.getElementById('album-details');

            // Update album cover with available image size, using 'standard' by default
            albumCover.src = albumData.cover ? albumData.cover.standard : 'default-cover.jpg'; // Provide a default image if none is available

            // Update the album details (title, artist, fans, release date, etc.).
            albumDetails.innerHTML = `
            <h3>${albumData.name}</h3>
            <p>Artist: ${albumData.artist}</p>
            <p>Deezer Fans: ${albumData.value}</p>
            <p>Release Date: ${albumData.dateRelease}</p>
            <p>Country: ${albumData.country || "Unknown"}</p>
            `;

            // Show the album info container.
            albumInfoContainer.style.display = 'block';
        }

        // Initial rendering of the chart with all countries.
        updateChart(currentRoot);
    })
    .catch(error => {
        console.error('Error loading the JSON data:', error);
    });
