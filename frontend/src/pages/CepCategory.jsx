import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CepItemGrid from "@/components/CepItemGrid";
import Spinner from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.APP_API_URL;
const DEBOUNCE_MS = 250;

function CepCategory() {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [filesBaseUrl, setFilesBaseUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim().toLowerCase());
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadCategory = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!API_URL) {
          throw new Error("APP_API_URL no configurado");
        }

        const url = new URL(`/api/cep/${encodeURIComponent(categorySlug)}`, API_URL);
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Categoria no encontrada");
          }
          throw new Error("No se pudo cargar la categoria");
        }

        const data = await response.json();
        if (isMounted) {
          setCategory(data);
          setFilesBaseUrl(data.filesBaseUrl || "");
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategory();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [categorySlug]);

  const filteredItems = useMemo(() => {
    if (!category || !Array.isArray(category.items)) return [];
    if (!debouncedTerm) return category.items;

    return category.items.filter((item) => {
      const name = String(item.nombre || "").toLowerCase();
      const code = String(item.codigo || "").toLowerCase();
      return name.includes(debouncedTerm) || code.includes(debouncedTerm);
    });
  }, [category, debouncedTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error.message}</p>
          <Button variant="outline" asChild>
            <Link to="/cep">Volver al CEP</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link to="/cep">Volver al CEP</Link>
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit">
              {category.codigo_categoria}
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              {category.nombre_categoria}
            </h1>
            <p className="text-slate-500">
              {Array.isArray(category.items) ? category.items.length : 0} fichas disponibles
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-4xl mx-auto">
          <Input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-4 py-3 text-base rounded-2xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white shadow-sm transition-all duration-200"
          />
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {filteredItems.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">
              No hay fichas para ese filtro.
            </p>
          ) : (
            <CepItemGrid items={filteredItems} filesBaseUrl={filesBaseUrl} />
          )}
        </div>
      </section>
    </div>
  );
}

export default CepCategory;
