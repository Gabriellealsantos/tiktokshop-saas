package com.venyx.tiktokshop.services;

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
    private static final long MAX_PIXELS = 40_000_000L;
    private static final float JPEG_QUALITY = 0.88f;

    public byte[] toJpeg(byte[] content) {
        BufferedImage source = read(content);
        BufferedImage scaled = downscale(source);
        return write(flatten(scaled));
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

    private byte[] write(BufferedImage image) {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(JPEG_QUALITY);

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
}
