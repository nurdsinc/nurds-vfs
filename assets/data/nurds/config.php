<?php
return [
  'useCache' => true,
  'jobMaxPortion' => 15,
  'jobRunInParallel' => false,
  'jobPoolConcurrencyNumber' => 8,
  'daemonMaxProcessNumber' => 5,
  'daemonInterval' => 10,
  'daemonProcessTimeout' => 3600,
  'jobForceUtc' => false,
  'recordsPerPage' => 20,
  'recordsPerPageSmall' => 5,
  'recordsPerPageSelect' => 10,
  'recordsPerPageKanban' => 5,
  'applicationName' => 'NurdsCRM',
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
  'outboundEmailFromName' => 'Nurds',
  'outboundEmailFromAddress' => 'hello@nurds.com',
  'smtpServer' => 'smtp.sendgrid.net',
  'smtpPort' => 465,
  'smtpAuth' => true,
  'smtpSecurity' => 'SSL',
  'smtpUsername' => 'apikey',
  'language' => 'en_US',
  'authenticationMethod' => 'Espo',
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
      'id' => '610184',
      'itemList' => [
        0 => 'Product',
        1 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '622756'
        ],
        2 => 'Quote',
        3 => 'SalesOrder',
        4 => 'Invoice',
        5 => 'DeliveryOrder',
        6 => 'ReturnOrder',
        7 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '707374'
        ],
        8 => 'PurchaseOrder',
        9 => 'ReceiptOrder',
        10 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '378438'
        ],
        11 => 'TransferOrder',
        12 => 'InventoryAdjustment',
        13 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '356669'
        ],
        14 => 'Warehouse',
        15 => 'InventoryNumber',
        16 => (object) [
          'type' => 'divider',
          'text' => NULL,
          'id' => '804375'
        ],
        17 => 'InventoryTransaction'
      ]
    ],
    6 => (object) [
      'type' => 'group',
      'text' => 'Misc Tab',
      'iconClass' => 'fas fa-atom',
      'color' => NULL,
      'id' => '141705',
      'itemList' => [
        0 => 'CallEvent',
        1 => 'CCertificate',
        2 => 'CDid',
        3 => 'Domain',
        4 => 'ExternalMonitoring',
        5 => 'NurdBuilder',
        6 => 'NurdsPBX',
        7 => 'SMSBot',
        8 => 'Zone'
      ]
    ],
    7 => (object) [
      'type' => 'divider',
      'text' => '$Activities',
      'id' => '219419'
    ],
    8 => 'Email',
    9 => 'Meeting',
    10 => 'Call',
    11 => 'Task',
    12 => 'Calendar',
    13 => (object) [
      'type' => 'divider',
      'id' => '655187',
      'text' => '$Support'
    ],
    14 => 'Case',
    15 => 'KnowledgeBaseArticle',
    16 => (object) [
      'type' => 'divider',
      'text' => NULL,
      'id' => '137994'
    ],
    17 => '_delimiter_',
    18 => (object) [
      'type' => 'divider',
      'text' => '$Marketing',
      'id' => '463280'
    ],
    19 => 'Campaign',
    20 => 'TargetList',
    21 => (object) [
      'type' => 'divider',
      'text' => '$Business',
      'id' => '518202'
    ],
    22 => 'Document',
    23 => (object) [
      'type' => 'divider',
      'text' => '$Organization',
      'id' => '566592'
    ],
    24 => 'User',
    25 => 'Team',
    26 => 'WorkingTimeCalendar',
    27 => (object) [
      'type' => 'divider',
      'text' => NULL,
      'id' => '898671'
    ],
    28 => 'EmailTemplate',
    29 => 'Template',
    30 => 'Import',
    31 => (object) [
      'type' => 'divider',
      'text' => NULL,
      'id' => '291212'
    ],
    32 => 'CPermit'
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
  'emailMessageMaxSize' => 10,
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
  'massEmailMaxPerHourCount' => 1000,
  'massEmailMaxPerBatchCount' => NULL,
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
  'currencyFormat' => 2,
  'currencyDecimalPlaces' => 2,
  'aclAllowDeleteCreated' => false,
  'aclAllowDeleteCreatedThresholdPeriod' => '24 hours',
  'attachmentAvailableStorageList' => NULL,
  'attachmentUploadMaxSize' => 256,
  'attachmentUploadChunkSize' => 4,
  'inlineAttachmentUploadMaxSize' => 20,
  'textFilterUseContainsForVarchar' => true,
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
  'emailForceUseExternalClient' => false,
  'useWebSocket' => false,
  'auth2FAMethodList' => [
    0 => 'Totp'
  ],
  'auth2FAInPortal' => false,
  'personNameFormat' => 'firstMiddleLast',
  'newNotificationCountInTitle' => false,
  'pdfEngine' => 'Dompdf',
  'smsProvider' => NULL,
  'mapProvider' => 'Google',
  'defaultFileStorage' => 'EspoUploadDir',
  'ldapUserNameAttribute' => 'sAMAccountName',
  'ldapUserFirstNameAttribute' => 'givenName',
  'ldapUserLastNameAttribute' => 'sn',
  'ldapUserTitleAttribute' => 'title',
  'ldapUserEmailAddressAttribute' => 'mail',
  'ldapUserPhoneNumberAttribute' => 'telephoneNumber',
  'ldapUserObjectClass' => 'person',
  'ldapPortalUserLdapAuth' => false,
  'passwordGenerateLength' => 10,
  'massActionIdleCountThreshold' => 100,
  'exportIdleCountThreshold' => 1000,
  'oidcJwtSignatureAlgorithmList' => [
    0 => 'RS256'
  ],
  'oidcUsernameClaim' => 'preferred_username',
  'oidcFallback' => false,
  'oidcScopes' => [
    0 => 'profile',
    1 => 'email',
    2 => 'phone'
  ],
  'listViewSettingsDisabled' => false,
  'cleanupDeletedRecords' => true,
  'phoneNumberNumericSearch' => true,
  'phoneNumberInternational' => true,
  'phoneNumberPreferredCountryList' => [
    0 => 'us'
  ],
  'wysiwygCodeEditorDisabled' => false,
  'customPrefixDisabled' => false,
  'listPagination' => true,
  'cacheTimestamp' => 1749347234,
  'microtime' => 1749347234.935089,
  'siteUrl' => 'https://nurds.crm.nurds.com',
  'fullTextSearchMinLength' => 4,
  'appTimestamp' => 1722049680,
  'oidcLogoutUrl' => '{siteUrl}',
  'auth2FA' => false,
  'passwordStrengthLength' => NULL,
  'passwordStrengthLetterCount' => NULL,
  'passwordStrengthBothCases' => false,
  'passwordStrengthNumberCount' => NULL,
  'passwordRecoveryDisabled' => false,
  'passwordRecoveryForAdminDisabled' => false,
  'passwordRecoveryNoExposure' => false,
  'passwordRecoveryForInternalUsersDisabled' => false,
  'oidcTeamsIds' => [],
  'oidcTeamsNames' => (object) [],
  'oidcTeamsColumns' => (object) [],
  'maintenanceMode' => false,
  'cronDisabled' => false,
  'fiscalYearShift' => 0,
  'addressCountryList' => [],
  'addressCityList' => [],
  'addressStateList' => [],
  'emailAddressIsOptedOutByDefault' => false,
  'workingTimeCalendarName' => NULL,
  'workingTimeCalendarId' => NULL,
  'addons' => 'property_lookup,person_lookup',
  'planType' => 'Enterprise',
  'appLogAdminAllowed' => false,
  'notePinnedMaxCount' => 5,
  'phoneNumberExtensions' => true,
  'starsLimit' => 500,
  'quickSearchFullTextAppendWildcard' => true,
  'authIpAddressCheck' => false,
  'authIpAddressWhitelist' => [],
  'authIpAddressCheckExcludedUsersIds' => [],
  'authIpAddressCheckExcludedUsersNames' => (object) [],
  'latestVersion' => '9.1.5',
  'userThemesDisabled' => false,
  'avatarsDisabled' => false,
  'scopeColorsDisabled' => false,
  'tabIconsDisabled' => false,
  'dashletsOptions' => (object) [],
  'tabQuickSearch' => true,
  'passwordStrengthSpecialCharacterCount' => NULL,
  'availableReactions' => [
    0 => 'Like',
    1 => 'Dislike',
    2 => 'Love',
    3 => 'Smile',
    4 => 'Surprise',
    5 => 'Laugh',
    6 => 'Meh',
    7 => 'Sad'
  ],
  'streamReactionsCheckMaxSize' => 50,
  'emailScheduledBatchCount' => 50,
  'emailAddressMaxCount' => 10,
  'phoneNumberMaxCount' => 10,
  'integrations' => (object) [
    'Google' => true,
    'GoogleReCaptcha' => true
  ],
  'eInvoiceFormat' => 'Peppol',
  'sellerCompanyName' => 'Nurds Inc',
  'sellerElectronicAddressScheme' => 'EM',
  'sellerTaxRegistrationScheme' => '9959',
  'sellerTaxRegistrationIdentifier' => '88-3276740',
  'sellerElectronicAddressIdentifier' => 'support@nurds.com',
  'sellerAddressPostalCode' => '85233',
  'sellerAddressStreet' => '865 E Baseline Road STE 1026',
  'sellerAddressState' => 'AZ',
  'sellerAddressCity' => 'Gilbert',
  'sellerAddressCountry' => 'USA',
  'sellerContactName' => 'Amber Shannon',
  'sellerContactEmailAddress' => 'amber@nurds.com',
  'sellerContactPhoneNumber' => '(678) 570-9503',
  'priceBooksEnabled' => false,
  'defaultPriceBookName' => NULL,
  'defaultPriceBookId' => NULL,
  'inventoryTransactionsEnabled' => false,
  'warehousesEnabled' => false,
  'salesForbidOrderUnlock' => false,
  'sellerVatNumber' => NULL,
  'outboundEmailBccAddress' => NULL,
  'massEmailOpenTracking' => true,
  'massEmailDisableMandatoryOptOutLink' => true
];
