#!/bin/bash

# Delay for 10 seconds
sleep 10

# Define log file
LOG_FILE="/var/log/nurdscrm_script.log"

# Redirect stdout (1) and stderr (2) to both the log file and the screen using tee
exec > >(tee -a $LOG_FILE) 2>&1

# Log start time
echo "Script started at $(date)"

# Update package lists
echo "Updating package lists..."
apt-get update

# Install nano, netstat (via net-tools), curl, htop, telnet, dnsutils, and acl (for setfacl)
echo "Installing debugging tools and ACL support..."
apt-get install -y nano net-tools curl htop telnet dnsutils acl


# Add color support for `ls` and other commands to .bashrc
echo "Adding color support for ls and other commands..."
echo "alias ls='ls --color=auto'" >> ~/.bashrc
echo "alias grep='grep --color=auto'" >> ~/.bashrc
echo "alias egrep='egrep --color=auto'" >> ~/.bashrc
echo "alias fgrep='fgrep --color=auto'" >> ~/.bashrc

# Optionally, apply the changes immediately for the current session
source ~/.bashrc

# Custom modifications (optional)
# touch /var/www/html/debug.txt
# echo "Debugging tools installed successfully!" >> /var/www/html/debug.txt

echo "Debugging tools installed successfully!"
# Now overwrite the images
#cp -r /var/www/html/nurd_assets/client/img/* /var/www/html/client/img/
#cp -r /var/www/html/nurd_assets/public/install/img/* /var/www/html/public/install/img/

#Move images
#echo "Moving Images!"

# Set ownership of /var/www/html to www-data:www-data
#echo "Setting ownership of /var/www/html to www-data:www-data..."
#chown -R www-data:www-data /var/www/html

# Set the Setgid bit to ensure new files inherit group ownership
echo "Setting the Setgid bit on /var/www/html..."
chmod g+s /var/www/html

# Set permissions for directories and files
#echo "Setting permissions for directories and files..."
#find /var/www/html -type d -exec chmod 755 {} + && find /var/www/html -type f -exec chmod 644 {} +;
#find /var/www/html/data /var/www/html/custom /var/www/html/client/custom -type d -exec chmod 775 {} + && find /var/www/html/data /var/www/html/custom /var/www/html/client/custom -type f -exec chmod 664 {} +;
#chmod 775 /var/www/html/application/Espo/Modules /var/www/html/client/modules;
#chmod 754 /var/www/html/bin/command;

# Set ACLs that reflect the chmod permissions
#echo "Setting ACLs to match the set permissions..."
# For general directories and files (755 for directories, 644 for files)
#setfacl -R -m d:u::rwx,d:g::rx,d:o::rx /var/www/html  # Default ACL for directories (755)
#setfacl -R -m d:u::rw,d:g::r,d:o::r /var/www/html  # Default ACL for files (644)

# For specific directories like /data, /custom, and /client/custom (775 for directories, 664 for files)
#setfacl -R -m d:u::rwx,d:g::rwx,d:o::rx /var/www/html/data /var/www/html/custom /var/www/html/client/custom  # Default ACL for directories (775)
#setfacl -R -m d:u::rw,d:g::rw,d:o::r /var/www/html/data /var/www/html/custom /var/www/html/client/custom  # Default ACL for files (664)

echo "Ownership, permissions, and ACLs have been configured."

echo "Applying NurdsCRM Changes..."

# Replace EspoCRM with NurdsCRM in all .json|.tpl|.php|.js|.html files
#this shows what is actually changed
#grep -Rl "EspoCRM" /var/www/html --include=\*.json | xargs -I{} sed -n 's/EspoCRM/NurdsCRM/gp' {}

#this applies the change
grep -Rl "EspoCRM" /var/www/html --include=\*.json | xargs -I{} sed -i 's/EspoCRM/NurdsCRM/g' {}
echo "EspoCRM => NurdsCRM in all .json files"

#apply except if the file has a copyright 
#grep -Rl "EspoCRM" /var/www/html --include=\*.tpl | xargs grep -L "&copy;" | xargs -I{} sed -n 's/EspoCRM/NurdsCRM/gp' {}
grep -Rl "EspoCRM" /var/www/html --include=\*.tpl | xargs grep -L "&copy;" | xargs -I{} sed -i 's/EspoCRM/NurdsCRM/g' {}
echo "EspoCRM => NurdsCRM in all .tpl files"

#apply in client folder
#grep -Rl "EspoCRM" /var/www/html/client --include=\*.tpl | xargs -I{} sed -n 's/EspoCRM/NurdsCRM/gp' {}
grep -Rl "EspoCRM" /var/www/html/client --include=\*.tpl | xargs -I{} sed -i 's/EspoCRM/NurdsCRM/g' {}
echo "EspoCRM => NurdsCRM in /client .tpl files"

#apply to php files but ignore any lines with a * in it
#grep -Rl --include=\*.php "EspoCRM" /var/www/html | xargs -I{} sed -n '/\*/!s/EspoCRM/NurdsCRM/gp' {}
grep -Rl --include=\*.php "EspoCRM" /var/www/html | xargs -I{} sed -i '/\*/!s/EspoCRM/NurdsCRM/g' {}
echo "EspoCRM => NurdsCRM in all .php files"

#apply to js files but ignore any lines with a * in it
#grep -Rl --include=\*.js "EspoCRM" /var/www/html | xargs -I{} sed -n '/\*/!s/EspoCRM/NurdsCRM/gp' {}
grep -Rl --include=\*.js "EspoCRM" /var/www/html | xargs -I{} sed -i '/\*/!s/EspoCRM/NurdsCRM/g' {}
echo "EspoCRM => NurdsCRM in all .js files"

#apply to html files but ignore any lines with a * in it
#grep -Rl --include=\*.html "EspoCRM" /var/www/html | xargs -I{} sed -n '/\*/!s/EspoCRM/NurdsCRM/gp' {}
grep -Rl --include=\*.html "EspoCRM" /var/www/html | xargs -I{} sed -i '/\*/!s/EspoCRM/NurdsCRM/g' {}
echo "EspoCRM => NurdsCRM in all .html files"

