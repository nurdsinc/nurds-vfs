<?php
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
 * License ID: 666d14eca4fd54205a89f2a8f2b55ea2
 ************************************************************************************/

use Espo\Core\Container;
use Espo\Core\DataManager;
use Espo\Core\InjectableFactory;
use Espo\Core\Utils\Config;
use Espo\Core\Utils\Metadata;
use Espo\Entities\ScheduledJob;
use Espo\Entities\Template;
use Espo\avant\Modules\Advanced\Entities\BpmnUserTask;
use Espo\avant\Modules\Advanced\Entities\Report as Report;
use Espo\avant\Modules\Advanced\Entities\ReportCategory;
use Espo\ORM\EntityManager;

/**
 * @todo Hash IDs if ID type is uuid.
 */
class AfterInstall
{
    /** @var Container */
    private $container;

    public function run(Container $container, $params = [])
    {
        $this->container = $container;

        $isUpgrade = !empty($params['isUpgrade']);

        /** @var Metadata $metadata */
        $metadata = $this->container->get('metadata');
        /** @var EntityManager $entityManager */
        $entityManager = $this->container->get('entityManager');

        $template = $entityManager
            ->getRDBRepository(Template::ENTITY_TYPE)
            ->where(['entityType' => 'Report'])
            ->findOne();

        if (!$isUpgrade && !$template) {
            $template = $entityManager->getNewEntity(Template::ENTITY_TYPE);

            $template->set([
                'id' => $this->prepareId('Report001'),
                'entityType' => 'Report',
                'name' => 'Report (default)',
                'header' => $metadata->get(['entityDefs', 'Template', 'defaultTemplates', 'Report', 'header']),
                'body' => $metadata->get(['entityDefs', 'Template', 'defaultTemplates', 'Report', 'body']),
                'footer' => $metadata->get(['entityDefs', 'Template', 'defaultTemplates', 'Report', 'footer']),
            ]);

            try {
                $entityManager->saveEntity($template, ['createdById' => 'system']);
            }
            catch (Exception $e) {}
        }

        if (
            !$entityManager
                ->getRDBRepository(ScheduledJob::ENTITY_TYPE)
                ->where(['job' => 'ReportTargetListSync'])
                ->findOne()
        ) {
            $job = $entityManager->getNewEntity(ScheduledJob::ENTITY_TYPE);

            $job->set([
               'name' => 'Sync Target Lists with Reports',
               'job' => 'ReportTargetListSync',
               'status' => ScheduledJob::STATUS_ACTIVE,
               'scheduling' => '0 2 * * *',
            ]);

            $entityManager->saveEntity($job);
        }

        if (
            !$entityManager
                ->getRDBRepository(ScheduledJob::ENTITY_TYPE)
                ->where(['job' => 'ScheduleReportSending'])
                ->findOne()
        ) {

            $job = $entityManager->getNewEntity(ScheduledJob::ENTITY_TYPE);

            $job->set([
               'name' => 'Schedule Report Sending',
               'job' => 'ScheduleReportSending',
               'status' => ScheduledJob::STATUS_ACTIVE,
               'scheduling' => '0 * * * *',
            ]);

            $entityManager->saveEntity($job);
        }

        if (
            !$entityManager
                ->getRDBRepository(ScheduledJob::ENTITY_TYPE)
                ->where(['job' => 'RunScheduledWorkflows'])
                ->findOne()
        ) {
            $job = $entityManager->getNewEntity(ScheduledJob::ENTITY_TYPE);

            $job->set([
               'name' => 'Run Scheduled Workflows',
               'job' => 'RunScheduledWorkflows',
               'status' => ScheduledJob::STATUS_ACTIVE,
               'scheduling' => '*/10 * * * *',
            ]);

            $entityManager->saveEntity($job);
        }

        if (
            !$entityManager
                ->getRDBRepository(ScheduledJob::ENTITY_TYPE)
                ->where(['job' => 'ProcessPendingProcessFlows'])
                ->findOne()
        ) {
            $job = $entityManager->getNewEntity(ScheduledJob::ENTITY_TYPE);

            $job->set([
               'name' => 'Process Pending Flows',
               'job' => 'ProcessPendingProcessFlows',
               'status' => ScheduledJob::STATUS_ACTIVE,
               'scheduling' => '* * * * *',
            ]);

            $entityManager->saveEntity($job);
        }

        if (!$isUpgrade) {
            if (!$entityManager->getEntityById('Report', $this->prepareId('001'))) {
                foreach ($this->reportExampleDataList as $data) {
                    try {
                        $report = $entityManager->getNewEntity('Report');

                        $report->set($data);
                        $report->set('id', $this->prepareId($data['id']));

                        $entityManager->saveEntity($report);
                    }
                    catch (Exception $e) {}
                }

                if (!$entityManager->getEntityById('ReportCategory', $this->prepareId('examples'))) {
                    $entityManager->createEntity('ReportCategory', [
                        'id' => $this->prepareId('examples'),
                        'name' => 'Examples',
                        'order' => 100,
                    ]);
                }
            }
        }

        /** @var Config $config */
        $config = $this->container->get('config');

        $tabList = $config->get('tabList');
        $assignmentNotificationsEntityList = $config->get('assignmentNotificationsEntityList');

        /** @var InjectableFactory $injectableFactory */
        $injectableFactory = $this->container->get('injectableFactory');

        $configWriter = $injectableFactory->create(Config\ConfigWriter::class);

        if (!$isUpgrade) {
            if (!in_array('Report', $tabList)) {
                $tabList[] = 'Report';

                $configWriter->set('tabList', $tabList);
            }

            if (!in_array('BpmnUserTask', $assignmentNotificationsEntityList)) {
                $assignmentNotificationsEntityList[] = 'BpmnUserTask';

                $configWriter->set('assignmentNotificationsEntityList', $assignmentNotificationsEntityList);
            }
        }

        $configWriter->set('adminPanelIframeUrl', $this->getIframeUrl('advanced-pack'));
        $configWriter->save();

        $this->clearCache();
    }

