<?php
return [
  'database' => [
    'host' => 'vultr-prod-2e977bd7-15d5-4b84-af3c-097ce4520dc5-vultr-prod-414f.vultrdb.com',
    'port' => '16751',
    'charset' => NULL,
    'dbname' => 'cohen_db',
    'user' => 'cohen',
    'password' => 'd.N3W4fyBmvgF2tu',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => '',
  'logger' => [
    'path' => 'data/cohen/logs/nurds.log',
    'level' => 'WARNING',
    'rotation' => true,
    'maxFileNumber' => 30,
    'printTrace' => false,
    'databaseHandler' => false,
    'sql' => false,
    'sqlFailed' => false
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
  'microtimeInternal' => 1745948906.014639,
  'cryptKey' => '410488ac556963770d44485e74b563fe',
  'hashSecretKey' => '485bd4fac54d561d32b65f22a0e1f495',
  'defaultPermissions' => [
    'user' => 33,
    'group' => 33
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.35',
  'instanceId' => 'dbf6118d-ac2c-4335-84ab-e950b47caa0a'
];
