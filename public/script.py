import json
import os
from pathlib import Path

def preview_json_file(file_path, num_records=2):
    """
    Read and preview a JSON file, showing its structure and first few records.
    
    Args:
        file_path (str): Path to the JSON file
        num_records (int): Number of records to preview
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print(f"\n{'='*50}")
        print(f"File: {os.path.basename(file_path)}")
        print(f"{'='*50}")
        
        if isinstance(data, list):
            print(f"Type: List of {len(data)} records")
            print("\nFirst {num_records} records:")
            for i, record in enumerate(data[:num_records]):
                print(f"\nRecord {i+1}:")
                print(json.dumps(record, indent=2))
        elif isinstance(data, dict):
            print("Type: Dictionary")
            print("\nTop-level keys:", list(data.keys()))
            print("\nSample of content:")
            print(json.dumps(dict(list(data.items())[:num_records]), indent=2))
            
    except Exception as e:
        print(f"Error reading {file_path}: {str(e)}")

def main():
    # List of JSON files to analyze
    json_files = [
        'album.json',
        'artist-members.json',
        'artist-without-members.json',
        'emotion-tags.json',
        'social-tags.json',
        'song.json',
        'song-topic.json',
        'topic-models.json'
    ]
    
    # Assuming files are in a 'data' subdirectory
    data_dir = Path('./data')
    
    for file_name in json_files:
        file_path = data_dir / file_name
        preview_json_file(file_path)

if __name__ == "__main__":
    main()