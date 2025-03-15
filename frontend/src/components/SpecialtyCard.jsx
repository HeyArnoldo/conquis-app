import React, { useState } from "react";
import { ImageDialog } from "./ImageDialog";
import { PDFDialog } from "./PDFDialog";

const CDN_URL = import.meta.env.APP_CDN_URL;
const fallbackImg = "/placeholder.svg"; // Asegúrate de tener este SVG en /public

const SpecialtyCard = ({ specialty }) => {
  // Imagen principal con fallback
  const [cardImg, setCardImg] = useState(`${CDN_URL}${specialty.img}`);

  const handleImageError = (event) => {
    // Si falla la carga, cambiamos la fuente al placeholder
    event.currentTarget.src = fallbackImg;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">

        <ImageDialog
          imageSrc={`${CDN_URL}${specialty.img}`}
          imageAlt={specialty.name}
        />

      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-2 text-blue-900">
          {specialty.name}
        </h2>
        <p className="text-gray-700 mb-2">Área: {specialty.area}</p>
        <a
          href={`${CDN_URL}${specialty.pdf}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-600 font-medium hover:underline mr-4"
        >
          Ver Ficha PDF
        </a>

        {/* Botón o enlace que abre el PDF en un modal (si tu PDFDialog así lo maneja) */}
        <PDFDialog
          pdfSrc={`${CDN_URL}${specialty.pdf}`}
          triggerText="Ver PDF"
        />
      </div>
    </div>
  );
};

export default SpecialtyCard;
