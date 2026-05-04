import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';

interface ProcessStep {
  label: string;
  status: 'pending' | 'active' | 'completed';
}

@Component({
  selector: 'app-consultation-processing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-processing.component.html',
  styleUrls: ['./consultation-processing.component.scss']
})
export class ConsultationProcessingComponent implements OnInit, OnDestroy {
  patientId!: number;
  consultationId!: number;
  hasError = signal<boolean>(false);
  
  steps = signal<ProcessStep[]>([
    { label: 'Transcrevendo áudio', status: 'active' },
    { label: 'Estruturando informações clínicas', status: 'pending' },
    { label: 'Finalizando laudo médico', status: 'pending' }
  ]);

  private timers: any[] = [];
  private pollInterval: any;

  constructor(private route: ActivatedRoute, private router: Router, private patientService: PatientService) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const consIdParam = this.route.snapshot.paramMap.get('consultationId');
    if (idParam && consIdParam) {
      this.patientId = +idParam;
      this.consultationId = +consIdParam;
      this.pollBackendStatus();
    } else {
      this.hasError.set(true);
    }
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private pollBackendStatus() {
    this.pollInterval = setInterval(() => {
      this.patientService.getConsultation(this.consultationId).subscribe({
        next: (consultation) => {
          if (consultation.status === 'processando') {
            // Animamos os passos baseados no tempo (mock visual para o usuário não achar que travou)
            this.steps.update(steps => {
              if (steps[0].status === 'active') {
                steps[0].status = 'completed';
                steps[1].status = 'active';
              } else if (steps[1].status === 'active' && Math.random() > 0.5) {
                // Aleatoriamente avança para o passo final
                steps[1].status = 'completed';
                steps[2].status = 'active';
              }
              return [...steps];
            });
          } else if (consultation.status === 'finalizada' || consultation.status === 'concluída') {
            clearInterval(this.pollInterval);
            this.steps.update(steps => {
              steps[0].status = 'completed';
              steps[1].status = 'completed';
              steps[2].status = 'completed';
              return [...steps];
            });
            setTimeout(() => {
              this.router.navigate(['/patients', this.patientId, 'consultations', this.consultationId, 'report']);
            }, 800);
          } else if (consultation.status === 'erro_processamento') {
            clearInterval(this.pollInterval);
            this.hasError.set(true);
          }
        },
        error: (err) => {
          console.error(err);
          clearInterval(this.pollInterval);
          this.hasError.set(true);
        }
      });
    }, 2000); // Check every 2 seconds
  }

  retry() {
    this.hasError.set(false);
    this.steps.set([
      { label: 'Transcrevendo áudio', status: 'active' },
      { label: 'Estruturando informações clínicas', status: 'pending' },
      { label: 'Finalizando laudo médico', status: 'pending' }
    ]);
    this.pollBackendStatus();
  }
}
