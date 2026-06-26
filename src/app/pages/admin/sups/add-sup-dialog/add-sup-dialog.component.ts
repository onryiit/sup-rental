import { Component, Inject, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Beach, Sup } from '../../../../models';
import QRCode from 'qrcode';

export interface AddSupDialogData {
  beaches: Beach[];
}

export interface AddSupDialogResult {
  sup: Omit<Sup, 'id'>;
}

@Component({
  selector: 'app-add-sup-dialog',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, MatDialogModule, MatButtonModule, TranslatePipe],
  templateUrl: './add-sup-dialog.component.html',
  styleUrls: ['./add-sup-dialog.component.scss'],
})
export class AddSupDialogComponent implements OnInit {
  beaches: Beach[];

  supForm!: FormGroup;
  step: 'form' | 'qr' = 'form';
  submitting = false;

  generatedQrCode = '';
  qrDataUrl = '';
  savedSupName = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddSupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddSupDialogData,
  ) {
    this.beaches = data.beaches;
  }

  ngOnInit(): void {
    this.supForm = this.fb.group({
      name:          ['', [Validators.required, Validators.maxLength(50)]],
      beachId:       [this.beaches[0]?.id ?? '', Validators.required],
      cabinetNumber: [1, [Validators.required, Validators.min(1)]],
    });
  }

  private beachCode(beachId: string): string {
    const name = this.beaches.find(b => b.id === beachId)?.name ?? beachId;
    return name
      .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '')
      .split(/\s+/)
      .map((w: string) => w.slice(0, 2).toUpperCase())
      .join('')
      .slice(0, 6);
  }

  get previewQrCode(): string {
    const { beachId, cabinetNumber } = this.supForm?.value ?? {};
    const code = this.beachCode(beachId ?? '');
    const num  = String(cabinetNumber ?? 1).padStart(3, '0');
    return `QR-${code}-${num}`;
  }

  async onSubmit(): Promise<void> {
    if (this.supForm.invalid) {
      this.supForm.markAllAsTouched();
      return;
    }
    this.submitting = true;

    const { name, beachId, cabinetNumber } = this.supForm.value;
    const qrCode = this.previewQrCode;

    const sup: Omit<Sup, 'id'> = { name, beachId, cabinetNumber, qrCode, status: '1' };

    this.qrDataUrl = await QRCode.toDataURL(qrCode, {
      width: 280,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    this.generatedQrCode = qrCode;
    this.savedSupName = name;
    this.submitting = false;
    this.step = 'qr';
    this.savedSup = sup;
  }

  private savedSup: Omit<Sup, 'id'> | null = null;

  confirmClose(): void {
    this.dialogRef.close(this.savedSup ? ({ sup: this.savedSup } as AddSupDialogResult) : undefined);
  }

  printQr(): void {
    const { beachId, cabinetNumber } = this.supForm.value;
    const beach = this.beaches.find(b => b.id === beachId);
    const win = window.open('', '_blank', 'width=400,height=500');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>QR - ${this.generatedQrCode}</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column;
                 align-items: center; padding: 32px; background: white; }
          img  { width: 240px; height: 240px; }
          h2   { margin: 16px 0 4px; font-size: 22px; color: #0f172a; }
          p    { margin: 4px 0; font-size: 14px; color: #475569; }
          code { font-size: 18px; font-weight: 700; color: #0077b6;
                 background: #e0f2fe; padding: 6px 16px; border-radius: 8px;
                 display: inline-block; margin-top: 12px; letter-spacing: 1px; }
          .divider { border: none; border-top: 1px dashed #cbd5e1; width: 100%; margin: 20px 0; }
        </style>
      </head><body>
        <img src="${this.qrDataUrl}" alt="${this.generatedQrCode}" />
        <code>${this.generatedQrCode}</code>
        <hr class="divider" />
        <h2>${this.savedSupName}</h2>
        <p>${beach?.name ?? ''}</p>
        <p>Kabin #${cabinetNumber}</p>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    win.document.close();
  }
}
