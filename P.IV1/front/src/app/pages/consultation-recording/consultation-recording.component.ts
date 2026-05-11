import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, computed, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConsultationService } from '../../services/consultation.service';
import { AudioRecordingService, RecordingState } from '../../services/audio-recording.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-consultation-recording',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-recording.component.html',
  styleUrls: ['./consultation-recording.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultationRecordingComponent implements OnInit, OnDestroy {
  @ViewChild('audioCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  patientId!: number;
  
  state = signal<RecordingState>('IDLE');
  errorMessage = signal<string>('');
  
  timeElapsed = signal<number>(0);
  formattedTime = computed(() => this.formatTime(this.timeElapsed()));
  
  private analyser: AnalyserNode | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private animationFrameId: number | null = null;
  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private consultationService: ConsultationService,
    private audioRecordingService: AudioRecordingService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.patientId = +idParam;
      this.startRecording();
    } else {
      this.state.set('ERROR');
      this.errorMessage.set('Paciente não identificado.');
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  async startRecording(): Promise<void> {
    try {
      await this.audioRecordingService.startRecording(() => {
        // Callback if needed for chunks
      });
      
      const audioSetup = this.audioRecordingService.setupAudioContextForVisualizer();
      if (audioSetup) {
        this.analyser = audioSetup.analyser;
      }

      this.state.set('RECORDING');
      this.startTimer();
      
      setTimeout(() => {
        this.drawAudioWave();
      }, 100);

    } catch (err: unknown) {
      this.state.set('ERROR');
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          this.errorMessage.set('Acesso ao microfone negado. Permita o acesso no seu navegador.');
        } else if (err.name === 'NotFoundError') {
          this.errorMessage.set('Nenhum microfone encontrado.');
        } else {
          this.errorMessage.set('Erro desconhecido ao iniciar gravação de áudio.');
        }
      } else {
        this.errorMessage.set('Erro crítico no sistema de áudio.');
      }
      console.error(err);
    }
  }

  togglePause(): void {
    if (this.state() === 'RECORDING') {
      this.audioRecordingService.pauseRecording();
      this.audioRecordingService.suspendAudioContext();
      this.state.set('PAUSED');
      this.pauseTimer();
    } else if (this.state() === 'PAUSED') {
      this.audioRecordingService.resumeRecording();
      this.audioRecordingService.resumeAudioContext();
      this.state.set('RECORDING');
      this.startTimer();
    }
  }

  async finishRecording(): Promise<void> {
    this.state.set('FINISHED');
    this.pauseTimer();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    try {
      const audioBlob = await this.audioRecordingService.stopRecording();
      
      this.consultationService.createConsultation({ paciente_id: this.patientId })
        .pipe(
          switchMap(consultation => 
            this.consultationService.uploadConsultationAudio(consultation.id!, audioBlob)
          ),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (updatedConsultation) => {
            this.router.navigate(['/patients', this.patientId, 'consultations', updatedConsultation.id, 'process']);
          },
          error: (err: unknown) => {
            console.error(err);
            this.errorMessage.set('Erro no upload do áudio ou criação da consulta.');
            this.state.set('ERROR');
          }
        });
    } catch (err: unknown) {
       console.error(err);
       this.errorMessage.set('Erro ao processar o arquivo de áudio final.');
       this.state.set('ERROR');
    }
  }

  cancelRecording(): void {
    this.cleanup();
    this.router.navigate(['/patients', this.patientId]);
  }

  private drawAudioWave = (): void => {
    if (!this.canvasRef || !this.analyser) return;

    const canvas = this.canvasRef.nativeElement;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (this.state() === 'FINISHED') return;
      this.animationFrameId = requestAnimationFrame(draw);

      if (this.state() === 'PAUSED') return;

      this.analyser!.getByteFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvasCtx.scale(dpr, dpr);

      const WIDTH = rect.width;
      const HEIGHT = rect.height;

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      const gradient = canvasCtx.createLinearGradient(0, HEIGHT, 0, 0);
      gradient.addColorStop(0, '#0284c7'); 
      gradient.addColorStop(1, '#38bdf8'); 

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * HEIGHT;
        canvasCtx.fillStyle = gradient;
        
        const r = barWidth / 2;
        canvasCtx.beginPath();
        if (canvasCtx.roundRect) {
            canvasCtx.roundRect(x, HEIGHT - barHeight, barWidth - 1, barHeight, [r, r, 0, 0]);
        } else {
            canvasCtx.rect(x, HEIGHT - barHeight, barWidth - 1, barHeight);
        }
        canvasCtx.fill();

        x += barWidth;
      }
    };

    draw();
  };

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeElapsed.update(v => v + 1);
    }, 1000);
  }

  private pauseTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  private cleanup(): void {
    this.pauseTimer();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.audioRecordingService.cleanup();
  }
}
