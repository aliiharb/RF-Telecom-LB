export type BrandRecord = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
  parent?: CategoryRecord | null;
};

export function serializeBrand(brand: BrandRecord) {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    description: brand.description,
    seoTitle: brand.seoTitle,
    seoDescription: brand.seoDescription,
    displayOrder: brand.displayOrder,
  };
}

export function serializeCategory(category: CategoryRecord) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    parent: category.parent
      ? {
          id: category.parent.id,
          name: category.parent.name,
          slug: category.parent.slug,
          parentId: category.parent.parentId,
          description: category.parent.description,
          seoTitle: category.parent.seoTitle,
          seoDescription: category.parent.seoDescription,
          displayOrder: category.parent.displayOrder,
        }
      : null,
    description: category.description,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    displayOrder: category.displayOrder,
  };
}
