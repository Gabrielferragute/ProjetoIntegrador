export interface Consultation {
  id?: number;
  paciente_id: number;
  data: string;
  audio_path?: string;
  transcricao?: string;
  laudo?: string;
  status: string;
}
