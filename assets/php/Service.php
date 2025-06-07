<?php
/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM – Open Source CRM application.
 * Copyright (C) 2014-2024 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

namespace Espo\Tools\Pdf;

use Espo\Core\Acl;
use Espo\Core\Exceptions\Error;
use Espo\Core\Exceptions\Forbidden;
use Espo\Core\Exceptions\NotFound;
use Espo\Core\Record\ServiceContainer;
use Espo\Core\Utils\Config;
use Espo\Entities\Template as TemplateEntity;
use Espo\ORM\EntityManager;
use Espo\Tools\Pdf\Data\DataLoaderManager;
use Espo\Tools\Stream\GlobalRecordService;
use Espo\Core\Select\SearchParams;
use Espo\Core\Select\Where\Item as WhereItem;
use Espo\Core\Utils\DateTime;
use Espo\Core\Utils\Language;

class Service
{
    private const DEFAULT_ENGINE = 'Dompdf';

    private EntityManager $entityManager;
    private Acl $acl;
    private ServiceContainer $serviceContainer;
    private DataLoaderManager $dataLoaderManager;
    private Config $config;
    private Builder $builder;
    private GlobalRecordService $globalRecordService;
    private DateTime $dateTime;
    private Language $language;
    public function __construct(
        EntityManager $entityManager,
        Acl $acl,
        ServiceContainer $serviceContainer,
        DataLoaderManager $dataLoaderManager,
        Config $config,
        Builder $builder,
        GlobalRecordService $globalRecordService,
        DateTime $dateTime,
        Language $language
    ) {
        $this->entityManager = $entityManager;
        $this->acl = $acl;
        $this->serviceContainer = $serviceContainer;
        $this->dataLoaderManager = $dataLoaderManager;
        $this->config = $config;
        $this->builder = $builder;
        $this->globalRecordService = $globalRecordService;
        $this->dateTime = $dateTime;
        $this->language = $language;
    }

    /**
     * Generate a PDF.
     *
     * @param string $entityType An entity type.
     * @param string $id A record ID.
     * @param string $templateId A template ID.
     * @param ?Params $params Params. If null, a params with the apply-acl will be used.
     * @params ?Data $data Data.
     *
     * @throws Error
     * @throws NotFound
     * @throws Forbidden
     */
    public function generate(
        string $entityType,
        string $id,
        string $templateId,
        ?Params $params = null,
        ?Data $data = null
    ): Contents {

        $params = $params ?? Params::create()->withAcl(true);

        $applyAcl = $params->applyAcl();

        $entity = $this->entityManager->getEntityById($entityType, $id);

        if (!$entity) {
            throw new NotFound("Record not found.");
        }

        /** @var ?TemplateEntity $template */
        $template = $this->entityManager->getEntityById(TemplateEntity::ENTITY_TYPE, $templateId);

        if (!$template) {
            throw new NotFound("Template not found.");
        }

        if ($applyAcl && !$this->acl->checkEntityRead($entity)) {
            throw new Forbidden("No access to record.");
        }

        if ($applyAcl && !$this->acl->checkEntityRead($template)) {
            throw new Forbidden("No access to template.");
        }

        $service = $this->serviceContainer->get($entityType);

        $service->loadAdditionalFields($entity);

        if (method_exists($service, 'loadAdditionalFieldsForPdf')) {
            // For bc.
            $service->loadAdditionalFieldsForPdf($entity);
        }

        if ($template->getTargetEntityType() !== $entityType) {
            throw new Error("Not matching entity types.");
        }

        // Fetch and process stream data using GlobalRecordService
        $searchParams = SearchParams::create()
            ->withWhere(
                WhereItem::createBuilder()
                    ->setAttribute('parentType')
                    ->setType(WhereItem\Type::EQUALS)
                    ->setValue($entityType)
                    ->build()
            )
            ->withWhereAdded(
                WhereItem::createBuilder()
                    ->setAttribute('parentId')
                    ->setType(WhereItem\Type::EQUALS)
                    ->setValue($id)
                    ->build()
            )
            ->withWhereAdded(
                WhereItem::createBuilder()
                    ->setAttribute('type')
                    ->setType(WhereItem\Type::EQUALS)
                    ->setValue('Post')
                    ->build()
            )
            ->withMaxSize(25);

        $streamData = $this->globalRecordService->find($searchParams)->getValueMapList();
        $streamData = array_map(function ($item) {
            $itemArray = (array) $item;
        
            if (!empty($itemArray['createdAt'])) {
                $itemArray['createdAt'] = $this->dateTime->convertSystemDateTime($itemArray['createdAt']);
            }
        
            return $itemArray;
        }, $streamData);

        $nurdsLogo = $this->config->get('nurdsLogo') ?? '';
        $entityLabel = $this->language->translateLabel($entity->getEntityType(), 'scopeNames');
        // Prepare your data for replacements
        $templateData = [
            'stream' => $streamData,
            'nurdsLogo' => $nurdsLogo,
            'nurdId' => strtoupper(TENANT),
            'entityType' => $entityType,
            'entityLabel' => $entityLabel,
            'recordId' => $id
            // Add more keys and values as needed
        ];

        // Convert the associative array into an object
        $data = ($data ?? Data::create())->withAdditionalTemplateData((object) $templateData);

        $data = $this->dataLoaderManager->load($entity, $params, $data);
        $engine = $this->config->get('pdfEngine') ?? self::DEFAULT_ENGINE;

        $printer = $this->builder
            ->setTemplate(new TemplateWrapper($template))
            ->setEngine($engine)
            ->build();

        return $printer->printEntity($entity, $params, $data);
    }
}
