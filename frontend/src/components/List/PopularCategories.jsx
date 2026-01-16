import React, { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.APP_API_URL;
const CDN_URL = import.meta.env.APP_CDN_URL || "";

function CategoryCard({ category }) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const specialtiesCount = category.specialties ?? 0;
  const baseUrl = category.filesBaseUrl || CDN_URL || "";
  const imageSrc = category.img ? `${baseUrl}${category.img}` : "";

  return (
    <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-slate-100 shadow-sm overflow-hidden bg-white pt-0 rounded-2xl">
      <Link to={`/category/${category.slug}`} className="block">
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
            {loading && !hasError ? (
              <div className="absolute inset-0 animate-pulse bg-slate-200" />
            ) : null}
            {hasError || !imageSrc ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                Imagen no disponible
              </div>
            ) : (
              <img
                src={imageSrc}
                alt={category.area}
                className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
                loading="lazy"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setHasError(true);
                  setLoading(false);
                }}
              />
            )}
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-700 font-semibold">
              {specialtiesCount} especialidades
            </Badge>
          </div>
        </div>

        <CardHeader className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                {category.area}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-2">
                {specialtiesCount === 1
                  ? "1 especialidad disponible"
                  : `${specialtiesCount} especialidades disponibles`}
              </CardDescription>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
          </div>
        </CardHeader>
      </Link>
    </Card>
  );
}

function PopularCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!API_URL) {
          throw new Error("APP_API_URL no configurado");
        }

        const url = new URL("/api/areas", API_URL);
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("No se pudieron cargar las categorias");
        }

        const data = await response.json();
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
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

    loadCategories();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">Cargando categorias...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        No se pudieron cargar las categorias.
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay categorias disponibles.
      </div>
    );
  }

  return (
    <section className="pb-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularCategories;
