import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { SupService } from '../../../services/sup.service';
import { IotService } from '../../../services/iot.service';
import { Sup, Beach } from '../../../models';
import { PageLayoutComponent } from '../../../components/page-layout/page-layout.component';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';
import { AddSupDialogComponent, AddSupDialogResult } from './add-sup-dialog/add-sup-dialog.component';

@Component({
  selector: 'app-admin-sups',
  standalone: true,
  imports: [NgFor, NgIf, TranslatePipe, PageLayoutComponent, BreadcrumbComponent],
  templateUrl: './admin-sups.component.html',
  styleUrls: ['../admin-shared.scss'],
})
export class AdminSupsComponent implements OnInit {
  sups: Sup[] = [];
  beaches: Beach[] = [];

  constructor(
    private supService: SupService,
    private iotService: IotService,
    private matDialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.supService.getAllSups().subscribe(s => this.sups = s);
    this.supService.getAllBeaches().subscribe(b => this.beaches = b);
  }

  openAddSupDialog(): void {
    const dialogRef = this.matDialog.open(AddSupDialogComponent, {
      width: '500px',
      data: { beaches: this.beaches },
    });

    dialogRef.afterClosed().subscribe((result: AddSupDialogResult | undefined) => {
      if (!result) return;
      this.supService.createSup(result.sup as Omit<Sup, 'id'>).subscribe(created => {
        this.sups = [...this.sups, created];
      });
    });
  }

  getBeachName(beachId: string): string {
    return this.beaches.find(b => b.id === beachId)?.name ?? beachId;
  }

  unlockManual(sup: Sup): void {
    this.iotService.unlockCabinet(`cabinet-${sup.cabinetNumber}`, 'MANUAL').subscribe(res => {
      alert(res.message);
    });
  }
}
