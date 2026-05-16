export type ProductImageSource = {
  id: string | number;
  product_id?: string | number;
  image_url?: string | null;
};

function toNumericProductId(value: string | number | undefined | null) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && /^[1-9]\d*$/.test(value)) {
    return Number(value);
  }

  return null;
}

export function getProductImageSrc(item: ProductImageSource) {
  if (item.image_url) {
    return item.image_url;
  }

  const numericProductId = toNumericProductId(item.product_id) ?? toNumericProductId(item.id);
  if (!numericProductId) {
    return '';
  }

  return `/api/products/image?id=${numericProductId}`;
}

export function getProductImageCandidates(item: ProductImageSource) {
  const candidates: string[] = [];
  const numericProductId = toNumericProductId(item.product_id) ?? toNumericProductId(item.id);

  if (numericProductId) {
    candidates.push(`/api/products/image?id=${numericProductId}`);
  }

  if (item.image_url && !candidates.includes(item.image_url)) {
    candidates.push(item.image_url);
  }

  return candidates;
}
