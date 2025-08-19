import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableFilters, TraineeRecord } from '../models/models';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TraineesService {
  private http = inject(HttpClient);
  private url = 'mock-data.json';

  records = signal<TraineeRecord[]>([]);
  subjectList = signal<string[]>([]);
  traineeList = signal<any[]>([]);

  getData(): Observable<TraineeRecord[]> {
    return this.http.get<TraineeRecord[]>(this.url).pipe(
      map((trainees) =>
        trainees.map((trainee) => ({
          ...trainee,
          examDate:
            trainee.examDate instanceof Date
              ? trainee.examDate
              : new Date(trainee.examDate as any),
        }))
      ),
      tap((data) => this.records.set(data)),
      tap((data) => this.extractLookups()),
      tap(() => console.log(this.subjectList(), this.traineeList())),
      catchError(() => of([]))
    );
  }

  extractLookups(): void {
    const records = this.records();
    if (!records || records.length === 0) {
      this.subjectList.set([]);
      this.traineeList.set([]);
      return;
    }

    const uniqueSubjects: string[] = [];
    const uniqueTrainees: { idTrainee: number; name: string }[] = [];

    for (const record of records) {
      if (record.subject && uniqueSubjects.indexOf(record.subject) === -1) {
        uniqueSubjects.push(record.subject);
      }

      let exists = false;
      for (const t of uniqueTrainees) {
        if (t.idTrainee === record.idTrainee) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        uniqueTrainees.push({
          idTrainee: record.idTrainee,
          name: record.name ?? '',
        });
      }
    }

    uniqueSubjects.sort((a, b) => a.localeCompare(b, 'he'));
    uniqueTrainees.sort((a, b) => a.name.localeCompare(b.name, 'he'));

    this.subjectList.set(uniqueSubjects);
    this.traineeList.set(uniqueTrainees);
  }

  update(record: TraineeRecord) {
    const currentRecords = this.records();
    const index = currentRecords.findIndex((r) => r.id === record.id);
    if (index !== -1) {
      currentRecords[index] = record;
      this.records.set([...currentRecords]);
    }
  }
  remove(record: TraineeRecord) {
    const currentRecords = this.records();
    const index = currentRecords.findIndex((r) => r.id === record.id);
    if (index !== -1) {
      currentRecords.splice(index, 1);
      this.records.set([...currentRecords]);
    }
  }

  add(record: TraineeRecord): void {
    const curr = this.records();
    this.records.set([record, ...curr]);
  }
}