#Replace 'Espo ' with 'Nurds ' only in /var/www/html/application/Espo/Resources
#grep -Rl "Espo " /var/www/html/application/Espo/Resources --include=\*.* | xargs -I{} sed -n 's/Espo /Nurds /gp' {}
grep -Rl "Espo " /var/www/html/application/Espo/Resources --include=\*.* | xargs -I{} sed -i 's/Espo /Nurds /g' {}
echo "'Espo ' => 'Nurds ' in application/Espo/Resources"

#Replace 'Espo ' with 'Nurds ' in .json
#grep -Rl "Espo " /var/www/html --include=\*.json | xargs -I{} sed -n 's/Espo /Nurds /gp' {}
grep -Rl "Espo " /var/www/html --include=\*.json | xargs -I{} sed -i 's/Espo /Nurds /g' {}
echo "'Espo ' => 'Nurds ' in .json files"

#Replace 'My Espo' with 'My Nurds' 
#grep -Rl "My Espo" /var/www/html --include=\*.* | xargs -I{} sed -n 's/My Espo/My Nurds/gp' {}
grep -Rl "My Espo" /var/www/html --include=\*.* | xargs -I{} sed -i 's/My Espo/My Nurds/g' {}
echo "'My Espo' => 'My Nurds'"

#Replace 'espo.log' with 'nurds.log' 
#grep -Rl "espo.log" /var/www/html --include=\*.* | xargs -I{} sed -n 's/espo.log/nurds.log/gp' {}
grep -Rl "espo.log" /var/www/html --include=\*.* | xargs -I{} sed -i 's/espo.log/nurds.log/g' {}
echo "'espo.log' => 'nurds.log'"

# Update the logger path in config.php
CONFIG_FILE="/var/www/html/application/Espo/Resources/defaults/config.php"

# Update timeZone, dateFormat, and timeFormat
sed -i "s|'timeZone' => 'UTC'|'timeZone' => 'America/Phoenix'|g" "$CONFIG_FILE"
sed -i "s|'dateFormat' => 'DD.MM.YYYY'|'dateFormat' => 'MM/DD/YYYY'|g" "$CONFIG_FILE"
sed -i "s|'timeFormat' => 'HH:mm'|'timeFormat' => 'hh:mm A'|g" "$CONFIG_FILE"
echo "timeZone set to America/Phoenix, dateFormat set to MM/DD/YYYY, timeFormat set to hh:mm A' in config.php"

# Use sed to insert the new line above the existing require_once statement
#grep -qxF 'require_once "nurds.php";' /var/www/html/bootstrap.php || sed -i '/require_once /i require_once "nurds.php";' /var/www/html/bootstrap.php
#echo "Inserted 'require_once \"nurds.php\";' above the existing require_once statement in bootstrap.php"

#Replace 'custom/Espo/Custom' with "custom/Espo/'.TENANT.'/Custom" 
# Perform the replacement for lines containing single quotes
#grep -Rl "custom/Espo/Custom" /var/www/html --include=\*.* --exclude-dir="vendor" | xargs -I{} sed -n "/'/ s|custom/Espo/Custom|custom/Espo/'.TENANT.'/Custom|gp" {}
grep -Rl "custom/Espo/Custom" /var/www/html --include=\*.* --exclude-dir="vendor" | xargs -I{} sed -i "/'/ s|custom/Espo/Custom|custom/Espo/'.TENANT.'/Custom|g" {}
# Perform the replacement for lines containing double quotes
#grep -Rl "custom/Espo/Custom" /var/www/html --include=\*.* --exclude-dir="vendor" | xargs -I{} sed -n '/"/ s|custom/Espo/Custom|custom/Espo/".TENANT."/Custom|gp' {}
grep -Rl "custom/Espo/Custom" /var/www/html --include=\*.* --exclude-dir="vendor" | xargs -I{} sed -i '/"/ s|custom/Espo/Custom|custom/Espo/".TENANT."/Custom|g' {}

echo "'custom/Espo/Custom' => 'custom/Espo/TENANT/Custom'"

#updating Espo\\Custom to Espo\\TENANT\\CUSTOM
#grep -Rl "namespace Espo\\\\Custom\\\\" /var/www/html --include=\*.php --exclude-dir="vendor" | xargs -I{} sed -n "s|namespace Espo\\\\Custom\\\\|namespace Espo\\\\\\\\\".TENANT.\"\\\\\\\\Custom\\\\\\\\|gp" {}
grep -Rl "namespace Espo\\\\Custom\\\\" /var/www/html --include=\*.php --exclude-dir="vendor" | xargs -I{} sed -i "s|namespace Espo\\\\Custom\\\\|namespace Espo\\\\\\\\\".TENANT.\"\\\\\\\\Custom\\\\\\\\|g" {}

#grep -Rl "Espo\\\\Custom\\\\Core\\\\Loaders" /var/www/html --include=\*.php --exclude-dir="vendor" | xargs -I{} sed -n "s|Espo\\\\Custom\\\\Core\\\\Loaders|Espo\\\\\\\\\'.TENANT.\'\\\\\\\\Custom\\\\\\\\Core\\\\\\\\Loaders|gp" {}
grep -Rl "Espo\\\\Custom\\\\Core\\\\Loaders" /var/www/html --include=\*.php --exclude-dir="vendor" | xargs -I{} sed -i "s|Espo\\\\Custom\\\\Core\\\\Loaders|Espo\\\\\\\\\'.TENANT.\'\\\\\\\\Custom\\\\\\\\Core\\\\\\\\Loaders|g" {}

#grep -Rl "Espo\\\\Custom\\\\Core\\\\Portal\\\\Loaders" /var/www/html --include=\*.php --exclude-dir="vendor" | xargs -I{} sed -n "s|Espo\\\\Custom\\\\Core\\\\Portal\\\\Loaders|Espo\\\\\\\\\'.TENANT.\'\\\\\\\\Custom\\\\\\\\Core\\\\\\\\Portal\\\\\\\\Loaders|gp" {}
grep -Rl "Espo\\\\Custom\\\\Core\\\\Portal\\\\Loaders" /var/www/html --include=\*.php --exclude-dir="vendor" | xargs -I{} sed -i "s|Espo\\\\Custom\\\\Core\\\\Portal\\\\Loaders|Espo\\\\\\\\\'.TENANT.\'\\\\\\\\Custom\\\\\\\\Core\\\\\\\\Portal\\\\\\\\Loaders|g" {}

