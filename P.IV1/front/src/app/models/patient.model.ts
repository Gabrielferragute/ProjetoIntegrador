export interface Patient {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  observations?: string;
  consultation_count?: number;
  last_consultation_date?: string;
  createdAt?: string;
}
