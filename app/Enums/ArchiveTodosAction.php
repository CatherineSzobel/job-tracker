<?php

namespace App\Enums;

/**
 * What happens to an application's open to-dos when it's archived.
 */
enum ArchiveTodosAction: string
{
    case Ask = 'ask';
    case Delete = 'delete';
    case Keep = 'keep';
}
