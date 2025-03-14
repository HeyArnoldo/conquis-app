import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SpecialtyGrid from './components/SpecialtyGrid';
import Spinner from './components/Spinner';

function App() {
  const [specialties, setSpecialties] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cantidad de especialidades por página
  const limit = 20;

  const fetchSpecialties = useCallback(async (pageNumber, search = searchTerm) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/areas/specialties/?limit=${limit}&page=${pageNumber}&search=${encodeURIComponent(search)}`
      );
      const data = await response.json();
      if (pageNumber === 1) {
        setSpecialties(data.specialties);
      } else {
        setSpecialties(prev => [...prev, ...data.specialties]);
      }
      setTotal(data.total);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Ejecuta la búsqueda cuando cambian la página o el término de búsqueda
  useEffect(() => {
    fetchSpecialties(page, searchTerm);
  }, [page, searchTerm, fetchSpecialties]);

  // Reinicia la lista y la paginación al cambiar el término de búsqueda
  useEffect(() => {
    setSpecialties([]);
    setPage(1);
  }, [searchTerm]);

  // Infinite Scroll: carga la siguiente página al acercarse al final
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loading &&
        specialties.length < total
      ) {
        setPage(prevPage => prevPage + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, specialties, total]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} total={total} />
        {specialties.length === 0 && !loading ? (
          <p className="text-center text-gray-600 text-xl">No se encontraron especialidades.</p>
        ) : (
          <SpecialtyGrid specialties={specialties} />
        )}
        {loading && <Spinner />}
      </main>
    </div>
  );
}

export default App;
