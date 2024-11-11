#!/bin/sh

# Define the function
run_python_script() {
    local script_path=$1
    local original_dir=$(pwd)

    # Start the timer
    start=$(date +%s)

    # Change directory to the script path
    cd "$script_path" || { echo "Failed to change directory to $script_path"; return 1; }

    # Run the python script
    python filter.py

    # Change back to the original directory
    cd "$original_dir" || { echo "Failed to change back to the original directory"; return 1; }

    # End the timer
    end=$(date +%s)

    # Calculate the time difference
    runtime=$((end-start))

    # Echo the runtime
    echo "The function took $runtime seconds to run."
}

# Call the function with a path as an argument
echo "Preparing map data"
run_python_script "./public/map"

echo "Preparing scatter data"
run_python_script "./public/scatter"

echo "Preparing sunburst data"
run_python_script "./public/sunburst"

echo "Preparing tidy tree data"
run_python_script "./public/tidy_tree"

echo "Preparing tidy tree data"
run_python_script "./public/treemap"
