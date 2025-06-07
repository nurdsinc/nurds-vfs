#!/bin/bash

# Set the base directory
base_dir="/var/www/html"

# Ask the user for input
read -p "Would you like to clear all cache folders or a specific one? (Type 'all' for all or provide the folder name): " choice

# Convert choice to lowercase for case-insensitive matching
choice=$(echo "$choice" | tr '[:upper:]' '[:lower:]')

# If the user chooses 'all'
if [[ "$choice" == "all" || "$choice" == "a" ]]; then
    for folder in "$base_dir"/*; do
        if [ -d "$folder/data/cache" ]; then
            echo "Clearing cache in $folder/data/cache"
            rm -rf "$folder/data/cache/"*
        else
            echo "No cache directory found in $folder"
        fi
    done
    echo "Cache clearing complete."

# If the user provides a specific folder name
else
    specific_folder="$base_dir/$choice"
    
    # Check if the specific folder exists and has a /data/cache directory
    if [ -d "$specific_folder/data/cache" ]; then
        echo "Clearing cache in $specific_folder/data/cache"
        rm -rf "$specific_folder/data/cache/"*
        echo "Cache cleared in $specific_folder."
    else
        echo "Cache folder not found in $specific_folder. Exiting."
        exit 1
    fi
fi