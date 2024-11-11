import logging
import json
from pathlib import Path
from data_processor import EmotionGenreProcessor

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

def main():
    try:
        setup_logging()
        
        # Configure paths
        data_dir = Path('../../data')
        emotion_tags_path = data_dir / 'emotion-tags.json'
        social_tags_path = data_dir / 'social-tags.json'
        output_path = data_dir / 'emotion_genre_map.json'

        # Process data
        processor = EmotionGenreProcessor(
            emotion_tags_path=str(emotion_tags_path),
            social_tags_path=str(social_tags_path)
        )
        result = processor.process()

        # Save results
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)

        logging.info(f"\nResults saved to {output_path}")

    except Exception as e:
        logging.error(f"Error during processing: {str(e)}")
        raise e

if __name__ == "__main__":
    main()