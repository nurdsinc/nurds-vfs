<?php

namespace Espo\avant\Custom\Controllers;

class Stages extends \Espo\Core\Templates\Controllers\Base
{

    public function actionCreateLink($params, $data, $request)
    {

        if (!$request->isPost()) {
            throw new BadRequest();
        }

        if (empty($params['id']) || empty($params['link'])) {
            throw new BadRequest();
        }

        $id = $params['id'];
        $link = $params['link'];


        if (!empty($data['massRelate'])) {
            if (!is_array($data['where'])) {
                throw new BadRequest();
            }
            $where = json_decode(json_encode($data['where']), true);

            $selectData = null;
            if (isset($data['selectData']) && is_array($data['selectData'])) {
                $selectData = json_decode(json_encode($data['selectData']), true);
            }

            return $this->getRecordService()->linkEntityMass($id, $link, $where, $selectData);
        } else {
            $foreignIdList = array();
            if (isset($data['id'])) {
                $foreignIdList[] = $data['id'];
            }
            if (isset($data['ids']) && is_array($data['ids'])) {
                foreach ($data['ids'] as $foreignId) {
                    $foreignIdList[] = $foreignId;
                }
            }

            $this->checkEntity($id,$foreignIdList, $link);

            $result = false;
            foreach ($foreignIdList as $foreignId) {
                if ($this->getRecordService()->linkEntity($id, $link, $foreignId)) {
                    $result = true;
                }
            }
            if ($result) {
                return true;
            }
        }

        throw new Error();

    }

    /**
     * Check the link ids and remove all entity attached.
     * 
     * @param  string $stageId    [description]
     * @param  array $entityIds  [description]
     * @param  string $entityType [description]
     * @return array             [description]
     */
    private function checkEntity($stageId, $entityIds,$entityType='claims'){

        $em = $this->getEntityManager();

        $entity = $this->getRecordService()->getEntity($stageId);

        $accountId = $entity->get('accountId');
        $accountEntity = $em->getEntity('Account', $accountId);

        $stagesList =  $em->getRepository('Account')
                    ->findRelated($accountEntity, 'stages');
        
        foreach ($stagesList as $stage) {

            $stageEntities = $em->getRepository('Stage')
                    ->findRelated($stage, $entityType);
            if($stageEntities && count($stageEntities)>0){
                foreach ($stageEntities as $stageEntity) {
                    /**
                     * Check if the entity from the stage list 
                     * exist on the new entry.
                     * then remove all found entity.
                     */
                    if(in_array($stageEntity->get('id'), $entityIds)){

                        /**
                         * Remove all entity by id
                         */
                        foreach ($entityIds as $entityId) {
                            $em->getRepository('Stage')
                                ->unrelate($stage, $entityType, $entityId);
                        }
                    }
                }
                // return json_encode($claims->toArray());
            }
        }
        // return json_encode($stagesList->toArray());
    }
}
