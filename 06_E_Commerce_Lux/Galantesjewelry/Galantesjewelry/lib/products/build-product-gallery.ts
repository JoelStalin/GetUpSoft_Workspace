import type { ProductGalleryImage, ShopProduct } from '@/lib/odoo/client';

export type GalleryImage = {
  id?: number | string;
  url: string;
  altText: string;
  sequence?: number;
  isPrimary?: boolean;
};

type ProductGallerySource = Pick<
  ShopProduct,
  'name' | 'imageUrl' | 'gallery' | 'galleryImages'
>;

function dedupeByUrl(images: GalleryImage[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (!image.url || seen.has(image.url)) {
      return false;
    }
    seen.add(image.url);
    return true;
  });
}

export function buildProductGallery(product: ProductGallerySource): GalleryImage[] {
  const images: GalleryImage[] = [];

  if (product.imageUrl) {
    images.push({
      id: 'primary',
      url: product.imageUrl,
      altText: product.name,
      sequence: 0,
      isPrimary: true,
    });
  }

  if (product.galleryImages?.length) {
    for (const img of product.galleryImages) {
      if (!img.url) continue;
      images.push({
        id: img.id,
        url: img.url,
        altText: img.altText || product.name,
        sequence: img.sequence ?? 10,
      });
    }
    return dedupeByUrl(images).sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0));
  }

  if (product.gallery?.length) {
    product.gallery.forEach((url, index) => {
      if (!url) return;
      images.push({
        id: `gallery-${index}`,
        url,
        altText: product.name,
        sequence: index + 1,
      });
    });
  }

  return dedupeByUrl(images).sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0));
}

export function toGalleryImageMetadata(image: GalleryImage): ProductGalleryImage | null {
  if (!image.url) {
    return null;
  }

  return {
    id: typeof image.id === 'number' ? image.id : 0,
    url: image.url,
    altText: image.altText,
    sequence: image.sequence,
  };
}
