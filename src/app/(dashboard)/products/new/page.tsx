"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("El nombre del producto es obligatorio.");
    if (!image) return setError("La imagen del producto es obligatoria.");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("image", image);
      const { product } = await api.post<{ product: Product }>(
        "/products",
        formData,
      );
      // Pasos 2-5 viven en /products/[id]. La página resume el wizard
      // en el primer paso con campos vacíos.
      router.replace(`/products/${product.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el producto.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/products"
        className="text-xs text-muted hover:text-orange"
      >
        ← Volver a productos
      </Link>

      <Card padding="lg" className="mt-4">
        <h1 className="text-xl font-semibold text-ink">Nuevo producto</h1>
        <p className="mt-2 text-sm text-muted">
          Empecemos con lo esencial: el nombre y una imagen. Después podrás completar las
          10 preguntas que la IA usa para generar anuncios con contexto real.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <Input
            label="Nombre del producto *"
            placeholder="Ej: Jeans tiro alto MUMU"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FileUpload
            label="Imagen del producto *"
            value={image}
            onChange={setImage}
            helperText="Esta imagen se usa como referencia en cada anuncio generado."
          />

          {error && (
            <div className="rounded-md border border-error/20 bg-error/10 p-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex justify-end border-t border-sand pt-5">
            <Button type="submit" size="md" loading={saving}>
              Continuar al diagnóstico →
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
