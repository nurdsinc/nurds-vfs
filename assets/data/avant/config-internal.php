<?php
return [
  'database' => [
    'host' => 'proxysql.nurds.com',
    'port' => '6033',
    'charset' => NULL,
    'dbname' => 'avant_db',
    'user' => 'db_user_nurds',
    'password' => 'P@ssw0rd1!2@3#',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => 'AploRex123@',
  'logger' => [
    'path' => 'data/avant/logs/nurds.log',
    'level' => 'DEBUG',
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
  'microtimeInternal' => 1739404734.139585,
  'cryptKey' => 'b7a58c15aafc750ee896c0a07aa501bd',
  'hashSecretKey' => '498b8b46109766b8bd94203191b0128a',
  'defaultPermissions' => [
    'user' => 33,
    'group' => 33
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.39',
  'instanceId' => 'a8c3c849-11ff-4958-940b-0d9a933e0533',
  'adminPanelIframeUrl' => 'https://s.espocrm.com/?advanced-pack=666d14eca4fd54205a89f2a8f2b55ea2&sales-pack=799ba07927a6a02c6a0ae59de64ec1ec'
];
