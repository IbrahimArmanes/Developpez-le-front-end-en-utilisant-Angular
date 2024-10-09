import { Component, OnInit } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public olympics$!: Observable<Olympic[]>;
  private subscription: Subscription = new Subscription();
  public pieChartData: ChartConfiguration['data'] = {
    datasets: [{ data: [] }],
    labels: []
  };
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.olympicService.loadInitialData().subscribe({
        next: () => {
          this.olympics$ = this.olympicService.getOlympics();
          this.updateChartData();
        }
      })
    );
  }

  updateChartData(): void {
    const { countries, medalCounts } = this.olympicService.getCountriesAndMedals();
    this.pieChartData.labels = countries;
    this.pieChartData.datasets[0].data = medalCounts;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}