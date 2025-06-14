<?php
return [
  'database' => [
    'host' => 'vultr-prod-2e977bd7-15d5-4b84-af3c-097ce4520dc5-vultr-prod-414f.vultrdb.com',
    'port' => '16751',
    'charset' => NULL,
    'dbname' => 'castle_db',
    'user' => 'castle',
    'password' => 'h7A]t.!3{Srqkg5h',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => '',
  'logger' => [
    'path' => 'data/castle/logs/nurds.log',
    'level' => 'DEBUG',
    'rotation' => true,
    'maxFileNumber' => 30,
    'printTrace' => false
  ],
  'restrictedMode' => false,
  'webSocketMessager' => 'ZeroMQ',
  'clientSecurityHeadersDisabled' => false,
  'clientCspDisabled' => false,
  'clientCspScriptSourceList' => [
    0 => 'https://maps.googleapis.com'
  ],
  'adminUpgradeDisabled' => false,
  'isInstalled' => true,
  'microtimeInternal' => 1749583034.101522,
  'passwordSalt' => '16133f9ea6db2267',
  'cryptKey' => '0cbd1dcfbf73f24a11605e4e227f257a',
  'hashSecretKey' => 'cf13d6bdf028da961569d9586659902c',
  'defaultPermissions' => [
    'user' => 33333,
    'group' => 33333
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.35',
  'instanceId' => '3b7c6244-4aa1-4a49-83bf-796a3fddd022',
  'cleanupAppLog' => true,
  'cleanupAppLogPeriod' => '30 days'
];
