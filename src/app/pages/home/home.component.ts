import { Component, OnInit } from '@angular/core';
import { Observable, Subscription, switchMap, tap } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { ChartConfiguration } from 'chart.js';
import { Router } from '@angular/router';

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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgb(46, 148, 92)',
        yAlign: 'bottom',
        bodyColor: 'white',
        titleAlign: 'center',
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;
            return `🏅 ${value}`;
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const country = this.pieChartData.labels?.[chartElement.index] as string;
        if (country) {
          this.router.navigate(['/detail', country]);
        }
      }
    },
    onHover: (event, chartElement) => {
      if (event.native && event.native.target) {
        (event.native.target as HTMLElement).style.cursor = chartElement[0] ? 'pointer' : 'default';
      }
    }  };
  public numberOfJOs: number = 0;
  public numberOfCountries: number = 0;

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.subscription.add(
      this.olympicService.loadInitialData().pipe(
        tap(() => {
          this.olympics$ = this.olympicService.getOlympics(); // Setting olympics$ after loading data
        }),
        switchMap(() => this.olympicService.getPieChartData()) // Only after data is loaded, switch to chart data
      ).subscribe({
        next: (chartData) => {
          this.pieChartData.labels = chartData.countries;
          this.pieChartData.datasets[0].data = chartData.medalCounts;
          this.numberOfCountries = chartData.numberOfCountries;
          this.numberOfJOs = chartData.numberOfJOs;
        },
        error: (err) => {
          console.error('Error loading chart data:', err);
        }
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}