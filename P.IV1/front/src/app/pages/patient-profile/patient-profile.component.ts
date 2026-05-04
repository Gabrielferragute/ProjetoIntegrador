import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { Consultation } from '../../models/consultation.model';
import { forkJoin, catchError, of } from 'rxjs';
import { ConsultationCardComponent } from '../../components/consultation-card/consultation-card.component';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ConsultationCardComponent],
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss']
})
export class PatientProfileComponent implements OnInit {
  patientId!: number;
  patient = signal<Patient | null>(null);
  consultations = signal<Consultation[]>([]);
  
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.patientId = +idParam;
      this.loadPatientData();
    } else {
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  loadPatientData() {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      patient: this.patientService.getPatient(this.patientId).pipe(
        catchError(err => {
          console.error('Erro ao carregar paciente', err);
          throw err;
        })
      ),
      consultations: this.patientService.getPatientConsultations(this.patientId).pipe(
        catchError(err => {
          console.warn('Erro ao carregar consultas, retornando array vazio', err);
          return of([]);
        })
      )
    }).subscribe({
      next: (data) => {
        this.patient.set(data.patient);
        this.consultations.set(data.consultations || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }
}
