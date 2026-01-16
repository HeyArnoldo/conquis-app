import React from "react";
import CepItemCard from "@/components/CepItemCard";

const CepItemGrid = ({ items, filesBaseUrl }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((item) => (
      <CepItemCard key={item.slug} item={item} filesBaseUrl={filesBaseUrl} />
    ))}
  </div>
);

export default CepItemGrid;
