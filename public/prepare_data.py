import json
import os

input_folder = '../data'
output_file = 'data/processed_data.json'

processed_data = []

# Lire les fichiers nécessaires avec encodage UTF-8 et gestion des erreurs
with open(os.path.join(input_folder, 'album.json'), 'r', encoding='utf-8', errors='replace') as f:
    albums = json.load(f)

# Extraire les données des albums pour le nuage de points
for album in albums:
    artist = album.get('name')  # Nom de l'artiste
    release_year = album.get('publicationDate')  # Année de sortie
    popularity = album.get('deezerFans', 0)  # Popularité
    complexity = album.get('complexity', 0)  # Complexité des paroles (si disponible)
    genre = album.get('genre', 0) # genre
    
    if artist and release_year:
        processed_data.append({
            'artist': artist,
            'year': int(release_year) if release_year.isdigit() else None,  # Convertit en entier si possible
            'popularity': popularity,
            'complexity': complexity,
            'genre': genre,
        })

# Sauvegarder les données dans le fichier JSON final pour la visualisation
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(processed_data, f, indent=4)

print(f"Données transformées et sauvegardées dans {output_file}")