    private function clearCache(): void
    {
        try {
            /** @var DataManager $dataManager */
            $dataManager = $this->container->get('dataManager');

            $dataManager->clearCache();
        }
        catch (Exception $e) {}
    }

    private $reportExampleDataList = [
        [
            'id' => '001',
            'name' => 'Leads by last activity',
            'entityType' => 'Lead',
            'type' => 'Grid',
            'columns' => [
                0 => 'COUNT:id',
            ],
            'chartColor' => '#6FA8D6',
            'chartType' => 'BarVertical',
            'depth' => 2,
            'isInternal' => true,
            'internalClassName' => 'Advanced:LeadsByLastActivity',
            'categoryId' => 'examples',
        ],
        [
            'id' => '002',
            'name' => 'Opportunities won',
            'entityType' => 'Opportunity',
            'type' => 'List',
            'columns' => [
                0 => 'name',
                1 => 'account',
                2 => 'closeDate',
                3 => 'amount',
            ],
            'runtimeFilters' => [
                0 => 'closeDate',
            ],
            'filtersData' => [
            ],
            'chartColor' => '#6FA8D6',
            'categoryId' => 'examples',
        ],
        [
            'id' => '003',
            'name' => 'Calls by account and user',
            'entityType' => 'Call',
            'type' => 'Grid',
            'columns' => [
                0 => 'COUNT:id',
            ],
            'groupBy' => [
                0 => 'account',
                1 => 'assignedUser',
            ],
            'filtersDataList' => [
                0 => [
                    'id' => '4c2388c1c4172',
                    'name' => 'status',
                    'params' =>
                        [
                            'type' => 'in',
                            'value' =>
                                [
                                    0 => 'Held',
                                ],
                            'data' => [
                                'type' => 'anyOf',
                                'valueList' => [
                                    0 => 'Held',
                                ],
                            ],
                            'field' => 'status',
                            'attribute' => 'status',
                        ],
                ],
            ],
            'runtimeFilters' => [
                0 => 'dateStart',
            ],
            'chartColor' => '#6FA8D6',
            'chartType' => 'BarVertical',
            'categoryId' => 'examples',
        ],
        [
            'id' => '004',
            'name' => 'Opportunities by lead source and user',
            'entityType' => 'Opportunity',
            'type' => 'Grid',
            'columns' => [
                0 => 'COUNT:id',
                1 => 'SUM:amountWeightedConverted',
            ],
            'groupBy' => [
                0 => 'assignedUser',
                1 => 'leadSource',
            ],
            'orderBy' => [
                0 => 'LIST:leadSource',
                1 => 'ASC:assignedUser',
            ],
            'chartColor' => '#6FA8D6',
            'chartType' => 'BarVertical',
            'categoryId' => 'examples',
        ],
        [
            'id' => '005',
            'name' => 'Leads by user',
            'entityType' => 'Lead',
            'type' => 'Grid',
            'columns' => [
                0 => 'COUNT:id',
            ],
            'groupBy' => [
                0 => 'assignedUser',
            ],
            'orderBy' => [
                0 => 'ASC:assignedUser',
            ],
            'filtersDataList' => [
                0 => [
                    'id' => '52566133e5c87',
                    'name' => 'status',
                    'params' =>
                        [
                            'type' => 'in',
                            'value' =>
                                [
                                    0 => 'New',
                                    1 => 'Assigned',
                                    2 => 'In Process',
                                ],
                            'data' => [
                                'type' => 'anyOf',
                                'valueList' => [
                                    0 => 'New',
                                    1 => 'Assigned',
                                    2 => 'In Process',
                                ],
                            ],
                            'field' => 'status',
                            'attribute' => 'status',
                        ],
                ],
            ],
            'chartColor' => '#6FA8D6',
            'chartType' => 'BarVertical',
            'categoryId' => 'examples',
        ],
        [
            'id' => '006',
            'name' => 'Opportunities by user',
            'entityType' => 'Opportunity',
            'type' => 'Grid',
            'columns' => [
                0 => 'COUNT:id',
                1 => 'SUM:amountWeightedConverted',
                2 => 'SUM:amountConverted',
            ],
            'groupBy' => [
                0 => 'assignedUser',
            ],
            'orderBy' => [
                0 => 'ASC:assignedUser',
            ],
            'filtersDataList' => [
                0 => [
                    'id' => 'd955e51247b15',
                    'name' => 'stage',
                    'params' =>
                        [
                            'type' => 'in',
                            'value' =>
                                [
                                    0 => 'Prospecting',
                                    1 => 'Qualification',
                                    2 => 'Proposal/Price Quote',
                                    3 => 'Negotiation/Review',
                                ],
                            'data' => [
                                'type' => 'anyOf',
                                'valueList' => [
                                    0 => 'Prospecting',
                                    1 => 'Qualification',
                                    2 => 'Proposal/Price Quote',
                                    3 => 'Negotiation/Review',
                                ],
                            ],
                            'field' => 'stage',
                            'attribute' => 'stage',
                        ],
                ],
            ],
            'chartColor' => '#6FA8D6',
            'chartType' => 'BarVertical',
            'categoryId' => 'examples',
        ],
        [
            'id' => '007',
            'name' => 'Revenue by month and user',
            'entityType' => 'Opportunity',
            'type' => 'Grid',
            'columns' => [
                0 => 'SUM:amountConverted',
            ],
            'groupBy' => [
                0 => 'MONTH:closeDate',
                1 => 'assignedUser',
            ],
            'orderBy' => [
                0 => 'ASC:assignedUser',
            ],
            'filtersDataList' => [
                0 => [
                    'id' => '449f09b3eb3d',
                    'name' => 'stage',
                    'params' =>
                        [
                            'type' => 'in',
                            'value' =>
                                [
                                    0 => 'Closed Won',
                                ],
                            'data' => [
                                'type' => 'anyOf',
                                'valueList' => [
                                    0 => 'Closed Won',
                                ],
                            ],
                            'field' => 'stage',
                            'attribute' => 'stage',
                        ],
                ],
            ],
            'runtimeFilters' => [
                0 => 'closeDate',
            ],
            'chartColor' => '#6FA8D6',
            'chartType' => 'Line',
            'categoryId' => 'examples',
        ],
        [
            'id' => '008',
            'name' => 'Leads by status',
            'entityType' => 'Lead',
            'type' => 'Grid',
            'data' => [
                'success' => 'Converted',
            ],
            'columns' => [
                0 => 'COUNT:id',
            ],
            'groupBy' => [
                0 => 'status',
            ],
            'orderBy' => [
                0 => 'LIST:status',
            ],
            'filtersDataList' => [
                0 => [
                    'id' => '86ca72143221d',
                    'name' => 'status',
                    'params' =>
                        [
                            'type' => 'in',
                            'value' =>
                                [
                                    0 => 'New',
                                    1 => 'Assigned',
                                    2 => 'In Process',
                                ],
                            'data' => [
                                'type' => 'anyOf',
                                'valueList' => [
                                    0 => 'New',
                                    1 => 'Assigned',
                                    2 => 'In Process',
                                ],
                            ],
                            'field' => 'status',
                            'attribute' => 'status',
                        ],
                ],
            ],
            'chartColor' => '#6FA8D6',
            'chartType' => 'BarHorizontal',
            'categoryId' => 'examples',
        ],
        [
            'id' => '009',
            'name' => 'Revenue by month',
            'entityType' => 'Opportunity',
            'type' => 'Grid',
            'data' => [
                'success' => 'Closed Won',
            ],
            'columns' => [
                0 => 'SUM:amountConverted',
            ],
            'groupBy' => [
                0 => 'MONTH:closeDate',
            ],
            'filtersDataList' => [
                0 => [
                    'id' => '429ccdc389055',
                    'name' => 'stage',
                    'params' =>
                        [
                            'type' => 'in',
                            'value' =>
                                [
                                    0 => 'Closed Won',
                                ],
                            'data' => [
                                'type' => 'anyOf',
                                'valueList' => [
                                    0 => 'Closed Won',
                                ],
                            ],
                            'field' => 'stage',
                            'attribute' => 'stage',
                        ],
                ],
            ],
            'runtimeFilters' => [
                0 => 'closeDate',
            ],
            'chartColor' => '#6FA8D6',
            'chartType' => 'BarVertical',
            'categoryId' => 'examples',
        ],
        [
            'id' => '010',
            'name' => 'Leads by source',
            'entityType' => 'Lead',
            'type' => 'Grid',
            'columns' => [
                0 => 'COUNT:id',
            ],
            'groupBy' => [
                0 => 'source',
            ],
            'orderBy' => [
                0 => 'LIST:source',
            ],
            'filtersDataList' => [
                0 => [
                    'id' => 'af614c422212d',
                    'name' => 'status',
                    'params' =>
                        [
                            'type' => 'in',
                            'value' =>
                                [
                                    0 => 'New',
                                    1 => 'Assigned',
                                    2 => 'In Process',
                                ],
                            'data' => [
                                'type' => 'anyOf',
                                'valueList' => [
                                    0 => 'New',
                                    1 => 'Assigned',
                                    2 => 'In Process',
                                ],
                            ],
                            'field' => 'status',
                            'attribute' => 'status',
                        ],
                ],
            ],
            'chartColor' => '#6FA8D6',
            'chartType' => 'Pie',
            'categoryId' => 'examples',
        ],
    ];

