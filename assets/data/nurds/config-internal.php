<?php
return [
  'database' => [
    'host' => 'proxysql.nurds.com',
    'port' => '6033',
    'charset' => NULL,
    'dbname' => 'nurds_db',
    'user' => 'db_user_nurds',
    'password' => 'P@ssw0rd1!2@3#',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => getenv('SENDGRID_API_KEY'),
  'logger' => [
    'path' => 'data/nurds/logs/nurds.log',
    'level' => 'INFO',
    'rotation' => true,
    'maxFileNumber' => 10,
    'printTrace' => true,
    'sql' => true,
    'databaseHandler' => true
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
  'microtimeInternal' => 1749270210.618316,
  'passwordSalt' => '411d2983aac1785f',
  'cryptKey' => '57f62a34ef6ff332a6171fc3132c4484',
  'hashSecretKey' => '003e9c2d2c68bd3cb3a6a2a82556e29d',
  'defaultPermissions' => [
    'user' => 'www-data',
    'group' => 'www-data'
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.39',
  'instanceId' => '72687fd2-fd1e-415c-b0fb-b0435931ca67',
  'apiSecretKeys' => (object) [],
  'cleanupAppLog' => true,
  'cleanupAppLogPeriod' => '30 days',
  'adminPanelIframeUrl' => 'https://s.espocrm.com/?google-integration=96ea385d4e0a9d0ba460925d713d8f63&sales-pack=799ba07927a6a02c6a0ae59de64ec1ec'
];
