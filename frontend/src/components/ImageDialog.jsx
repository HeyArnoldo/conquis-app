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

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 min-h-[287.02px]">
              <span>Cargando...</span>
            </div>
          )}
          <img
            src={imageSrc}
            alt={imageAlt}
            onLoad={handleLoad}
            className={`w-full h-auto object-contain cursor-pointer transition-opacity duration-300 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
          />
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
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 min-h-[287.02px]">
              <span>Cargando imagen...</span>
            </div>
          )}
          <img
            src={imageSrc}
            alt={imageAlt}
            onLoad={handleLoad}
            className={`max-h-[80vh] max-w-full object-contain mx-auto transition-opacity duration-300 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
          />
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
