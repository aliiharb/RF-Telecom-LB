"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/site";

type Item = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  displayOrder?: number;
};

export function TaxonomyManager({
  kind,
  items,
  parentOptions = [],
}: {
  kind: "categories" | "brands";
  items: Item[];
  parentOptions?: Item[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "");

    await fetch(`/api/admin/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: formData.get("slug") || slugify(name),
        parentId: formData.get("parentId") || null,
        logoUrl: formData.get("logoUrl") || null,
        description: formData.get("description") || null,
        seoTitle: formData.get("seoTitle") || null,
        seoDescription: formData.get("seoDescription") || null,
        displayOrder: formData.get("displayOrder") || 0,
      }),
    });

    setCreating(false);
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={create} className="grid gap-3 rounded border border-zinc-200 bg-white p-5 md:grid-cols-2">
        <input name="name" required placeholder="Name" className="h-10 rounded border border-zinc-200 px-3 text-sm" />
        <input name="slug" placeholder="Slug" className="h-10 rounded border border-zinc-200 px-3 text-sm" />
        {kind === "categories" ? (
          <select name="parentId" className="h-10 rounded border border-zinc-200 px-3 text-sm">
            <option value="">No parent</option>
            {parentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : (
          <input name="logoUrl" placeholder="Logo URL" className="h-10 rounded border border-zinc-200 px-3 text-sm" />
        )}
        <input name="displayOrder" placeholder="Display order" className="h-10 rounded border border-zinc-200 px-3 text-sm" />
        <input name="seoTitle" placeholder="SEO title" className="h-10 rounded border border-zinc-200 px-3 text-sm" />
        <input name="seoDescription" placeholder="SEO description" className="h-10 rounded border border-zinc-200 px-3 text-sm" />
        <textarea name="description" placeholder="Description" className="min-h-20 rounded border border-zinc-200 p-3 text-sm md:col-span-2" />
        <button
          type="submit"
          disabled={creating}
          className="h-10 rounded bg-zinc-950 px-4 text-sm font-medium text-white disabled:bg-zinc-400 md:w-fit"
        >
          {creating ? "Adding..." : `Add ${kind === "categories" ? "Category" : "Brand"}`}
        </button>
      </form>
      <div className="grid gap-3">
        {items.map((item) => (
          <TaxonomyRow key={item.id} kind={kind} item={item} parentOptions={parentOptions} />
        ))}
      </div>
    </div>
  );
}

function TaxonomyRow({
  kind,
  item,
  parentOptions,
}: {
  kind: "categories" | "brands";
  item: Item;
  parentOptions: Item[];
}) {
  const router = useRouter();
  const [state, setState] = useState(item);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/${kind}/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    setSaving(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete ${item.name}?`)) {
      return;
    }

    await fetch(`/api/admin/${kind}/${item.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-3 rounded border border-zinc-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={state.name}
          onChange={(event) => setState({ ...state, name: event.target.value })}
          className="h-10 rounded border border-zinc-200 px-3 text-sm"
        />
        <input
          value={state.slug}
          onChange={(event) => setState({ ...state, slug: event.target.value })}
          className="h-10 rounded border border-zinc-200 px-3 text-sm"
        />
        {kind === "categories" ? (
          <select
            value={state.parentId || ""}
            onChange={(event) => setState({ ...state, parentId: event.target.value || null })}
            className="h-10 rounded border border-zinc-200 px-3 text-sm"
          >
            <option value="">No parent</option>
            {parentOptions
              .filter((option) => option.id !== item.id)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
          </select>
        ) : (
          <input
            value={state.logoUrl || ""}
            onChange={(event) => setState({ ...state, logoUrl: event.target.value })}
            placeholder="Logo URL"
            className="h-10 rounded border border-zinc-200 px-3 text-sm"
          />
        )}
        <input
          value={state.displayOrder ?? 0}
          onChange={(event) => setState({ ...state, displayOrder: Number(event.target.value || 0) })}
          placeholder="Display order"
          className="h-10 rounded border border-zinc-200 px-3 text-sm"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={state.seoTitle || ""}
          onChange={(event) => setState({ ...state, seoTitle: event.target.value })}
          placeholder="SEO title"
          className="h-10 rounded border border-zinc-200 px-3 text-sm"
        />
        <input
          value={state.seoDescription || ""}
          onChange={(event) => setState({ ...state, seoDescription: event.target.value })}
          placeholder="SEO description"
          className="h-10 rounded border border-zinc-200 px-3 text-sm"
        />
      </div>
      <textarea
        value={state.description || ""}
        onChange={(event) => setState({ ...state, description: event.target.value })}
        placeholder="Description"
        className="min-h-20 rounded border border-zinc-200 p-3 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-10 rounded bg-zinc-950 px-4 text-sm font-medium text-white disabled:bg-zinc-400"
        >
          {saving ? "Saving" : "Save"}
        </button>
        <button
          type="button"
          onClick={remove}
          className="h-10 rounded border border-red-200 px-4 text-sm font-medium text-red-700 hover:border-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
