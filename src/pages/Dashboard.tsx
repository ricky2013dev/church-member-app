import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import type { Family, WeeklyStats } from '../types';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [recentFamilies, setRecentFamilies] = useState<Family[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch weekly stats and families in parallel
        const [statsData, familiesData] = await Promise.all([
          apiService.getWeeklyStats(),
          apiService.getFamilies()
        ]);
        
        setWeeklyStats(statsData);
        // Get most recent 2 families
        setRecentFamilies(familiesData.slice(0, 2));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data for development
        const mockWeeklyStats: WeeklyStats[] = [
          { week: '2024-08-18', new_families: 3, total_families: 45 },
          { week: '2024-08-11', new_families: 2, total_families: 42 },
          { week: '2024-08-04', new_families: 1, total_families: 40 },
          { week: '2024-07-28', new_families: 4, total_families: 39 },
          { week: '2024-07-21', new_families: 2, total_families: 35 },
          { week: '2024-07-14', new_families: 1, total_families: 33 },
        ];

        const mockRecentFamilies: Family[] = [
          {
            id: 1,
            family_name: '김철수 & 이영희',
            family_picture_url: '',
            registration_status: 'Registration Complete',
            input_date: '2024-08-18',
            notes: '새가족 환영',
            created_at: '2024-08-18T10:00:00Z',
            updated_at: '2024-08-18T10:00:00Z',
            members: []
          },
          {
            id: 2,
            family_name: '박민수',
            family_picture_url: '',
            registration_status: 'Visitor',
            input_date: '2024-08-11',
            notes: '첫 방문',
            created_at: '2024-08-11T10:00:00Z',
            updated_at: '2024-08-11T10:00:00Z',
            members: []
          }
        ];

        setWeeklyStats(mockWeeklyStats);
        setRecentFamilies(mockRecentFamilies);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">{t('dashboard')}</h1>
      
      {/* Weekly Registration Stats */}
      <div className="card">
        <h2 className="card-header">{t('weeklyRegistrations')}</h2>
        <div className="stats-grid">
          {weeklyStats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-week">{stat.week}</div>
              <div className="stat-number">{stat.new_families}</div>
              <div className="stat-label">{t('newFamilies')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Families */}
      <div className="card">
        <h2 className="card-header">{t('recentFamilies')}</h2>
        <div className="family-list">
          {recentFamilies.map((family) => (
            <div key={family.id} className="family-item">
              <div className="family-item-content">
                <div className="family-item-left">
                  <div className="family-photo">
                    {family.family_picture_url ? (
                      <img 
                        src={family.family_picture_url} 
                        alt={family.family_name}
                      />
                    ) : (
                      <span className="family-photo-placeholder">No Photo</span>
                    )}
                  </div>
                  <div className="family-info">
                    <h3>{family.family_name}</h3>
                    <p>
                      {t(family.registration_status === 'Visitor' ? 'visitor' : 'registrationComplete')}
                    </p>
                  </div>
                </div>
                <div className="family-item-right">
                  <div className="family-date">{family.input_date}</div>
                  <div className="family-children">
                    {family.members?.filter(m => m.relationship === 'child').length || 0} {t('numberOfChildren')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;