async function loadParallelSetData(N) {
    try {
        const response = await fetch('/data/album.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const sortedData = data.sort((a, b) => {
            return new Date(b.publicationDate) - new Date(a.publicationDate);
        });

        const slicedData = sortedData;

        const filteredData = slicedData.filter(item =>
            item.genre && item.genre.trim() !== "" &&
            item.length && isValidLength(item.length) &&
            item.country && item.language && item.publicationDate
        );

        const mappedData = filteredData.map(item => ({
            id: item._id.$oid,
            name: item.name,
            genre: item.genre,
            length: convertLengthToMinutes(item.length),
            publicationDate: item.publicationDate,
            country: item.country,
            language: item.language, 
            explicitLyrics: item.explicitLyrics === undefined || item.explicitLyrics === "" ? false : item.explicitLyrics,
        }));

        return mappedData;
    } catch (error) {
        console.error('Error loading JSON:', error);
        return [];
    }
}

function convertLengthToMinutes(length) {
    const parts = length.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return (hours * 60) + minutes;
}

function isValidLength(length) {
    const regex = /^\d{2}:\d{2}$/;
    return regex.test(length);
}
