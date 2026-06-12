import { useState, useEffect } from 'react';
import { apiService, type Animal, type PaginatedAnimalsResponse, type FilterOptions, type AnimalFilters } from './services/api';
import MapDisplay from './components/MapDisplay';
import BreedPieChart from './components/BreedPieChart';
import AnimalTable from './components/AnimalTable';

function App() {
  const [animalsData, setAnimalsData] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<AnimalFilters>({});
  const [rescueFilter, setRescueFilter] = useState<string | null>(null);

  useEffect(() => {
    const initOptions = async () => {
      try {
        const options = await apiService.getFilterOptions();
        setFilterOptions(options);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    initOptions();
  }, []);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true);
        setError(null);
        if (rescueFilter) {
          const data: Animal[] = await apiService.getFilteredAnimals(rescueFilter);
          setAnimalsData(data);
          setTotalPages(1);
          setCurrentPage(1);
        } else {
          const data: PaginatedAnimalsResponse = await apiService.getAnimals(currentPage, pageSize, filters);
          setAnimalsData(data.animals);
          setTotalPages(data.totalPages);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching animals.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, [currentPage, pageSize, filters, rescueFilter]);

  const applyFilter = (newFilters: Partial<AnimalFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setRescueFilter(null);
    setCurrentPage(1);
  };

  const applyRescueFilter = (type: string | null) => {
    setRescueFilter(type);
    if (!type) {
      setFilters({}); // Reset all column filters when fully resetting
      setCurrentPage(1);
    }
  };

  return (
    <div className="min-h-screen box-border p-5 md:p-10 max-w-[1600px] mx-auto flex flex-col gap-8">
      <header className="flex items-center justify-between bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl shadow-black/30">
        <div className="flex items-center gap-5">
          <div>
            <h1 className="m-0 text-2xl font-bold text-slate-100 tracking-tight">Grazioso Salvare</h1>
            <p className="text-sm text-sky-400 font-medium m-0 mt-1">Rescue Dashboard <span className="text-slate-500 mx-2">|</span> <span className="text-slate-400">Richard Hawkins</span></p>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-8 flex-1">
        <section className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl shadow-black/30 flex flex-col">
          <div className="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
              <h2 className="text-xl font-bold text-slate-100 m-0 whitespace-nowrap">
                Animal Records
              </h2>
              
              {/* Preset Filters */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => applyRescueFilter(rescueFilter === 'water' ? null : 'water')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${rescueFilter === 'water' ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700 hover:text-white'}`}
                >
                  Water Rescue
                </button>
                <button 
                  onClick={() => applyRescueFilter(rescueFilter === 'mountain' ? null : 'mountain')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${rescueFilter === 'mountain' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700 hover:text-white'}`}
                >
                  Mountain Rescue
                </button>
                <button 
                  onClick={() => applyRescueFilter(rescueFilter === 'disaster' ? null : 'disaster')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${rescueFilter === 'disaster' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700 hover:text-white'}`}
                >
                  Disaster Tracking
                </button>
              </div>
            </div>

            {!error && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <label htmlFor="pageSize">Show:</label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-800 border border-white/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-1.5 rounded-md bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-slate-400 font-mono">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages || loading}
                    className="p-1.5 rounded-md bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-white/10 rounded-full border-t-purple-500 animate-spin mb-4 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
              <p className="text-slate-400 text-sm font-medium animate-pulse">Retrieving records from database...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-8 bg-red-500/5 border border-red-500/20 rounded-2xl">
              <div className="text-center max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-red-400 font-semibold text-lg mb-2">Connection Error</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
              </div>
            </div>
          ) : (
            <AnimalTable 
              animalsData={animalsData}
              selectedAnimalId={selectedAnimalId}
              onSelectAnimal={setSelectedAnimalId}
              filterOptions={filterOptions}
              filters={filters}
              onApplyFilter={applyFilter}
            />
          )}
        </section>

        {/* Dashboard Grid for Chart and Map */}
        <section className={`grid grid-cols-1 ${rescueFilter ? 'lg:grid-cols-2' : ''} gap-8`}>
          {/* Pie Chart (Conditional) */}
          {rescueFilter && (
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl shadow-black/30 flex flex-col items-center justify-center min-h-[400px]">
              <h2 className="text-xl font-bold text-slate-100 mb-4 w-full justify-start">
                Breed Distribution
              </h2>
              <div className="flex-1 w-full flex items-center justify-center">
                <BreedPieChart animals={animalsData} />
              </div>
            </div>
          )}

          {/* Map Display */}
          <MapDisplay animal={animalsData.find(a => a.id === selectedAnimalId) || null} />
        </section>

      </main>
    </div>
  );
}

export default App;
