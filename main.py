import json
from collections import Counter
from typing import List, Dict, Any

def load_json_file(file_path: str) -> List[Dict[str, Any]]:
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as file:
                return json.load(file)
        except UnicodeDecodeError:
            continue
    raise ValueError("Unable to decode the file with the attempted encodings")

def analyze_dataset(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    artists = []
    songs = []
    genres = []
    labels = []
    years = []

    for artist in data:
        artists.append(artist.get('name', 'Unknown Artist'))
        
        # Genres
        artist_genres = artist.get('genres', []) or artist.get('dbp_genre', [])
        genres.extend(artist_genres)
        
        # Labels
        artist_labels = artist.get('labels', []) or artist.get('recordLabel', [])
        labels.extend(artist_labels)
        
        # Years
        if 'lifeSpan' in artist:
            if 'begin' in artist['lifeSpan']:
                years.append(artist['lifeSpan']['begin'][:4])
            if 'end' in artist['lifeSpan']:
                years.append(artist['lifeSpan']['end'][:4])
        
        # Songs
        if 'albums' in artist:
            for album in artist['albums']:
                if 'songs' in album:
                    for song in album['songs']:
                        songs.append(song.get('title', 'Unknown Song'))

    return {
        "Total Artists": len(artists),
        "Unique Artists": len(set(artists)),
        "Total Songs": len(songs),
        "Unique Songs": len(set(songs)),
        "Top 5 Genres": Counter(genres).most_common(5),
        "Top 5 Labels": Counter(labels).most_common(5),
        "Year Range": f"{min(years, default='N/A')} - {max(years, default='N/A')}",
        "Sample Artists": artists[:5],
        "Sample Songs": songs[:5]
    }

def main():
    try:
        file_path = '72000.json'  # Replace with your file path
        data = load_json_file(file_path)
        results = analyze_dataset(data)

        print("Dataset Analysis Results:")
        for key, value in results.items():
            print(f"{key}: {value}")

    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
    except json.JSONDecodeError:
        print("Error: The file is not a valid JSON.")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()