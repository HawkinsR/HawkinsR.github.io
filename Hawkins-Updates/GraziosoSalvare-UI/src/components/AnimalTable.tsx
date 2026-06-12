import { useState, useEffect } from 'react';
import type { Animal, FilterOptions, AnimalFilters } from '../services/api';

interface AnimalTableProps {
  animalsData: Animal[];
  selectedAnimalId: number | null;
  onSelectAnimal: (id: number) => void;
  filterOptions: FilterOptions | null;
  filters: AnimalFilters;
  onApplyFilter: (filters: Partial<AnimalFilters>) => void;
}

export default function AnimalTable({
  animalsData,
  selectedAnimalId,
  onSelectAnimal,
  filterOptions,
  filters,
  onApplyFilter
}: AnimalTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Animal; direction: 'asc' | 'desc' } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSort = (key: keyof Animal) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAnimals = [...animalsData].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const FilterDropdown = ({ columnKey, options, selectedValues }: { columnKey: keyof AnimalFilters, options: string[], selectedValues: string[] }) => {
    const isOpen = openDropdown === columnKey;
    return (
      <div className="relative inline-block ml-2">
        <button 
          onClick={(e) => { e.stopPropagation(); setOpenDropdown(isOpen ? null : columnKey); }}
          className={`p-1 rounded hover:bg-white/10 ${selectedValues.length > 0 ? 'text-sky-400' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 p-2 max-h-60 overflow-y-auto" onClick={e => e.stopPropagation()}>
            {options.map(opt => {
              const isChecked = selectedValues.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2 p-1.5 hover:bg-slate-700 rounded cursor-pointer text-sm font-normal text-slate-200">
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={(e) => {
                      const newSelected = e.target.checked 
                        ? [...selectedValues, opt] 
                        : selectedValues.filter(v => v !== opt);
                      onApplyFilter({ [columnKey]: newSelected });
                    }}
                    className="rounded border-slate-500 bg-slate-700 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="truncate">{opt || 'Unknown'}</span>
                </label>
              );
            })}
            {selectedValues.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-600">
                <button 
                  onClick={() => onApplyFilter({ [columnKey]: [] })}
                  className="w-full text-center text-xs text-slate-400 hover:text-white py-1"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const AgeFilterDropdown = () => {
    const isOpen = openDropdown === 'age';
    const isFiltered = filters.minAge !== undefined || filters.maxAge !== undefined;
    const maxWeeks = filterOptions?.maxAgeInWeeks || 1000;
    
    const [localMin, setLocalMin] = useState(filters.minAge || 0);
    const [localMax, setLocalMax] = useState(filters.maxAge || maxWeeks);

    useEffect(() => {
      setLocalMin(filters.minAge || 0);
      setLocalMax(filters.maxAge || maxWeeks);
    }, [filters.minAge, filters.maxAge, maxWeeks]);

    return (
      <div className="relative inline-block ml-2">
        <button 
          onClick={(e) => { e.stopPropagation(); setOpenDropdown(isOpen ? null : 'age'); }}
          className={`p-1 rounded hover:bg-white/10 ${isFiltered ? 'text-sky-400' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 p-4" onClick={e => e.stopPropagation()}>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400">Min Age (weeks)</label>
                <span className="text-xs font-mono text-sky-400">{localMin}</span>
              </div>
              <input 
                type="range" min="0" max={maxWeeks} value={localMin}
                onChange={(e) => setLocalMin(Number(e.target.value))}
                onMouseUp={() => onApplyFilter({ minAge: localMin })}
                onTouchEnd={() => onApplyFilter({ minAge: localMin })}
                className="w-full accent-sky-500"
              />
            </div>
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400">Max Age (weeks)</label>
                <span className="text-xs font-mono text-sky-400">{localMax}</span>
              </div>
              <input 
                type="range" min="0" max={maxWeeks} value={localMax}
                onChange={(e) => setLocalMax(Number(e.target.value))}
                onMouseUp={() => onApplyFilter({ maxAge: localMax })}
                onTouchEnd={() => onApplyFilter({ maxAge: localMax })}
                className="w-full accent-sky-500"
              />
            </div>
            {isFiltered && (
              <div className="mt-3 pt-2 border-t border-slate-600">
                <button 
                  onClick={() => onApplyFilter({ minAge: undefined, maxAge: undefined })}
                  className="w-full text-center text-xs text-slate-400 hover:text-white py-1"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-950/50 shadow-inner relative">
      <table className="w-full text-left text-sm text-slate-300 border-collapse">
        <thead className="text-xs uppercase bg-slate-900/95 backdrop-blur text-slate-400 sticky top-0 z-10 shadow-md">
          <tr>
            <th onClick={() => handleSort('animalId')} className="px-6 py-5 font-semibold cursor-pointer hover:text-white transition-colors group">
              <div className="flex items-center gap-2">ID <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'animalId' ? 'opacity-100' : ''}`}>{sortConfig?.key === 'animalId' && sortConfig.direction === 'desc' ? '↑' : '↓'}</span></div>
            </th>
            <th onClick={() => handleSort('name')} className="px-6 py-5 font-semibold cursor-pointer hover:text-white transition-colors group">
              <div className="flex items-center gap-2">Name <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'name' ? 'opacity-100' : ''}`}>{sortConfig?.key === 'name' && sortConfig.direction === 'desc' ? '↑' : '↓'}</span></div>
            </th>
            <th className="px-6 py-5 font-semibold">
              <div className="flex items-center gap-2">
                <span className="cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('animalType')}>
                  Type <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'animalType' ? 'opacity-100' : ''}`}>{sortConfig?.key === 'animalType' && sortConfig.direction === 'desc' ? '↑' : '↓'}</span>
                </span>
                {filterOptions && <FilterDropdown columnKey="animalType" options={filterOptions.animalTypes} selectedValues={filters.animalType || []} />}
              </div>
            </th>
            <th onClick={() => handleSort('breed')} className="px-6 py-5 font-semibold cursor-pointer hover:text-white transition-colors group">
              <div className="flex items-center gap-2">Breed <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'breed' ? 'opacity-100' : ''}`}>{sortConfig?.key === 'breed' && sortConfig.direction === 'desc' ? '↑' : '↓'}</span></div>
            </th>
            <th className="px-6 py-5 font-semibold">
              <div className="flex items-center gap-2">
                <span className="cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('sexUponOutcome')}>
                  Sex <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'sexUponOutcome' ? 'opacity-100' : ''}`}>{sortConfig?.key === 'sexUponOutcome' && sortConfig.direction === 'desc' ? '↑' : '↓'}</span>
                </span>
                {filterOptions && <FilterDropdown columnKey="sexUponOutcome" options={filterOptions.sexes} selectedValues={filters.sexUponOutcome || []} />}
              </div>
            </th>
            <th className="px-6 py-5 font-semibold">
              <div className="flex items-center gap-2">
                <span className="cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('ageUponOutcome')}>
                  Age <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'ageUponOutcome' ? 'opacity-100' : ''}`}>{sortConfig?.key === 'ageUponOutcome' && sortConfig.direction === 'desc' ? '↑' : '↓'}</span>
                </span>
                {filterOptions && <AgeFilterDropdown />}
              </div>
            </th>
            <th className="px-6 py-5 font-semibold">
              <div className="flex items-center gap-2">
                <span className="cursor-pointer hover:text-white transition-colors group" onClick={() => handleSort('outcomeType')}>
                  Outcome <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === 'outcomeType' ? 'opacity-100' : ''}`}>{sortConfig?.key === 'outcomeType' && sortConfig.direction === 'desc' ? '↑' : '↓'}</span>
                </span>
                {filterOptions && <FilterDropdown columnKey="outcomeType" options={filterOptions.outcomes} selectedValues={filters.outcomeType || []} />}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedAnimals.map((animal) => {
            const isSelected = selectedAnimalId === animal.id;
            return (
              <tr
                key={animal.id}
                onClick={() => onSelectAnimal(animal.id)}
                className={`cursor-pointer transition-all duration-200 group ${isSelected ? 'bg-sky-500/10' : 'hover:bg-slate-800/50'}`}
              >
                <td className={`px-6 py-4 font-mono text-xs ${isSelected ? 'text-sky-300' : 'text-slate-500'} border-l-4 ${isSelected ? 'border-l-sky-400' : 'border-l-transparent group-hover:border-l-slate-700'}`}>
                  {animal.animalId || animal.id}
                </td>
                <td className={`px-6 py-4 font-medium ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {animal.name || <span className="text-slate-600 italic">Unknown</span>}
                </td>
                <td className="px-6 py-4 text-slate-300">{animal.animalType}</td>
                <td className="px-6 py-4 text-slate-300 max-w-[200px] truncate" title={animal.breed || ''}>{animal.breed}</td>
                <td className="px-6 py-4 text-slate-300">{animal.sexUponOutcome}</td>
                <td className="px-6 py-4 text-slate-300">{animal.ageUponOutcome}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${animal.outcomeType === 'Adoption' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      animal.outcomeType === 'Transfer' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        animal.outcomeType === 'Return to Owner' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                          'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    }`}>
                    {animal.outcomeType || 'N/A'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
