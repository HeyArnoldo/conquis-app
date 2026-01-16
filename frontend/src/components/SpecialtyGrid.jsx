import React from 'react';
import SpecialtyCard from './SpecialtyCard';

const SpecialtyGrid = ({ specialties }) => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    {specialties.map(specialty => {
      const key = specialty.areaSlug
        ? `${specialty.areaSlug}-${specialty.slug}`
        : specialty.slug;
      return <SpecialtyCard key={key} specialty={specialty} />;
    })}
  </div>
);

export default SpecialtyGrid;
