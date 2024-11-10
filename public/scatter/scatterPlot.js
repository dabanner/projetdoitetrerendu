// Configuration du graphique
const width = 900;
const height = 600;
const margin = { top: 20, right: 200, bottom: 70, left: 70 }; // Augmenter le margin droit pour la légende

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

    // Seuls les genres non vides seront ajoutés au tableau genres.
    // Les genres vides ou non définis seront simplement ignorés.
    const genres = Array.from(new Set(data.flatMap(d => d.genre ? [d.genre] : [])));
    const genreColor = d3.scaleOrdinal(d3.schemeCategory10).domain(genres);

    // Définition des échelles
    const xScale = d3.scaleLinear().domain([1920, 2024]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.popularity)]).range([height, 0]);

    // Ajout des axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
    svg.append("g").call(yAxis);

    // Ajouter les labels des axes
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 30)
        .style("text-anchor", "middle")
        .text("Année de sortie");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .style("text-anchor", "middle")
        .text("Popularité");

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
        .style("display", "none") // Masquer les points au départ
 
    // Fonction de mise à jour du graphique
    function updateChart() {
        const selectedRanges = yearRanges.filter((_, i) =>
            checkboxContainer.selectAll("input").nodes()[i].checked
        );

        svg.selectAll(".point")
            .style("display", d =>
                selectedRanges.some(range => {
                    const [min, max] = range.split("-").map(Number);
                    return d.year >= min && d.year <= max;
                }) ? "block" : "none"
            );
    }

    // Ajout des cases à cocher pour chaque plage d'années (désactivées par défaut)
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
        label.append("span").text("Toutes les années");

    yearRanges.forEach(range => {
        const label = checkboxContainer.append("label");
        label.append("input")
            .attr("type", "checkbox")
            .attr("value", range)
            .property("checked", false) // Désactivé par défaut
            .style("margin-left", "25px")
            .on("change", updateChart);
        label.append("span").text(range);
    });

// Ajouter la légende des genres à droite du graphique
const legend = svg.append("g")
    .attr("transform", `translate(${width + 20}, 20)`); // Positionner à droite du graphique
// Ajouter le titre de la légende
legend.append("text")
  .attr("x", 0)
  .attr("y", -10) // Ajuster la position verticale si nécessaire
  .style("font-weight", "bold")
  .text("Légende des genres");

genres.forEach((genre, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        // Définir la taille des carrés à 12x12
        legendRow.append("rect")
            .attr("x", 20) // Positionner le texte à droite du carré
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", genreColor(genre));

        // Définir la taille de la police
        legendRow.append("text")
            .attr("x", 36) // Positionner le texte à droite du carré
            .attr("y", 6) // Centrer verticalement avec le carré
            .attr("dy", ".35em")
            .style("font-size", "12px") // Taille de la police réduite
            .style("text-anchor", "start")
            .text(genre);

});


}).catch(error => console.error("Erreur lors du chargement des données :", error));
