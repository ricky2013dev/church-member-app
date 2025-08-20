import type { Family, Member } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Family operations
  async getFamilies(): Promise<Family[]> {
    return this.fetchWithAuth('/families');
  }

  async getFamily(id: number): Promise<Family> {
    return this.fetchWithAuth(`/families/${id}`);
  }

  async createFamily(family: {
    family_name: string;
    registration_status: 'Visitor' | 'Registration Complete';
    input_date: string;
    notes: string;
    family_picture_url: string;
    members: Array<{
      korean_name?: string;
      english_name?: string;
      relationship: 'husband' | 'wife' | 'child';
      phone_number?: string;
      birth_date?: string;
      picture_url?: string;
      memo?: string;
      member_group?: 'college' | 'youth' | 'kid' | 'kinder';
      grade_level?: string;
    }>;
  }): Promise<Family> {
    return this.fetchWithAuth('/families', {
      method: 'POST',
      body: JSON.stringify(family),
    });
  }

  async updateFamily(id: number, family: Partial<Family>): Promise<Family> {
    return this.fetchWithAuth(`/families/${id}`, {
      method: 'PUT',
      body: JSON.stringify(family),
    });
  }

  async deleteFamily(id: number): Promise<void> {
    return this.fetchWithAuth(`/families/${id}`, {
      method: 'DELETE',
    });
  }

  // Member operations
  async createMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>): Promise<Member> {
    return this.fetchWithAuth('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  }

  async updateMember(id: number, member: Partial<Member>): Promise<Member> {
    return this.fetchWithAuth(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    });
  }

  async deleteMember(id: number): Promise<void> {
    return this.fetchWithAuth(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  // Statistics
  async getWeeklyStats(): Promise<Array<{ week: string; new_families: number; total_families: number }>> {
    return this.fetchWithAuth('/stats/weekly');
  }

  // File upload
  async uploadFile(file: File, type: 'family' | 'member'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();