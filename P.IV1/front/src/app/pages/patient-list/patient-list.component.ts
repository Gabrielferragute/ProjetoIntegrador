import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  patients = signal<Patient[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);

  filteredPatients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.patients();
    return this.patients().filter(p => p.name.toLowerCase().includes(query));
  });

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.patientService.getPatients().subscribe({
      next: (data) => {
        // If data is null/undefined or not array, use []
        this.patients.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar pacientes', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }
}
