import React from "react";
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-auto object-contain cursor-pointer"
        />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] mx-auto">
        <DialogHeader>
          {/* Título oculto solo para accesibilidad */}
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          
          {/* Descripción también oculta para accesibilidad */}
          <DialogDescription className="sr-only">
            Aquí puedes ver la imagen en tamaño completo
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-h-[80vh] max-w-full object-contain mx-auto"
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
