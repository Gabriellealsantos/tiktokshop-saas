const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.92;

/**
 * Reduz a foto para MAX_DIMENSION no lado mais longo antes de subir. Foto de celular
 * sai com 12MP e 5MB, e o backend só guarda 2048px de qualquer forma: subir o original
 * é banda jogada fora e segundos a mais de upload no 4G do usuário.
 */
export async function downscaleImage(file: File): Promise<File> {
    try {
        const bitmap = await createImageBitmap(file);
        const longest = Math.max(bitmap.width, bitmap.height);
        if (longest <= MAX_DIMENSION) {
            bitmap.close();
            return file;
        }

        const ratio = MAX_DIMENSION / longest;
        const width = Math.round(bitmap.width * ratio);
        const height = Math.round(bitmap.height * ratio);

        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext("2d");
        if (!context) {
            bitmap.close();
            return file;
        }
        context.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: JPEG_QUALITY });
        return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
    } catch {
        return file;
    }
}