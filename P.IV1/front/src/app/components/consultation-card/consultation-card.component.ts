import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Consultation } from '../../models/consultation.model';

@Component({
  selector: 'app-consultation-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './consultation-card.component.html',
  styleUrls: ['./consultation-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationCardComponent {
  @Input({ required: true }) consultation!: Consultation;
  @Input({ required: true }) patientId!: number;
}
