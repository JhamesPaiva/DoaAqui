<?php

declare(strict_types=1);

namespace DoaAqui\Support;

/**
 * O ENUM status_item no banco usa "Disponivel" (sem acento — assim está no modelo ER
 * e no schema.sql já entregues). O front-end (mockado no localStorage) já usa
 * "Disponível" com acento em toda a interface. Em vez de escolher um lado e obrigar
 * o outro a mudar, essa classe isola a conversão num único lugar: o banco nunca vê
 * acento, o front-end nunca vê a grafia sem acento.
 */
class Enums
{
    private const STATUS_ITEM_DB_PARA_APP = [
        'Disponivel' => 'Disponível',
        'Reservado' => 'Reservado',
        'Doado' => 'Doado',
    ];

    public const STATUS_ITEM_VALIDOS_APP = ['Disponível', 'Reservado', 'Doado'];

    public static function statusItemParaApp(string $valorDb): string
    {
        return self::STATUS_ITEM_DB_PARA_APP[$valorDb] ?? $valorDb;
    }

    public static function statusItemParaDb(string $valorApp): ?string
    {
        $mapaInverso = array_flip(self::STATUS_ITEM_DB_PARA_APP);
        return $mapaInverso[$valorApp] ?? null;
    }
}
