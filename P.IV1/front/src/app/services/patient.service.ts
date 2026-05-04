import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Patient } from '../models/patient.model';
import { Consultation } from '../models/consultation.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService extends BaseService {

  constructor(http: HttpClient) {
    super(http);
  }

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/patients`);
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${id}`);
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/patients`, patient);
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/patients/${id}`, patient);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/patients/${id}`);
  }

  getPatientConsultations(id: number): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.apiUrl}/patients/${id}/consultations`);
  }

  createConsultation(consultation: any): Observable<Consultation> {
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

  updateConsultation(id: number, data: any): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.apiUrl}/consultations/${id}`, data);
  }
}
