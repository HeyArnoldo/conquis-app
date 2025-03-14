import React from 'react';
import SpecialtyCard from './SpecialtyCard';

const SpecialtyGrid = ({ specialties }) => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    {specialties.map(specialty => (
      <SpecialtyCard key={specialty.slug} specialty={specialty} />
    ))}
  </div>
);

export default SpecialtyGrid;
