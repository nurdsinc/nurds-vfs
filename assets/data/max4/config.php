<?php
return [
  'planType' => 'Enterprise',
  'useCache' => true,
  'jobMaxPortion' => 15,
  'jobRunInParallel' => false,
  'jobPoolConcurrencyNumber' => 8,
  'daemonMaxProcessNumber' => 5,
  'daemonInterval' => 10,
  'daemonProcessTimeout' => 36000,
  'jobForceUtc' => false,
  'recordsPerPage' => 50,
  'recordsPerPageSmall' => 25,
  'recordsPerPageSelect' => 20,
  'recordsPerPageKanban' => 15,
  'applicationName' => 'NurdsCRM (max4)',
  'version' => '9.0.2',
  'timeZone' => 'America/New_York',
  'dateFormat' => 'MM/DD/YYYY',
  'timeFormat' => 'hh:mm A',
  'weekStart' => 0,
  'thousandSeparator' => ',',
  'decimalMark' => '.',
  'exportDelimiter' => ',',
  'currencyList' => [
    0 => 'USD'
  ],
  'defaultCurrency' => 'USD',
  'baseCurrency' => 'USD',
  'currencyRates' => [],
  'currencyNoJoinMode' => false,
  'outboundEmailIsShared' => true,
  'outboundEmailFromName' => 'Max4 Claims',
  'outboundEmailFromAddress' => '',
  'smtpServer' => '',
  'smtpPort' => 587,
  'smtpAuth' => false,
  'smtpSecurity' => 'TLS',
  'smtpUsername' => '',
  'language' => 'en_US',
  'authenticationMethod' => 'Oidc',
  'tabQuickSearch' => true,
  'globalSearchEntityList' => [
    0 => 'Account',
    1 => 'Contact',
    2 => 'Lead',
    3 => 'Opportunity'
  ],
  'tabList' => [
    0 => (object) [
      'type' => 'divider',
      'id' => '342567',
      'text' => '$CRM'
    ],
    1 => 'Account',
    2 => 'Contact',
    3 => 'Lead',
    4 => 'Opportunity',
    5 => (object) [
      'type' => 'group',
      'text' => '$SalesPack',
      'iconClass' => 'fas fa-boxes',
      'color' => NULL,
      'id' => '887713',
      'itemList' => [
        0 => 'Product',
        1 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '492979'
        ],
        2 => 'Quote',
        3 => 'SalesOrder',
        4 => 'Invoice',
        5 => 'DeliveryOrder',
        6 => 'ReturnOrder',
        7 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '450012'
        ],
        8 => 'PurchaseOrder',
        9 => 'ReceiptOrder',
        10 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '971029'
        ],
        11 => 'TransferOrder',
        12 => 'InventoryAdjustment',
        13 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '119126'
        ],
        14 => 'Warehouse',
        15 => 'InventoryNumber',
        16 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '645336'
        ],
        17 => 'InventoryTransaction'
      ]
    ],
    6 => (object) [
      'type' => 'divider',
      'text' => '$Activities',
      'id' => '219419'
    ],
    7 => 'Email',
    8 => 'Meeting',
    9 => 'Call',
    10 => 'Task',
    11 => 'Calendar',
    12 => (object) [
      'type' => 'divider',
      'id' => '655187',
      'text' => '$Support'
    ],
    13 => 'Case',
    14 => 'KnowledgeBaseArticle',
    15 => (object) [
      'type' => 'divider',
      'text' => NULL,
      'id' => '137994'
    ],
    16 => '_delimiter_',
    17 => (object) [
      'type' => 'divider',
      'text' => '$Marketing',
      'id' => '463280'
    ],
    18 => 'Campaign',
    19 => 'TargetList',
    20 => (object) [
      'type' => 'divider',
      'text' => '$Business',
      'id' => '518202'
    ],
    21 => 'Document',
    22 => (object) [
      'type' => 'divider',
      'text' => '$Organization',
      'id' => '566592'
    ],
    23 => 'User',
    24 => 'Team',
    25 => 'WorkingTimeCalendar',
    26 => (object) [
      'type' => 'divider',
      'text' => NULL,
      'id' => '898671'
    ],
    27 => 'EmailTemplate',
    28 => 'Template',
    29 => 'Import',
    30 => (object) [
      'type' => 'divider',
      'text' => NULL,
      'id' => '170966'
    ]
  ],
  'quickCreateList' => [
    0 => 'Account',
    1 => 'Contact',
    2 => 'Lead',
    3 => 'Opportunity',
    4 => 'Meeting',
    5 => 'Call',
    6 => 'Task',
    7 => 'Case',
    8 => 'Email'
  ],
  'exportDisabled' => false,
  'adminNotifications' => true,
  'adminNotificationsNewVersion' => true,
  'adminNotificationsCronIsNotConfigured' => true,
  'adminNotificationsNewExtensionVersion' => true,
  'assignmentEmailNotifications' => false,
  'assignmentEmailNotificationsEntityList' => [
    0 => 'Lead',
    1 => 'Opportunity',
    2 => 'Task',
    3 => 'Case'
  ],
  'assignmentNotificationsEntityList' => [
    0 => 'Call',
    1 => 'Email'
  ],
  'portalStreamEmailNotifications' => true,
  'streamEmailNotificationsEntityList' => [
    0 => 'Case'
  ],
  'streamEmailNotificationsTypeList' => [
    0 => 'Post',
    1 => 'Status',
    2 => 'EmailReceived'
  ],
  'emailNotificationsDelay' => 30,
  'emailMessageMaxSize' => 25,
  'emailRecipientAddressMaxCount' => 100,
  'notificationsCheckInterval' => 10,
  'popupNotificationsCheckInterval' => 15,
  'maxEmailAccountCount' => 2,
  'followCreatedEntities' => false,
  'b2cMode' => false,
  'theme' => 'Light',
  'themeParams' => (object) [
    'navbar' => 'side'
  ],
  'massEmailMaxPerHourCount' => 500,
  'massEmailMaxPerBatchCount' => 10,
  'massEmailVerp' => false,
  'personalEmailMaxPortionSize' => 50,
  'inboundEmailMaxPortionSize' => 50,
  'emailAddressLookupEntityTypeList' => [
    0 => 'User'
  ],
  'emailAddressSelectEntityTypeList' => [
    0 => 'User',
    1 => 'Contact',
    2 => 'Lead',
    3 => 'Account'
  ],
  'emailAddressEntityLookupDefaultOrder' => [
    0 => 'User',
    1 => 'Contact',
    2 => 'Lead',
    3 => 'Account'
  ],
  'phoneNumberEntityLookupDefaultOrder' => [
    0 => 'User',
    1 => 'Contact',
    2 => 'Lead',
    3 => 'Account'
  ],
  'authTokenLifetime' => 0,
  'authTokenMaxIdleTime' => 48,
  'userNameRegularExpression' => '[^a-z0-9\\-@_\\.\\s]',
  'addressFormat' => 1,
  'displayListViewRecordCount' => true,
  'dashboardLayout' => [
    0 => (object) [
      'name' => 'My Nurds',
      'layout' => [
        0 => (object) [
          'id' => 'default-stream',
          'name' => 'Stream',
          'x' => 0,
          'y' => 0,
          'width' => 2,
          'height' => 4
        ],
        1 => (object) [
          'id' => 'default-activities',
          'name' => 'Activities',
          'x' => 2,
          'y' => 2,
          'width' => 2,
          'height' => 4
        ]
      ]
    ]
  ],
  'calendarEntityList' => [
    0 => 'Meeting',
    1 => 'Call',
    2 => 'Task'
  ],
  'activitiesEntityList' => [
    0 => 'Meeting',
    1 => 'Call'
  ],
  'historyEntityList' => [
    0 => 'Meeting',
    1 => 'Call',
    2 => 'Email'
  ],
  'busyRangesEntityList' => [
    0 => 'Meeting',
    1 => 'Call'
  ],
  'emailAutoReplySuppressPeriod' => '2 hours',
  'emailAutoReplyLimit' => 5,
  'cleanupJobPeriod' => '1 month',
  'cleanupActionHistoryPeriod' => '15 days',
  'cleanupAuthTokenPeriod' => '1 month',
  'cleanupSubscribers' => true,
  'cleanupAudit' => true,
  'cleanupAuditPeriod' => '3 months',
  'appLogAdminAllowed' => false,
  'currencyFormat' => 2,
  'currencyDecimalPlaces' => 2,
  'aclAllowDeleteCreated' => false,
  'aclAllowDeleteCreatedThresholdPeriod' => '24 hours',
  'attachmentAvailableStorageList' => NULL,
  'attachmentUploadMaxSize' => 50,
  'attachmentUploadChunkSize' => 4,
  'inlineAttachmentUploadMaxSize' => 20,
  'textFilterUseContainsForVarchar' => false,
  'tabColorsDisabled' => false,
  'massPrintPdfMaxCount' => 50,
  'emailKeepParentTeamsEntityList' => [
    0 => 'Case'
  ],
  'streamEmailWithContentEntityTypeList' => [
    0 => 'Case'
  ],
  'recordListMaxSizeLimit' => 200,
  'noteDeleteThresholdPeriod' => '1 month',
  'noteEditThresholdPeriod' => '7 days',
  'notePinnedMaxCount' => 5,
  'emailForceUseExternalClient' => false,
  'useWebSocket' => false,
  'auth2FAMethodList' => [
    0 => 'Totp'
  ],
  'auth2FAInPortal' => false,
  'personNameFormat' => 'firstLast',
  'newNotificationCountInTitle' => false,
  'pdfEngine' => 'Dompdf',
  'smsProvider' => NULL,
  'mapProvider' => 'Google',
  'defaultFileStorage' => 'AwsS3',
  'ldapUserNameAttribute' => 'sAMAccountName',
  'ldapUserFirstNameAttribute' => 'givenName',
  'ldapUserLastNameAttribute' => 'sn',
  'ldapUserTitleAttribute' => 'title',
  'ldapUserEmailAddressAttribute' => 'mail',
  'ldapUserPhoneNumberAttribute' => 'telephoneNumber',
  'ldapUserObjectClass' => 'person',
  'ldapPortalUserLdapAuth' => false,
  'passwordGenerateLength' => 10,
  'passwordStrengthLength' => NULL,
  'passwordStrengthLetterCount' => NULL,
  'passwordStrengthNumberCount' => NULL,
  'passwordStrengthBothCases' => false,
  'passwordStrengthSpecialCharacterCount' => NULL,
  'massActionIdleCountThreshold' => 100,
  'exportIdleCountThreshold' => 1000,
  'oidcJwtSignatureAlgorithmList' => [
    0 => 'RS256'
  ],
  'oidcUsernameClaim' => 'preferred_username',
  'oidcFallback' => true,
  'oidcScopes' => [
    0 => 'profile',
    1 => 'email',
    2 => 'phone'
  ],
  'oidcAuthorizationPrompt' => 'select_account',
  'listViewSettingsDisabled' => false,
  'cleanupDeletedRecords' => true,
  'phoneNumberNumericSearch' => true,
  'phoneNumberInternational' => true,
  'phoneNumberExtensions' => false,
  'phoneNumberPreferredCountryList' => [
    0 => 'us',
    1 => 'de'
  ],
  'wysiwygCodeEditorDisabled' => false,
  'customPrefixDisabled' => false,
  'listPagination' => true,
  'starsLimit' => 500,
  'quickSearchFullTextAppendWildcard' => false,
  'authIpAddressCheck' => false,
  'authIpAddressWhitelist' => [],
  'authIpAddressCheckExcludedUsersIds' => [],
  'authIpAddressCheckExcludedUsersNames' => (object) [],
  'availableReactions' => [
    0 => 'Like'
  ],
  'streamReactionsCheckMaxSize' => 50,
  'emailScheduledBatchCount' => 50,
  'emailAddressMaxCount' => 10,
  'phoneNumberMaxCount' => 10,
  'cacheTimestamp' => 1748451836,
  'microtime' => 1748451836.116111,
  'siteUrl' => 'https://max4.crm.nurds.com',
  'fullTextSearchMinLength' => 4,
  'appTimestamp' => 1748451101,
  'userThemesDisabled' => false,
  'avatarsDisabled' => false,
  'scopeColorsDisabled' => false,
  'tabIconsDisabled' => false,
  'dashletsOptions' => (object) []
];
