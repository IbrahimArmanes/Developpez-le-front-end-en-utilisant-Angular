import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, switchMap, tap } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from 'src/app/core/models/Olympic';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public country: string;
  public olympicData: Olympic | undefined;

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [{ data: [] }],
    labels: []
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: 'chartArea',
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
  };

  constructor(private route: ActivatedRoute, private olympicService: OlympicService) {
    this.country = this.route.snapshot.paramMap.get('country') || '';
  }

  ngOnInit(): void {
    this.olympicService.getOlympics().subscribe(olympics => {
      this.olympicData = olympics.find(olympic => olympic.country === this.country);
      if (this.olympicData) {
        this.updateChartData();
      }
    });
  }

  private updateChartData(): void {
    if (this.olympicData) {
      // Calculate the minimum y-value for the chart
      const medalCounts = this.olympicData.participations.map(p => p.medalsCount);
      const minMedals = Math.min(...medalCounts);
      const minY = Math.floor(minMedals / 1.1);

      // Update the chart data
      this.lineChartData.labels = this.olympicData.participations.map(p => p.year.toString());
      this.lineChartData.datasets = [{
        data: medalCounts,
        label: 'Medals'
      }];

      this.lineChartOptions = {
        ...this.lineChartOptions,
        scales: {
          y: {
            min: minY,
            title: {
              display: true,
              text: 'Medals'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Dates'
            }
          }
        }
      };
    }
  }
  getOlympicData(): { totalMedals: number; totalAthletes: number; olympicData: Olympic } {
    const defaultData = { totalMedals: 0, totalAthletes: 0, olympicData: {} as Olympic };

    if (!this.olympicData) {
      return defaultData;
    }

    const totalMedals = this.olympicData.participations.reduce((sum, p) => sum + p.medalsCount, 0);
    const totalAthletes = this.olympicData.participations.reduce((sum, p) => sum + p.athleteCount, 0);

    return {
      totalMedals,
      totalAthletes,
      olympicData: this.olympicData
    };
  }}


