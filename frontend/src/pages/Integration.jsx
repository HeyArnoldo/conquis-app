import React, { useCallback, useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PDFDialog } from "@/components/PDFDialog";

const API_URL = import.meta.env.APP_API_URL;
const DEFAULT_MIN_SCORE = 0.6;

function Integration() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(DEFAULT_MIN_SCORE);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPending = useCallback(async (nextPage, replace) => {
    if (!API_URL) {
      setError(new Error("APP_API_URL no configurado"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/integration/pending", API_URL);
      url.searchParams.set("page", nextPage);
      url.searchParams.set("limit", 15);
      url.searchParams.set("minScore", minScore);
      if (search.trim()) {
        url.searchParams.set("search", search.trim());
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("No se pudieron cargar las sugerencias");
      }

      const data = await response.json();
      const nextItems = Array.isArray(data.items) ? data.items : [];
      setHasMore(Boolean(data.hasMore));
      setItems(prev => (replace ? nextItems : [...prev, ...nextItems]));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [minScore, search]);

  useEffect(() => {
    setPage(1);
    loadPending(1, true);
  }, [loadPending]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPending(nextPage, false);
  };

  const updateLink = async (payload) => {
    if (!API_URL) {
      setError(new Error("APP_API_URL no configurado"));
      return;
    }

    try {
      const response = await fetch(new URL("/api/integration/links", API_URL), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el enlace");
      }

      setItems(prev => prev.filter(item => item.cep.id !== payload.cepId));
    } catch (err) {
      setError(err);
    }
  };

  const handleConfirm = (cepId, specialtyId) => {
    updateLink({ cepId, specialtyId, status: "confirmed", source: "manual" });
  };

  const handleIgnore = (cepId) => {
    updateLink({ cepId, specialtyId: null, status: "ignored", source: "manual" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Integracion CEP y Especialidades
          </h1>
          <p className="text-gray-600 mb-6">
            Revisa sugerencias y confirma el enlace correcto cuando exista.
          </p>

          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <Input
              type="text"
              placeholder="Buscar por nombre o codigo CEP..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-white"
            />
            <Input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={minScore}
              onChange={(event) => setMinScore(event.target.value)}
              className="bg-white"
            />
          </div>
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {error ? (
            <div className="text-red-500 mb-6">{error.message}</div>
          ) : null}

          {items.length === 0 && !loading ? (
            <div className="text-gray-600">No hay pendientes por revisar.</div>
          ) : null}

          <div className="space-y-6">
            {items.map((entry) => {
              const cep = entry.cep;
              const cepPdf = cep.pdf && cep.filesBaseUrl
                ? `${cep.filesBaseUrl.replace(/\/+$/, "")}/${cep.pdf.replace(/^\/+/, "")}`
                : null;

              return (
                <div
                  key={cep.id}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit mb-2">
                        {cep.codigo}
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {cep.nombre}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {cep.category?.name}
                      </p>
                      {cepPdf ? (
                        <div className="mt-3 space-y-2">
                          <div className="h-48 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            <iframe
                              src={cepPdf}
                              className="h-full w-full"
                              title={`PDF CEP ${cep.codigo}`}
                            />
                          </div>
                          <PDFDialog pdfSrc={cepPdf} triggerText="Abrir PDF CEP" />
                        </div>
                      ) : null}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleIgnore(cep.id)}
                    >
                      Ignorar
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {entry.candidates.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        Sin sugerencias automaticas.
                      </div>
                    ) : (
                      entry.candidates.map((candidate) => {
                        const spec = candidate.specialty;
                        const specPdf = spec.pdf && spec.filesBaseUrl
                          ? `${spec.filesBaseUrl.replace(/\/+$/, "")}/${spec.pdf.replace(/^\/+/, "")}`
                          : null;

                        return (
                          <div
                            key={spec.id}
                            className="border border-slate-100 rounded-xl p-4 bg-slate-50"
                          >
                            <div className="text-xs text-slate-500 mb-1">
                              Score: {(candidate.score * 100).toFixed(0)}%
                            </div>
                            <div className="font-semibold text-slate-900">
                              {spec.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {spec.areaName}
                            </div>
                            {specPdf ? (
                              <div className="mt-3 space-y-2">
                                <div className="h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                                  <iframe
                                    src={specPdf}
                                    className="h-full w-full"
                                    title={`PDF especialidad ${spec.name}`}
                                  />
                                </div>
                                <PDFDialog pdfSrc={specPdf} triggerText="Abrir PDF especialidad" />
                              </div>
                            ) : null}
                            <div className="mt-3">
                              <Button onClick={() => handleConfirm(cep.id, spec.id)}>
                                Vincular
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {loading ? (
            <div className="mt-6">
              <Spinner />
            </div>
          ) : null}

          {!loading && hasMore ? (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Cargar mas
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default Integration;
