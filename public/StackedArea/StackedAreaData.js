async function loadStackedAreaData() {
    try {
        const response = await fetch('/data/album.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const genreMappingResponse = await fetch('/data/genres.json');
        if (!genreMappingResponse.ok) throw new Error('Failed to load genre mapping');
        const genreMapping = await genreMappingResponse.json();

        const sortedData = data.sort((a, b) => {
            return new Date(b.publicationDate) - new Date(a.publicationDate);
        });

        const filteredData = sortedData.filter(item =>
            item.genre && item.genre.trim() !== "" && item.publicationDate && item.country
        );

        const mappedData = filteredData.map(item => {
            let mainGenre = "Other";
            for (let mainCategory in genreMapping) {
                if (genreMapping[mainCategory][item.genre]) {
                    mainGenre = mainCategory;
                    break;
                }
            }

            return {
                id: item._id.$oid,
                genre: mainGenre,
                publicationDate: item.publicationDate,
                country: item.country,
            };
        });

        return mappedData;
    } catch (error) {
        console.error('Error loading JSON:', error);
        return [];
    }
}

function accumulateAlbumsOverYears(data) {
    const accumulatedData = {};

    data.forEach(item => {
        const year = new Date(item.publicationDate).getFullYear();

        if (!accumulatedData[year]) {
            accumulatedData[year] = {};
        }

        if (!accumulatedData[year][item.genre]) {
            accumulatedData[year][item.genre] = 0;
        }

        accumulatedData[year][item.genre] += 1;
    });

    const result = [];
    for (const year in accumulatedData) {
        for (const genre in accumulatedData[year]) {
            result.push({
                year: parseInt(year),
                genre: genre,
                nbAlbums: accumulatedData[year][genre]
            });
        }
    }

    return result;
}