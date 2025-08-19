import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import 'chartjs-adapter-date-fns'; // ← מאפשר ציר זמן

export type ChartKey = 'chart1' | 'chart2' | 'chart3';
import { TraineeRecord } from '../../models/models';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.scss']
})
export class ChartWidgetComponent implements OnChanges {
  @Input({ required: true }) chart!: ChartKey;
  @Input() records: TraineeRecord[] = [];
  @Input() selectedIds: number[] = [];
  @Input() selectedSubjects: string[] = [];

  chartType: ChartType = 'line';
  chartData: ChartData = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { ticks: { autoSkip: true, maxTicksLimit: 12 } },
      y: { beginAtZero: true, suggestedMax: 100 }
    }
  };

  emptyMessage: string | null = null;

  ngOnChanges(): void {
    this.rebuild();
  }

  private rebuild(): void {
    this.emptyMessage = null;

    if (this.chart === 'chart1') {
      this.chartType = 'line';
      this.buildChart1();
    } else if (this.chart === 'chart2') {
      this.chartType = 'bar';
      this.buildChart2();
    } else {
      this.chartType = 'bar';
      this.buildChart3();
    }
  }

  private buildChart1(): void {
    if (!this.selectedIds?.length) { this.setEmpty('No ID selected'); return; }

    const recs = this.records.filter(r => this.selectedIds.includes(r.idTrainee));
    if (!recs.length) { this.setEmpty('No data for selected IDs'); return; }

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day' },
          ticks: { autoSkip: true, maxTicksLimit: 12 }
        },
        y: { beginAtZero: true, suggestedMax: 100 }
      }
    };

    const byId = new Map<number, { x: number; y: number }[]>();
    for (const r of recs) {
      const rawDate: any = (r as any).examDate ?? r.examDate;
      const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
      const point = { x: date.getTime(), y: Number(r.grade ?? 0) };
      if (!byId.has(r.idTrainee)) byId.set(r.idTrainee, []);
      byId.get(r.idTrainee)!.push(point);
    }

    const nameById = this.nameMap(recs);
    const datasets = this.selectedIds.map(id => ({
      type: 'line' as const,
      label: nameById.get(id) || `ID ${id}`,
      data: (byId.get(id) ?? []).sort((a, b) => a.x - b.x),
      showLine: true,
      spanGaps: true,
      tension: 0.25,
      pointRadius: 2,
      fill: false
    }));

    this.chartData = { labels: [], datasets };
  }

  private buildChart2(): void {
    if (!this.selectedIds?.length) { this.setEmpty('No ID selected'); return; }

    const recs = this.records.filter(r => this.selectedIds.includes(r.idTrainee));
    if (!recs.length) { this.setEmpty('No data for selected IDs'); return; }

    // חזרה לציר קטגוריות
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { type: 'category', ticks: { autoSkip: true, maxTicksLimit: 12 } },
        y: { beginAtZero: true, suggestedMax: 100 }
      }
    };

    const nameById = this.nameMap(recs);
    const agg = new Map<number, { sum: number; cnt: number }>();
    for (const r of recs) {
      const id = r.idTrainee;
      const a = agg.get(id) ?? { sum: 0, cnt: 0 };
      a.sum += Number(r.grade ?? 0);
      a.cnt += 1;
      agg.set(id, a);
    }

    const ids = Array.from(agg.keys()).sort((a, b) =>
      (nameById.get(a) || `ID ${a}`).localeCompare(nameById.get(b) || `ID ${b}`)
    );

    const labels = ids.map(id => nameById.get(id) || `ID ${id}`);
    const data = ids.map(id => +(agg.get(id)!.sum / agg.get(id)!.cnt).toFixed(2));

    this.chartData = {
      labels,
      datasets: [{ type: 'bar', label: 'Average grade', data }]
    };
  }

  private buildChart3(): void {
    if (!this.selectedSubjects?.length) { this.setEmpty('No subject selected'); return; }

    const recs = this.records.filter(r => r.subject && this.selectedSubjects.includes(r.subject));
    if (!recs.length) { this.setEmpty('No data for selected subjects'); return; }

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { type: 'category', ticks: { autoSkip: true, maxTicksLimit: 12 } },
        y: { beginAtZero: true, suggestedMax: 100 }
      }
    };

    const agg = new Map<string, { sum: number; cnt: number }>();
    for (const r of recs) {
      const s = r.subject!.trim();
      const a = agg.get(s) ?? { sum: 0, cnt: 0 };
      a.sum += Number(r.grade ?? 0);
      a.cnt += 1;
      agg.set(s, a);
    }

    const subjects = Array.from(agg.keys()).sort((a, b) => a.localeCompare(b));
    const labels = subjects;
    const data = subjects.map(s => +(agg.get(s)!.sum / agg.get(s)!.cnt).toFixed(2));

    this.chartData = {
      labels,
      datasets: [{ type: 'bar', label: 'Average grade', data }]
    };
  }

  private setEmpty(msg: string) {
    this.emptyMessage = msg;
    this.chartData = { labels: [], datasets: [] };
  }

  private nameMap(recs: TraineeRecord[]): Map<number, string> {
    const m = new Map<number, string>();
    for (const r of recs) {
      if (r.name && !m.has(r.idTrainee)) m.set(r.idTrainee, r.name);
    }
    return m;
  }
}
