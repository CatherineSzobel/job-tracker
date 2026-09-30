<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

/**
 * What happens to an application's open to-dos when it's archived.
 */
enum ArchiveTodosAction: string
{
    use HasValues;

    case Ask = 'ask';
    case Delete = 'delete';
    case Keep = 'keep';
}
