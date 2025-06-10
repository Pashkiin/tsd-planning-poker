import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCsvComponent } from './import-csv.component';

describe('ImportCsvComponent', () => {
  let component: ImportCsvComponent;
  let fixture: ComponentFixture<ImportCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportCsvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
