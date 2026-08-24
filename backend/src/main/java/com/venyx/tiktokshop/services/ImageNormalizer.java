package com.venyx.tiktokshop.services;

import com.sksamuel.scrimage.ImmutableImage;
import com.sksamuel.scrimage.webp.WebpWriter;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.springframework.stereotype.Component;

import javax.imageio.*;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Iterator;

@Component
public class ImageNormalizer {

    private static final int MAX_DIMENSION = 2048;
    private static final long MAX_PIXELS = 8_000_000L;
    private static final float JPEG_QUALITY = 0.88f;
    private static final int WEBP_QUALITY = 92;

    /**
     * Qualidade das imagens de REFERÊNCIA mandadas ao modelo. Mais alta que a de exibição
     * porque a referência não é para ser vista: é o insumo que o modelo precisa reproduzir.
     * A image 1 do swap é justamente a cena que tem de voltar intacta, e cada geração de
     * JPEG apaga um pouco da textura fina — grão de parede, trama de tecido, ripado — que é
     * exatamente onde a deriva de fundo aparece primeiro.
     */
    private static final float REFERENCE_JPEG_QUALITY = 0.95f;

    public byte[] toJpeg(byte[] content) {
        BufferedImage source = read(content);
        BufferedImage scaled = downscale(source);
        return write(flatten(scaled), JPEG_QUALITY);
    }

    /**
     * Normaliza uma imagem para servir de referência ao modelo.
     *
     * <p>Quando o conteúdo já é JPEG dentro do limite de dimensão, ele passa direto: decodificar
     * e recodificar não ganharia nada e custaria mais uma geração de perda. É o caso do
     * resultado do swap de pessoa quando ele volta como base do swap de roupa.
     */
    public byte[] toReferenceJpeg(byte[] content) {
        if (isJpeg(content) && withinMaxDimension(content)) {
            return content;
        }
        BufferedImage source = read(content);
        BufferedImage scaled = downscale(source);
        return write(flatten(scaled), REFERENCE_JPEG_QUALITY);
    }

    private boolean isJpeg(byte[] content) {
        return content != null && content.length >= 3
                && (content[0] & 0xFF) == 0xFF
                && (content[1] & 0xFF) == 0xD8
                && (content[2] & 0xFF) == 0xFF;
    }

    /** Lê só o cabeçalho: descobrir o tamanho não deve custar a decodificação inteira. */
    private boolean withinMaxDimension(byte[] content) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(content))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                return false;
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(input);
                return Math.max(reader.getWidth(0), reader.getHeight(0)) <= MAX_DIMENSION;
            } finally {
                reader.dispose();
            }
        } catch (Exception e) {
            return false;
        }
    }

    public byte[] toWebp(byte[] content) {
        BufferedImage source = read(content);
        BufferedImage scaled = downscale(source);
        return writeWebp(flatten(scaled));
    }

    private BufferedImage read(byte[] content) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(content))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw new BusinessException("Formato de imagem não suportado. Envie JPG, PNG ou WEBP.");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(input);
                assertSafeDimensions(reader.getWidth(0), reader.getHeight(0));
                return reader.read(0);
            } finally {
                reader.dispose();
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Não foi possível ler a imagem enviada.");
        }
    }

    private void assertSafeDimensions(int width, int height) {
        if ((long) width * height > MAX_PIXELS) {
            throw new BusinessException("Imagem com resolução acima do permitido.");
        }
    }

    private BufferedImage downscale(BufferedImage source) {
        int width = source.getWidth();
        int height = source.getHeight();
        int longest = Math.max(width, height);
        if (longest <= MAX_DIMENSION) {
            return source;
        }
        double ratio = (double) MAX_DIMENSION / longest;
        int targetWidth = Math.max(1, (int) Math.round(width * ratio));
        int targetHeight = Math.max(1, (int) Math.round(height * ratio));

        BufferedImage target = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR );
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        graphics.drawImage(source, 0, 0, targetWidth, targetHeight, Color.WHITE, null);
        graphics.dispose();
        return target;
    }

    private BufferedImage flatten(BufferedImage source) {
        if (source.getType() == BufferedImage.TYPE_INT_RGB) {
            return source;
        }
        BufferedImage target = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        graphics.drawImage(source, 0, 0, Color.WHITE, null);
        graphics.dispose();
        return target;
    }

    private byte[] write(BufferedImage image, float quality) {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(quality);

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (ImageOutputStream stream = ImageIO.createImageOutputStream(output)) {
            writer.setOutput(stream);
            writer.write(null, new IIOImage(image, null, null), param);
        } catch (Exception e) {
            throw new BusinessException("Falha ao converter a imagem.");
        } finally {
            writer.dispose();
        }
        return output.toByteArray();
    }

    private byte[] writeWebp(BufferedImage image) {
        try {
            return ImmutableImage.wrapAwt(image).bytes(WebpWriter.DEFAULT.withQ(WEBP_QUALITY));
        } catch (Exception e) {
            throw new BusinessException("Falha ao converter a imagem.");
        }
    }
}
