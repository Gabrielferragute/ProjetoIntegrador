import { Component, OnInit, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-consultation-start',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './consultation-start.component.html',
  styleUrls: ['./consultation-start.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationStartComponent implements OnInit {
  patientId!: number;
  patient = signal<Patient | null>(null);
  
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  isStarting = signal<boolean>(false);

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

    this.patientService.getPatient(this.patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
        this.patient.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar paciente', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  startConsultation() {
    this.isStarting.set(true);
    // Transita instantaneamente para a tela de gravação onde a MediaRecorder API será iniciada
    this.router.navigate(['/patients', this.patientId, 'consultations', 'record']);
  }
}
