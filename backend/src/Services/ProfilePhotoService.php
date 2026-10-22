<?php
declare(strict_types=1);
namespace DoaAqui\Services;
class ProfilePhotoService
{
    private static function arquivo(int $id): string { return dirname(__DIR__, 2) . '/storage/profile_photos/' . $id . '.json'; }
    public static function obter(int $id): ?string {
        $file = self::arquivo($id);
        if (!is_file($file)) return null;
        $url = json_decode((string) file_get_contents($file), true);
        return is_string($url) && preg_match('~^/uploads/[a-f0-9]{32}\.(jpg|jpeg|png|webp)$~', $url) ? $url : null;
    }
    public static function salvar(int $id, string $url): void {
        $file = self::arquivo($id);
        if (!is_dir(dirname($file))) mkdir(dirname($file), 0755, true);
        $old = self::obter($id);
        $temp = tempnam(dirname($file), 'photo-');
        if ($temp === false) throw new \RuntimeException('Falha ao salvar foto.');
        if (file_put_contents($temp, json_encode($url), LOCK_EX) === false || !rename($temp, $file)) {
            @unlink($temp);
            throw new \RuntimeException('Falha ao salvar foto.');
        }
        if ($old && $old !== $url) @unlink(dirname(__DIR__, 2) . '/public' . $old);
    }
    public static function excluir(int $id): void {
        $url = self::obter($id);
        if ($url) @unlink(dirname(__DIR__, 2) . '/public' . $url);
        if (is_file(self::arquivo($id))) unlink(self::arquivo($id));
    }
}