#grep -Rl --include=\*.php "= 'Espo\\\\\\\\Custom" /var/www/html --exclude-dir="vendor" | xargs -I{} sed -n "s|= 'Espo\\\\\\\\Custom|= 'Espo\\\\\\\\\'.TENANT.\'\\\\\\\\Custom|gp" {}
grep -Rl --include=\*.php "= 'Espo\\\\\\\\Custom" /var/www/html --exclude-dir="vendor" | xargs -I{} sed -i "s|= 'Espo\\\\\\\\Custom|= 'Espo\\\\\\\\\'.TENANT.\'\\\\\\\\Custom|g" {}

echo "Updated Espo\\Custom to Espo\\TENANT\\Custom"

#update files in the vendor folder
#grep -Rl "Modules" /var/www/html/vendor/composer/autoload_psr4.php | xargs -I{} sed -n "/Modules/i\    'Espo\\\\\\\\'.TENANT.'\\\\\\\\Modules\\\\\\\\' => array(\$baseDir . '\/custom\/Espo\/'.TENANT.'\/Modules'),\n    'Espo\\\\\\\\'.TENANT.'\\\\\\\\Custom\\\\\\\\' => array(\$baseDir . '\/custom\/Espo\/'.TENANT.'\/Custom')," {}
grep -Rl "Modules" /var/www/html/vendor/composer/autoload_psr4.php | xargs -I{} sed -i "/Modules/i\    'Espo\\\\\\\\'.TENANT.'\\\\\\\\Modules\\\\\\\\' => array(\$baseDir . '\/custom\/Espo\/'.TENANT.'\/Modules'),\n    'Espo\\\\\\\\'.TENANT.'\\\\\\\\Custom\\\\\\\\' => array(\$baseDir . '\/custom\/Espo\/'.TENANT.'\/Custom')," {}
echo "added Espo\\TENANT\\Modules\\ and Espo\\TENANT\\Custom\\"

#grep -m 1 -Rl "Espo\\\\\\\\Modules" /var/www/html/vendor/composer/autoload_static.php | xargs -I{} sed -n "0,/'Espo\\\\\\\\Modules\\\\\\\\'/s//'Espo\\\\\\\\'.TENANT.'\\\\\\\\Modules\\\\\\\\' => 15,\n            'Espo\\\\\\\\'.TENANT.'\\\\\\\\Custom\\\\\\\\' => 14,\n            &/p" {}
grep -m 1 -Rl "Espo\\\\\\\\Modules" /var/www/html/vendor/composer/autoload_static.php | xargs -I{} sed -i "0,/'Espo\\\\\\\\Modules\\\\\\\\'/s//'Espo\\\\\\\\'.TENANT.'\\\\\\\\Modules\\\\\\\\' => 15,\n            'Espo\\\\\\\\'.TENANT.'\\\\\\\\Custom\\\\\\\\' => 14,\n            &/" {}
echo "added Espo\\TENANT\\Custom and Espo\\TENANT\\Modules"

#grep -n "Espo\\\\\\\\Modules" /var/www/html/vendor/composer/autoload_static.php | sed -n '2p' | cut -d: -f1 | xargs -I{} sed -n "{}i \ \ \ \ \ \ \ \ 'Espo\\\\\\\\'.TENANT.'\\\\\\\\Modules\\\\\\\\' => array (\\n\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ 0 => __DIR__ . '/../..' . '/custom/Espo/'.TENANT.'/Modules',\\n\ \ \ \ \ \ \ \ ),\\n\ \ \ \ \ \ \ \ 'Espo\\\\\\\\'.TENANT.'\\\\\\\\Custom\\\\\\\\' => array (\\n\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ 0 => __DIR__ . '/../..' . '/custom/Espo/'.TENANT.'/Custom',\\n\ \ \ \ \ \ \ \ )," /var/www/html/vendor/composer/autoload_static.php
grep -n "Espo\\\\\\\\Modules" /var/www/html/vendor/composer/autoload_static.php | sed -n '2p' | cut -d: -f1 | xargs -I{} sed -i "{}i \ \ \ \ \ \ \ \ 'Espo\\\\\\\\'.TENANT.'\\\\\\\\Modules\\\\\\\\' => array (\\n\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ 0 => __DIR__ . '/../..' . '/custom/Espo/'.TENANT.'/Modules',\\n\ \ \ \ \ \ \ \ ),\\n\ \ \ \ \ \ \ \ 'Espo\\\\\\\\'.TENANT.'\\\\\\\\Custom\\\\\\\\' => array (\\n\ \ \ \ \ \ \ \ \ \ \ \ \ \ \ \ 0 => __DIR__ . '/../..' . '/custom/Espo/'.TENANT.'/Custom',\\n\ \ \ \ \ \ \ \ )," /var/www/html/vendor/composer/autoload_static.php
echo "added Espo\\Modules and Espo\\Custom Arrays"


#Replace 'data/' with "data/'.TENANT.'/" 
# Perform the replacement for lines containing single quotes
#grep -Rl "'data/" /var/www/html --include=\*.php --exclude="nurds.php" | xargs -I{} sed -n "/data\/'/!s|'data/|'data/'.TENANT.'/|gp" {}
grep -Rl "'data/" /var/www/html --include=\*.php --exclude="nurds.php" | xargs -I{} sed -i "/data\/'/!s|'data/|'data/'.TENANT.'/|g" {}
# Perform the replacement for lines containing double quotes
#grep -Rl '"data/' /var/www/html --include=\*.php --exclude="nurds.php" | xargs -I{} sed -n '/data\/"/!s|"data/|"data/".TENANT."/|gp' {}
grep -Rl '"data/' /var/www/html --include=\*.php --exclude="nurds.php" | xargs -I{} sed -i '/data\/"/!s|"data/|"data/".TENANT."/|g' {}


echo "'custom/Espo/Custom' => 'custom/Espo/TENANT/Custom'"

