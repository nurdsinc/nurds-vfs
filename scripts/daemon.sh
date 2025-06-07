#!/bin/bash
set -e  # Exit the script if any command fails

# Log the start of the script
echo "Starting custom entrypoint script" >> /var/log/nurdscrm.log


# Log the completion of nurdscrm.sh
echo "Custom script nurdscrm.sh has completed" >> /var/log/nurdscrm.log

# ------------------------- END -------------------------------------