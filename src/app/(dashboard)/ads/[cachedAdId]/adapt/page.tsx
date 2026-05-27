"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { CopyVariantPicker } from "@/components/CopyVariantPicker";
import { SavedCopiesBrowser } from "@/components/SavedCopiesBrowser";
import { api, ApiError } from "@/lib/api";
import type { CachedAd, AdaptCopyResponse, Product } from "@/lib/types";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function AdaptCopyPage() {
  const { cachedAdId } = useParams<{ cachedAdId: string }>();
  const router = useRouter();
  const [ad, setAd] = useState<CachedAd | null>(null);

  // Product picker — only complete products are eligible
  const [products, setProducts] = useState<Product[] | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [userInstructions, setUserInstructions] = useState("");

  // Source mode: new (generate) or saved (reuse)
  const [source, setSource] = useState<"new" | "saved">("new");

  // Result state
  const [result, setResult] = useState<AdaptCopyResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(`ad_${cachedAdId}`);
    if (stored) setAd(JSON.parse(stored));

    api
      .get<{ products: Product[] }>("/products?onlyComplete=true")
      .then(({ products }) => {
        setProducts(products);
        // If user has no usable products, redirect them to create one.
        if (products.length === 0) {
          router.replace("/products/new");
          return;
        }
        // Auto-select first product for convenience.
        setSelectedProductId(products[0].id);
      })
      .catch(() => setProducts([]));
  }, [cachedAdId, router]);

  async function handleAdapt(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!selectedProductId) {
      setError("Selecciona un producto.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post<AdaptCopyResponse>(
        `/ads/${cachedAdId}/adapt-copy`,
        {
          productId: selectedProductId,
          userInstructions: userInstructions.trim() || undefined,
        },
      );

      setResult(res);
      setSelectedVariant(0);

      sessionStorage.setItem(
        `adaptation_${cachedAdId}`,
        JSON.stringify(res),
      );
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Error al adaptar el copy.");
    } finally {
      setLoading(false);
    }
  }

  function handleContinue() {
    sessionStorage.setItem(
      `selectedVariant_${cachedAdId}`,
      String(selectedVariant),
    );
    router.push(`/ads/${cachedAdId}/generate`);
  }

  if (!ad) {
    return (
      <Card>
        <p className="text-error">
          No se encontró el anuncio. Vuelve a buscarlo.
        </p>
        <Link href="/ads/search" className="mt-4 inline-block">
          <Button variant="ghost" size="sm">Volver a buscar</Button>
        </Link>
      </Card>
    );
  }

  if (products === null) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/ads/${cachedAdId}`}
        className="text-sm text-muted hover:text-ink transition-colors"
      >
        ← Volver al anuncio
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-ink">Adaptar copy</h1>
      <p className="mt-1 text-sm text-muted">
        Adapta el copy de &quot;{ad.headline || "este anuncio"}&quot; a tu marca.
      </p>

      <Card className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Copy original del anuncio
        </h3>
        <div className="mt-3 flex flex-col gap-3 rounded-md border border-sand bg-sand-light p-4">
          {ad.headline && (
            <div>
              <span className="text-xs font-medium uppercase text-muted">Headline</span>
              <p className="mt-0.5 text-sm font-medium text-ink">{ad.headline}</p>
            </div>
          )}
          {ad.description && (
            <div>
              <span className="text-xs font-medium uppercase text-muted">Descripción</span>
              <p className="mt-0.5 text-sm text-charcoal whitespace-pre-line">{ad.description}</p>
            </div>
          )}
          {ad.ctaTitle && (
            <div>
              <span className="text-xs font-medium uppercase text-muted">CTA</span>
              <p className="mt-0.5 text-sm text-charcoal">{ad.ctaTitle}</p>
            </div>
          )}
        </div>
      </Card>

      {!result && (
        <>
          <Card className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Producto a pautar
              </h3>
              <Link
                href="/products/new"
                className="text-xs font-medium text-orange hover:text-orange/80"
              >
                + Nuevo producto
              </Link>
            </div>
            <div className="mt-4">
              <ProductPicker
                products={products}
                selectedId={selectedProductId}
                onSelect={setSelectedProductId}
              />
            </div>
          </Card>

          <Card className="mt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSource("new")}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  source === "new"
                    ? "border-orange text-orange"
                    : "border-sand text-muted hover:border-orange/30"
                }`}
              >
                Generar nuevo
              </button>
              <button
                type="button"
                onClick={() => setSource("saved")}
                className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  source === "saved"
                    ? "border-orange text-orange"
                    : "border-sand text-muted hover:border-orange/30"
                }`}
              >
                Usar copy guardado
              </button>
            </div>
          </Card>

          {source === "saved" && (
            <Card className="mt-4">
              <SavedCopiesBrowser
                productId={selectedProductId}
                products={products}
                onUse={(res) => {
                  setResult(res);
                  setSelectedVariant(0);
                  sessionStorage.setItem(
                    `adaptation_${cachedAdId}`,
                    JSON.stringify(res),
                  );
                }}
              />
            </Card>
          )}

          {source === "new" && (
            <>
              <Card className="mt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  ¿Qué quieres adaptar?
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Describe en tus palabras qué cambios quieres en el copy. La IA usará
                  estas instrucciones junto con la información de tu marca y producto.
                </p>
                <Textarea
                  className="mt-3"
                  rows={4}
                  placeholder="Ej: Quiero que el tono sea más juvenil y directo, enfocado en el beneficio de ahorro de tiempo. Menciona que tenemos envío gratis en Colombia."
                  value={userInstructions}
                  onChange={(e) => setUserInstructions(e.target.value)}
                />
              </Card>

              <Card className="mt-4">
                <form onSubmit={handleAdapt}>
                  <Button type="submit" loading={loading} size="lg" className="w-full">
                    Adaptar copy a mi marca
                  </Button>
                </form>
              </Card>
            </>
          )}
        </>
      )}

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 py-8">
          <Spinner size="lg" />
          <p className="text-sm text-muted">
            Gemini está adaptando el copy a tu marca...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Elige una variante
            </h2>
            <p className="text-sm text-muted">
              Selecciona la que mejor represente tu marca.
            </p>
          </div>

          <CopyVariantPicker
            adaptationId={result.adaptationId}
            variants={result.variants}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
            productId={result.product?.id ?? null}
            onVariantsChange={(variants) => {
              const updated = { ...result, variants };
              setResult(updated);
              sessionStorage.setItem(
                `adaptation_${cachedAdId}`,
                JSON.stringify(updated),
              );
            }}
          />

          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setResult(null)}
              className="flex-1"
            >
              Regenerar
            </Button>
            <Button onClick={handleContinue} size="lg" className="flex-1">
              Generar imágenes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductPicker({
  products,
  selectedId,
  onSelect,
}: {
  products: Product[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {products.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p.id)}
          className={`relative overflow-hidden rounded-lg border-2 transition-colors ${
            selectedId === p.id
              ? "border-orange ring-2 ring-orange/30"
              : "border-sand hover:border-orange/30"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${API_HOST}${p.imageUrl}`}
            alt={p.name || "Producto"}
            className="aspect-square w-full object-cover"
          />
          {p.name && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
              <span className="text-[10px] font-medium text-white line-clamp-1">
                {p.name}
              </span>
            </div>
          )}
          {selectedId === p.id && (
            <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-[10px] text-white">
              ✓
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
