import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';

export type RecordingState = 'IDLE' | 'RECORDING' | 'PAUSED' | 'FINISHED' | 'ERROR';

@Component({
  selector: 'app-consultation-recording',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-recording.component.html',
  styleUrls: ['./consultation-recording.component.scss']
})
export class ConsultationRecordingComponent implements OnInit, OnDestroy {
  @ViewChild('audioCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  patientId!: number;
  
  state = signal<RecordingState>('IDLE');
  errorMessage = signal<string>('');
  
  timeElapsed = signal<number>(0);
  formattedTime = computed(() => this.formatTime(this.timeElapsed()));
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private timerInterval: any;
  private animationFrameId: number | null = null;
  private stream: MediaStream | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private patientService: PatientService) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.patientId = +idParam;
      // Start recording automatically as they came from the "Start" screen
      this.startRecording();
    } else {
      this.state.set('ERROR');
      this.errorMessage.set('Paciente não identificado.');
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.setupAudioContext(this.stream);
      
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(250); // get chunks every 250ms
      this.state.set('RECORDING');
      this.startTimer();
      
      // Delay Canvas drawing slightly to ensure ViewChild is rendered since we start synchronously
      setTimeout(() => {
        this.drawAudioWave();
      }, 100);

    } catch (err: any) {
      this.state.set('ERROR');
      if (err.name === 'NotAllowedError') {
        this.errorMessage.set('Acesso ao microfone negado. Permita o acesso no seu navegador.');
      } else if (err.name === 'NotFoundError') {
        this.errorMessage.set('Nenhum microfone encontrado.');
      } else {
        this.errorMessage.set('Erro desconhecido ao iniciar gravação de áudio.');
      }
      console.error(err);
    }
  }

  togglePause() {
    if (!this.mediaRecorder) return;

    if (this.state() === 'RECORDING') {
      this.mediaRecorder.pause();
      this.state.set('PAUSED');
      this.pauseTimer();
      if (this.audioContext && this.audioContext.state === 'running') {
        this.audioContext.suspend();
      }
    } else if (this.state() === 'PAUSED') {
      this.mediaRecorder.resume();
      this.state.set('RECORDING');
      this.startTimer();
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }
  }

  finishRecording() {
    if (!this.mediaRecorder) return;
    
    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      this.patientService.createConsultation({ paciente_id: this.patientId }).subscribe({
        next: (consultation) => {
          this.patientService.uploadConsultationAudio(consultation.id!, audioBlob).subscribe({
            next: () => {
              this.router.navigate(['/patients', this.patientId, 'consultations', consultation.id, 'process']);
            },
            error: (err) => {
              console.error(err);
              this.errorMessage.set("Erro no upload do áudio.");
              this.state.set('ERROR');
            }
          });
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set("Erro ao criar consulta.");
          this.state.set('ERROR');
        }
      });
    };

    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    this.state.set('FINISHED');
    this.pauseTimer();
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  cancelRecording() {
    this.cleanup();
    this.router.navigate(['/patients', this.patientId]);
  }

  private setupAudioContext(stream: MediaStream) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);
  }

  private drawAudioWave = () => {
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
      gradient.addColorStop(0, '#0284c7'); // primary
      gradient.addColorStop(1, '#38bdf8'); // lighter

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * HEIGHT;
        canvasCtx.fillStyle = gradient;
        
        const r = barWidth / 2;
        canvasCtx.beginPath();
        // Fallback for older browsers not supporting roundRect
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

  private startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeElapsed.update(v => v + 1);
    }, 1000);
  }

  private pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  private cleanup() {
    this.pauseTimer();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
