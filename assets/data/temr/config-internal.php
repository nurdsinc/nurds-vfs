<?php
return [
  'database' => [
    'host' => 'vultr-prod-2e977bd7-15d5-4b84-af3c-097ce4520dc5-vultr-prod-414f.vultrdb.com',
    'port' => '16751',
    'charset' => NULL,
    'dbname' => 'temr_db',
    'user' => 'temr',
    'password' => '[4CgGVy=,.#jU$zB',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => getenv('SENDGRID_API_KEY'),
  'logger' => [
    'path' => 'data/temr/logs/nurds.log',
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
  'microtimeInternal' => 1743444562.32721,
  'passwordSalt' => '2bac85495ef1ca0e',
  'cryptKey' => '5c3b197ffb2dfc49d6eb9156ac4269f8',
  'hashSecretKey' => '120cb1da8df6f1730dc4bf326810f5ab',
  'defaultPermissions' => [
    'user' => 33,
    'group' => 33
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.35',
  'instanceId' => '10628efb-d969-485b-ad20-fd4d2c528947',
  'apiSecretKeys' => (object) []
];
