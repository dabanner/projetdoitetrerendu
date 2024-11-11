# Constants used across the emotion-genre mapping system

GENRE_CATEGORIES = {
    "Rock": {
        'rock', 'hard rock', 'classic rock', 'alternative rock', 'punk rock', 
        'progressive rock', 'psychedelic rock', 'indie rock', 'garage rock',
        'art rock', 'folk rock', 'blues rock', 'post rock', 'southern rock'
    },
    "Metal": {
        'metal', 'heavy metal', 'black metal', 'death metal', 'thrash metal',
        'doom metal', 'power metal', 'progressive metal', 'gothic metal',
        'symphonic metal', 'folk metal', 'industrial metal'
    },
    "Electronic": {
        'electronic', 'electronica', 'techno', 'house', 'trance', 'ambient',
        'drum and bass', 'dubstep', 'idm', 'synthpop', 'electro', 'industrial',
        'dance', 'edm'
    },
    "Pop": {
        'pop', 'indie pop', 'synth pop', 'power pop', 'dream pop', 'baroque pop',
        'art pop', 'chamber pop', 'dance pop', 'electropop'
    },
    "Hip-Hop": {
        'hip hop', 'hip-hop', 'rap', 'gangsta rap', 'underground hip hop',
        'conscious hip hop', 'trap', 'grime'
    },
    "Jazz": {
        'jazz', 'fusion', 'bebop', 'swing', 'free jazz', 'acid jazz',
        'contemporary jazz', 'smooth jazz', 'latin jazz'
    },
    "Blues": {
        'blues', 'delta blues', 'chicago blues', 'rhythm and blues', 'rnb',
        'contemporary blues'
    },
    "Folk and Country": {
        'folk', 'contemporary folk', 'traditional folk', 'country', 
        'americana', 'bluegrass', 'singer-songwriter'
    },
    "World": {
        'world', 'latin', 'reggae', 'ska', 'afrobeat', 'bossa nova', 'samba',
        'salsa', 'flamenco', 'celtic'
    },
    "Classical": {
        'classical', 'contemporary classical', 'baroque', 'opera', 'chamber music',
        'symphony', 'orchestral'
    },
    "Other": {
        'experimental', 'avant-garde', 'indie', 'alternative', 'fusion',
        'instrumental', 'acoustic', 'soul', 'funk', 'disco', 'gospel',
        'soundtrack', 'ambient', 'new age'
    }
}

# Flatten genre list
GENRES = {genre for category in GENRE_CATEGORIES.values() for genre in category}

# Emotion color mapping based on psychological associations
EMOTION_COLORS = {
    # Calm/Peaceful Group - Blues and soft teals
    'mellow': '#89CFF0',      # Soft blue
    'calm': '#7CB9E8',        # Light blue
    'relaxing': '#73C2FB',    # Maya blue
    'relax': '#73C2FB',       # Maya blue
    'peaceful': '#B6D0E2',    # Pale blue
    'tranquil': '#A5D7E8',    # Light cyan
    'serene': '#89CFF0',      # Baby blue
    'serenity': '#89CFF0',    # Baby blue
    'gentle': '#B6D0E2',      # Pale blue
    'quiet': '#D6E2E9',       # Light grayish blue
    'soft': '#C3E0E5',        # Pale cyan
    'soothing': '#A5D7E8',    # Light cyan

    # Sad/Melancholic Group - Deep blues and purples
    'sad': '#4B0082',         # Indigo
    'melancholy': '#483D8B',  # Dark slate blue
    'melancholic': '#483D8B', # Dark slate blue
    'blue': '#4169E1',        # Royal blue
    'heartbreak': '#2E4053',  # Dark blue gray
    'gloomy': '#34495E',      # Darker blue gray
    'sorrow': '#4B0082',      # Indigo
    'grief': '#2C3E50',       # Dark blue
    'depressive': '#2C3E50',  # Dark blue
    'bleak': '#34495E',       # Darker blue gray

    # Happy/Joyful Group - Yellows and warm colors
    'happy': '#FFD700',       # Gold
    'fun': '#FFB347',         # Pastel orange
    'joyful': '#FFC30B',      # Marigold
    'cheerful': '#FFD700',    # Gold
    'bright': '#FFE87C',      # Light yellow
    'lively': '#FFB347',      # Pastel orange

    # Energetic/Intense Group - Reds and oranges
    'energetic': '#FF4500',   # Orange red
    'intense': '#FF4500',     # Orange red
    'passionate': '#FF0000',  # Red
    'fierce': '#FF0000',      # Red
    'exciting': '#FF4500',    # Orange red
    'fiery': '#FF0000',       # Red

    # Dark/Angry Group - Dark reds and blacks
    'dark': '#1A1A1A',        # Very dark gray
    'angry': '#8B0000',       # Dark red
    'aggressive': '#8B0000',  # Dark red
    'rage': '#8B0000',        # Dark red

    # Romantic/Sensual Group - Pinks and purples
    'romantic': '#FF69B4',    # Hot pink
    'sexy': '#FF1493',        # Deep pink
    'tender': '#DDA0DD',      # Plum
    'passion': '#FF1493',     # Deep pink
    'desire': '#FF69B4',      # Hot pink

    # Dreamy/Ethereal Group - Soft purples and lavenders
    'dreamy': '#E6E6FA',      # Lavender
    'bittersweet': '#DDA0DD', # Plum
    'poignant': '#D8BFD8',    # Thistle
    'delicate': '#E6E6FA',    # Lavender

    # Fun/Playful Group - Bright warm colors
    'funny': '#FFA07A',       # Light salmon
    'humor': '#FFA07A',       # Light salmon
    'playful': '#FFB347',     # Pastel orange
    'silly': '#FFA07A',       # Light salmon
    'party': '#FF69B4',       # Hot pink

    # Default for unmapped emotions
    'default': '#808080'      # Gray
}