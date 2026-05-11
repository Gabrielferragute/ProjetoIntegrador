import { Component, OnInit, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  isSaving = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('Ocorreu um erro ao tentar salvar o paciente. Verifique sua conexão e tente novamente.');
  showSuccessToast = signal<boolean>(false);
  patientId: number | null = null;
  isEditMode = signal<boolean>(false);

  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      age: [null, [Validators.required, Validators.min(0), Validators.max(150)]],
      gender: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.email]],
      observations: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.patientId = +idParam;
      this.isEditMode.set(true);
      this.loadPatientData();
    }
  }

  loadPatientData(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    
    this.patientService.getPatient(this.patientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (patient) => {
          this.patientForm.patchValue({
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone,
            email: patient.email,
            observations: patient.observations
          });
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.errorMessage.set('Falha ao carregar dados do paciente para edição.');
          this.isLoading.set(false);
        }
      });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.patientForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.hasError.set(false);

    const request$ = this.isEditMode() && this.patientId
      ? this.patientService.updatePatient(this.patientId, this.patientForm.value)
      : this.patientService.createPatient(this.patientForm.value);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.showSuccessToast.set(true);
          setTimeout(() => {
            this.router.navigate(['/patients']);
          }, 1500);
        },
        error: (err) => {
          console.error('Erro ao salvar paciente', err);
          this.isSaving.set(false);
          this.hasError.set(true);
          
          if (err.status === 422) {
            this.errorMessage.set('Dados inválidos. Verifique o formato do e-mail ou outros campos.');
          } else if (err.status === 409) {
            this.errorMessage.set('Já existe um paciente com este E-mail ou Telefone.');
          } else {
            this.errorMessage.set('Ocorreu um erro ao tentar salvar o paciente. Verifique sua conexão e tente novamente.');
          }
        }
      });
  }
}
