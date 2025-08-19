import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFiltersComponent } from '../table-filters.component/table-filters.component';
import { TraineesService } from '../../services/trainees.service';
import { FiltersStateService } from '../../services/filters-state-service';
import { TableFilters, TraineeRecord } from '../../models/models';

type Row = {
  idTrainee: number;
  name: string;
  average: number;
  exams: number;
  passed: boolean;
};

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule, TableFiltersComponent],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss',
})
export class MonitorComponent {
  private traineesService = inject(TraineesService);
  private filtersStateService = inject(FiltersStateService);

  readonly PASS_THRESHOLD = 65;

  activeFiltersMonitor = computed<TableFilters>(() =>
    this.filtersStateService.activeFiltersMonitor()
  );

  records = computed<TraineeRecord[]>(() => this.traineesService.records());

  rowsBase = computed<Row[]>(() => {
    const agg = new Map<number, { name: string; sum: number; cnt: number }>();

    for (const r of this.records()) {
      const id = r.idTrainee;
      const a = agg.get(id) ?? { name: r.name ?? `ID ${id}`, sum: 0, cnt: 0 };
      a.name = r.name ?? a.name;
      a.sum += Number(r.grade ?? 0);
      a.cnt += 1;
      agg.set(id, a);
    }

    const rows: Row[] = [];
    for (const [id, a] of agg) {
      const avg = a.cnt ? +(a.sum / a.cnt).toFixed(2) : 0;
      rows.push({
        idTrainee: id,
        name: a.name,
        average: avg,
        exams: a.cnt,
        passed: avg >= this.PASS_THRESHOLD,
      });
    }

    rows.sort((x, y) => x.name.localeCompare(y.name));
    return rows;
  });

  allIds = computed<number[]>(() => {
    const s = new Set<number>();
    for (const r of this.records()) s.add(r.idTrainee);
    return Array.from(s).sort((a, b) => a - b);
  });

  rows = computed<Row[]>(() => {
    const rows = this.rowsBase().slice();
    const f = this.activeFiltersMonitor();

    const ids = f?.traineeIds ?? [];
    const idSet = ids.length ? new Set(ids) : null;

    const nameQuery =
      (f as any)?.nameQuery ??
      (f as any)?.name ??
      (f as any)?.names ??
      '';

    const states: string[] =
      (f as any)?.states && (f as any).states.length
        ? (f as any).states
        : ['passed', 'failed'];
    const stateSet = new Set(states);

    return rows
      .filter((r) => !idSet || idSet.has(r.idTrainee))
      .filter((r) =>
        nameQuery
          ? r.name.toLowerCase().includes(String(nameQuery).toLowerCase().trim())
          : true
      )
      .filter((r) => (r.passed ? stateSet.has('passed') : stateSet.has('failed')));
  });
}