#in permissions.php update data to data/TENANT
#grep -Rl "'data'" /var/www/html/application/Espo/Core/Utils/File/Permission.php --include=\*.php --exclude="nurds.php" | xargs -I{} sed -n "s|'data'|'data/'.TENANT|gp" {}
grep -Rl "'data'" /var/www/html/application/Espo/Core/Utils/File/Permission.php --include=\*.php --exclude="nurds.php" | xargs -I{} sed -i "s|'data'|'data/'.TENANT|g" {}
echo "updated 'data' to 'data/'.TENANT"

#update isInstalled check
#grep -Rl '// check if app was installed' /var/www/html/install/entry.php --include=\*.php | xargs -I{} sed -n '/\/\/ check if app was installed/i ########################################\n# NurdsCRM - Check TENANT is installed #\n########################################\n//Unset session and block install if isInstalled is true\nif($installer->isInstalled()){\n    unset($_SESSION['install']['installProcess']);\n}\n########################################' {}
grep -Rl '// check if app was installed' /var/www/html/install/entry.php --include=\*.php | xargs -I{} sed -i '/\/\/ check if app was installed/i ########################################\n# NurdsCRM - Check TENANT is installed #\n########################################\n//Unset session and block install if isInstalled is true\nif($installer->isInstalled()){\n    unset($_SESSION['install']['installProcess']);\n}\n########################################' {}
echo "updated isInstaled check"

#replace line in install/core/InstallerConfig.php
#grep -Rl "protected \$configPath = 'install/config.php'; //full path: install/config.php" /var/www/html/install/core/InstallerConfig.php --include=\*.php | xargs -I{} sed -n "s|protected \$configPath = 'install/config.php'; //full path: install/config.php|protected \$configPath = 'data/'.TENANT.'/config-internal.php'; //full path: data/TENANT/config-internal.php|gp" {}
grep -Rl "protected \$configPath = 'install/config.php'; //full path: install/config.php" /var/www/html/install/core/InstallerConfig.php --include=\*.php | xargs -I{} sed -i "s|protected \$configPath = 'install/config.php'; //full path: install/config.php|protected \$configPath = 'data/'.TENANT.'/config-internal.php'; //full path: data/TENANT/config-internal.php|g" {}
echo "replaced configpath"

#adding $overrideConfigPath
#grep -Rl "private string \$overrideConfigPath" /var/www/html --include=\*.php | xargs -I{} sed -n "/private string \$overrideConfigPath/a\   private string \$overrideGlobalConfigPath = 'data/config-override.php';" {}
grep -Rl "private string \$overrideConfigPath" /var/www/html --include=\*.php | xargs -I{} sed -i "/private string \$overrideConfigPath/a\   private string \$overrideGlobalConfigPath = 'data/config-override.php';" {}
echo "added overrideConfigPath: 1"

#grep -Rl "\$overrideData =" /var/www/html --include=\*.php | xargs -I{} sed -n "/\$overrideData =/a\\        \$overrideGlobalData = \$this->readFile(\$this->overrideGlobalConfigPath);" {}
grep -Rl "\$overrideData =" /var/www/html --include=\*.php | xargs -I{} sed -i "/\$overrideData =/a\\        \$overrideGlobalData = \$this->readFile(\$this->overrideGlobalConfigPath);" {}
echo "added overrideConfigPath: 2"

#grep -m 1 -Rl "\$overrideData," /var/www/html --include=\*.php | xargs -I{} sed -n "0,/\$overrideData,/s/\(\$overrideData,.*\)/\1\n            \$overrideGlobalData,/p" {}
grep -m 1 -Rl "\$overrideData," /var/www/html --include=\*.php | xargs -I{} sed -i "0,/\$overrideData,/s/\(\$overrideData,.*\)/\1\n            \$overrideGlobalData,/" {}
echo "added overrideData: 3"

#grep -Rl "array \$overrideData," /var/www/html --include=\*.php | xargs -I{} sed -n "/array \$overrideData,/a\\        array \$overrideGlobalData," {}
grep -Rl "array \$overrideData," /var/www/html --include=\*.php | xargs -I{} sed -i "/array \$overrideData,/a\\        array \$overrideGlobalData," {}
echo "added overrideData: 4"

#grep -Rl "mixed> \$overrideData" /var/www/html --include=\*.php | xargs -I{} sed -n "/mixed> \$overrideData/a\\     * @param array<string, mixed> \$overrideGlobalData" {}
grep -Rl "mixed> \$overrideData" /var/www/html --include=\*.php | xargs -I{} sed -i "/mixed> \$overrideData/a\\     * @param array<string, mixed> \$overrideGlobalData" {}
echo "added overrideData: 5"

#grep -Rl "\$overrideData);" /var/www/html --include=\*.php | xargs -I{} sed -n "/\$overrideData);/i\\        /** @var array<string, mixed> \$mergedData */\n        \$mergedData = Util::merge(\$mergedData, \$overrideGlobalData);\n/p" {}
grep -Rl "\$overrideData);" /var/www/html --include=\*.php | xargs -I{} sed -i "/\$overrideData);/i\\        /** @var array<string, mixed> \$mergedData */\n        \$mergedData = Util::merge(\$mergedData, \$overrideGlobalData);\n" {}
echo "added overrideData: 6"

#enable superadmin login
#grep -Rl "if (\$user->isSuperAdmin()) {" /var/www/html/application/Espo/Core/Authentication --include=\*.php | xargs -I{} sed -n 's/if (\$user->isSuperAdmin()) {/if (\$user->isSuperAdmin() \&\& \!\$this->configDataProvider->allowAdminUser()) {/p' {}
grep -Rl "if (\$user->isSuperAdmin()) {" /var/www/html/application/Espo/Core/Authentication --include=\*.php | xargs -I{} sed -i 's/if (\$user->isSuperAdmin()) {/if (\$user->isSuperAdmin() \&\& \!\$this->configDataProvider->allowAdminUser()) {/' {}

echo "enabled superadmin login"

#Updated TYPE_ADMIN to TYPE_SUPER_ADMIN
#grep -Rl "User::TYPE_ADMIN" /var/www/html/install/core/ --include="Installer.php" | xargs -I{} sed -n "s/User::TYPE_ADMIN/User::TYPE_SUPER_ADMIN/p" {}
grep -Rl "User::TYPE_ADMIN" /var/www/html/install/core/ --include="Installer.php" | xargs -I{} sed -i "s/User::TYPE_ADMIN/User::TYPE_SUPER_ADMIN/g" {}
echo "updated TYPE_ADMIN to TYPE_SUPER_ADMIN"

