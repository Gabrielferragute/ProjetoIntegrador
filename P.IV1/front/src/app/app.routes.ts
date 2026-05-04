import { Routes } from '@angular/router';
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { ConsultationStartComponent } from './pages/consultation-start/consultation-start.component';
import { ConsultationRecordingComponent } from './pages/consultation-recording/consultation-recording.component';
import { ConsultationProcessingComponent } from './pages/consultation-processing/consultation-processing.component';
import { ConsultationReportComponent } from './pages/consultation-report/consultation-report.component';

export const routes: Routes = [
  { path: 'patients', component: PatientListComponent },
  { path: 'patients/new', component: PatientFormComponent },
  { path: 'patients/:id', component: PatientProfileComponent },
  { path: 'patients/:id/consultations/new', component: ConsultationStartComponent },
  { path: 'patients/:id/consultations/record', component: ConsultationRecordingComponent },
  { path: 'patients/:id/consultations/:consultationId/process', component: ConsultationProcessingComponent },
  { path: 'patients/:id/consultations/:consultationId/report', component: ConsultationReportComponent },
  { path: '', redirectTo: '/patients', pathMatch: 'full' }
];
