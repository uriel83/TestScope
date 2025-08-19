import {
  Component, EventEmitter, inject, Input, Output,
  OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TraineeRecord } from '../../models/models';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-data-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './data-details.component.html',
  styleUrls: ['./data-details.component.scss'],
})
export class DataDetailsComponent implements OnChanges {
  @Input() selected: TraineeRecord | null = null;

  @Output() save = new EventEmitter<TraineeRecord>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    id: [{ value: '', disabled: true }],
    idTrainee: [''],
    name: [''],
    grade: [null as number | null],
    email: [''],
    examDate: [null as Date | null],
    address: [''],
    city: [''],
    country: [''],
    zip: [''],
    subject: [''],
  });

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.selected) {
      const { examDate, ...rest } = this.selected;
      this.form.patchValue({
        ...rest,
        examDate: examDate
          ? (examDate instanceof Date ? examDate : new Date(examDate as any))
          : null,
      }, { emitEvent: false });
    } else {
      this.form.reset({}, { emitEvent: false });
    }
  }

  onSave(): void {
    if (!this.selected || this.form.invalid) return;

    const merged: TraineeRecord = {
      ...this.selected,
      ...this.form.getRawValue(), // כולל id (disabled) נשאר מה-selected
    } as TraineeRecord;

    this.save.emit(merged);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
