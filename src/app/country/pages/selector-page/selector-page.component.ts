import { CountriesService } from './../../services/countries.service';
import { Component, OnInit } from '@angular/core';
import { filter, switchMap, tap } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Region, SmallCountry } from '../../interfaces/country';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit{

  public countriesByRegions: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required ],
    country: ['', Validators.required ],
    border: ['', Validators.required ],

  })

  constructor(
    private fb: FormBuilder,
    private contriesService: CountriesService,
  ) {}

  // access to
  ngOnInit(): void {
    this.onRegionChanged()
    this.onCountryChanged()
  }

  // send data by references
  get regions(): Region[] {
    return this.contriesService.regions;
  }

  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('country')!.setValue('') ), // Clean form
        tap( () => this.borders = [] ),
        // switchMap take last observable data and subscribe to the new
        switchMap( region => this.contriesService.getCountriesByRegion( region ) )
      )
      .subscribe( countries => {
        this.countriesByRegions = countries;
    });
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('border')!.setValue('') ), // Clean form
        filter( (value: string) => value.length > 0 ), // if value query is empty the next not will response
        switchMap( alphaCode => this.contriesService.getCountryAlphaCode( alphaCode ) ),
        switchMap( country => this.contriesService.getCountryBordersByCodes( country.borders ) ) // get all borders
      )
      .subscribe( countries => {
        this.borders = countries;
    });
  }





}
