import json
from collections import defaultdict

# Comprehensive genre list
GENRES = {
    # Rock and derivatives
    'rock', 'hard rock', 'classic rock', 'alternative rock', 'punk rock', 
    'progressive rock', 'psychedelic rock', 'indie rock', 'garage rock',
    'art rock', 'folk rock', 'blues rock', 'post rock', 'southern rock',
    
    # Metal and derivatives
    'metal', 'heavy metal', 'black metal', 'death metal', 'thrash metal',
    'doom metal', 'power metal', 'progressive metal', 'gothic metal',
    'symphonic metal', 'folk metal', 'industrial metal',
    
    # Electronic and derivatives
    'electronic', 'electronica', 'techno', 'house', 'trance', 'ambient',
    'drum and bass', 'dubstep', 'idm', 'synthpop', 'electro', 'industrial',
    'dance', 'edm',
    
    # Pop and derivatives
    'pop', 'indie pop', 'synth pop', 'power pop', 'dream pop', 'baroque pop',
    'art pop', 'chamber pop', 'dance pop', 'electropop',
    
    # Hip-Hop/Rap
    'hip hop', 'hip-hop', 'rap', 'gangsta rap', 'underground hip hop',
    'conscious hip hop', 'trap', 'grime',
    
    # Jazz and derivatives
    'jazz', 'fusion', 'bebop', 'swing', 'free jazz', 'acid jazz',
    'contemporary jazz', 'smooth jazz', 'latin jazz',
    
    # Blues and derivatives
    'blues', 'delta blues', 'chicago blues', 'rhythm and blues', 'rnb',
    'contemporary blues',
    
    # Folk and Country
    'folk', 'contemporary folk', 'traditional folk', 'country', 
    'americana', 'bluegrass', 'singer-songwriter',
    
    # World Music
    'world', 'latin', 'reggae', 'ska', 'afrobeat', 'bossa nova', 'samba',
    'salsa', 'flamenco', 'celtic',
    
    # Classical and Orchestral
    'classical', 'contemporary classical', 'baroque', 'opera', 'chamber music',
    'symphony', 'orchestral',
    
    # Other major genres
    'experimental', 'avant-garde', 'indie', 'alternative', 'fusion',
    'instrumental', 'acoustic', 'soul', 'funk', 'disco', 'gospel',
    'soundtrack', 'ambient', 'new age'
}

def extract_valid_emotions():
    """Extract list of valid emotions from emotion-tags.json"""
    print("Extracting valid emotions from emotion-tags.json...")
    
    emotions = set()
    emotion_counts = defaultdict(int)
    
    with open('../data/emotion-tags.json', 'r', encoding='utf-8') as f:
        emotion_data = json.load(f)
        
    for entry in emotion_data:
        for emotion in entry.get('emotions', []):
            if emotion.get('nbr_tags', 0) > 0:
                emotions.add(emotion['emotion_tag'].lower())
                emotion_counts[emotion['emotion_tag'].lower()] += emotion['nbr_tags']
    
    print(f"\nFound {len(emotions)} unique emotions")
    print("\nTop 10 most common emotions:")
    for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"{emotion}: {count}")
        
    return emotions

def create_emotion_genre_map(valid_emotions):
    """Create mapping between emotions and genres using social tags"""
    print("\nProcessing social tags...")
    
    emotion_genre_map = defaultdict(lambda: defaultdict(int))
    processed = 0
    skipped = 0
    
    with open('../data/social-tags.json', 'r', encoding='utf-8') as f:
        social_data = json.load(f)
    
    for entry in social_data:
        song_genres = defaultdict(int)
        song_emotions = defaultdict(int)
        
        for tag in entry.get('socials', []):
            tag_name = tag['social_tag'].lower()
            tag_count = tag['nbr_tags']
            
            if tag_count == 0:
                continue
                
            # Check if it's a verified emotion
            if tag_name in valid_emotions:
                song_emotions[tag_name] += tag_count
                
            # Check if it's a genre
            for genre in GENRES:
                if genre in tag_name:
                    song_genres[genre] += tag_count
                    break
        
        if song_emotions and song_genres:
            for emotion, emotion_count in song_emotions.items():
                for genre, genre_count in song_genres.items():
                    relationship_strength = (emotion_count + genre_count) / 2
                    emotion_genre_map[emotion][genre] += relationship_strength
            processed += 1
        else:
            skipped += 1
    
    print(f"\nProcessed {processed} songs")
    print(f"Skipped {skipped} songs")
    
    return emotion_genre_map

def create_final_structure(emotion_genre_map):
    """Create final JSON structure for visualization"""
    result = {
        "name": "Music Emotions and Genres",
        "children": [
            {
                "name": emotion,
                "children": [
                    {
                        "name": genre,
                        "value": count,
                        "emotion": emotion
                    }
                    for genre, count in sorted(
                        genres.items(),
                        key=lambda x: x[1],
                        reverse=True
                    )[:20]  # Top 10 genres for each emotion
                ]
            }
            for emotion, genres in sorted(
                emotion_genre_map.items(),
                key=lambda x: sum(x[1].values()),
                reverse=True
            )
        ]
    }
    
    print("\nFinal statistics:")
    print(f"Number of emotions mapped: {len(result['children'])}")
    print("\nTop emotions by total genre association:")
    for emotion in result["children"][:10]:
        total = sum(child["value"] for child in emotion["children"])
        print(f"{emotion['name']}: {total:.2f}")
    
    return result

def main():
    try:
        # Get valid emotions from emotion-tags.json
        valid_emotions = extract_valid_emotions()
        
        # Create emotion-genre mapping using social-tags.json
        emotion_genre_map = create_emotion_genre_map(valid_emotions)
        
        # Create final structure
        result = create_final_structure(emotion_genre_map)
        
        # Save to file
        output_file = '../data/emotion_genre_map.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
            
        print(f"\nResults saved to {output_file}")
        
    except Exception as e:
        print(f"Error during processing: {str(e)}")
        raise e

if __name__ == "__main__":
    main()
