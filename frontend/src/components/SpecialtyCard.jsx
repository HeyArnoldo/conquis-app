import React from "react";
import { ImageDialog } from "./ImageDialog";
import { PDFDialog } from "./PDFDialog";

const CDN_URL = import.meta.env.APP_CDN_URL;

const SpecialtyCard = ({ specialty }) => {
  const baseUrl = specialty.filesBaseUrl || CDN_URL || "";
  const imageSrc = specialty.img ? `${baseUrl}${specialty.img}` : "";
  const pdfSrc = specialty.pdf ? `${baseUrl}${specialty.pdf}` : "";

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="p-4">
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <ImageDialog imageSrc={imageSrc} imageAlt={specialty.name} />
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-1 rounded-full w-fit mb-3">
          {specialty.area}
        </div>
        <h2 className="text-xl font-semibold text-slate-900 leading-snug mb-4">
          {specialty.name}
        </h2>
        <div className="flex items-center gap-3">
          <a
            href={pdfSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            Ver ficha PDF
          </a>

          <PDFDialog pdfSrc={pdfSrc} triggerText="Abrir PDF" />
        </div>
      </div>
    </div>
  );
};

export default SpecialtyCard;
