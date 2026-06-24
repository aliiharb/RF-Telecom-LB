"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminCategoryOption } from "@/lib/admin-product-taxonomy";

export function CategoryManager({ initialCategories }: { initialCategories: AdminCategoryOption[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState("");
  const router = useRouter();

  async function deleteCategory(category: AdminCategoryOption) {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This will also remove its subcategories and product-subcategory links. Products will not be deleted.`,
    );

    if (!confirmed) return;

    setDeleting(`category:${category.id}`);
    setMessage("");
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    setDeleting("");

    if (!response.ok) {
      setMessage(data.error || "Unable to delete category.");
      return;
    }

    setCategories((current) => current.filter((item) => item.id !== category.id));
    setMessage("Category deleted.");
    router.refresh();
  }

  async function deleteSubcategory(categoryId: number, subcategory: AdminCategoryOption["subcategories"][number]) {
    const confirmed = window.confirm(
      `Delete "${subcategory.name}"? This will remove product-subcategory links. Products will not be deleted.`,
    );

    if (!confirmed) return;

    setDeleting(`subcategory:${subcategory.id}`);
    setMessage("");
    const response = await fetch(`/api/admin/catalog/subcategories/${encodeURIComponent(subcategory.id)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    setDeleting("");

    if (!response.ok) {
      setMessage(data.error || "Unable to delete subcategory.");
      return;
    }

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: category.subcategories.filter((item) => item.id !== subcategory.id),
            }
          : category,
      ),
    );
    setMessage("Subcategory deleted.");
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      {message ? (
        <p className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm font-medium text-sky-700">
          {message}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-sky-50 text-left text-zinc-500">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Subcategories</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-3 text-zinc-500">{category.id}</td>
                  <td className="px-5 py-3 font-semibold text-zinc-950">{category.name}</td>
                  <td className="px-5 py-3 text-zinc-600">{category.slug}</td>
                  <td className="px-5 py-3 text-zinc-600">
                    {category.subcategories.length ? (
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((subcategory) => (
                          <span
                            key={subcategory.id}
                            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-3 pr-1 text-xs font-medium text-zinc-700"
                          >
                            {subcategory.name}
                            <button
                              type="button"
                              onClick={() => void deleteSubcategory(category.id, subcategory)}
                              disabled={deleting === `subcategory:${subcategory.id}`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50 disabled:text-zinc-300"
                              aria-label={`Delete ${subcategory.name}`}
                            >
                              <Trash2 size={13} aria-hidden="true" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void deleteCategory(category)}
                      disabled={deleting === `category:${category.id}`}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-100 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:text-zinc-300"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
