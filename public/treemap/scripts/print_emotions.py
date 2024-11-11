import json
from collections import defaultdict

# First, let's see what emotions we actually have in the data
def print_actual_emotions():
    """Print all actual emotions from the emotion-tags.json file"""
    with open('../data/emotion-tags.json', 'r', encoding='utf-8') as f:
        emotion_data = json.load(f)
        
    emotions = set()
    emotion_counts = defaultdict(int)
    
    for entry in emotion_data:
        for emotion in entry.get('emotions', []):
            if emotion.get('nbr_tags', 0) > 0:
                emotions.add(emotion['emotion_tag'].lower())
                emotion_counts[emotion['emotion_tag'].lower()] += emotion['nbr_tags']
    
    print("\nAll emotions in the dataset:")
    for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"{emotion}: {count}")
    
    return emotions

if __name__ == "__main__":
    print_actual_emotions()