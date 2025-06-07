<?php

namespace Espo\avant\Custom\Controllers;


class Dealflow extends \Espo\Core\Templates\Controllers\Base
{
     public function actionList($params, $data, $request)
    {
        $entityManager = $this->getEntityManager();
            $claimId = $params['id'];

            $claimRepository = $entityManager->getRepository('Claims');
            $claimsData =  $claimRepository
                    ->find();
        
        return array(
            'list' =>$claimsData->toArray()
        );
    }
}
