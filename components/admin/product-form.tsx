"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormEvent, useState } from "react";
import type { CatalogBrand, CatalogCategory } from "@/lib/catalog";
import { slugify } from "@/lib/site";

type ProductFormProduct = {
  id: string;
  name: string;
  slug: string;
  brandId?: string | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
  sku?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  price?: string | number | null;
  currency: string;
  availability: string;
  featured: boolean;
  published: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  imageAltText?: string | null;
  specificationLines?: string;
  images?: { url: string; alt?: string | null }[];
};

export function ProductForm({
  product,
  brands,
  categories,
}: {
  product?: ProductFormProduct;
  brands: CatalogBrand[];
  categories: CatalogCategory[];
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const formData = new FormData(event.currentTarget);

    if (!formData.get("slug")) {
      formData.set("slug", slugify(String(formData.get("name") || "")));
    }

    const response = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product ? "PUT" : "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Unable to save product." }));
      setError(data.error || "Unable to save product.");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded border border-zinc-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Name
          <input
            name="name"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!product && !slug) {
                setSlug(slugify(event.target.value));
              }
            }}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Slug
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Brand
          <select
            name="brandId"
            defaultValue={product?.brandId || ""}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          >
            <option value="">No brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Category
          <select
            name="categoryId"
            defaultValue={product?.categoryId || ""}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.parent ? `${category.parent.name} / ${category.name}` : category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Subcategory
          <select
            name="subcategoryId"
            defaultValue={product?.subcategoryId || ""}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          >
            <option value="">No subcategory</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.parent ? `${category.parent.name} / ${category.name}` : category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          SKU/model
          <input
            name="sku"
            defaultValue={product?.sku || ""}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Price
          <input
            name="price"
            inputMode="decimal"
            defaultValue={product?.price ?? ""}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Currency
          <input
            name="currency"
            defaultValue={product?.currency || "USD"}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Availability
          <select
            name="availability"
            defaultValue={product?.availability || "ON_REQUEST"}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          >
            <option value="IN_STOCK">In Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="ON_REQUEST">On Request</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Short description
        <textarea
          name="shortDescription"
          defaultValue={product?.shortDescription || ""}
          className="min-h-24 rounded border border-zinc-200 p-3 outline-none focus:border-zinc-950"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Full description
        <textarea
          name="fullDescription"
          defaultValue={product?.fullDescription || ""}
          className="min-h-36 rounded border border-zinc-200 p-3 outline-none focus:border-zinc-950"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Specifications
        <textarea
          name="specifications"
          defaultValue={product?.specificationLines || ""}
          placeholder="Key: Value"
          className="min-h-36 rounded border border-zinc-200 p-3 font-mono text-sm outline-none focus:border-zinc-950"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Meta title
          <input
            name="metaTitle"
            defaultValue={product?.metaTitle || ""}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-700">
          Meta keywords
          <input
            name="metaKeywords"
            defaultValue={product?.metaKeywords || ""}
            className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Meta description
        <textarea
          name="metaDescription"
          defaultValue={product?.metaDescription || ""}
          className="min-h-24 rounded border border-zinc-200 p-3 outline-none focus:border-zinc-950"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Image alt text
        <input
          name="imageAltText"
          defaultValue={product?.imageAltText || ""}
          className="h-11 rounded border border-zinc-200 px-3 outline-none focus:border-zinc-950"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-700">
        Upload images
        <input
          name="images"
          type="file"
          multiple
          accept="image/*"
          className="rounded border border-zinc-200 p-3 text-sm"
        />
      </label>
      {product?.images?.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {product.images.map((image) => (
            <Image
              key={image.url}
              src={image.url}
              alt={image.alt || product.name}
              width={180}
              height={180}
              className="aspect-square rounded object-cover"
            />
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
          <input name="featured" type="checkbox" defaultChecked={product?.featured || false} />
          Featured
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
          <input name="published" type="checkbox" defaultChecked={product?.published ?? true} />
          Published
        </label>
      </div>
      {error ? <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:bg-zinc-400"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
