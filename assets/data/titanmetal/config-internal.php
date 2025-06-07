<?php
return [
  'database' => [
    'host' => 'vultr-prod-2e977bd7-15d5-4b84-af3c-097ce4520dc5-vultr-prod-414f.vultrdb.com',
    'port' => '16751',
    'charset' => NULL,
    'dbname' => 'titanmetal_db',
    'user' => 'titanmetal',
    'password' => '6c?Ba?ySQ{8.h*TF',
    'platform' => 'Mysql'
  ],
  'smtpPassword' => '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',
  'logger' => [
    'path' => 'data/titanmetal/logs/nurds.log',
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
  'microtimeInternal' => 1748558525.871213,
  'cryptKey' => '124b1538df838846b4d8f44dbcc0eb15',
  'hashSecretKey' => '96e6ad2cdaf2c7af39af61f7bb4bf21b',
  'defaultPermissions' => [
    'user' => 33,
    'group' => 33
  ],
  'actualDatabaseType' => 'mysql',
  'actualDatabaseVersion' => '8.0.35',
  'instanceId' => '2a2c66a2-7622-4e61-99f9-e24fd07435d0',
  'adminPanelIframeUrl' => 'https://s.espocrm.com/?sales-pack=799ba07927a6a02c6a0ae59de64ec1ec'
];
