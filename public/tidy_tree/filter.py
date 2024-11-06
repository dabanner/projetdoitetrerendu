import json
# Load artists data
with open('../data/artist-without-members.json') as f:
    artists_data = json.load(f)

# Load albums data
with open('../data/album.json') as f:
    albums_data = json.load(f)

# Function to filter artists without members
def filter_artists(artists):
    filtered_artists = []
    for artist in artists:
        if len(artist['genres'])>0:
            filtered_artists.append({
                'name': artist['name'],
                'genres': artist['genres'],
                'albums': []  # Initialize an empty list for albums
            })
    return filtered_artists

# Function to add album titles to artists
def add_albums_to_artists(artists, albums):
    for artist in artists:
        # Find albums that belong to the artist
        artist_albums = [album['title'] for album in albums if album['name'] == artist['name']]
        artist['albums'] = artist_albums  # Add albums to artist data
        print(artist)

# Filter artists without members
filtered_artists = filter_artists(artists_data)
print("filtered")

# Add albums to the filtered artists
add_albums_to_artists(filtered_artists, albums_data)
print("filtered 2")

# Output the combined data
output_data = {
    'artists': filtered_artists
}

# Save the result to a new JSON file
with open('filtered_artists_py.json', 'w') as f:
    json.dump(output_data, f, indent=4)

print("Filtered artists data has been saved to 'filtered_artists.json'.")
