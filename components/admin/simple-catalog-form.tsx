"use client";

import { FormEvent, useState } from "react";
import type { AdminCategoryOption } from "@/lib/admin-product-taxonomy";
import { slugify } from "@/lib/site";

export function SimpleCatalogForm({
  kind,
  categories = [],
}: {
  kind: "category" | "subcategory" | "brand";
  categories?: AdminCategoryOption[];
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const endpoint =
      kind === "category"
        ? "/api/admin/catalog/categories"
        : kind === "subcategory"
          ? "/api/admin/catalog/subcategories"
          : "/api/admin/catalog/brands";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        categoryId: categoryId ? Number(categoryId) : undefined,
        description,
        featured,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Unable to save.");
      return;
    }
    setMessage("Saved.");
    setName("");
    setSlug("");
    setCategoryId("");
    setDescription("");
    setFeatured(true);
    setSlugTouched(false);
  }

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-5 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-sm">
      {kind === "subcategory" ? (
        <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
          Category
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-11 rounded-xl border border-zinc-200 px-3">
            <option value="">Choose category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
        Name
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          className="h-11 rounded-xl border border-zinc-200 px-3"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
        Slug
        <input
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          onBlur={() => setSlug(slugify(slug))}
          className="h-11 rounded-xl border border-zinc-200 px-3"
        />
      </label>
      {kind === "brand" ? (
        <>
          <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 rounded-xl border border-zinc-200 p-3" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
            Featured
          </label>
        </>
      ) : null}
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-sky-50 p-3 text-sm text-sky-700">{message}</p> : null}
      <button type="submit" className="admin-create-button">
        Save
      </button>
    </form>
  );
}