#added Plan Type to default
#grep -L "'planType'" /var/www/html/application/Espo/Resources/defaults/config.php | xargs -I{} grep -Rl "'useCache'" {} --include="config.php" | xargs -I{} sed -n "/'useCache'/ i \ \ \ \ 'planType' => 'Free'," {} | tee /dev/tty
grep -L "'planType'" /var/www/html/application/Espo/Resources/defaults/config.php | xargs -I{} grep -Rl "'useCache'" {} --include="config.php" | xargs -I{} sed -i "/'useCache'/ i \ \ \ \ 'planType' => 'Free'," {} 
echo "added Plan Type to default config.php"


#added planType to settings.json
#grep -Rl '"name": "pdfEngine"' /var/www/html/application/Espo/Resources/layouts/Settings/settings.json --include="settings.json" | xargs -I{} sed -n '/"name": "pdfEngine"/ {
#  N
#  /"name": "planType"/! s/"name": "pdfEngine"/"name": "pdfEngine"}, {"name": "planType"/
#}' {}
grep -Rl '"name": "pdfEngine"' /var/www/html/application/Espo/Resources/layouts/Settings/settings.json --include="settings.json" | xargs -I{} sed -i '/"name": "pdfEngine"/ {
  N
  /"name": "planType"/! s/"name": "pdfEngine"/"name": "pdfEngine"}, {"name": "planType"/
}' {}
echo "added planType name in settings.json"

#updated title in ClientManager.php
#grep -Rl 'private const APP_DESCRIPTION = ' /var/www/html/application/Espo/Core/Utils/ --include="ClientManager.php" | xargs -I{} sed -n '/private const APP_DESCRIPTION = .*NurdsCRM/ s/.*private const APP_DESCRIPTION.*/    private const APP_DESCRIPTION = "Nurds | The Confidence to Scale. One Process, One System at a time.";/p' {} | tee /dev/tty
grep -Rl 'private const APP_DESCRIPTION = ' /var/www/html/application/Espo/Core/Utils/ --include="ClientManager.php" | xargs -I{} sed -i '/private const APP_DESCRIPTION = .*NurdsCRM/ s/.*private const APP_DESCRIPTION.*/    private const APP_DESCRIPTION = "Nurds | The Confidence to Scale. One Process, One System at a time.";/g' {}
echo "updated APP_DESCRIPTION"

#update the cron language
#grep -Rl "'cronSetup' =>" /var/www/html/application/Espo/Core/Utils/ --include="ScheduledJob.php" | xargs -I{} sed -n "/^[[:space:]]*'linux' => /d; /'cronSetup' =>/a\ \ \ \ \ 'linux' => '* * * * * cd {DOCUMENT_ROOT}; CRON_NURDS_ID='.TENANT.' {PHP-BINARY} -f {CRON-FILE} > /dev/null 2>&1'," {} | tee /dev/tty
grep -Rl "\$cronSetup = \[" /var/www/html/application/Espo/Core/Utils/ --include="ScheduledJob.php" | xargs -I{} sed -i "/^[[:space:]]*'linux' =>/c\        'linux' => '* * * * * cd {DOCUMENT_ROOT}; CRON_NURDS_ID='.TENANT.' {PHP-BINARY} -f {CRON-FILE} > /dev/null 2>&1'," {}
echo "updated Cron verbage"

# Copy Sync.php to /var/www/html/data
#cp -f /assets/php/Sync.php /var/www/html/application/Espo/Core/Authentication/Oidc/UserProvider/Sync.php
#echo "copied over the Sync.php file"

#update install.js
#grep -Rl "InstallScript.prototype.main = function() {" /var/www/html/public/install/js/install.js | xargs -I{} sed -n '/InstallScript.prototype.main = function() {/,/};/c\InstallScript.prototype.main = function() {\tvar self = this;\tvar nextAction = '"'"'step3'"'"';\t\$("#start").click(function() {\t\t\$(this).attr('"'"'disabled'"'"', '"'"'disabled'"'"');\t\tself.showLoading();\t\tself.actionsChecking();\t});\n\n\t$('"'"'[name="user-lang"]'"'"').change(() => {\n\t\tthis.goTo(self.action);\n\t});\n\n\t$('"'"'[name="theme"]'"'"').change(() => {\n\t\tthis.goTo(self.action);\n\t});\n}' {} && cat {}
#grep -Rl "InstallScript.prototype.main = function() {" /var/www/html/public/install/js/install.js | xargs -I{} sed -i '/InstallScript.prototype.main = function() {/,/};/c\InstallScript.prototype.main = function() {\tvar self = this;\tvar nextAction = '"'"'step3'"'"';\t\$("#start").click(function() {\t\t\$(this).attr('"'"'disabled'"'"', '"'"'disabled'"'"');\t\tself.showLoading();\t\tself.actionsChecking();\t});\n\n\t$('"'"'[name="user-lang"]'"'"').change(() => {\n\t\tthis.goTo(self.action);\n\t});\n\n\t$('"'"'[name="theme"]'"'"').change(() => {\n\t\tthis.goTo(self.action);\n\t});\n}' {}
#echo "updated public/install/js/install.js"

###################################################
# Setup for Global Custom Folders
###################################################
#insert in HookManager.php
#grep -Rl "foreach (\$metadata->getModuleList() as \$moduleName)" /var/www/html/application/Espo/Core/HookManager.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -n "/foreach (\$metadata->getModuleList() as \$moduleName)/ i\\        \$globalData = \$this->readHookData(hookDir: \$this->pathProvider->getGlobalCustom() . 'Hooks');\\n        // Recursively merge and overwrite \$data with \$globalData\\n        \$data = array_replace_recursive(\$data, \$globalData);\\n" {} | tee /dev/tty
grep -Rl "foreach (\$metadata->getModuleList() as \$moduleName)" /var/www/html/application/Espo/Core/HookManager.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -i "/foreach (\$metadata->getModuleList() as \$moduleName)/ i\\        \$globalData = \$this->readHookData(hookDir: \$this->pathProvider->getGlobalCustom() . 'Hooks');\\n        // Recursively merge and overwrite \$data with \$globalData\\n        \$data = array_replace_recursive(\$globalData, \$data);\\n" {}
echo "updated HookManager.php"

