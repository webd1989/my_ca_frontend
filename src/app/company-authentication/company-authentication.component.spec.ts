import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyAuthenticationComponent } from './company-authentication.component';

describe('CompanyAuthenticationComponent', () => {
  let component: CompanyAuthenticationComponent;
  let fixture: ComponentFixture<CompanyAuthenticationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyAuthenticationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
