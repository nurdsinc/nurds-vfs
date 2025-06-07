<?php

namespace Espo\Modules\Nurds\Entities;

class NurdsProfile extends \Espo\Core\ORM\Entity
{
    public const ENTITY_TYPE = 'NurdsProfile';

    /**
     * For backward compatibility.
     * @deprecated
     * @return null
     */
    public function getSmtpParams()
    {
        return null;
    }

    public function getTimeZone(): ?string
    {
        return $this->get('timeZone');
    }

    public function getLanguage(): ?string
    {
        return $this->get('language');
    }
}
