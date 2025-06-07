<?php
return [
  'database' => [
    'host' => 'vultr-prod-2e977bd7-15d5-4b84-af3c-097ce4520dc5-vultr-prod-414f.vultrdb.com',
    'port' => '16751',
    'charset' => NULL,
    'dbname' => 'ctrlsolutions_db',
    'user' => 'ctrlsolutions',
    'password' => '9(TfhbiwPi57Bgx{',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => '',
  'logger' => [
    'path' => 'data/ctrlsolutions/logs/nurds.log',
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
  'microtimeInternal' => 1748112694.348536,
  'cryptKey' => '2c4788c7732a9e46682756d5b5f61565',
  'hashSecretKey' => '61951602c0ca6c786c205f5747837d22',
  'defaultPermissions' => [
    'user' => 33,
    'group' => 33
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.35',
  'instanceId' => 'c05d35fe-d374-4862-8a63-a98f200df677',
  'adminPanelIframeUrl' => 'https://s.espocrm.com/?sales-pack=799ba07927a6a02c6a0ae59de64ec1ec'
];
