<?php
//vultr
/*
  'database' => [
    'host' => 'vultr-prod-2e977bd7-15d5-4b84-af3c-097ce4520dc5-vultr-prod-414f.vultrdb.com',
    'port' => '16751',
    'charset' => NULL,
    'dbname' => 'advosy_db',
    'user' => 'advosy',
    'password' => '!5fMdj@a4GbyE,b[',
    'platform' => 'Mysql'
  ], 
*/
return [
  'database' => [
    'host' => 'proxysql.nurds.com',
    'port' => '6033',
    'charset' => NULL,
    'dbname' => 'advosy_db',
    'user' => 'db_user_nurds',
    'password' => 'P@ssw0rd1!2@3#',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => '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',
  'logger' => [
    'path' => 'data/advosy/logs/nurds.log',
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
  'microtimeInternal' => 1740682745.453763,
  'cryptKey' => 'cc37ed58b683b8fdd49c6e7b82e739d8',
  'hashSecretKey' => '37254f67f4ea5ad240c81f4b3f9a68b8',
  'defaultPermissions' => [
    'user' => 33,
    'group' => 33
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.30',
  'instanceId' => '77820ed6-155a-4f7c-b18f-284aea935942',
  'adminPanelIframeUrl' => 'https://s.espocrm.com/?sales-pack=799ba07927a6a02c6a0ae59de64ec1ec'
];
