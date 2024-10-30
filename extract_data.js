fetch( __dirname + "/public/data/artist-without-members.json")
  .then(response => {
    // Ensure the response is in JSON format
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(artistsData => {
    // Function to get artists by genre
    function getArtistsByGenre(data, genre) {
      return data.filter(artist => artist.dbp_genre.includes(genre));
    }

    // Example usage
    const genreToFind = "Alternative rock";
    const relatedArtists = getArtistsByGenre(artistsData, genreToFind);

    // Display the result
    console.log(`Artists related to ${genreToFind}:`);
    relatedArtists.forEach(artist => {
      console.log(`- ${artist.name} (ID: ${artist.id_artist_deezer})`);
    });
  })
  .catch(error => {
    console.error("There was a problem with the fetch operation:", error);
  });
