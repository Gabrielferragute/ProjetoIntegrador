import { Component, OnInit, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { ConsultationService } from '../../services/consultation.service';
import { Patient } from '../../models/patient.model';
import { Consultation } from '../../models/consultation.model';
import { forkJoin, catchError, of } from 'rxjs';
import { ConsultationCardComponent } from '../../components/consultation-card/consultation-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ConsultationCardComponent],
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientProfileComponent implements OnInit {
  patientId!: number;
  patient = signal<Patient | null>(null);
  consultations = signal<Consultation[]>([]);
  
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  
  showDeleteConfirm = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private consultationService: ConsultationService
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
      consultations: this.consultationService.getPatientConsultations(this.patientId).pipe(
        catchError(err => {
          console.warn('Erro ao carregar consultas, retornando array vazio', err);
          return of([]);
        })
      )
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
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

  confirmDelete() {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
  }

  executeDelete() {
    this.isDeleting.set(true);
    this.patientService.deletePatient(this.patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.router.navigate(['/patients']);
        },
        error: (err) => {
          console.error('Erro ao excluir paciente', err);
          this.isDeleting.set(false);
          this.showDeleteConfirm.set(false);
          alert('Não foi possível excluir o paciente. Verifique sua conexão e tente novamente.');
        }
      });
  }
}
