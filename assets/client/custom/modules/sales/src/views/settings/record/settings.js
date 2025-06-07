/***********************************************************************************
 * The contents of this file are subject to the Extension License Agreement
 * ("Agreement") which can be viewed at
 * https://www.espocrm.com/extension-license-agreement/.
 * By copying, installing downloading, or using this file, You have unconditionally
 * agreed to the terms and conditions of the Agreement, and You may not use this
 * file except in compliance with the Agreement. Under the terms of the Agreement,
 * You shall not license, sublicense, sell, resell, rent, lease, lend, distribute,
 * redistribute, market, publish, commercialize, or otherwise transfer rights or
 * usage to the software or any modified version or derivative work of the software
 * created by or for you.
 *
 * Copyright (C) 2015-2024 Letrium Ltd.
 *
 * License ID: 799ba07927a6a02c6a0ae59de64ec1ec
 ************************************************************************************/

define('sales:views/settings/record/settings', ['views/settings/record/edit'], function (Dep) {

    return class extends Dep {

        setup() {
            this.setupDetailLayout();

            super.setup();

            const version = this.getConfig().get('version');

            if (version) {
                const [major] = version.split('.');

                if (parseInt(major) < 8) {
                    this.setFieldReadOnly('inventoryTransactionsEnabled')
                    this.setFieldReadOnly('warehousesEnabled')
                }
            }
        }

        setupDetailLayout() {
            this.detailLayout = [
                {
                    tabLabel: this.translate('General', 'labels', 'Settings'),
                    rows: [
                        [
                            {
                                name: 'priceBooksEnabled',
                            },
                            {
                                name: 'defaultPriceBook',
                            }
                        ],
                    ]
                },
                {
                    rows: [
                        [
                            {
                                name: 'inventoryTransactionsEnabled',
                            },
                            {
                                name: 'warehousesEnabled',
                            },
                        ],
                        [
                            {
                                name: 'salesForbidOrderUnlock'
                            },
                            false
                        ]
                    ]
                },
                {
                    tabLabel: this.translate('Electronic Invoicing', 'labels', 'Settings'),
                    tabBreak: true,
                    rows: [
                        [
                            {
                                name: 'eInvoiceFormat'
                            },
                            false
                        ]
                    ]
                },
                {
                    label: this.translate('Seller Information', 'labels', 'Settings'),
                    rows: [
                        [
                            {
                                name: 'sellerCompanyName'
                            },
                            {
                                name: 'sellerVatNumber'
                            }
                        ],
                        [
                            {
                                name: 'sellerElectronicAddressScheme'
                            },
                            {
                                name: 'sellerElectronicAddressIdentifier'
                            }
                        ],
                        [
                            {
                                name: 'sellerTaxRegistrationScheme'
                            },
                            {
                                name: 'sellerTaxRegistrationIdentifier'
                            }
                        ],
                        [
                            {
                                name: "sellerAddress"
                            },
                            false
                        ],
                        [
                            {
                                name: 'sellerContactName',
                            },
                            false
                        ],
                        [
                            {
                                name: 'sellerContactEmailAddress',
                            },
                            {
                                name: 'sellerContactPhoneNumber',
                            }
                        ]
                    ]
                }
            ];
        }
    }
});
