#!/bin/sh

# Define the function
run_python_script() {
    local script_path=$1
    local original_dir=$(pwd)

    # Change directory to the script path
    cd "$script_path" || { echo "Failed to change directory to $script_path"; return 1; }

    # Run the python script
    python filter.py

    # Change back to the original directory
    cd "$original_dir" || { echo "Failed to change back to the original directory"; return 1; }
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
