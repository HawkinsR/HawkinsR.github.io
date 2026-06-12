const API_BASE_URL = '';

export interface Animal {
  id: number;
  ageUponOutcome: string | null;
  animalId: string | null;
  animalType: string | null;
  breed: string | null;
  color: string | null;
  dateOfBirth: string | null;
  dateTime: string | null;
  monthYear: string | null;
  name: string | null;
  outcomeSubtype: string | null;
  outcomeType: string | null;
  sexUponOutcome: string | null;
  locationLat: number;
  locationLong: number;
  ageUponOutcomeInWeeks: number;
}

export interface PaginatedAnimalsResponse {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  animals: Animal[];
}

export interface FilterOptions {
  animalTypes: string[];
  sexes: string[];
  outcomes: string[];
  maxAgeInWeeks: number;
}

export interface AnimalFilters {
  animalType?: string[];
  sexUponOutcome?: string[];
  outcomeType?: string[];
  minAge?: number;
  maxAge?: number;
}

export interface HealthCheckResponse {
  status: string;
  database: string;
  timestamp: string;
}

export interface RootCheckResponse {
  message: string;
  status: string;
  timestamp: string;
}

export const apiService = {
  async getRoot(): Promise<RootCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/api/smoke`);
    if (!response.ok) {
      throw new Error(`Root smoke check failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getHealth(): Promise<HealthCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getAnimals(page: number = 1, pageSize: number = 100, filters?: AnimalFilters): Promise<PaginatedAnimalsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    
    if (filters) {
      if (filters.animalType) filters.animalType.forEach(t => params.append('animalType', t));
      if (filters.sexUponOutcome) filters.sexUponOutcome.forEach(s => params.append('sexUponOutcome', s));
      if (filters.outcomeType) filters.outcomeType.forEach(o => params.append('outcomeType', o));
      if (filters.minAge !== undefined) params.append('minAge', filters.minAge.toString());
      if (filters.maxAge !== undefined) params.append('maxAge', filters.maxAge.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/Animal/animals?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch animals: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getFilterOptions(): Promise<FilterOptions> {
    const response = await fetch(`${API_BASE_URL}/api/Animal/filter-options`);
    if (!response.ok) {
      throw new Error(`Failed to fetch filter options: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async getFilteredAnimals(rescueType: string): Promise<Animal[]> {
    const response = await fetch(`${API_BASE_URL}/api/Animal/animals/filter/${rescueType}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch filtered animals: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
};
