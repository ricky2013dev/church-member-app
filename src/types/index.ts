export interface Family {
  id: number;
  family_name: string;
  family_picture_url?: string;
  registration_status: 'Visitor' | 'Registration Complete';
  input_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  members: Member[];
}

export interface Member {
  id: number;
  family_id: number;
  korean_name?: string;
  english_name?: string;
  relationship: 'husband' | 'wife' | 'child';
  phone_number?: string;
  birth_date?: string;
  picture_url?: string;
  memo?: string;
  member_group?: 'college' | 'youth' | 'kid' | 'kinder';
  grade_level?: string;
  created_at: string;
  updated_at: string;
  education_status: EducationStatus[];
}

export interface EducationStatus {
  id: number;
  member_id: number;
  course: '101' | '201' | '301' | '401';
  completed: boolean;
  completion_date?: string;
  created_at: string;
}

export interface WeeklyStats {
  week: string;
  new_families: number;
  total_families: number;
}

export type Language = 'ko' | 'en';