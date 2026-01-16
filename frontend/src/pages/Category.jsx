import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SpecialtyGrid from "@/components/SpecialtyGrid";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.APP_API_URL;
const CDN_URL = import.meta.env.APP_CDN_URL || "";

function Category() {
  const { areaSlug } = useParams();
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadArea = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!API_URL) {
          throw new Error("APP_API_URL no configurado");
        }

        const url = new URL(`/api/areas/${encodeURIComponent(areaSlug)}`, API_URL);
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Categoria no encontrada");
          }
          throw new Error("No se pudo cargar la categoria");
        }

        const data = await response.json();
        if (isMounted) {
          setArea(data);
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

    loadArea();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [areaSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error.message}</p>
          <Button variant="outline" asChild>
            <Link to="/categorias">Volver a categorias</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!area) {
    return null;
  }

  const baseUrl = area.filesBaseUrl || CDN_URL || "";
  const specialties = Array.isArray(area.items)
    ? area.items.map(item => ({
        ...item,
        area: area.name,
        areaSlug: area.slug,
        filesBaseUrl: baseUrl
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white-50">
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link to="/categorias">Volver a categorias</Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {area.img ? (
              <div className="w-full md:w-56 bg-white rounded-xl shadow-md p-4">
                <img
                  src={`${baseUrl}${area.img}`}
                  alt={area.name}
                  className="w-full h-auto object-contain"
                />
              </div>
            ) : null}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {area.name}
              </h1>
              <p className="text-gray-600">
                {specialties.length} especialidades disponibles
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {specialties.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">
              No hay especialidades en esta categoria.
            </p>
          ) : (
            <SpecialtyGrid specialties={specialties} />
          )}
        </div>
      </section>
    </div>
  );
}

export default Category;
