import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { SupService } from '../../../services/sup.service';
import { IotService } from '../../../services/iot.service';
import { Sup, Beach } from '../../../models';
import { PageLayoutComponent } from '../../../components/page-layout/page-layout.component';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';
import { AppDataSource } from '../../../shared/app-data-source';
import { AddSupDialogComponent, AddSupDialogResult } from './add-sup-dialog/add-sup-dialog.component';

// ── Component ────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-admin-sups',
  standalone: true,
  imports: [
    TranslatePipe,
    MatTableModule, MatSortModule, MatPaginatorModule,
    NgClass,
    MatMenuModule, MatIconModule, MatButtonModule,
    PageLayoutComponent, BreadcrumbComponent,
  ],
  templateUrl: './admin-sups.component.html',
  styleUrls: ['../admin-shared.scss'],
})
export class AdminSupsComponent implements OnInit, OnDestroy {
  displayedColumns = ['name', 'qrCode', 'beach', 'cabinetNumber', 'status', 'actions'];

  private supsData$ = new BehaviorSubject<Sup[]>([]);
  dataSource!: AppDataSource<Sup>;
  beaches: Beach[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort,      { static: true }) sort!: MatSort;

  private destroy$ = new Subject<void>();

  constructor(
    private supService: SupService,
    private iotService: IotService,
    private matDialog: MatDialog,
    private cd: ChangeDetectorRef,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.dataSource = new AppDataSource(this.supsData$, this.paginator, this.sort, ['name', 'qrCode', 'cabinetNumber']);

    this.supService.getAllSups().pipe(takeUntil(this.destroy$)).subscribe(s => {
      console.log('s: ', s);
      this.supsData$.next(s);
      this.cd.detectChanges();
    });
    this.supService.getAllBeaches().pipe(takeUntil(this.destroy$)).subscribe(b => this.beaches = b);
  }

  searchFilter(text: string): void {
    this.dataSource.filter = text;
  }

  getBeachName(beachId: string): string {
    return this.beaches.find(b => b.id === beachId)?.name ?? beachId;
  }

  openAddSupDialog(): void {
    const ref = this.matDialog.open(AddSupDialogComponent, {
      width: '500px',
      data: { beaches: this.beaches },
    });
    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: AddSupDialogResult | undefined) => {
      if (!result) return;
      this.supService.createSup(result.sup).subscribe(() => {
        this.supService.getAllSups().pipe(takeUntil(this.destroy$)).subscribe(s => {
          this.supsData$.next(s);
          this.cd.detectChanges();
        });
      });
    });
  }
  getNameForStatus(status: string): string {
    switch (status) {
      case '1': return this.translateService.instant('ADMIN.AVAILABLE');
      case '2': return this.translateService.instant('ADMIN.RENTED');
      case '3': return this.translateService.instant('ADMIN.MAINTENANCE');
      default:  return status;
    }
  }

  getColorForStatus(status: string): string {
    switch (status) {
      case '1': return 'status-dot--available';
      case '2': return 'status-dot--rented';
      case '3': return 'status-dot--maintenance';
      default:  return '';
    }
  } 
  unlockManual(sup: Sup): void {
    this.iotService.unlockCabinet(`cabinet-${sup.cabinetNumber}`, 'MANUAL').subscribe(res => {
      alert(res.message);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