#insert in Autoload.php
#grep -Rl "\$customPath = \$this->pathProvider->getCustom() . \$this->autoloadFileName;" /var/www/html/application/Espo/Core/Utils/Autoload.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -n "/\$customPath = \$this->pathProvider->getCustom() . \$this->autoloadFileName;/ a\\        \$customGlobalPath = \$this->pathProvider->getGlobalCustom() . \$this->autoloadFileName;\\n        // Recursively merge and overwrite \$data with \$customPath\\n        \$data = array_replace_recursive(\$data, \$this->loadDataFromFile(\$customPath));\\n" {} | tee /dev/tty
grep -Rl "\$customPath = \$this->pathProvider->getCustom() . \$this->autoloadFileName;" /var/www/html/application/Espo/Core/Utils/Autoload.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -i "/\$customPath = \$this->pathProvider->getCustom() . \$this->autoloadFileName;/ a\\        \$customGlobalPath = \$this->pathProvider->getGlobalCustom() . \$this->autoloadFileName;\\n        // Recursively merge and overwrite \$data with \$customGlobalPath\\n        \$data = array_replace_recursive(\$data, \$this->loadDataFromFile(\$customGlobalPath));\\n        \$data = array_replace_recursive(\$data, \$this->loadDataFromFile(\$customPath));\\n" {}
echo "updated Autoload.php"

#insert in Route.php
#grep -Rl "\$data = \$this->addDataFromFile(\[\], \$customFilePath);" /var/www/html/application/Espo/Core/Utils/Route.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -n "/\$data = \$this->addDataFromFile(\[\], \$customFilePath);/ a\\\n        \$customGlobalFilePath = \$this->pathProvider->getGlobalCustom() . \$this->routesFileName;\\n        \$data = \$this->addDataFromFile(\$data, \$customGlobalFilePath);\\n" {} | tee /dev/tty
#grep -Rl "\$data = \$this->addDataFromFile(\[\], \$customFilePath);" /var/www/html/application/Espo/Core/Utils/Route.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -i "/\$data = \$this->addDataFromFile(\[\], \$customFilePath);/ a\\\n        \$customGlobalFilePath = \$this->pathProvider->getGlobalCustom() . \$this->routesFileName;\\n        \$data = \$this->addDataFromFile(\$data, \$customGlobalFilePath);\\n" {}
sed -i '/\$data = \$this->addDataFromFile(\[\], \$customFilePath);/d' /var/www/html/application/Espo/Core/Utils/Route.php
sed -i '/$coreFilePath = $this->pathProvider->getCore()/i \
    $customGlobalFilePath = $this->pathProvider->getGlobalCustom() . $this->routesFileName;\
    $data = $this->addDataFromFile([], $customGlobalFilePath);\
    $data = $this->addDataFromFile($data, $customFilePath);' /var/www/html/application/Espo/Core/Utils/Route.php
echo "updated Route.php"

#insert in Builder.php
#grep -Rl "if (\$customTables !== \[\])" /var/www/html/application/Espo/Core/Utils/Database/Schema/Builder.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -n "/if (\$customTables !== \[\])/ i\\\n        /** @var array<string, mixed> \$customTables */\\n        \$customTables = Util::merge(\\n            \$customTables,\\n            \$this->loadData(\$this->pathProvider->getGlobalCustom() . \$this->tablesPath)\\n        );\\n" {} | tee /dev/tty
grep -Rl "if (\$customTables !== \[\])" /var/www/html/application/Espo/Core/Utils/Database/Schema/Builder.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -i "/if (\$customTables !== \[\])/ i\\\n        /** @var array<string, mixed> \$customTables */\\n        \$customTables = Util::merge(\\n            \$customTables,\\n            \$this->loadData(\$this->pathProvider->getGlobalCustom() . \$this->tablesPath)\\n        );\\n" {}
echo "updated Builder.php"

#insert ClassMap.php
#grep -Rl "if (\$cacheKey && \$this->config->get('useCache'))" /var/www/html/application/Espo/Core/Utils/File/ClassMap.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -n "/if (\$cacheKey && \$this->config->get('useCache'))/ i\\\n        \$data = array_merge(\\n            \$data,\\n            \$this->getClassNameHash(\\n                \$this->pathProvider->getGlobalCustom() . \$path,\\n                \$allowedMethods,\\n                \$subDirs\\n            )\\n        );\\n" {} | tee /dev/tty
grep -Rl "if (\$cacheKey && \$this->config->get('useCache'))" /var/www/html/application/Espo/Core/Utils/File/ClassMap.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -i "/if (\$cacheKey && \$this->config->get('useCache'))/ i\\\n        \$data = array_merge(\\n            \$data,\\n            \$this->getClassNameHash(\\n                \$this->pathProvider->getGlobalCustom() . \$path,\\n                \$allowedMethods,\\n                \$subDirs\\n            )\\n        );\\n" {}
echo "updated ClassMap.php"

#insert Unifier.php
#grep -Rl "\$newData = \$this->unifySingle(\$customFilePath, true);" /var/www/html/application/Espo/Core/Utils/File/Unifier.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -n "/\$newData = \$this->unifySingle(\$customFilePath, true);/ a\\\n        \$customGlobalFilePath = \$this->pathProvider->getGlobalCustom() . \$path;\\n        /** @var array<string, mixed> \$newGlobalData */\\n        \$newGlobalData = \$this->unifySingle(\$customGlobalFilePath, true);\\n        // Recursively merge and overwrite \$newData with \$newGlobalData\\n        \$newData = array_replace_recursive(\$newData, \$newGlobalData);\\n" {} | tee /dev/tty
grep -Rl "\$newData = \$this->unifySingle(\$customFilePath, true);" /var/www/html/application/Espo/Core/Utils/File/Unifier.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -i "/\$newData = \$this->unifySingle(\$customFilePath, true);/ a\\\n        \$customGlobalFilePath = \$this->pathProvider->getGlobalCustom() . \$path;\\n        /** @var array<string, mixed> \$newGlobalData */\\n        \$newGlobalData = \$this->unifySingle(\$customGlobalFilePath, true);\\n        // Recursively merge and overwrite \$newData with \$newGlobalData\\n        \$newData = array_replace_recursive(\$newGlobalData, \$newData);\\n" {}
echo "updated Unifier.php variable"

