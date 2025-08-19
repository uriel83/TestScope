import { Injectable, signal } from '@angular/core';
import { TableFilters } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FiltersStateService {

  activeFiltersData = signal<TableFilters>({ subjects: [], traineeIds: [], dateFrom: null, dateTo: null });
  activeFiltersAnalysis = signal<TableFilters>({ subjects: [], traineeIds: [], dateFrom: null, dateTo: null });
  activeFiltersMonitor = signal<TableFilters>({ subjects: [], traineeIds: [], dateFrom: null, dateTo: null });

  setFiltersData(filters: TableFilters) {
    console.log('Setting filters for data:', filters);
    this.activeFiltersData.set(filters);
  }

  clearFiltersData() {
    this.activeFiltersData.set({ subjects: [], traineeIds: [], dateFrom: null, dateTo: null });
  }

  setFiltersAnalysis(filters: TableFilters) {
    this.activeFiltersAnalysis.set(filters);
  }

  clearFiltersAnalysis() {
    this.activeFiltersAnalysis.set({ subjects: [], traineeIds: [], dateFrom: null, dateTo: null },);
  }
  setFiltersMonitor(filters: TableFilters) {
    this.activeFiltersMonitor.set(filters);
  }
  clearFiltersMonitor() {
    this.activeFiltersMonitor.set({ subjects: [], traineeIds: [], dateFrom: null, dateTo: null },);
  }
}
