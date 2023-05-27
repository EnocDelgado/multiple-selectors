import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [
    Region.Africa,
    Region.America,
    Region.Asia,
    Region.Europe,
    Region.Oceania
  ];

  constructor(
    private http: HttpClient,
  ) { }

  // getter
  get regions(): Region[] {
    return [ ...this._regions ];
  }

  // extract countries by region
  getCountriesByRegion( region: Region ): Observable<SmallCountry[]> {
    // validation
    if ( !region ) return of([]);

    const url: string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`;

    return this.http.get<Country[]>( url )
      .pipe(
        map( countries => countries.map( country => ({
          // create smallcountry by map function
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),
      );
  }

  //
  getCountryAlphaCode( alphaCode: string ): Observable<SmallCountry> {

    // if ( !alphaCode ) return of([]);

    const url: string = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`;

    return this.http.get<Country>( url )
      .pipe(
        map( country  => ({
          // create smallcountry by map function
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        })),
      );
  }


  getCountryBordersByCodes( borders: string[] ): Observable<SmallCountry[]> {
    // validation
    if ( !borders || borders.length === 0 ) return of([]);

    // store all arrays (Observable<SmallCountry>[] is as a promise arrays)
    const countryRequest:Observable<SmallCountry>[] = []

    borders.forEach( code => {
      const request = this.getCountryAlphaCode( code );
      countryRequest.push( request );
    })
    // emit to all request  a value
    return combineLatest( countryRequest );
  }

}
