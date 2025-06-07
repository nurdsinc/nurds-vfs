#!/bin/bash
set -e  # Exit the script if any command fails

# Log the start of the script
echo "Starting custom entrypoint script" >> /var/log/nurdscrm.log

# Run the default entrypoint script and wait for it to complete
docker-entrypoint.sh apache2-foreground "$@"

# Log that docker-entrypoint has completed
echo "docker-entrypoint.sh has completed, starting custom script" >> /var/log/nurdscrm.log

# Run your custom script after the default entrypoint script
/scripts/nurdscrm.sh >> /var/log/nurdscrm.log 2>&1

# Log the completion of nurdscrm.sh
echo "Custom script nurdscrm.sh has completed" >> /var/log/nurdscrm.log

# ------------------------- END -------------------------------------