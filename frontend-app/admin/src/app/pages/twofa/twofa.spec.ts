import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFA } from './twofa';

describe('Twofa', () => {
  let component: TwoFA;
  let fixture: ComponentFixture<TwoFA>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoFA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoFA);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
