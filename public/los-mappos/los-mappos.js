// Set the dimensions and margins of the graph
var width = 1280;
var height = 550;

// Append the svg object to the body of the page
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geoMercator()
    .scale(153)
    .translate([width / 2, height / 2])

// Load external data and boot
async function testFunc() {
    const genresData = await d3.json("genres.json");

    // Process the data to calculate the popularity of each genre in each country
    var genreData = processData(genresData);

    // Load the world map data
    const worldData = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");

    // Join the data
    var joinedData = joinData(genreData, worldData);

    // Create the heatmap
    createHeatmap(joinedData, "J-Rock");


    // Draw the map
    /*
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "black")
        .style("opacity", 1)
        */

}










//////////////////////////////////////////////////


// Load your data

// Function to process the data
function processData(genresData) {
    // Create an object to store the popularity of each genre in each country
    var data = {};

    // Loop through the genres data
    genresData.forEach(function (genre) {
        // Loop through the artists in each genre
        genre.artists.forEach(function (artist) {
            // If the country is not in the data object, add it
            if (!data[artist.location]) {
                data[artist.location] = {};
            }

            // If the genre is not in the country object, add it and set the count to 1
            if (!data[artist.location][genre.name]) {
                data[artist.location][genre.name] = 1;
            } else {
                // If the genre is already in the country object, increment the count
                data[artist.location][genre.name]++;
            }
        });
    });

    // Normalize the data to get the popularity
    for (var country in data) {
        var totalArtists = 0;
        for (var genre in data[country]) {
            totalArtists += data[country][genre];
        }
        for (var genre in data[country]) {
            data[country][genre] = data[country][genre] / totalArtists;
        }
    }

    return data;
}

// Function to join the data
function joinData(data, worldData) {
    // Loop through the world map data
    for (var i = 0; i < worldData.features.length; i++) {
        var country = worldData.features[i].properties.name;
        // If the country is in the data object, add the data to the feature
        if (data[country]) {
            worldData.features[i].properties.data = data[country];
        }
    }
    return worldData;
}

// Function to create the heatmap
function createHeatmap(joinedData, genre) {
    // Create a color scale
    var colorScale = d3.scaleQuantize()
        .domain([0, 1])
        .range(d3.schemeReds[9]);

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(joinedData.features)
        .enter()
        .append("path")
        .attr("fill", function (d) {
            // If the country has data, use the popularity of the given genre to color the country
            if (d.properties.data && d.properties.data[genre]) {
                console.log(d.properties.data)
                return colorScale(d.properties.data[genre]);
            } else {
                // If the country does not have data for the given genre, use a default color
                return "#ccc";
            }
        })
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "black")
        .style("opacity", 1);
}

async function drawMap(jsonData) {
    // Filter data for 'J-Rock' genre
    const jRockArtists = jsonData
        .find(genre => genre.name === 'J-Rock')
        .artists.reduce((acc, artist) => {
            acc[artist.location] = (acc[artist.location] || 0) + 1;
            return acc;
        }, {});

    // Load world map data
    const worldMap = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/world/110m.json').then(response => response.json());

    // Draw the map
    const svg = d3.select('#map').append('svg')
        .attr('width', 1000)
        .attr('height', 600);

    const projection = d3.geoMercator()
        .scale(150)
        .translate([500, 300]);

    const path = d3.geoPath().projection(projection);

    svg.selectAll('.country')
        .data(topojson.feature(worldMap, worldMap.objects.countries).features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('d', path)
        .style('fill', d => {
            const countryName = d.properties.name;
            const artistCount = jRockArtists[countryName] || 0;
            const colorScale = d3.scaleSequential(d3.interpolateOranges)
                .domain([0, d3.max(Object.values(jRockArtists))]);
            return colorScale(artistCount);
        });
}

// Fetch your JSON data and draw the map
fetch('./genres.json')
    .then(response => response.json())
    .then(jsonData => drawMap(jsonData))
    .catch(error => console.error(error));
