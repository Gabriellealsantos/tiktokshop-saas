type S3ImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * <img> para mídia servida do S3. Força crossOrigin="anonymous" para que o
 * browser carregue com contexto CORS desde a primeira requisição — sem isso,
 * uma carga sem Origin polui o cache e quebra fetch/canvas posterior sobre a
 * mesma URL (tainted cache). O caller pode sobrescrever passando crossOrigin.
 */
export function S3Image({ crossOrigin = "anonymous", ...props }: S3ImageProps) {
  return <img crossOrigin={crossOrigin} {...props} />;
}
