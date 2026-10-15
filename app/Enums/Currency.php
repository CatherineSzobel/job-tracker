<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

/**
 * The currencies a salary range can be in (ISO 4217 codes); euros unless the user picks another.
 */
enum Currency: string
{
    use HasValues;

    case Eur = 'EUR';
    case Usd = 'USD';
    case Gbp = 'GBP';
    case Chf = 'CHF';
    case Sek = 'SEK';
    case Nok = 'NOK';
    case Dkk = 'DKK';
    case Pln = 'PLN';
    case Czk = 'CZK';
    case Cad = 'CAD';
    case Aud = 'AUD';
}
