export interface TraineeRecord {
  id: number;
  idTrainee: number;
  name: string;
  grade: number;
  email: string;
  examDate: Date;
  address: string;
  city: string;
  country: string;
  zip: string;
  subject: string;
}

export type TableFilters = {
  subjects: string[];
  traineeIds: number[];
  dateFrom?: Date | null;
  dateTo?: Date | null;
  gradeMin?: number | null;
  gradeMax?: number | null;
};

export type TraineeLite = { idTrainee: number; name: string };


