import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export function ImageDialog({ imageSrc, imageAlt }) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {loading && !hasError ? (
            <div className="absolute inset-0 animate-pulse bg-slate-200" />
          ) : null}
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              Imagen no disponible
            </div>
          ) : (
            <img
              src={imageSrc}
              alt={imageAlt}
              onLoad={handleLoad}
              onError={handleError}
              className={`w-full h-full object-contain cursor-pointer transition-opacity duration-300 ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              loading="lazy"
            />
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] mx-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          <DialogDescription className="sr-only">
            Aquí puedes ver la imagen en tamaño completo
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          {loading && !hasError ? (
            <div className="absolute inset-0 animate-pulse bg-slate-200" />
          ) : null}
          {hasError ? (
            <div className="flex items-center justify-center min-h-[240px] text-sm text-slate-500">
              Imagen no disponible
            </div>
          ) : (
            <img
              src={imageSrc}
              alt={imageAlt}
              onLoad={handleLoad}
              onError={handleError}
              className={`max-h-[80vh] max-w-full object-contain mx-auto transition-opacity duration-300 ${
                loading ? "opacity-0" : "opacity-100"
              }`}
            />
          )}
          <DialogClose asChild>
            <button className="absolute top-2 right-2 text-white text-2xl font-bold">
              &times;
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
