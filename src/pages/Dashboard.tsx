import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { formatDateOnly } from '../utils/dateUtils';
import type { Family, WeeklyStats } from '../types';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  
  // State management
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [allFamilies, setAllFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);

  // Helper function: Generate weekly stats for past 8 weeks (2 months)
  const generatePastEightWeeks = (): WeeklyStats[] => {
    const weeks: WeeklyStats[] = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
      // Calculate week start (Sunday)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + (i * 7)));
      
      // Calculate week end (Saturday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekString = weekStart.toISOString().split('T')[0];
      
      // Count families registered in this week
      const familiesInWeek = allFamilies.filter(family => {
        const familyDate = new Date(family.input_date);
        return familyDate >= weekStart && familyDate <= weekEnd;
      });
      
      // Count total families up to this week
      const totalFamiliesUpToWeek = allFamilies.filter(
        family => new Date(family.input_date) <= weekEnd
      ).length;
      
      weeks.push({
        week: weekString,
        new_families: familiesInWeek.length,
        total_families: totalFamiliesUpToWeek
      });
    }
    
    return weeks;
  };

  // Effect: Fetch families data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const familiesData = await apiService.getFamilies();
        setAllFamilies(familiesData);
        setFilteredFamilies(familiesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback to mock data for development
        const mockFamilies: Family[] = [
          {
            id: 1,
            family_name: '김철수 & 이영희',
            family_picture_url: '',
            registration_status: 'Registration Complete',
            input_date: '2024-08-18',
            notes: '새가족 환영',
            created_at: '2024-08-18T10:00:00Z',
            updated_at: '2024-08-18T10:00:00Z',
            members: [],
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
            members: [],
          },
          {
            id: 3,
            family_name: '이영희 & 박민수',
            family_picture_url: '',
            registration_status: 'Registration Complete',
            input_date: '2024-08-04',
            notes: '',
            created_at: '2024-08-04T10:00:00Z',
            updated_at: '2024-08-04T10:00:00Z',
            members: [],
          },
          {
            id: 4,
            family_name: '최철수',
            family_picture_url: '',
            registration_status: 'Visitor',
            input_date: '2024-07-28',
            notes: '',
            created_at: '2024-07-28T10:00:00Z',
            updated_at: '2024-07-28T10:00:00Z',
            members: [],
          },
        ];

        setAllFamilies(mockFamilies);
        setFilteredFamilies(mockFamilies);
      }
    };

    fetchData();
  }, []);

  // Effect: Generate weekly stats when families data changes
  useEffect(() => {
    if (allFamilies.length > 0) {
      const stats = generatePastEightWeeks();
      setWeeklyStats(stats);
    }
  }, [allFamilies]);

  // Effect: Filter families based on selected weeks
  useEffect(() => {
    if (selectedWeeks.length === 0) {
      // No selection = show all families
      setFilteredFamilies(allFamilies);
      return;
    }

    // Filter families to only show those from selected weeks
    const filtered = allFamilies.filter(family => {
      const familyDate = new Date(family.input_date);
      
      return selectedWeeks.some(weekStr => {
        const weekStart = new Date(weekStr);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return familyDate >= weekStart && familyDate <= weekEnd;
      });
    });
    
    setFilteredFamilies(filtered);
  }, [selectedWeeks, allFamilies]);

  // Handler: Toggle week selection
  const handleWeekClick = (weekStr: string) => {
    setSelectedWeeks(prev => 
      prev.includes(weekStr)
        ? prev.filter(w => w !== weekStr) // Remove if already selected
        : [...prev, weekStr] // Add to selection
    );
  };

  // Handler: Clear all selections
  const handleClearSelection = () => setSelectedWeeks([]);

  return (
    <div className="container">
      <h1 className="page-title">{t('dashboard')}</h1>

      {/* Weekly Registration Stats */}
      <section className="card">
        <h2 className="card-header">
          {t('weeklyRegistrations')} (2months)
        </h2>
        
        <div className="stats-grid">
          {weeklyStats.map((stat, index) => (
            <div 
              key={stat.week}
              className={`stat-card ${
                selectedWeeks.includes(stat.week) ? 'selected' : ''
              }`}
              onClick={() => handleWeekClick(stat.week)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedWeeks.includes(stat.week)}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-week">{stat.week}</div>
              <div className="stat-number">{stat.new_families}</div>
              <div className="stat-label">{t('newFamilies')}</div>
            </div>
          ))}
        </div>
        
        {selectedWeeks.length > 0 && (
          <div className="selection-info">
            <p>
              Selected weeks: {selectedWeeks.length} | 
              Showing families: {filteredFamilies.length}
            </p>
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={handleClearSelection}
              style={{ marginTop: '10px' }}
            >
              Clear Selection (Show All)
            </button>
          </div>
        )}
      </section>

      {/* Filtered Families */}
      <section className="card">
        <h2 className="card-header">
          {selectedWeeks.length === 0 
            ? 'All Families' 
            : `Families from Selected Weeks (${filteredFamilies.length})`
          }
        </h2>
        
        <div className="family-list">
          {filteredFamilies.map(family => (
            <Link 
              key={family.id} 
              to={`/edit/${family.id}`} 
              className="family-item"
            >
              <div className="family-item-content">
                <div className="family-item-left">
                  <div className="family-photo">
                    {family.family_picture_url ? (
                      <img 
                        src={family.family_picture_url} 
                        alt={family.family_name} 
                      />
                    ) : (
                      <span className="family-photo-placeholder">
                        No Photo
                      </span>
                    )}
                  </div>
                  
                  <div className="family-info">
                    <h3>{family.family_name}</h3>
                    <p>
                      {t(
                        family.registration_status === 'Visitor'
                          ? 'visitor'
                          : 'registrationComplete'
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="family-item-right">
                  <div className="family-date">
                    {formatDateOnly(family.input_date)}
                  </div>
                  
                  <div className="family-children">
                    {family.members?.filter(m => m.relationship === 'child').length || 0}{' '}
                    {t('numberOfChildren')}
                  </div>
                  
                  {family.main_supporter?.name && (
                    <p style={{ 
                      marginTop: '0.25rem', 
                      fontSize: '0.875rem', 
                      color: '#059669' 
                    }}>
                      팀원: {family.main_supporter.name}
                    </p>
                  )}
                  
                  {family.life_group && (
                    <p style={{ 
                      marginTop: '0.25rem', 
                      fontSize: '0.875rem', 
                      color: '#7c3aed' 
                    }}>
                      목장: {family.life_group}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
