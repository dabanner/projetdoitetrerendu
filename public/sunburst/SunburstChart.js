const width = 800;
const radius = width / 2;

// Define a custom pastel color scale
const pastelColors = [
    "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
    "#D4A5A5", "#D4C6A5", "#D4D4A5", "#A5D4B5", "#A5B5D4"
];

const colorScale = d3.scaleOrdinal(pastelColors);

function getColor(d) {
    while (d.depth > 1) d = d.parent;
    return colorScale(d.data.name) || '#ccc';
}

// Set up the partition layout with a logarithmic y-scale
const partition = d3.partition()
    .size([2 * Math.PI, radius]);

// Fetch the data and process it to group albums by country.
fetch('/data/updated_album.json')
    .then(response => response.json())
    .then(data => {
        const limitedAlbums = data.slice(0, 4000);

        // Group the limited albums by country, assigning "Unknown" for empty or undefined countries.
        const albumsByCountry = d3.group(limitedAlbums, d => d.country || "Unknown");

        // Create checkboxes for each unique country
        const countryCheckboxesContainer = document.getElementById("country-checkboxes");
        Array.from(albumsByCountry.keys()).forEach(country => {
            const container = document.createElement("div");
            container.classList.add("checkbox-container");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = country;
            checkbox.checked = false;
            checkbox.addEventListener("change", updateChart);

            const label = document.createElement("label");
            label.textContent = country;

            container.appendChild(checkbox);
            container.appendChild(label);
            countryCheckboxesContainer.appendChild(container);
        });

        // Format the data in a hierarchical structure.
        const albumsByArtist = Array.from(albumsByCountry, ([country, albums]) => ({
            name: country,
            children: Array.from(d3.group(albums, d => d.name), ([artist, albums]) => ({
                name: artist,
                children: albums.map(album => ({
                    name: album.title,
                    artist: album.name,
                    value: album.deezerFans || 0,
                    color: "#ccc",
                    country: album.country || "Unknown",
                    cover: album.cover
                }))
            }))
        }));

        // Create the hierarchical data structure.
        const root = d3.hierarchy({ children: albumsByArtist })
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        partition(root);
        let currentRoot = root;

        // Create the SVG container.
        const svg = d3.select("svg")
            .attr("width", width)
            .attr("height", width)
            .append("g")
            .attr("transform", `translate(${width / 2},${width / 2})`);

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        // Function to update the chart with selected countries
        function updateChart() {
            const selectedCountries = Array.from(document.querySelectorAll("#country-checkboxes input:checked"))
                .map(checkbox => checkbox.value);

            // Filter albums based on selected countries
            const filteredData = currentRoot.data.children.filter(d => selectedCountries.includes(d.name));
            const filteredRoot = d3.hierarchy({ children: filteredData })
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

            partition(filteredRoot);

            // Update paths with the filtered data
            const path = svg.selectAll("path")
                .data(filteredRoot.descendants(), d => d.data.name);

            path.transition()
                .duration(750)
                .attr("d", arc)
                .attr("fill", d => getColor(d));

            // Updated click handler inside path.enter().append("path") section
            path.enter().append("path")
                .attr("d", arc)
                .attr("fill", d => getColor(d))
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .on("mouseover", function () {
                    d3.select(this).attr("fill", "orange");
                })
                .on("mouseout", function (event, d) {
                    d3.select(this).attr("fill", getColor(d));
                })
                .on("click", (event, d) => {
                    // Ignore clicks on artist arcs (depth 2) and above
                    if (d.depth === 2) {
                        return; // Don't do anything if it's an artist arc
                    }

                    if (d.children) {
                        return;  // Focus on the selected country or higher level
                    } else {
                        displayAlbumInfo(d.data);  // Display album info if it's a leaf node (album)
                    }
                });

            path.exit().remove();

            const label = svg.selectAll("text")
                .data(filteredRoot.descendants(), d => d.data.name);

            const minAngle = 0.8 * Math.PI / 180;
            label.transition()
                .duration(750)
                .attr("transform", d => {
                    const angle = (d.x0 + d.x1) / 2;
                    return `rotate(${(angle * 180 / Math.PI - 90)}) translate(${(d.y0 + d.y1) / 2})`;
                })
                .attr("text-anchor", "middle")
                .text(d => {
                    const angle = d.x1 - d.x0;
                    if (angle >= minAngle) {
                        if (d.depth === 1) {
                            return d.data.name; // Country name
                        } else if (d.depth === 2) {
                            return `${d.data.name}`; // Artist name
                        } else if (d.depth === 3) {
                            return d.data.name; // Album title
                        }
                    }
                    return '';
                })
                .style("font-size", "10px")
                .style("fill", "#000");

            label.enter().append("text")
                .attr("transform", d => {
                    const angle = (d.x0 + d.x1) / 2;
                    return `rotate(${(angle * 180 / Math.PI - 90)}) translate(${(d.y0 + d.y1) / 2})`;
                })
                .attr("text-anchor", "middle")
                .text(d => {
                    const angle = d.x1 - d.x0;
                    if (angle >= minAngle) {
                        return d.depth === 1 ? d.data.name : (d.depth === 2 ? `${d.data.name}` : d.data.name);
                    }
                    return '';
                })
                .style("font-size", "10px")
                .style("fill", "#000");

            label.exit().remove();
        }

        function displayAlbumInfo(albumData) {
            const albumInfoContainer = document.getElementById('album-info');
            const albumCover = document.getElementById('album-cover');
            const albumDetails = document.getElementById('album-details');
            albumCover.src = albumData.cover ? albumData.cover.standard : 'default-cover.jpg';
            albumDetails.innerHTML = `
                        <h3>${albumData.name}</h3>
                        <p>Artist: ${albumData.artist}</p>
                        <p>Deezer Fans: ${albumData.value}</p>
                        <p>Release Date: ${albumData.dateRelease}</p>
                        <p>Country: ${albumData.country || "Unknown"}</p>
                    `;
            albumInfoContainer.style.display = 'block';

            //Button to close the album info container
            const closeButton = document.getElementById('album-info-close');
            closeButton.addEventListener('click', () => {
                albumInfoContainer.style.display = 'none';
            });
        }

        updateChart();
    })
    .catch(error => console.error('Error loading the JSON data:', error));
