import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-consultation-report',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './consultation-report.component.html',
  styleUrls: ['./consultation-report.component.scss']
})
export class ConsultationReportComponent implements OnInit {
  patientId!: number;
  consultationId!: number;
  today = new Date();

  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  showSuccess = signal<boolean>(false);

  // Simulando dados estruturados vindos do back-end (campo `laudo`)
  report = signal({
    identificacao: 'Paciente do sexo masculino, 45 anos.',
    queixa_principal: 'Dor de cabeça tensional há 3 dias e cansaço excessivo.',
    historia: 'Relata início dos sintomas na última segunda-feira. Nega febre, náuseas ou vômitos. Faz uso contínuo de losartana para hipertensão. Trabalha em frente ao computador por 10h diárias.',
    conduta: '1. Dipirona 1g de 8/8h em caso de dor.\n2. Descanso visual e pausas a cada hora.\n3. Retorno se os sintomas persistirem após 5 dias.'
  });

  // Buffer para edição
  editBuffer = {
    identificacao: '',
    queixa_principal: '',
    historia: '',
    conduta: ''
  };

  constructor(private route: ActivatedRoute, private router: Router, private patientService: PatientService) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const consParam = this.route.snapshot.paramMap.get('consultationId');
    if (idParam) this.patientId = +idParam;
    if (consParam) this.consultationId = +consParam;

    if (this.consultationId) {
      this.patientService.getConsultation(this.consultationId).subscribe({
        next: (consultation) => {
          if (consultation.laudo) {
            this.parseReportString(consultation.laudo);
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  parseReportString(reportString: string) {
    const reportObj = {
      identificacao: '',
      queixa_principal: '',
      historia: '',
      conduta: ''
    };

    const sections = reportString.split('### ');
    sections.forEach(section => {
      if (section.trim() === '') return;
      const lines = section.split('\n');
      const title = lines[0].trim().toLowerCase();
      const content = lines.slice(1).join('\n').trim();

      if (title.includes('identifica')) {
        reportObj.identificacao = content;
      } else if (title.includes('queixa')) {
        reportObj.queixa_principal = content;
      } else if (title.includes('história') || title.includes('historia')) {
        reportObj.historia = content;
      } else if (title.includes('conduta')) {
        reportObj.conduta = content;
      }
    });

    this.report.set(reportObj);
  }

  toggleEdit() {
    if (!this.isEditing()) {
      // Entra em modo de edição, copiando os valores
      this.editBuffer = { ...this.report() };
      this.isEditing.set(true);
    } else {
      // Cancela edição
      this.isEditing.set(false);
    }
  }

  saveReport() {
    this.isSaving.set(true);
    
    // Convert back to string format
    const reportStr = `### Identificação\n${this.editBuffer.identificacao}\n\n### Queixa principal\n${this.editBuffer.queixa_principal}\n\n### História\n${this.editBuffer.historia}\n\n### Conduta\n${this.editBuffer.conduta}\n`;

    this.patientService.updateConsultation(this.consultationId, { laudo: reportStr }).subscribe({
      next: () => {
        this.report.set({ ...this.editBuffer });
        this.isSaving.set(false);
        this.isEditing.set(false);
        
        this.showSuccess.set(true);
        setTimeout(() => this.showSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error(err);
        this.isSaving.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/patients', this.patientId]);
  }
}
