import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  isSaving = signal<boolean>(false);
  hasError = signal<boolean>(false);
  showSuccessToast = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      age: [null, [Validators.required, Validators.min(0), Validators.max(120)]],
      gender: ['', Validators.required],
      phone: ['', [Validators.pattern('^[0-9 \\-\\+()]*$')]],
      email: ['', [Validators.email]],
      observations: ['']
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

    this.patientService.createPatient(this.patientForm.value).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showSuccessToast.set(true);
        // Redireciona de volta após um tempo para o usuário ver o sucesso
        setTimeout(() => {
          this.router.navigate(['/patients']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao salvar paciente', err);
        this.isSaving.set(false);
        this.hasError.set(true);
      }
    });
  }
}
