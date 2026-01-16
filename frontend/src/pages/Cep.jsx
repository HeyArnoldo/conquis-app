import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "@/components/Spinner";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@/components/ui/dialog";
import { FileText } from "lucide-react";

const API_URL = import.meta.env.APP_API_URL;
const CDN_URL = import.meta.env.APP_CDN_URL || "";
const SHOW_WARNINGS = import.meta.env.APP_SHOW_CEP_WARNINGS === "true";

function CepCategoryCard({ category, filesBaseUrl }) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const normalizedBase = (filesBaseUrl || CDN_URL || "").replace(/\/+$/, "");
  const normalizedPath = category.img?.replace(/^\/+/, "") || "";
  const imageSrc = category.img ? `${normalizedBase}/${normalizedPath}` : "";

  return (
    <Link
      to={`/cep/${category.slug}`}
      className="group bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6 transition hover:-translate-y-1 hover:shadow-xl hover:border-slate-200"
    >
      <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 mb-4">
        <div className="aspect-square bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center p-6 relative">
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
              alt={category.nombre_categoria}
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
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit mb-3">
        {category.codigo_categoria}
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        {category.nombre_categoria}
      </h2>
      <p className="text-sm text-slate-500">
        {Array.isArray(category.items) ? category.items.length : 0} fichas disponibles
      </p>
      <span className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium mt-4">
        Ver especialidades
        <span className="transition-transform group-hover:translate-x-1">{">"}</span>
      </span>
    </Link>
  );
}

function Cep() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filesBaseUrl, setFilesBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadCep = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!API_URL) {
          throw new Error("APP_API_URL no configurado");
        }

        const url = new URL("/api/cep", API_URL);
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("No se pudo cargar el CEP");
        }

        const data = await response.json();
        if (isMounted) {
          setCategories(Array.isArray(data.categorias) ? data.categorias : []);
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

    loadCep();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const normalizedTerm = searchTerm.trim().toLowerCase();
  const specialties = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.flatMap((category) => {
      const items = Array.isArray(category.items) ? category.items : [];
      return items.map((item) => ({
        ...item,
        categorySlug: category.slug,
        categoryName: category.nombre_categoria,
        categoryCode: category.codigo_categoria
      }));
    });
  }, [categories]);

  const filteredSpecialties = useMemo(() => {
    if (!normalizedTerm) return [];
    return specialties.filter((item) => {
      const name = String(item.nombre || "").toLowerCase();
      const code = String(item.codigo || "").toLowerCase();
      const category = String(item.categoryName || "").toLowerCase();
      return (
        name.includes(normalizedTerm) ||
        code.includes(normalizedTerm) ||
        category.includes(normalizedTerm)
      );
    });
  }, [normalizedTerm, specialties]);

  const normalizedBase = (filesBaseUrl || CDN_URL || "").replace(/\/+$/, "");

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
        <p className="text-red-500 text-lg">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-16 -right-24 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.05),transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Link to={'https://www.facebook.com/recursosparaelguiamayor'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 shadow-sm">
            Créditos: GM. Isaí Duarte Maolo
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mt-6 mb-4">
            Buscador de Especialidades del Club de Conquistadores de la DSA
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explora las especialidades, con acceso rápido a sus fichas y recursos.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Buscar especialidades por nombre, código o categoría..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
      </section>

      {normalizedTerm ? (
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
              <span>
                {filteredSpecialties.length} resultado
                {filteredSpecialties.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Limpiar
              </button>
            </div>

            {filteredSpecialties.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                No se encontraron especialidades.
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredSpecialties.map((item) => {
                  const pdfPath = item.pdf?.replace(/^\/+/, "") || "";
                  const pdfUrl = item.pdf ? `${normalizedBase}/${pdfPath}` : "";
                  const imagePath = item.img?.replace(/^\/+/, "") || "";
                  const imageUrl = item.img ? `${normalizedBase}/${imagePath}` : "";
                  const cardInner = (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.nombre}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Sin logo
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit mb-2">
                            {item.codigo}
                          </p>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {item.nombre}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {item.categoryName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {pdfUrl ? (
                          <span className="text-amber-700 font-medium">Abrir</span>
                        ) : (
                          <span className="text-slate-400">PDF no disponible</span>
                        )}
                      </div>
                    </div>
                  );

                  if (!pdfUrl) {
                    return (
                      <div
                        key={`${item.categorySlug}-${item.slug}`}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                      >
                        {cardInner}
                      </div>
                    );
                  }

                  return (
                    <Dialog key={`${item.categorySlug}-${item.slug}`}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="w-full text-left rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                          aria-label={`Abrir PDF de ${item.nombre}`}
                        >
                          {cardInner}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[860px] h-[90vh] p-0 overflow-hidden py-0">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 text-xs text-slate-500 max-h-12">
                            <span className="font-medium text-slate-700">
                              {item.codigo} - {item.nombre}
                            </span>
                            <div className="flex items-center gap-2">
                              <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-black text-white px-3 py-1 rounded-lg text-xs font-medium mr-3 hover:bg-slate-800 transition-colors flex items-center gap-2"
                              >
                                <FileText size={16} />
                                Abrir en nueva pestaña
                              </a>
                              <DialogClose asChild>
                                <button
                                  type="button"
                                  className="text-slate-400 hover:text-slate-900 transition-colors"
                                  aria-label="Cerrar"
                                >
                                  &times;
                                </button>
                              </DialogClose>
                            </div>
                          </div>
                          <iframe
                            src={pdfUrl}
                            className="w-full h-full"
                            title={`PDF ${item.nombre}`}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {!normalizedTerm ? (
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CepCategoryCard
                key={category.slug}
                category={category}
                filesBaseUrl={filesBaseUrl}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default Cep;