#grep -Rl "\$itemData = \$this->unifySingle(\$customFilePath, true);" /var/www/html/application/Espo/Core/Utils/File/Unifier.php | xargs -I{} grep -L "\$itemGlobalData" {} | xargs -I{} sed -n "/\$itemData = \$this->unifySingle(\$customFilePath, true);/ a\\\n        \$customGlobalFilePath = \$this->pathProvider->getGlobalCustom() . \$path;\\n        \$itemGlobalData = \$this->unifySingle(\$customGlobalFilePath, true);\\n        \$this->prepareItemDataObject(\$itemGlobalData, \$forceAppendPathList);\\n\\n        // Recursively merge and overwrite \$itemData with \$itemGlobalData\\n        \$itemData = DataUtil::merge(\$itemData, overrideData: \$itemGlobalData);\\n" {} | tee /dev/tty
grep -Rl "\$itemData = \$this->unifySingle(\$customFilePath, true);" /var/www/html/application/Espo/Core/Utils/File/Unifier.php | xargs -I{} grep -L "\$itemGlobalData" {} | xargs -I{} sed -i "/\$itemData = \$this->unifySingle(\$customFilePath, true);/ a\\\n        \$customGlobalFilePath = \$this->pathProvider->getGlobalCustom() . \$path;\\n        \$itemGlobalData = \$this->unifySingle(\$customGlobalFilePath, true);\\n        \$this->prepareItemDataObject(\$itemGlobalData, \$forceAppendPathList);\\n\\n        // Recursively merge and overwrite \$itemData with \$itemGlobalData\\n        \$itemData = DataUtil::merge(\$itemGlobalData, \$itemData);\\n" {}
echo "updated Unifier.php function"

#insert in PathProvider.php
#grep -Rl "public function getModule" /var/www/html/application/Espo/Core/Utils/Module/PathProvider.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -n "/public function getModule/ i\\\n    public function getGlobalCustom(): string\\n    {\\n        return \$this->customGlobalPath;\\n    }\\n" {} | tee /dev/tty
grep -Rl "public function getModule" /var/www/html/application/Espo/Core/Utils/Module/PathProvider.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -i "/public function getModule/ i\\\n    public function getGlobalCustom(): string\\n    {\\n        return \$this->customGlobalPath;\\n    }\\n" {}
echo "updated PathProvider.php" variable

#grep -Rl "private string \$customPath" /var/www/html/application/Espo/Core/Utils/Module/PathProvider.php | xargs -I{} grep -L "\$customGlobalPath" {} | xargs -I{} sed -n "/private string \$customPath/ a\    private string \$customGlobalPath = 'custom/Espo/Custom/';" {} | tee /dev/tty
grep -Rl "private string \$customPath" /var/www/html/application/Espo/Core/Utils/Module/PathProvider.php | xargs -I{} grep -L "\$customGlobalPath" {} | xargs -I{} sed -i "/private string \$customPath/ a\    private string \$customGlobalPath = 'custom/Espo/Custom/';" {}
echo "updated PathProvider.php function"

#updated Module.php 
grep -Rl "private string \$customPath" /var/www/html/application/Espo/Core/Utils/Module.php | xargs -I{} sed -i "s|private string \$customPath = 'custom/Espo/Modules';|private string \$customPath = 'custom/Espo/'.TENANT.'/Modules';|" {}
echo "updated Module.php"

#insert in FileReader.php
#grep -Rl "\$moduleName = null;" /var/www/html/application/Espo/Core/Utils/Resource/FileReader.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -n "/\$moduleName = null;/ i\\\n        \$customGlobalPath = \$this->pathProvider->getGlobalCustom() . \$path;\\n\\n        if (\$this->fileManager->isFile(\$customGlobalPath)) {\\n            return \$customGlobalPath;\\n        }\\n" {} | tee /dev/tty
grep -Rl "\$moduleName = null;" /var/www/html/application/Espo/Core/Utils/Resource/FileReader.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -i "/\$moduleName = null;/ i\\\n        \$customGlobalPath = \$this->pathProvider->getGlobalCustom() . \$path;\\n\\n        if (\$this->fileManager->isFile(\$customGlobalPath)) {\\n            return \$customGlobalPath;\\n        }\\n" {}
echo "updated FileReader.php"

#insert in Resource/PathProvider
#grep -Rl "public function getModule" /var/www/html/application/Espo/Core/Utils/Resource/PathProvider.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -n "/public function getModule/ i\\\n    public function getGlobalCustom(): string\\n    {\\n        return \$this->provider->getGlobalCustom() . 'Resources/';\\n    }\\n" {} | tee /dev/tty
grep -Rl "public function getModule" /var/www/html/application/Espo/Core/Utils/Resource/PathProvider.php | xargs -I{} grep -L "getGlobalCustom" {} | xargs -I{} sed -i "/public function getModule/ i\\\n    public function getGlobalCustom(): string\\n    {\\n        return \$this->provider->getGlobalCustom() . 'Resources/';\\n    }\\n" {}
echo "updated Resource/PathProvider"

#update /.docker/compose/nurdscrm/espocrm/application/Espo/Core/Mail/Sender.php
echo "Updating @espo to @tenant in Sender.php"
SENDER_FILE="/var/www/html/application/Espo/Core/Mail/Sender.php"

# Replace the 4-part sprintf line
sed -i -E 's#(sprintf\("%s/%s/%s/%s)@espo", (.*)\)#\1@%s", \2, TENANT)#' "$SENDER_FILE"

# Replace the 3-part sprintf line
sed -i -E 's#(sprintf\("%s/%s/%s)@espo", (.*)\)#\1@%s", \2, TENANT)#' "$SENDER_FILE"

