import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CepItemGrid from "@/components/CepItemGrid";
import Spinner from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.APP_API_URL;
const DEBOUNCE_MS = 250;
const PAGE_SIZE = 18;

function CepCategory() {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [filesBaseUrl, setFilesBaseUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [searchItems, setSearchItems] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreRef = useRef(null);
  const searchMoreRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim().toLowerCase());
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedTerm.length > 0;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadCategory = async () => {
      setLoading(true);
      setError(null);
      setLoadMoreError(null);
      setPage(1);
      setHasMore(false);
      setItems([]);
      setTotalItems(0);
      setSearchItems([]);
      setSearchPage(1);
      setSearchHasMore(false);
      setSearchLoading(false);
      setSearchLoadingMore(false);
      setSearchError(null);

      try {
        if (!API_URL) {
          throw new Error("APP_API_URL no configurado");
        }

        const url = new URL(`/api/cep/${encodeURIComponent(categorySlug)}`, API_URL);
        url.searchParams.set("page", "1");
        url.searchParams.set("limit", String(PAGE_SIZE));
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
          setItems(Array.isArray(data.items) ? data.items : []);
          setTotalItems(
            Number.isFinite(data.pagination?.total)
              ? data.pagination.total
              : Array.isArray(data.items)
                ? data.items.length
                : 0
          );
          setPage(data.pagination?.page || 1);
          setHasMore(Boolean(data.pagination?.hasNextPage));
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

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      if (!API_URL) {
        throw new Error("APP_API_URL no configurado");
      }

      const nextPage = page + 1;
      const url = new URL(`/api/cep/${encodeURIComponent(categorySlug)}`, API_URL);
      url.searchParams.set("page", String(nextPage));
      url.searchParams.set("limit", String(PAGE_SIZE));

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("No se pudo cargar mas contenido");
      }

      const data = await response.json();
      setItems((prev) => [
        ...prev,
        ...(Array.isArray(data.items) ? data.items : [])
      ]);
      setPage(nextPage);
      setHasMore(Boolean(data.pagination?.hasNextPage));
      if (!filesBaseUrl) {
        setFilesBaseUrl(data.filesBaseUrl || "");
      }
    } catch (err) {
      setLoadMoreError(err);
    } finally {
      setLoadingMore(false);
    }
  }, [categorySlug, filesBaseUrl, hasMore, loadingMore, page]);

  const loadMoreSearch = useCallback(async () => {
    if (searchLoadingMore || !searchHasMore || !debouncedTerm) return;

    setSearchLoadingMore(true);
    setSearchError(null);

    try {
      if (!API_URL) {
        throw new Error("APP_API_URL no configurado");
      }

      const nextPage = searchPage + 1;
      const url = new URL(`/api/cep/${encodeURIComponent(categorySlug)}`, API_URL);
      url.searchParams.set("q", debouncedTerm);
      url.searchParams.set("page", String(nextPage));
      url.searchParams.set("limit", String(PAGE_SIZE));

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("No se pudo cargar mas resultados");
      }

      const data = await response.json();
      setSearchItems((prev) => [
        ...prev,
        ...(Array.isArray(data.items) ? data.items : [])
      ]);
      setSearchPage(nextPage);
      setSearchHasMore(Boolean(data.pagination?.hasNextPage));
      setFilesBaseUrl((prev) => prev || data.filesBaseUrl || "");
    } catch (err) {
      setSearchError(err);
    } finally {
      setSearchLoadingMore(false);
    }
  }, [categorySlug, debouncedTerm, searchHasMore, searchLoadingMore, searchPage]);

  useEffect(() => {
    if (isSearching || !hasMore || loadingMore) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isSearching, loadMore, loadingMore]);

  useEffect(() => {
    if (!debouncedTerm) {
      setSearchItems([]);
      setSearchPage(1);
      setSearchHasMore(false);
      setSearchLoading(false);
      setSearchLoadingMore(false);
      setSearchError(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const loadSearch = async () => {
      setSearchLoading(true);
      setSearchError(null);
      setSearchPage(1);
      setSearchHasMore(false);
      setSearchItems([]);

      try {
        if (!API_URL) {
          throw new Error("APP_API_URL no configurado");
        }

        const url = new URL(`/api/cep/${encodeURIComponent(categorySlug)}`, API_URL);
        url.searchParams.set("q", debouncedTerm);
        url.searchParams.set("page", "1");
        url.searchParams.set("limit", String(PAGE_SIZE));
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("No se pudo buscar en la categoria");
        }

        const data = await response.json();
        if (isMounted) {
          setSearchItems(Array.isArray(data.items) ? data.items : []);
          setSearchPage(data.pagination?.page || 1);
          setSearchHasMore(Boolean(data.pagination?.hasNextPage));
          setFilesBaseUrl((prev) => prev || data.filesBaseUrl || "");
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted) {
          setSearchError(err);
        }
      } finally {
        if (isMounted) {
          setSearchLoading(false);
        }
      }
    };

    loadSearch();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [categorySlug, debouncedTerm]);

  useEffect(() => {
    if (!debouncedTerm || !searchHasMore || searchLoadingMore) return;
    const sentinel = searchMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreSearch();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [debouncedTerm, loadMoreSearch, searchHasMore, searchLoadingMore]);

  const visibleItems = isSearching ? searchItems : items;

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
              {totalItems} fichas disponibles
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
          {visibleItems.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">
              {isSearching
                ? searchLoading
                  ? "Buscando fichas..."
                  : searchError
                    ? searchError.message
                    : "No hay fichas para ese filtro."
                : "No hay fichas para ese filtro."}
            </p>
          ) : (
            <CepItemGrid items={visibleItems} filesBaseUrl={filesBaseUrl} />
          )}
          {isSearching ? (
            <>
              <div ref={searchMoreRef} className="h-10" />
              {searchLoadingMore ? (
                <div className="mt-4 flex justify-center">
                  <Spinner />
                </div>
              ) : null}
              {searchError && visibleItems.length > 0 ? (
                <p className="mt-4 text-center text-sm text-red-500">
                  {searchError.message}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <div ref={loadMoreRef} className="h-10" />
              {loadingMore ? (
                <div className="mt-4 flex justify-center">
                  <Spinner />
                </div>
              ) : null}
              {loadMoreError ? (
                <p className="mt-4 text-center text-sm text-red-500">
                  {loadMoreError.message}
                </p>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default CepCategory;
