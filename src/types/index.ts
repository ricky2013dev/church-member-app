export interface Family {
  id: number;
  family_name: string;
  family_picture_url?: string;
  registration_status: 'Visitor' | 'Registration Complete';
  input_date: string;
  notes?: string;
  address?: string;
  zipcode?: string;
  life_group?: string;
  main_supporter_id?: number;
  sub_supporter_id?: number;
  created_at: string;
  updated_at: string;
  members: Member[];
  main_supporter?: Supporter;
  sub_supporter?: Supporter;
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

export interface Supporter {
  display_sort: number;
  id: number;
  name: string;
  group_code: string;
  phone_number?: string;
  email?: string;
  profile_picture_url?: string;
  gender: 'male' | 'female';
  status: 'on' | 'off';
  pin_code: string;
  created_at: string;
  updated_at: string;
}

export interface GroupPinCode {
  id: number;
  group_code: string;
  pin_code: string;
  group_name: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyStats {
  week: string;
  new_families: number;
  total_families: number;
}

export type Language = 'ko' | 'en';