#update Daemon.php to allow for passing in a tenant argument
grep -q "Check and set tenant" /var/www/html/application/Espo/Core/ApplicationRunners/Daemon.php || \
grep -Rl "if (!\$toSkip) {" /var/www/html/application/Espo/Core/ApplicationRunners/Daemon.php | xargs -I{} sed -i "/if (!\$toSkip) {/a\\
                // Check and set tenant\\n\
                \\\$argv = \\\$_SERVER['argv'];\\n\
                if (!isset(\\\$argv[1])) {\\n\
                    echo \\\"Error: TENANT is not set.\\\\n\\\";\\n\
                    exit(1);\\n\
                }\\n\
                \\n\
                \\\$tenant = \\\$argv[1];\\n\
                \\\$envVars = array_merge(\\\$_ENV, array(\\\"CRON_NURDS_ID\\\" => \\\$tenant));" {}

echo "updated Daemon.php"                

# End Global Custom Folders
###################################################

# Copy /usr/src/nurdscrm/data to /var/www/html/data
#cp -rf /usr/src/nurdscrm/data/. /var/www/html/data/

# When ready, create the symlink from /var/www/html/data and /custom to /usr/src/nurdscrm/data and /custom
# also doing application/Espo/Modules/Nurds & NurdsExtensions and client/modules/nurds
rm -rf /var/www/html/data
rm -rf /var/www/html/custom
rm -rf /var/www/html/application/Espo/Modules/Nurds
rm -rf /var/www/html/application/Espo/Modules/NurdsExtensions
rm -rf /var/www/html/client/modules/nurds
ln -s /mnt/vfs/assets/data /var/www/html/data
ln -s /mnt/vfs/assets/custom /var/www/html/custom
ln -s /mnt/vfs/assets/modules/Nurds /var/www/html/application/Espo/Modules/Nurds
ln -s /mnt/vfs/assets/modules/NurdsExtensions /var/www/html/application/Espo/Modules/NurdsExtensions
ln -s /mnt/vfs/assets/client/nurds /var/www/html/client/modules/nurds
cp /mnt/vfs/scripts/install_module.sh /var/www/html/install_module.sh


# Change ownership of the copied file(s) to www-data:www-data
chown -R www-data:www-data /var/www/html/
echo "Data and Custom folder synced successfully!"

# Run EspoCRM rebuild script
echo "Running NurdsCRM rebuild script..."
cd /var/www/html  # Change to the NurdsCRM installation directory
chmod +x bin/command # Make the command file executable
php rebuild.php   # Run the rebuild command
 

# Check if the environment variable NURDS_SERVER_ID is set to "crons"
if [ "$NURDS_SERVER_ID" == "crons" ]; then
    # Run the desired command
    echo "NURDS_SERVER_ID is set to crons. Running command..."
    # if env is for crons
    echo "Installing Cron Related Items"
    apt-get install -y supervisor cron

    # Default Supervisor conf directory
    SUPERVISOR_CONF_DIR="/etc/supervisor/conf.d"
    SUPERVISOR_CONF_FILE="$SUPERVISOR_CONF_DIR/nurds_daemon.conf"
    TENANT_DIR="/var/www/html/data"
    SUPERVISORCTL="/usr/bin/supervisorctl"

    # Check if Supervisor's config file exists, if not create it.
    if [ ! -f "$SUPERVISOR_CONF_FILE" ]; then
        echo "Supervisor config file does not exist. Creating default config."
        touch "$SUPERVISOR_CONF_FILE"
    fi

    # Clear the current config file (optional, only if you want to start fresh)
    echo "" > "$SUPERVISOR_CONF_FILE"

    # Scan the tenant directory for subdirectories
    for tenant_folder in "$TENANT_DIR"/*; do
        if [ -d "$tenant_folder" ]; then
            # Look for either config.php or config-internal.php
            # First check if config.php exists
            if [ -f "$tenant_folder/config.php" ]; then
                # Check if the 'isInstalled' key exists in the config.php
                if grep -q "'isInstalled'" "$tenant_folder/config.php"; then
                    config_file="$tenant_folder/config.php"
                fi
            fi

            # If config.php doesn't exist, check for config-internal.php
            if [ -z "$config_file" ] && [ -f "$tenant_folder/config-internal.php" ]; then
                # Check if the 'isInstalled' key exists in the config-internal.php
                if grep -q "'isInstalled'" "$tenant_folder/config-internal.php"; then
                    config_file="$tenant_folder/config-internal.php"
                fi
            fi

            # Check if the config file contains 'isInstalled' => true
            if grep -q "'isInstalled' => true" "$config_file"; then
                tenant_name=$(basename "$tenant_folder")  # Extract tenant name from folder name

                # Append the program config for this tenant to the supervisor config
                echo "[program:${tenant_name}_daemon]" >> "$SUPERVISOR_CONF_FILE"
                echo "command=/usr/local/bin/php /var/www/html/daemon.php $tenant_name" >> "$SUPERVISOR_CONF_FILE"
                echo "autostart=true" >> "$SUPERVISOR_CONF_FILE"
                echo "autorestart=true" >> "$SUPERVISOR_CONF_FILE"
                echo "stderr_logfile=/var/log/${tenant_name}_daemon.err.log" >> "$SUPERVISOR_CONF_FILE"
                echo "stdout_logfile=/var/log/${tenant_name}_daemon.out.log" >> "$SUPERVISOR_CONF_FILE"
                echo "environment=CRON_NURDS_ID=\"$tenant_name\"" >> "$SUPERVISOR_CONF_FILE"
                echo "" >> "$SUPERVISOR_CONF_FILE"  # Add a blank line for readability
            fi
        fi
    done

    # Reload supervisor to apply changes
    service supervisor start 
    supervisorctl reread
    supervisorctl update
    echo "Supervisor configuration updated with active tenants."

    echo "Current Supervisor Jobs Running:"
    supervisorctl status

    service cron start
    echo "Cron Service Started"

fi

chmod +x /var/www/html/install_module.sh

# Log completion time
echo "Script completed at $(date)"

a2enmod cache cache_disk expires headers
service apache-htcacheclean start
echo "Enabled Cache Modules"

a2enconf expires
echo "Enabled Expires Configuration"

a2enmod http2
echo "Enabled HTTP2"

nohup apache2ctl restart > /var/log/apache_restart.log 2>&1 &

#service apache2 restart
# ------------------------- END -------------------------------------
# Keep the container running
#tail -f /dev/null
#exec "$@"