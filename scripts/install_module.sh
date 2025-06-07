#!/bin/bash

# Variables
ROOT_DIR=$(pwd)

# Functions
print_error() {
    echo "Error: $1"
    exit 1
}

update_files() {
    local folder=$1
    local tenant=$2
    local license_id=$3

    # Replace 'nurds' with tenant name
    find "$folder" -type f -exec sed -i "s/nurds/$tenant/g" {} \;

    # If license ID provided, replace it
    if [ ! -z "$license_id" ]; then
        find "$folder" -type f -exec sed -i "s/666d14eca4fd54205a89f2a8f2b55ea2/$license_id/g" {} \;
    fi
}

run_after_install_runner() {
    local scripts_folder=$1/scripts
    local tenant=$2

    export CRON_NURDS_ID=$tenant
    if [ -d "$scripts_folder" ]; then
        for i in {1..7}; do
            php "$scripts_folder/AfterInstallRunner.php" --tenant="$tenant"
        done
    else
        print_error "Scripts folder not found in $scripts_folder"
    fi
}

# Main Script

# Check for required arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <tenant_name> <module_name> [license_id]"
    exit 1
fi

TENANT_NAME=${1,,} # Convert to lowercase
MODULE_NAME=$2
LICENSE_ID=$3

ZIP_FILE="custom/Espo/Modules/$MODULE_NAME.zip"
TENANT_DIR="custom/Espo/$TENANT_NAME"
CUSTOM_DIR="$TENANT_DIR/Custom"
MODULES_DIR="$TENANT_DIR/Modules"
MODULE_FOLDER="$MODULES_DIR/$MODULE_NAME"

# Check if tenant folder exists in data
if [ ! -d "data/$TENANT_NAME" ]; then
    print_error "Tenant '$TENANT_NAME' not found in data folder."
fi

# Create tenant directories if not existing
mkdir -p "$CUSTOM_DIR" || print_error "Failed to create directory: $CUSTOM_DIR"
mkdir -p "$MODULES_DIR" || print_error "Failed to create directory: $MODULES_DIR"

# Check if zip file exists
if [ ! -f "$ZIP_FILE" ]; then
    print_error "Zip file '$ZIP_FILE' not found."
fi

# Check if the module folder exists and delete it
if [ -d "$MODULE_FOLDER" ]; then
    echo "Removing existing module folder: $MODULE_FOLDER"
    rm -rf "$MODULE_FOLDER" || print_error "Failed to remove existing module folder: $MODULE_FOLDER"
fi

# Unzip the module to a temporary directory
TEMP_DIR=$(mktemp -d)
unzip -q "$ZIP_FILE" -d "$TEMP_DIR" || { rm -rf "$TEMP_DIR"; print_error "Failed to unzip $ZIP_FILE."; }

# Move the unzipped folder to the tenant's Modules directory
if [ -d "$TEMP_DIR/$MODULE_NAME" ]; then
    mv "$TEMP_DIR/$MODULE_NAME" "$MODULE_FOLDER" || { rm -rf "$TEMP_DIR"; print_error "Failed to move module to $MODULE_FOLDER."; }
else
    rm -rf "$TEMP_DIR"
    print_error "Module folder '$MODULE_NAME' not found in the ZIP file."
fi
rm -rf "$TEMP_DIR"

# Update tenant name and license ID in files
update_files "$MODULE_FOLDER" "$TENANT_NAME" "$LICENSE_ID"

# Run AfterInstallRunner.php 7 times
run_after_install_runner "$MODULE_FOLDER" "$TENANT_NAME"

# Run php rebuild.php
# php rebuild.php

echo "Module '$MODULE_NAME' installed successfully for tenant '$TENANT_NAME'."