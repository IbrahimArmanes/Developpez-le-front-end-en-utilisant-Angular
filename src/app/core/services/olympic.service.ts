import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<Olympic[]>([]);

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<Olympic[]> {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      retry(2),
      tap((value) => this.olympics$.next(value)),
      catchError((e : HttpErrorResponse) => this.handleError(e)
      )
    );
  }

  getOlympics(): Observable<Olympic[]> {
    return this.olympics$.asObservable();
  }
  // Centralized error handling function
  private handleError(e: HttpErrorResponse): Observable<never> 
  {
    let userFriendlyMessage = 'An unknown error occurred. Please try again later.';
    
    if (e.error instanceof ErrorEvent) {
      // A client-side or network error occurred
      console.error('A client-side error occurred:', e.error.message);
      userFriendlyMessage = 'There seems to be a problem with your network connection.';
    } else {
      // Backend or server-side error
      console.error(`Backend returned code ${e.status}, body was:`, e.error);
      if (e.status === 404) {
        userFriendlyMessage = 'The requested resource was not found.';
      } else if (e.status === 500) {
        userFriendlyMessage = 'The server encountered an error. Please try again later.';
      }
    }
    // Update the BehaviorSubject to reflect the empty state
    this.olympics$.next([]);

    // Display the error message to the user
    alert(userFriendlyMessage);

    // Return an observable with a user-facing error message
    return throwError(() => new Error(userFriendlyMessage));
  }

@Injectable({
  providedIn: 'root',
})

  getPieChartData(): Observable<{ countries: string[], medalCounts: number[], numberOfCountries: number, numberOfJOs: number }> {
    return this.olympics$.pipe(
      map(olympics => {
        const countries = olympics.map(olympic => olympic.country);
        const medalCounts = olympics.map(olympic => 
          olympic.participations.reduce((sum, participation) => sum + participation.medalsCount, 0)
        );
        const numberOfCountries = countries.length;
        const numberOfJOs = Math.max(...olympics.map(olympic => olympic.participations.length));
        return { countries, medalCounts, numberOfCountries, numberOfJOs };
      })
    );
  }

  // getCountriesAndMedals(): { countries: string[], medalCounts: number[] } {
  //   const olympics = this.olympics$.getValue();
  //   const countries = olympics.map(olympic => olympic.country);
  //   const medalCounts = olympics.map(olympic => 
  //     olympic.participations.reduce((sum, participation) => sum + participation.medalsCount, 0)
  //   );
  //   return { countries, medalCounts };
  // }
}