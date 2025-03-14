import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm, total }) => (
  <div className="mb-8 flex flex-col sm:flex-row items-center justify-between">
    <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar especialidad..."
        className="w-full border border-yellow-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
      />
    </div>
    <div className="text-gray-700">
      <p>
        Total de especialidades encontradas: <span className="font-bold">{total}</span>
      </p>
    </div>
  </div>
);

export default SearchBar;
