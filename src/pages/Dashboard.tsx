import React, { useState, useEffect } from 'react';

import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import type { Family, WeeklyStats } from '../types';
import FamilyListItem from '../components/FamilyListItem';
import WeeklyChart from '../components/WeeklyChart';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  
  // State management
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [allFamilies, setAllFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);

  // Helper function: Generate weekly stats for past 26 weeks (6 months)
  const generatePastSixMonths = (): WeeklyStats[] => {
    const weeks: WeeklyStats[] = [];
    const today = new Date();
    
    for (let i = 0; i < 26; i++) {
      // Calculate week start (Sunday)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() - (i * 7));
      
      // Calculate week end (Saturday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekString = weekStart.getFullYear() + '-' + 
        String(weekStart.getMonth() + 1).padStart(2, '0') + '-' + 
        String(weekStart.getDate()).padStart(2, '0');
      
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
    
    return weeks.reverse();
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
      const stats = generatePastSixMonths();
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

      {/* Weekly Chart */}
      <section className="card">
        <WeeklyChart 
          data={weeklyStats}
          selectedWeeks={selectedWeeks}
          onWeekClick={handleWeekClick}
        />
      </section>

      {/* Weekly Registration Stats */}
      <section className="card">
        <h2 className="card-header">
          {t('weeklyRegistrations')} (6months)
        </h2>
        
        <div className="stats-grid">
          {weeklyStats
            .slice()
            .sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime())
            .map((stat) => (
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
          {filteredFamilies
            .slice()
            .sort((a, b) => {
              const dateA = new Date(a.input_date);
              const dateB = new Date(b.input_date);
              return dateB.getTime() - dateA.getTime(); // Most recent first
            })
            .map(family => (
              <FamilyListItem 
                key={family.id}
                family={family}
                variant="dashboard"
              />
            ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
