<?php
return [
  'database' => [
    'host' => 'localhost',
    'port' => NULL,
    'charset' => NULL,
    'dbname' => '',
    'user' => '',
    'password' => ''
  ],
  'smtpPassword' => NULL,
  'logger' => [
    'path' => 'data/nurd/logs/nurds.log',
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
  'isInstalled' => false,
  'microtimeInternal' => 1740694690.003243
];
