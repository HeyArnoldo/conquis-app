import PopularCategories from "@/components/List/PopularCategories";
import SpecialtyGrid from "@/components/SpecialtyGrid";
import Spinner from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.APP_API_URL;
const SEARCH_LIMIT = 24;
const DEBOUNCE_MS = 350;

function Inicio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadSpecialties = useCallback(async (nextPage, term, replace) => {
    if (!API_URL) {
      setError(new Error("APP_API_URL no configurado"));
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/areas/specialties", API_URL);
      url.searchParams.set("limit", SEARCH_LIMIT);
      url.searchParams.set("page", nextPage);

      if (term) {
        url.searchParams.set("search", term);
      }

      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error("No se pudieron cargar las especialidades");
      }

      const data = await response.json();
      const items = Array.isArray(data.specialties) ? data.specialties : [];
      const parsedTotal = Number.parseInt(data.total, 10);
      const totalCount = Number.isNaN(parsedTotal) ? items.length : parsedTotal;
      const nextHasMore = typeof data.hasMore === "boolean"
        ? data.hasMore
        : nextPage * SEARCH_LIMIT < totalCount;

      setTotal(totalCount);
      setHasMore(nextHasMore);
      setSpecialties(prev => (replace ? items : [...prev, ...items]));
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err);
      }
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadSpecialties(1, debouncedTerm, true);
    setPage(1);
    setHasMore(true);
  }, [debouncedTerm, loadSpecialties]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const handleLoadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setPage(prev => {
      const nextPage = prev + 1;
      loadSpecialties(nextPage, debouncedTerm, false);
      return nextPage;
    });
  }, [debouncedTerm, hasMore, loading, loadSpecialties]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleLoadMore]);

  const showCategories = searchTerm.trim().length === 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-16 -right-24 h-72 w-72 rounded-full bg-blue-200/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm">
            +600 especialidades
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mt-6 mb-6">
            Descubre las Especialidades de
            <span className="text-blue-600 block">Conquistadores</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explora un catalogo completo para desarrollar habilidades, conocimientos
            y caracter en jovenes conquistadores.
          </p>

          <div className="relative max-w-2xl mx-auto mb-8">
            <Input
              type="text"
              placeholder="Buscar especialidades del Club de Conquistadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 text-base rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-lg transition-all duration-200"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          {debouncedTerm ? (
            <div className="text-sm text-blue-700 bg-blue-50 inline-flex items-center gap-2 px-3 py-1 rounded-full">
              Buscando: "{debouncedTerm}"
            </div>
          ) : null}
        </div>
      </section>

      {showCategories ? (
        <section className="pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Categorias destacadas
                </h2>
                <p className="text-gray-600">
                  Explora por area y encuentra la especialidad que buscas.
                </p>
              </div>
            </div>
          </div>
          <PopularCategories />
        </section>
      ) : null}

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {debouncedTerm ? "Resultados de busqueda" : "Todas las especialidades"}
              </h2>
              <p className="text-gray-600">
                Usa el buscador para filtrar por nombre, area o slug.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              {total} resultados
            </div>
          </div>

          {error ? (
            <div className="text-center text-red-500 py-6">
              {error.message}
            </div>
          ) : specialties.length === 0 && !loading ? (
            <p className="text-center text-gray-600 text-lg">
              No se encontraron especialidades.
            </p>
          ) : (
            <SpecialtyGrid specialties={specialties} />
          )}

          {loading && <Spinner />}

          {!loading && !hasMore && specialties.length > 0 ? (
            <p className="text-center text-sm text-gray-500 mt-6">
              Ya viste todas las especialidades disponibles.
            </p>
          ) : null}

          <div ref={sentinelRef} className="h-8" />
        </div>
      </section>
    </div>
  );
}

export default Inicio;
