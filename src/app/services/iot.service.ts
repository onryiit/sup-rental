import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { IoTCommand } from '../models';
import { environment } from '../../environments/environment';

export interface IoTResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class IotService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Backend publishes MQTT message to AWS IoT Core topic: sups/{deviceId}/commands
  // Raspberry Pi subscribes to this topic and controls the relay
  unlockCabinet(cabinetDeviceId: string, rentalId: string): Observable<IoTResponse> {
    const command: IoTCommand = { deviceId: cabinetDeviceId, command: 'unlock', rentalId };
    // TODO: this.http.post<IoTResponse>(`${this.apiUrl}/iot/command`, command)
    console.log('[IoT] Unlock command sent:', command);
    return of({
      success: true,
      message: `Kabin ${cabinetDeviceId} kilidi açıldı`,
      timestamp: new Date().toISOString(),
    }).pipe(delay(1200));
  }

  lockCabinet(cabinetDeviceId: string): Observable<IoTResponse> {
    const command: IoTCommand = { deviceId: cabinetDeviceId, command: 'lock' };
    // TODO: this.http.post<IoTResponse>(`${this.apiUrl}/iot/command`, command)
    return of({ success: true, message: 'Kabin kilitlendi', timestamp: new Date().toISOString() }).pipe(delay(500));
  }
}
