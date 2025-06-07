<?php
return [
  'database' => [
    'host' => 'vultr-prod-2e977bd7-15d5-4b84-af3c-097ce4520dc5-vultr-prod-414f.vultrdb.com',
    'port' => '16751',
    'charset' => NULL,
    'dbname' => 'roofer_db',
    'user' => 'roofer',
    'password' => '}u2JC*AFJMg(@#(.',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => '',
  'logger' => [
    'path' => 'data/roofer/logs/nurds.log',
    'level' => 'WARNING',
    'rotation' => true,
    'maxFileNumber' => 30,
    'printTrace' => false,
    'databaseHandler' => false
  ],
  'restrictedMode' => false,
  'cleanupAppLog' => true,
  'cleanupAppLogPeriod' => '30 days',
  'webSocketMessager' => 'ZeroMQ',
  'clientSecurityHeadersDisabled' => false,
  'clientCspDisabled' => false,
  'clientCspScriptSourceList' => [
    0 => 'https://maps.googleapis.com'
  ],
  'adminUpgradeDisabled' => false,
  'isInstalled' => true,
  'microtimeInternal' => 1734974959.690526,
  'passwordSalt' => 'bd8696a38d2f1482',
  'cryptKey' => '8a78d1064f81c4021646aab3dc1541c3',
  'hashSecretKey' => 'a1663b54fc0740d85399905c5dbd1316',
  'defaultPermissions' => [
    'user' => 33,
    'group' => 33
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.30',
  'instanceId' => 'a16f4489-5509-45ba-932f-33b7ee439cbc'
];
