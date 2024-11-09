import json

# Load the original JSON data
with open('./data/json/artist-without-members.json', 'r') as f:
    data = json.load(f)

# Initialize an empty dictionary to hold the genres data
genres_data = {}

# Iterate over each artist in the original data
for artist in data:
    # Iterate over each genre for the current artist
    for genre in artist['genres']:
        # If the genre is not already in the genres_data dictionary, add it
        if genre not in genres_data:
            genres_data[genre] = []
        # Add the artist's name and location to the genre's list of artists
        genres_data[genre].append({
            'name': artist['name'],
            #Only add city and "," if city is not empty
            'location': artist['location']['country']
        })

# Convert the genres_data dictionary to a list of genres
genres = []
for genre, artists in genres_data.items():
    genres.append({
        'name': genre,
        'artists': artists
    })

# Write the genres list to a new JSON file
with open('genres.json', 'w') as f:
    json.dump(genres, f)