    private function getIframeUrl(string $name): string
    {
        /** @var Config $config */
        $config = $this->container->get('config');

        $iframeUrl = $config->get('adminPanelIframeUrl');

        if (empty($iframeUrl) || trim($iframeUrl) == '/') {
            $iframeUrl = 'https://s.espocrm.com/';
        }

        $iframeUrl = $this->urlFixParam($iframeUrl);

        return self::urlAddParam($iframeUrl, $name, '666d14eca4fd54205a89f2a8f2b55ea2');
    }

    private function urlFixParam(string $url): string
    {
        if (preg_match('/\/&(.+?)=(.+?)\//i', $url, $match)) {
            $fixedUrl = str_replace($match[0], '/', $url);

            if (!empty($match[1])) {
                $url = self::urlAddParam($fixedUrl, $match[1], $match[2]);
            }
        }

        $url = preg_replace('/^(\/\?)+/', 'https://s.espocrm.com/?', $url);
        $url = preg_replace('/\/\?&/', '/?', $url);
        return preg_replace('/\/&/', '/?', $url);
    }

    private static function urlAddParam(string $url, string $paramName, $paramValue): string
    {
        $urlQuery = parse_url($url, \PHP_URL_QUERY);

        if (!$urlQuery) {
            $params = [
                $paramName => $paramValue
            ];

            $url = trim($url);
            /** @var string $url */
            $url = preg_replace('/\/\?$/', '', $url);
            /** @var string $url */
            $url = preg_replace('/\/$/', '', $url);

            return $url . '/?' . http_build_query($params);
        }

        parse_str($urlQuery, $params);

        if (!isset($params[$paramName]) || $params[$paramName] != $paramValue) {
            $params[$paramName] = $paramValue;

            return str_replace($urlQuery, http_build_query($params), $url);
        }

        return $url;
    }

    private function prepareId(string $id): string
    {
        /** @var Metadata $metadata */
        $metadata = $this->container->get('metadata');

        $toHash =
            $metadata->get(['app', 'recordId', 'type']) === 'uuid4' ||
            $metadata->get(['app', 'recordId', 'dbType']) === 'uuid';

        if ($toHash) {
            return md5($id);
        }

        return $id;
    }
}
