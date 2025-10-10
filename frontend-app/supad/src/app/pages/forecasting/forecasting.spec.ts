import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Forecasting } from './forecasting';

describe('Forecasting', () => {
  let component: Forecasting;
  let fixture: ComponentFixture<Forecasting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Forecasting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Forecasting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
