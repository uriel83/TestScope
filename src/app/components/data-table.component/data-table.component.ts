import {
  Component,
  inject,
  signal,
  effect,
  ViewChild,
  AfterViewInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableFilters, TraineeLite, TraineeRecord } from '../../models/models';
import { TraineesService } from '../../services/trainees.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TableFiltersComponent } from '../table-filters.component/table-filters.component';
import { FiltersStateService } from '../../services/filters-state-service';
import { DataDetailsComponent } from '../data-details.component/data-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog.component/confirm-dialog.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    TableFiltersComponent,
    DataDetailsComponent,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent implements AfterViewInit {
  private traineesService = inject(TraineesService);
  private filtersStateService = inject(FiltersStateService);
  private dialog = inject(MatDialog);
  records = computed<TraineeRecord[]>(() => this.traineesService.records());
  subjectList = computed<string[]>(() => this.traineesService.subjectList());
  traineeList = computed<TraineeLite[]>(() =>
    this.traineesService.traineeList()
  );
  activeFiltersData = computed<TableFilters>(() =>
    this.filtersStateService.activeFiltersData()
  );

  filteredRecords = computed<TraineeRecord[]>(() => {
    const data = this.records();
    const { subjects, traineeIds, dateFrom, dateTo, gradeMin, gradeMax } =
      this.activeFiltersData() as TableFilters;

    if (
      !subjects.length &&
      !traineeIds.length &&
      !dateFrom &&
      !dateTo &&
      gradeMin === null &&
      gradeMax === null
    ) {
      return data;
    }

    const subjectSet = subjects.length ? new Set(subjects) : null;
    const traineeSet = traineeIds.length ? new Set(traineeIds) : null;

    const applyDateFilter = !!(dateFrom && dateTo);
    const fromTime = applyDateFilter ? dateFrom!.getTime() : 0;
    const toTime = applyDateFilter
      ? dateTo!.getTime()
      : Number.MAX_SAFE_INTEGER;

    return data.filter((rec) => {
      const subjectOk = !subjectSet || subjectSet.has(rec.subject);
      const traineeOk = !traineeSet || traineeSet.has(rec.idTrainee);
      const dateOk =
        !applyDateFilter ||
        (rec.examDate &&
          rec.examDate.getTime() >= fromTime &&
          rec.examDate.getTime() <= toTime);
      const gradeOk =
        (gradeMin === null ||
          gradeMin === undefined ||
          rec.grade >= gradeMin) &&
        (gradeMax === null || gradeMax === undefined || rec.grade <= gradeMax);

      return subjectOk && traineeOk && dateOk && gradeOk;
    });
  });

  dataSource = new MatTableDataSource<TraineeRecord>([]);
  displayedColumns: string[] = [
    'id',
    'name',
    'examDate',
    'grade',
    'subject',
    'actions',
  ];
  selected = signal<TraineeRecord | null>(null);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource.data = this.filteredRecords();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.paginator.pageSize = 10;
  }

  selectRecord(row: TraineeRecord) {
    if (this.selected() === row) {
      this.selected.set(null);
    } else {
      this.selected.set(row);
    }
  }

  onSaveTrainee(record: TraineeRecord) {
    console.log('Saving trainee:', record);
    this.traineesService.update(record);
    this.selected.set(null);
  }

  onCancelEdit() {
    console.log('Edit cancelled');
    this.selected.set(null);
  }
  generateTempId(): number {
    const used = new Set(this.traineesService.records().map((r) => +r.id));
    for (let i = 1; i <= 100; i++) if (!used.has(i)) return i;
    return Date.now();
  }

  createBlankRecord(): TraineeRecord {
    return {
      id: this.generateTempId(),
      idTrainee: 0,
      name: '',
      grade: 0,
      email: '',
      examDate: new Date(),
      address: '',
      city: '',
      country: '',
      zip: '',
      subject: '',
    };
  }

  onAdd() {
    const draft = this.createBlankRecord();
    this.traineesService.add(draft);
    this.selected.set(draft);
    this.filtersStateService.clearFiltersData();
    console.log(this.activeFiltersData());
  }

  onDelete(row: TraineeRecord) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { name: row.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Delete trainee:', row);
        this.traineesService.remove(row);
        this.selected.set(null);
      }
    });
  }
}
