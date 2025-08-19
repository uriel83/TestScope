import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  computed,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { TableFilters } from '../../models/models';
import { FiltersStateService } from '../../services/filters-state-service';
import { TraineesService } from '../../services/trainees.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

type TraineeLite = { idTrainee: number; name: string };

@Component({
  selector: 'app-table-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './table-filters.component.html',
  styleUrl: './table-filters.component.scss',
})
export class TableFiltersComponent implements OnInit, OnDestroy, OnChanges {
  private filtersStateService = inject(FiltersStateService);
  private traineesService = inject(TraineesService);
  private fb = inject(FormBuilder);

  @Input() activeFilters?: TableFilters;
  @Input() type?: string;

  subjects = computed<string[]>(() => this.traineesService.subjectList());
  trainees = computed<TraineeLite[]>(() => this.traineesService.traineeList());

  form = this.fb.group({
    subjects: this.fb.control<string[]>([]),
    traineeIds: this.fb.control<number[]>([]),
    dateFrom: this.fb.control<Date | null>(null),
    dateTo: this.fb.control<Date | null>(null),
    gradeMin: this.fb.control<number | null>(null),
    gradeMax: this.fb.control<number | null>(null),
  });

  private sub?: Subscription;

  ngOnInit(): void {
    this.patchFilters();
    this.sub = this.form.valueChanges.subscribe((v) => {
      const payload = {
        subjects: v.subjects ?? [],
        traineeIds: v.traineeIds ?? [],
        dateFrom: v.dateFrom ?? null,
        dateTo: v.dateTo ?? null,
        gradeMin: v.gradeMin ?? null,
        gradeMax: v.gradeMax ?? null,
      } as TableFilters;

      switch (this.type) {
        case 'data':
          this.filtersStateService.setFiltersData(payload);
          break;
        case 'monitor':
          this.filtersStateService.setFiltersMonitor(payload);
          break;
        case 'analysis':
          this.filtersStateService.setFiltersAnalysis(payload);
          break;
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    const activeFiltersChange = changes['activeFilters'];
    if (!activeFiltersChange || activeFiltersChange.firstChange) return;

    const prevFilters = activeFiltersChange.previousValue as TableFilters;
    const nextFilters = activeFiltersChange.currentValue as TableFilters;

    const toTimestamp = (d: any) => (d instanceof Date ? d.getTime() : 0);
    const toNumber = (n: any) =>
      n === null || n === undefined || n === '' ? null : Number(n);

    const subjectsChanged =
      (prevFilters?.subjects ?? []).join() !==
      (nextFilters?.subjects ?? []).join();

    const traineeIdsChanged =
      (prevFilters?.traineeIds ?? []).join() !==
      (nextFilters?.traineeIds ?? []).join();

    const dateFromChanged = toTimestamp((prevFilters as any).dateFrom) !== toTimestamp((nextFilters as any).dateFrom);

    const dateToChanged = toTimestamp((prevFilters as any).dateTo) !== toTimestamp((nextFilters as any).dateTo);

    const gradeMinChanged = toNumber((prevFilters as any).gradeMin) !== toNumber((nextFilters as any).gradeMin);

    const gradeMaxChanged = toNumber((prevFilters as any).gradeMax) !== toNumber((nextFilters as any).gradeMax);

    if (
      subjectsChanged ||
      traineeIdsChanged ||
      dateFromChanged ||
      dateToChanged ||
      gradeMinChanged ||
      gradeMaxChanged
    ) {
      this.patchFilters();
    }
  }

  private patchFilters() {
    const f = this.activeFilters;
    if (f) {
      this.form.patchValue(
        {
          subjects: f.subjects ?? [],
          traineeIds: f.traineeIds ?? [],
          dateFrom: (f as any).dateFrom ?? null,
          dateTo: (f as any).dateTo ?? null,
          gradeMin: (f as any).gradeMin ?? null,
          gradeMax: (f as any).gradeMax ?? null,
        },
        { emitEvent: false }
      );
    }
  }

  resetFilters(): void {
    this.form.setValue({
      subjects: [],
      traineeIds: [],
      dateFrom: null,
      dateTo: null,
      gradeMin: null,
      gradeMax: null,
    });
    switch (this.type) {
      case 'data':
        this.filtersStateService.clearFiltersData();
        break;
      case 'monitor':
        this.filtersStateService.clearFiltersMonitor();
        break;
      case 'analysis':
        this.filtersStateService.clearFiltersAnalysis();
        break;
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  clearSubjects() {
    this.form.controls.subjects.setValue([]);
  }
  clearTrainees() {
    this.form.controls.traineeIds.setValue([]);
  }
  clearDates() {
    this.form.patchValue({ dateFrom: null, dateTo: null });
  }
}
