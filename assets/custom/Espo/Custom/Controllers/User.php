<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\Exceptions\Forbidden;
use stdClass;

class User extends \Espo\Controllers\User
{
    public function getActionList(Request $request, Response $response): stdClass
    {
        $result = parent::getActionList($request, $response);

        // Only apply filter if not super admin
        if (!$this->user->isSuperAdmin()) {
            $filtered = array_filter($result->list, function ($item) {
                return $item->userName !== 'nurds_api';
            });

            $filtered = array_values($filtered);

            return (object) [
                'list' => $filtered,
                'total' => count($filtered),
                'hasMore' => $result->hasMore ?? false,
                'offset' => $result->offset ?? 0,
            ];
        }

        // Super admin sees everything
        return $result;
    }
}