import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";

const CepItemCard = ({ item, filesBaseUrl }) => {
  const normalizedBase = filesBaseUrl?.replace(/\/+$/, "") || "";
  const normalizedPath = item.pdf?.replace(/^\/+/, "") || "";
  const normalizedImagePath = item.img?.replace(/^\/+/, "") || "";
  const pdfSrc = item.pdf ? `${normalizedBase}/${normalizedPath}` : "";
  const imageSrc = item.img ? `${normalizedBase}/${normalizedImagePath}` : "";

  const cardInner = (
    <>
      <div className="p-4">
        {imageSrc ? (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={imageSrc}
              alt={item.nombre}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center text-sm text-slate-500">
            Imagen no disponible
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit mb-3">
          {item.codigo}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          {item.nombre}
        </h3>
        {pdfSrc ? (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>PDF disponible</span>
            <span className="text-amber-700 font-medium">Abrir</span>
          </div>
        ) : (
          <p className="text-sm text-slate-500">PDF no disponible</p>
        )}
      </div>
    </>
  );

  if (!pdfSrc) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {cardInner}
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
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
                href={pdfSrc}
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
            src={pdfSrc}
            className="w-full h-full"
            title={`PDF ${item.nombre}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CepItemCard;









