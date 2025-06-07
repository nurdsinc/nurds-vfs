<?php
return [
  'database' => [
    'host' => 'vultr-prod-2e977bd7-15d5-4b84-af3c-097ce4520dc5-vultr-prod-414f.vultrdb.com',
    'port' => '16751',
    'charset' => NULL,
    'dbname' => 'crons_db',
    'user' => 'crons',
    'password' => 'G9c??Di?@uST4Zbd',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => '',
  'logger' => [
    'path' => 'data/crons/logs/nurds.log',
    'level' => 'DEBUG',
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
  'microtimeInternal' => 1734923585.050258,
  'passwordSalt' => '98325974b874a1bd',
  'cryptKey' => '65f4d35c362e1af9e5a4ce10a33736b2',
  'hashSecretKey' => '98c622c6539ddb629ed1bbb7334e3e86',
  'defaultPermissions' => [
    'user' => 33,
    'group' => 33
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.30',
  'instanceId' => '892ee003-5ae4-4309-a7fa-3c5400124610',
  'apiSecretKeys' => (object) []
];
