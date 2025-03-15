import React, { useState } from "react";

const ImageWithFallback = ({ src, alt, fallbackSrc, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          {/* Placeholder visible mientras se carga la imagen */}
          <img src={fallbackSrc} alt="Placeholder" className="w-1/2" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setLoading(false);
        }}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;
