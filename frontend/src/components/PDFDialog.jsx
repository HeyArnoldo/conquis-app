import React from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function PDFDialog({ pdfSrc, triggerText = "Ver Ficha PDF" }) {
  return (
    <Dialog>
      {/* Este Trigger puede ser un botón, texto o cualquier otro elemento */}
      <DialogTrigger asChild>
        <Button className="bg-blue-600">{triggerText}</Button>
      </DialogTrigger>

      {/* Contenido del diálogo */}
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Ficha PDF</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>

        {/* Contenedor del PDF en iframe */}
        <div className="relative w-full h-[80vh]">
          <iframe
            src={pdfSrc}
            className="w-full h-full"
            title="PDF Ficha de Especialidad"
          />
          <DialogClose asChild>
            <button className="absolute top-2 right-2 text-white text-2xl font-bold">
              &times;
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
