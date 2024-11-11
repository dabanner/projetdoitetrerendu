from collections import defaultdict
import json
from typing import Dict, Set
import logging
from constants import GENRES, EMOTION_COLORS

class EmotionGenreProcessor:
    def __init__(self, emotion_tags_path: str, social_tags_path: str):
        self.emotion_tags_path = emotion_tags_path
        self.social_tags_path = social_tags_path
        self.valid_emotions = set()
        self.emotion_counts = defaultdict(int)
        self.emotion_genre_map = defaultdict(lambda: defaultdict(int))

    def process(self) -> Dict:
        """Main processing function"""
        self._extract_valid_emotions()
        self._create_emotion_genre_map()
        return self._create_final_structure()

    def _extract_valid_emotions(self) -> None:
        """Extract valid emotions from emotion tags file"""
        logging.info("Extracting valid emotions...")
        
        with open(self.emotion_tags_path, 'r', encoding='utf-8') as f:
            emotion_data = json.load(f)

        for entry in emotion_data:
            for emotion in entry.get('emotions', []):
                if emotion.get('nbr_tags', 0) > 0:
                    emotion_tag = emotion['emotion_tag'].lower()
                    self.valid_emotions.add(emotion_tag)
                    self.emotion_counts[emotion_tag] += emotion['nbr_tags']

        logging.info(f"Found {len(self.valid_emotions)} unique emotions")
        self._log_top_emotions()

    def _log_top_emotions(self, top_n: int = 10) -> None:
        """Log the top N emotions by count"""
        logging.info(f"\nTop {top_n} emotions by count:")
        for emotion, count in sorted(
            self.emotion_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:top_n]:
            logging.info(f"{emotion}: {count}")

    def _create_emotion_genre_map(self) -> None:
        """Create mapping between emotions and genres"""
        logging.info("\nProcessing social tags...")
        
        processed = skipped = 0
        
        with open(self.social_tags_path, 'r', encoding='utf-8') as f:
            social_data = json.load(f)

        for entry in social_data:
            song_genres = defaultdict(int)
            song_emotions = defaultdict(int)
            
            for tag in entry.get('socials', []):
                tag_name = tag['social_tag'].lower()
                tag_count = tag['nbr_tags']
                
                if tag_count == 0:
                    continue
                    
                if tag_name in self.valid_emotions:
                    song_emotions[tag_name] += tag_count
                    
                for genre in GENRES:
                    if genre in tag_name:
                        song_genres[genre] += tag_count
                        break
            
            if song_emotions and song_genres:
                for emotion, emotion_count in song_emotions.items():
                    for genre, genre_count in song_genres.items():
                        relationship_strength = (emotion_count + genre_count) / 2
                        self.emotion_genre_map[emotion][genre] += relationship_strength
                processed += 1
            else:
                skipped += 1

        logging.info(f"Processed {processed} songs")
        logging.info(f"Skipped {skipped} songs")

    def _create_final_structure(self) -> Dict:
        """Create final JSON structure with colors"""
        result = {
            "name": "Music Emotions and Genres",
            "children": [
                {
                    "name": emotion,
                    "color": EMOTION_COLORS.get(emotion, EMOTION_COLORS['default']),
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
                        )[:20]
                    ]
                }
                for emotion, genres in sorted(
                    self.emotion_genre_map.items(),
                    key=lambda x: sum(x[1].values()),
                    reverse=True
                )
            ]
        }

        self._log_final_statistics(result)
        return result

    def _log_final_statistics(self, result: Dict) -> None:
        """Log final statistics about the processed data"""
        logging.info("\nFinal statistics:")
        logging.info(f"Number of emotions mapped: {len(result['children'])}")
        logging.info("\nTop emotions by total genre association:")
        
        for emotion in result["children"][:10]:
            total = sum(child["value"] for child in emotion["children"])
            color = emotion['color']
            logging.info(f"{emotion['name']}: {total:.2f} (Color: {color})")