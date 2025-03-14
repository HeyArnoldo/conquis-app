import React from "react";
import { ImageDialog } from "./ImageDialog";
//import { PDFDialog } from "./PDFDialog";

const SpecialtyCard = ({ specialty }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
    <ImageDialog
      imageSrc={`http://localhost:8000${specialty.img}`}
      imageAlt={specialty.name}
    />
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-2 text-blue-900">
        {specialty.name}
      </h2>
      <p className="text-gray-700 mb-2">Área: {specialty.area}</p>
      <a
        href={`http://localhost:8000${specialty.pdf}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-yellow-600 font-medium hover:underline"
      >
        Ver Ficha PDF
      </a>
      {/* <PDFDialog
        pdfSrc={`http://localhost:8000${specialty.pdf}`}
        triggerText="Ver Ficha PDF"
      /> */}
    </div>
  </div>
);

export default SpecialtyCard;
