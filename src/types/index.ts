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

export interface MonthlyStats {
  month: string;
  new_families: number;
  total_families: number;
}

export interface Event {
  id: number;
  event_name: string;
  event_date: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  creator?: Supporter;
  responses?: EventResponse[];
  summary?: EventSummary;
  user_response?: 'Join' | 'Not Able' | 'Not Decide' | null;
}

export interface EventResponse {
  id: number;
  event_id: number;
  supporter_id: number;
  attendance_status: 'Join' | 'Not Able' | 'Not Decide';
  created_at: string;
  updated_at: string;
  supporter?: Supporter;
}

export interface EventSummary {
  total_join: number;
  total_not_able: number;
  total_not_decide: number;
  total_responses: number;
}

export type Language = 'ko' | 'en';
