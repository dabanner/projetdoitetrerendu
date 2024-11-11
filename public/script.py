import json

def peek_large_json(file_path, num_samples=5):
    print(f"Peeking into {file_path}...")
    
    samples = []
    current_object = ""
    object_count = 0
    samples_collected = 0
    
    with open(file_path, 'r', encoding='utf-8') as f:
        # Skip the initial [
        f.read(1)
        
        for line in f:
            current_object += line
            
            if "}" in line:  # Potential end of an object
                try:
                    # Try to parse the accumulated object
                    json_obj = json.loads(current_object.rstrip(","))
                    if samples_collected < num_samples:
                        samples.append(json_obj)
                        samples_collected += 1
                    
                    object_count += 1
                    if samples_collected >= num_samples:
                        break
                        
                    current_object = ""
                except json.JSONDecodeError:
                    continue
    
    print(f"\nTotal objects processed before sampling: {object_count}")
    print(f"Sample of {len(samples)} objects:\n")
    
    for i, sample in enumerate(samples, 1):
        print(f"Sample {i}:")
        print(json.dumps(sample, indent=2))
        print("-" * 80)

if __name__ == "__main__":
    peek_large_json('./data/song.json')