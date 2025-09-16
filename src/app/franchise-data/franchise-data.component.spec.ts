import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FranchiseDataComponent } from './franchise-data.component';

describe('FranchiseDataComponent', () => {
  let component: FranchiseDataComponent;
  let fixture: ComponentFixture<FranchiseDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FranchiseDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FranchiseDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
