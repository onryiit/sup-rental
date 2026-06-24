import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupService } from '../../services/sup.service';
import { RentalService } from '../../services/rental.service';
import { Sup, Beach, RentalDuration } from '../../models';

@Component({
  selector: 'app-rental-flow',
  templateUrl: './rental-flow.component.html',
  styleUrls: ['./rental-flow.component.scss'],
})
export class RentalFlowComponent implements OnInit {
  sup: Sup | null = null;
  beach: Beach | null = null;
  durations: RentalDuration[] = [];
  selectedDuration: RentalDuration | null = null;
  form!: FormGroup;
  loading = true;
  submitting = false;
  qrCode = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private supService: SupService,
    private rentalService: RentalService
  ) {}

  ngOnInit(): void {
    this.qrCode = this.route.snapshot.paramMap.get('qrCode') || '';
    this.form = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^(\+90|0)?5\d{9}$/)]],
      name: ['', Validators.required],
    });
    this.durations = this.supService.getRentalDurations();
    this.supService.getSupByQrCode(this.qrCode).subscribe(sup => {
      this.sup = sup;
      if (sup) {
        this.supService.getBeach(sup.beachId).subscribe(b => {
          this.beach = b;
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }

  selectDuration(d: RentalDuration): void {
    this.selectedDuration = d;
  }

  proceed(): void {
    if (!this.form.valid || !this.selectedDuration || !this.sup) return;
    this.submitting = true;
    const { phone, name } = this.form.value;
    this.rentalService
      .createRental(
        this.sup.id,
        this.sup.qrCode,
        this.sup.beachId,
        this.sup.cabinetNumber,
        this.selectedDuration,
        phone
      )
      .subscribe(rental => {
        this.router.navigate(['/payment', rental.id]);
      });
  }
}
