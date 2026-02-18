export function getThumbnailUrl(src: string): string {
  const lastSlash = src.lastIndexOf('/');
  if (lastSlash === -1) return src;

  const dir = src.slice(0, lastSlash + 1);
  const filename = src.slice(lastSlash + 1);

  const dotIndex = filename.lastIndexOf('.');
  const base = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;

  return `${dir}thumb_${base}.jpg`;
}
