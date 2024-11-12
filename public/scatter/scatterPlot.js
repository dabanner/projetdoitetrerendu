// Configuration du graphique
const width = 900;
const height = 600;
const margin = { top: 20, right: 200, bottom: 70, left: 70 };

// Création du canevas SVG pour le graphique D3
const svg = d3.select("#scatter-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Données de plage d'années
const yearRanges = [
    "1920-1929", "1930-1939", "1940-1949", "1950-1959",
    "1960-1969", "1970-1979", "1980-1989", "1990-1999",
    "2000-2009", "2010-2019", "2020-2024"
];

// Fonction pour charger et afficher les données du graphique
d3.json("/data/processed_data.json").then(data => {
    if (!data) {
        console.error("Erreur : Les données sont vides ou introuvables.");
        return;
    }

    // Conversion des valeurs numériques et extraction des genres uniques
    data.forEach(d => {
        d.year = +d.year;
        d.popularity = +d.popularity;
    });

    const genres = Array.from(new Set(data.flatMap(d => d.genre ? [d.genre] : [])));

    // Générer une palette de couleurs unique
    const genreColor = d3.scaleOrdinal()
       .domain(genres)
       .range(genres.map((d, i) => d3.interpolateRainbow(i / 33)));

    // Définition des échelles
    const xScale = d3.scaleLinear().domain([1920, 2024]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.popularity)]).range([height, 0]);

    // Ajout des axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g").attr("transform", `translate(0,${height})`).attr("class", "x-axis").call(xAxis);
    svg.append("g").attr("class", "y-axis").call(yAxis);

    // Ajouter les labels des axes
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 30)
        .style("text-anchor", "middle")
        .text("Release Year");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .style("text-anchor", "middle")
        .text("Popularity");

    // Ajouter les points de données avec couleur en fonction du genre
    svg.selectAll(".point")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.popularity))
        .attr("r", 4)
        .style("fill", d => genreColor(d.genre[0]))
        .style("display", "none");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Fonction de mise à jour du graphique
// Fonction de mise à jour du graphique
function updateChart() {
    const selectedRanges = yearRanges.filter((_, i) =>
        checkboxContainer.selectAll("input").nodes()[i].checked
    );

    // Réinitialiser la plage d'années par défaut si aucune case n'est cochée
    if (selectedRanges.length === 0) {
        xScale.domain([1920, 2024]);
    } else {
        const yearsSelected = selectedRanges.flatMap(range => {
            const [min, max] = range.split("-").map(Number);
            return [min, max];
        });

        // Calculer la plage minimale et maximale des années sélectionnées
        var xMin = (d3.min(yearsSelected) - 10);
        var xMax = (d3.max(yearsSelected) - 10);
        if (xMax == 2014) { xMax = 2024; }

        // Mettre à jour l'échelle de xScale
        xScale.domain([xMin, xMax]);
    }

    // Extraire les données filtrées par plage d'années sélectionnée
    const filteredData = data.filter(d =>
        selectedRanges.some(range => {
            const [min, max] = range.split("-").map(Number);
            return d.year >= min && d.year <= max;
        })
    );

    // Calculer la plage min et max pour la popularité dans les données filtrées
    const yMin = d3.min(filteredData, d => d.popularity);
    const yMax = d3.max(filteredData, d => d.popularity);

    // Mettre à jour l'échelle de yScale en fonction des nouvelles valeurs min et max
    yScale.domain([0, yMax]);

    // Redessiner les axes avec les nouvelles échelles
    svg.select(".x-axis").transition().duration(500).call(xAxis);
    svg.select(".y-axis").transition().duration(500).call(yAxis);

    // Afficher ou masquer les points en fonction des plages d'années sélectionnées
    svg.selectAll(".point")
        .style("display", d =>
            selectedRanges.some(range => {
                const [min, max] = range.split("-").map(Number);
                return d.year >= min && d.year <= max;
            }) ? "block" : "none"
        );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////        
    // Ajout des cases à cocher pour chaque plage d'années
    const checkboxContainer = d3.select("#checkboxes");

    // Ajout de la case à cocher "Toutes les années" en haut
    const label = checkboxContainer.append("label");
    label.append("input")
        .attr("type", "checkbox")
        .attr("id", "selectAll")
        .property("checked", false)
        .on("change", () => {
            checkboxContainer.selectAll("input:not(#selectAll)")
                .property("checked", d3.select("#selectAll").property("checked"));
            updateChart();
        });
    label.append("span").text("Select All Years");

    yearRanges.forEach(range => {
        const label = checkboxContainer.append("label");
        label.append("input")
            .attr("type", "checkbox")
            .attr("value", range)
            .property("checked", false)
            .style("margin-left", "25px")
            .on("change", updateChart);
        label.append("span").text(range);
    });

    // Ajouter la légende des genres à droite du graphique
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, 20)`);

    legend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-weight", "bold")
        .text("Genres");

    genres.forEach((genre, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendRow.append("rect")
            .attr("x", 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", genreColor(genre));

        legendRow.append("text")
            .attr("x", 36)
            .attr("y", 6)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .style("text-anchor", "start")
            .text(genre);
    });

}).catch(error => console.error("Erreur lors du chargement des données :", error));
