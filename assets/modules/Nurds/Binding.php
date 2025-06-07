<?php

namespace Espo\Modules\Nurds;

use Espo\Core\Binding\Binder;
use Espo\Core\Binding\BindingProcessor;

class Binding implements BindingProcessor
{
    public function process(Binder $binder): void
    {
        $this->bindServices($binder);
    }

    private function bindServices(Binder $binder): void
    {
        $binder->bindService(
            'Espo\Modules\Nurds\Entities\NurdsProfile',  // Your entity class
            'nurdsprofile'                 // The service name (lowercase)
        );
    }
}
