import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

import { TableFiltersComponent } from '../table-filters.component/table-filters.component';
import { TraineesService } from '../../services/trainees.service';
import { FiltersStateService } from '../../services/filters-state-service';
import { TableFilters, TraineeRecord } from '../../models/models';
import { ChartWidgetComponent } from '../chart-widget.component/chart-widget.component';

type Zone = 'left' | 'right' | 'hidden';
type ChartKey = 'chart1' | 'chart2' | 'chart3';

const CHART_TITLES: Record<ChartKey, string> = {
  chart1: 'Chart 1: Grades average over time (per student)',
  chart2: 'Chart 2: Students averages for selected IDs',
  chart3: 'Chart 3: Grades averages per subject',
};

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, DragDropModule, TableFiltersComponent, ChartWidgetComponent],
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
})
export class AnalysisComponent {
  private traineesService = inject(TraineesService);
  private filtersStateService = inject(FiltersStateService);

  activeFiltersAnalysis = computed<TableFilters>(() =>
    this.filtersStateService.activeFiltersAnalysis()
  );

  records = computed<TraineeRecord[]>(() => this.traineesService.records());

  allIds = computed<number[]>(() => {
    const set = new Set<number>();
    for (const r of this.records()) set.add(r.idTrainee);
    return Array.from(set).sort((a, b) => a - b);
  });

  allSubjects = computed<string[]>(() => {
    const set = new Set<string>();
    for (const r of this.records()) if (r.subject) set.add(r.subject);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  selectedIds = computed<number[]>(() => {
    const ids = this.activeFiltersAnalysis().traineeIds ?? [];
    return ids.length ? ids : this.allIds();
  });

  selectedSubjects = computed<string[]>(() => {
    const subs = this.activeFiltersAnalysis().subjects ?? [];
    return subs.length ? subs : this.allSubjects();
  });

  layout = signal<Record<Zone, ChartKey>>({
    left: 'chart1',
    right: 'chart3',
    hidden: 'chart2',
  });

  title = (key: ChartKey) => CHART_TITLES[key];

  private swapZones(src: Zone, dst: Zone) {
    if (src === dst) return;
    this.layout.update(l => ({ ...l, [src]: l[dst], [dst]: l[src] }));
  }

  onDrop(ev: CdkDragDrop<unknown>) {
    const src = ev.previousContainer.id as Zone;
    const dst = ev.container.id as Zone;
    this.swapZones(src, dst);
  }
}
