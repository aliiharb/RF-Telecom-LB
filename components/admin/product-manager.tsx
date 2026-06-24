"use client";

import { Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { AdminCategoryOption } from "@/lib/admin-product-taxonomy";
import type { AdminBrandOption, AdminManagedProduct, AdminProductImage, AdminProductStatus } from "@/lib/admin-products";
import { slugify } from "@/lib/site";

type ProductFormState = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  weight: string;
  color: string;
  sku: string;
  status: AdminProductStatus;
  brandId: string;
  specPdfUrl: string;
  images: Array<Omit<AdminProductImage, "id"> & { id?: string }>;
  categoryId: string;
  subcategoryIds: string[];
};

const emptyForm: ProductFormState = {
  title: "",
  slug: "",
  description: "",
  price: "",
  weight: "",
  color: "",
  sku: "",
  status: "draft",
  brandId: "",
  specPdfUrl: "",
  images: [],
  categoryId: "",
  subcategoryIds: [],
};

function productToForm(product: AdminManagedProduct, categories: AdminCategoryOption[]): ProductFormState {
  const categoryId =
    product.categoryId ||
    categories.find((category) => category.subcategories.some((subcategory) => product.subcategoryIds.includes(subcategory.id)))?.id ||
    "";

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description || "",
    price: product.price === null ? "" : product.price.toFixed(2),
    weight: product.weight === null ? "" : String(product.weight),
    color: product.color || "",
    sku: product.sku || "",
    status: product.status,
    brandId: product.brandId ? String(product.brandId) : "",
    specPdfUrl: product.specPdfUrl || "",
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      position: image.position,
      isPrimary: image.isPrimary,
    })),
    categoryId: String(categoryId),
    subcategoryIds: product.subcategoryIds,
  };
}

function statusLabel(status: AdminProductStatus) {
  return status[0].toUpperCase() + status.slice(1);
}

function formatDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function ProductManager({
  initialProducts,
  categories,
  brands,
}: {
  initialProducts: AdminManagedProduct[];
  categories: AdminCategoryOption[];
  brands: AdminBrandOption[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [uploading, setUploading] = useState("");
  const [stayAndClear, setStayAndClear] = useState(true);
  const [slugTouched, setSlugTouched] = useState(false);

  const selectedCategory = categories.find((category) => String(category.id) === form.categoryId) || null;
  const subcategoryOptions = selectedCategory?.subcategories || [];

  const filteredProducts = useMemo(() => {
    const title = filterTitle.trim().toLowerCase();
    return products.filter((product) => {
      const matchesTitle = !title || product.title.toLowerCase().includes(title);
      const matchesCategory = !filterCategory || String(product.categoryId) === filterCategory;
      const matchesBrand = !filterBrand || String(product.brandId || "") === filterBrand;
      const matchesStatus = !filterStatus || product.status === filterStatus;
      return matchesTitle && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [filterBrand, filterCategory, filterStatus, filterTitle, products]);

  function updateForm(patch: Partial<ProductFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function resetForm() {
    setForm(emptyForm);
    setErrors({});
    setSlugTouched(false);
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    const price = Number(form.price);

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }
    if (!form.slug.trim()) {
      nextErrors.slug = "Slug is required.";
    }
    if (form.price.trim() && (!Number.isFinite(price) || price < 0)) {
      nextErrors.price = "Price must be 0 or greater.";
    }

    setErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!validate()) {
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: form.price.trim() ? Number(form.price).toFixed(2) : null,
      weight: form.weight.trim() ? Number(form.weight) : null,
      color: form.color.trim() || null,
      sku: form.sku.trim() || null,
      status: form.status,
      brandId: form.brandId ? Number(form.brandId) : null,
      specPdfUrl: form.specPdfUrl || null,
      subcategoryIds: form.subcategoryIds,
      images: form.images.map((image, index) => ({
        url: image.url,
        position: index,
        isPrimary: image.isPrimary,
      })),
    };

    const response = await fetch(form.id ? `/api/admin/products/${form.id}` : "/api/admin/products", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setErrors(data.errors || {});
      setMessage(data.error || "Unable to save product.");
      setSaving(false);
      return;
    }

    const saved = data.product as AdminManagedProduct;
    setProducts((current) => {
      const exists = current.some((product) => product.id === saved.id);
      return exists
        ? current.map((product) => (product.id === saved.id ? saved : product))
        : [saved, ...current];
    });
    setMessage(form.id ? "Product updated." : "Product created.");
    setSaving(false);

    if (!form.id && stayAndClear) {
      resetForm();
    } else if (form.id) {
      setForm(productToForm(saved, categories));
    }
  }

  async function uploadFiles(kind: "images" | "pdf", files: FileList | null) {
    if (!files?.length) return;
    if (kind === "pdf" && files[0].type !== "application/pdf") {
      setErrors((current) => ({ ...current, specPdfUrl: "Spec sheet must be a PDF." }));
      return;
    }
    setUploading(kind);
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("slug", form.slug || slugify(form.title || "product"));
    Array.from(files).forEach((file) => formData.append("files", file));
    const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
    const data = await response.json().catch(() => ({}));
    setUploading("");
    if (!response.ok) {
      setMessage(data.error || "Unable to upload files.");
      return;
    }
    const uploads = (data.uploads || []) as Array<{ url: string }>;
    if (kind === "pdf") {
      updateForm({ specPdfUrl: uploads[0]?.url || "" });
    } else {
      updateForm({
        images: [
          ...form.images,
          ...uploads.map((upload, index) => ({
            url: upload.url,
            position: form.images.length + index,
            isPrimary: !form.images.length && index === 0,
          })),
        ],
      });
    }
  }

  async function deleteProduct(product: AdminManagedProduct) {
    const confirmed = window.confirm(
      `Delete "${product.title}"? This will also remove its subcategory links.`,
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(data.error || "Unable to delete product.");
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
    if (form.id === product.id) {
      resetForm();
    }
    setMessage("Product deleted.");
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/80 bg-white/95 p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">{form.id ? "Edit product" : "Add product"}</h2>
            <p className="mt-1 text-sm text-zinc-500">Create products and link them to one or more subcategories.</p>
          </div>
          {form.id ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              <Plus size={16} aria-hidden="true" />
              New product
            </button>
          ) : null}
        </div>

        <form onSubmit={saveProduct} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Title
              <input
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value;
                  updateForm({ title, slug: slugTouched ? form.slug : slugify(title) });
                }}
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-sky-500"
              />
              {errors.title ? <span className="text-xs text-red-600">{errors.title}</span> : null}
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Slug
              <input
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateForm({ slug: event.target.value });
                }}
                onBlur={() => updateForm({ slug: slugify(form.slug) })}
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-sky-500"
              />
              {errors.slug ? <span className="text-xs text-red-600">{errors.slug}</span> : null}
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Price
              <input
                value={form.price}
                onChange={(event) => updateForm({ price: event.target.value })}
                onBlur={() => {
                  const price = Number(form.price);
                  if (Number.isFinite(price) && price >= 0) {
                    updateForm({ price: price.toFixed(2) });
                  }
                }}
                inputMode="decimal"
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-sky-500"
              />
              {errors.price ? <span className="text-xs text-red-600">{errors.price}</span> : null}
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              SKU
              <input
                value={form.sku}
                onChange={(event) => updateForm({ sku: event.target.value })}
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-sky-500"
              />
              {errors.sku ? <span className="text-xs text-red-600">{errors.sku}</span> : null}
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Weight
              <input
                value={form.weight}
                onChange={(event) => updateForm({ weight: event.target.value })}
                inputMode="decimal"
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-sky-500"
              />
              {errors.weight ? <span className="text-xs text-red-600">{errors.weight}</span> : null}
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Color
              <input
                value={form.color}
                onChange={(event) => updateForm({ color: event.target.value })}
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-sky-500"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Status
              <select
                value={form.status}
                onChange={(event) => updateForm({ status: event.target.value as AdminProductStatus })}
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-sky-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Brand
              <select
                value={form.brandId}
                onChange={(event) => updateForm({ brandId: event.target.value })}
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-sky-500"
              >
                <option value="">No brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Category
              <select
                value={form.categoryId}
                onChange={(event) =>
                  updateForm({
                    categoryId: event.target.value,
                    subcategoryIds: [],
                  })
                }
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-sky-500"
              >
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId ? <span className="text-xs text-red-600">{errors.categoryId}</span> : null}
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateForm({ description: event.target.value })}
              className="min-h-24 rounded-xl border border-zinc-200 p-3 outline-none focus:border-sky-500"
            />
          </label>

          <div className="grid gap-2 text-sm font-medium text-zinc-700">
            Subcategories
            <div className="grid gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {subcategoryOptions.map((subcategory) => (
                <label key={subcategory.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">
                  <input
                    type="checkbox"
                    checked={form.subcategoryIds.includes(subcategory.id)}
                    onChange={(event) => {
                      updateForm({
                        subcategoryIds: event.target.checked
                          ? [...form.subcategoryIds, subcategory.id]
                          : form.subcategoryIds.filter((id) => id !== subcategory.id),
                      });
                    }}
                  />
                  {subcategory.name}
                </label>
              ))}
              {!subcategoryOptions.length ? (
                <p className="text-sm text-zinc-500">Choose a category first.</p>
              ) : null}
            </div>
            {errors.subcategoryIds ? <span className="text-xs text-red-600">{errors.subcategoryIds}</span> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => void uploadFiles("images", event.target.files)}
                className="rounded-xl border border-zinc-200 p-3 text-sm"
              />
              {uploading === "images" ? <span className="text-xs text-sky-700">Uploading images...</span> : null}
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Spec PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => void uploadFiles("pdf", event.target.files)}
                className="rounded-xl border border-zinc-200 p-3 text-sm"
              />
              {form.specPdfUrl ? (
                <a href={form.specPdfUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-700">
                  View uploaded PDF
                </a>
              ) : null}
              {errors.specPdfUrl ? <span className="text-xs text-red-600">{errors.specPdfUrl}</span> : null}
            </label>
          </div>

          {form.images.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {form.images.map((image, index) => (
                <div key={`${image.url}-${index}`} className="rounded-xl border border-zinc-200 p-2">
                  <img src={image.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="primaryImage"
                        checked={image.isPrimary}
                        onChange={() =>
                          updateForm({
                            images: form.images.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index })),
                          })
                        }
                      />
                      Primary
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...form.images];
                          const previous = next[index - 1];
                          if (!previous) return;
                          next[index - 1] = next[index];
                          next[index] = previous;
                          updateForm({ images: next });
                        }}
                        className="rounded border border-zinc-200 px-2 py-1"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => updateForm({ images: form.images.filter((_, itemIndex) => itemIndex !== index) })}
                        className="rounded border border-red-100 px-2 py-1 text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={stayAndClear}
                onChange={(event) => setStayAndClear(event.target.checked)}
                disabled={Boolean(form.id)}
              />
              Stay and clear form after creating
            </label>
            <div className="flex items-center gap-3">
              {message ? <p className="text-sm font-medium text-sky-700">{message}</p> : null}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:bg-sky-300"
              >
                {saving ? "Saving..." : form.id ? "Save changes" : "Create product"}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/80 bg-white/95 p-5 shadow-sm">
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_190px_190px_160px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
            <input
              value={filterTitle}
              onChange={(event) => setFilterTitle(event.target.value)}
              placeholder="Search by title"
              className="h-11 w-full rounded-xl border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-sky-500"
            />
          </label>
          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-sky-500"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={filterBrand}
            onChange={(event) => setFilterBrand(event.target.value)}
            className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-sky-500"
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="h-11 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-sky-500"
          >
            <option value="">All status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Subcategories</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-medium text-zinc-950">{product.title}</td>
                    <td className="px-4 py-3">
                      {product.primaryImageUrl ? <img src={product.primaryImageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" /> : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{product.categoryName || "N/A"}</td>
                    <td className="px-4 py-3 text-zinc-600">{product.subcategoryNames.join(", ") || "N/A"}</td>
                    <td className="px-4 py-3 text-zinc-600">{product.brandName || "N/A"}</td>
                    <td className="px-4 py-3 font-medium text-zinc-950">{product.price === null ? "N/A" : `$${product.price.toFixed(2)}`}</td>
                    <td className="px-4 py-3 text-zinc-600">{statusLabel(product.status)}</td>
                    <td className="px-4 py-3 text-zinc-600">{formatDate(product.updatedAt || product.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setForm(productToForm(product, categories));
                            setSlugTouched(true);
                            setErrors({});
                            setMessage("");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                          aria-label={`Edit ${product.title}`}
                        >
                          <Edit2 size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteProduct(product)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
                          aria-label={`Delete ${product.title}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!filteredProducts.length ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
            <X size={16} aria-hidden="true" />
            No products matched the current filters.
          </div>
        ) : null}
      </section>
    </div>
  );
}
