import { Component, inject, signal } from '@angular/core';
import { AnalysisComponent } from '../analysis.component/analysis.component';
import { DataTableComponent } from '../data-table.component/data-table.component';
import { MonitorComponent } from '../monitor.component/monitor.component';
import { MatButtonModule } from '@angular/material/button';
import { TraineesService } from '../../services/trainees.service';


@Component({
  selector: 'app-home',
  imports: [MatButtonModule, DataTableComponent, AnalysisComponent, MonitorComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
    private traineesService = inject(TraineesService);

  activeView = signal<'data' | 'analysis' | 'monitor'>('data');
  ngOnInit(): void {
    this.traineesService.getData().subscribe();
  }
}

