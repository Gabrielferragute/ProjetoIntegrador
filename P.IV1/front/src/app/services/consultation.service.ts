import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Consultation } from '../models/consultation.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService extends BaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  getPatientConsultations(patientId: number): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.apiUrl}/patients/${patientId}/consultations`);
  }

  createConsultation(consultation: Partial<Consultation>): Observable<Consultation> {
    return this.http.post<Consultation>(`${this.apiUrl}/consultations/`, consultation);
  }

  uploadConsultationAudio(consultationId: number, audioBlob: Blob): Observable<Consultation> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    return this.http.post<Consultation>(`${this.apiUrl}/consultations/${consultationId}/audio`, formData);
  }

  getConsultation(id: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${this.apiUrl}/consultations/${id}`);
  }

  updateConsultation(id: number, data: Partial<Consultation>): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.apiUrl}/consultations/${id}`, data);
  }
}
