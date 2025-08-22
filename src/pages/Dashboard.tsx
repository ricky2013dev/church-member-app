import React, { useState, useEffect } from 'react';

import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import type { Family, WeeklyStats, MonthlyStats } from '../types';
import FamilyListItem from '../components/FamilyListItem';
import WeeklyChart from '../components/WeeklyChart';
import MonthlyChart from '../components/MonthlyChart';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  
  // State management
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [allFamilies, setAllFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

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

  // Helper function: Generate monthly stats for past 12 months
  const generatePastTwelveMonths = (): MonthlyStats[] => {
    const months: MonthlyStats[] = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      // Calculate month start (first day of month)
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      // Calculate month end (last day of month)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const monthString = monthStart.getFullYear() + '-' + 
        String(monthStart.getMonth() + 1).padStart(2, '0');
      
      // Count families registered in this month
      const familiesInMonth = allFamilies.filter(family => {
        const familyDate = new Date(family.input_date);
        return familyDate >= monthStart && familyDate <= monthEnd;
      });
      
      // Count total families up to this month
      const totalFamiliesUpToMonth = allFamilies.filter(
        family => new Date(family.input_date) <= monthEnd
      ).length;
      
      months.push({
        month: monthString,
        new_families: familiesInMonth.length,
        total_families: totalFamiliesUpToMonth
      });
    }
    
    return months.reverse();
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

  // Effect: Generate weekly and monthly stats when families data changes
  useEffect(() => {
    if (allFamilies.length > 0) {
      const weeklyStats = generatePastSixMonths();
      const monthlyStats = generatePastTwelveMonths();
      setWeeklyStats(weeklyStats);
      setMonthlyStats(monthlyStats);
    }
  }, [allFamilies]);

  // Effect: Filter families based on current view mode and selections
  useEffect(() => {
    const hasWeeklySelection = viewMode === 'weekly' && selectedWeeks.length > 0;
    const hasMonthlySelection = viewMode === 'monthly' && selectedMonths.length > 0;
    
    if (!hasWeeklySelection && !hasMonthlySelection) {
      // No selection = show all families
      setFilteredFamilies(allFamilies);
      return;
    }

    let filtered = [...allFamilies];

    // Filter by selected weeks (only if in weekly view)
    if (hasWeeklySelection) {
      filtered = filtered.filter(family => {
        const familyDate = new Date(family.input_date);
        
        return selectedWeeks.some(weekStr => {
          const weekStart = new Date(weekStr);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          return familyDate >= weekStart && familyDate <= weekEnd;
        });
      });
    }

    // Filter by selected months (only if in monthly view)
    if (hasMonthlySelection) {
      filtered = filtered.filter(family => {
        const familyDate = new Date(family.input_date);
        
        return selectedMonths.some(monthStr => {
          const [year, month] = monthStr.split('-');
          const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
          const monthEnd = new Date(parseInt(year), parseInt(month), 0);
          
          return familyDate >= monthStart && familyDate <= monthEnd;
        });
      });
    }
    
    setFilteredFamilies(filtered);
  }, [selectedWeeks, selectedMonths, allFamilies, viewMode]);

  // Handler: Toggle week selection
  const handleWeekClick = (weekStr: string) => {
    setSelectedWeeks(prev => 
      prev.includes(weekStr)
        ? prev.filter(w => w !== weekStr) // Remove if already selected
        : [...prev, weekStr] // Add to selection
    );
  };

  // Handler: Toggle month selection
  const handleMonthClick = (monthStr: string) => {
    setSelectedMonths(prev => 
      prev.includes(monthStr)
        ? prev.filter(m => m !== monthStr) // Remove if already selected
        : [...prev, monthStr] // Add to selection
    );
  };

  // Handler: Clear all selections
  const handleClearSelection = () => {
    setSelectedWeeks([]);
    setSelectedMonths([]);
  };

  // Handler: Toggle view mode
  const handleViewModeToggle = (mode: 'weekly' | 'monthly') => {
    setViewMode(mode);
    // Clear selections when switching views
    setSelectedWeeks([]);
    setSelectedMonths([]);
  };

  return (
    <div className="container">

      {/* View Toggle */}
      <section className="card">
        <div className="toggle-container">
          <div className="toggle-button-group">
            <button
              onClick={() => handleViewModeToggle('weekly')}
              className={`toggle-button ${viewMode === 'weekly' ? 'active' : ''}`}
            >
              Weekly
            </button>
            <button
              onClick={() => handleViewModeToggle('monthly')}
              className={`toggle-button ${viewMode === 'monthly' ? 'active' : ''}`}
            >
              Monthly
            </button>
          </div>
        </div>
      </section>

      {/* Chart Section - Single View */}
      <section className="card">
        {viewMode === 'weekly' ? (
          <WeeklyChart 
            data={weeklyStats}
            selectedWeeks={selectedWeeks}
            onWeekClick={handleWeekClick}
          />
        ) : (
          <MonthlyChart 
            data={monthlyStats}
            selectedMonths={selectedMonths}
            onMonthClick={handleMonthClick}
          />
        )}
      </section>

      {/* Registration Stats - Single View */}
      <section className="card">
        {viewMode === 'weekly' ? (
          <>
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
          </>
        ) : (
          <>
            <h2 className="card-header">
              Monthly Registrations (12months)
            </h2>
            
            <div className="stats-grid">
              {monthlyStats
                .slice()
                .sort((a, b) => new Date(b.month + '-01').getTime() - new Date(a.month + '-01').getTime())
                .map((stat) => (
                <div 
                  key={stat.month}
                  className={`stat-card ${
                    selectedMonths.includes(stat.month) ? 'selected' : ''
                  }`}
                  onClick={() => handleMonthClick(stat.month)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedMonths.includes(stat.month)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="stat-week">{stat.month}</div>
                  <div className="stat-number">{stat.new_families}</div>
                  <div className="stat-label">{t('newFamilies')}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {((viewMode === 'weekly' && selectedWeeks.length > 0) || (viewMode === 'monthly' && selectedMonths.length > 0)) && (
        <section className="card">
          <div className="selection-info">
            <p>
              {viewMode === 'weekly' 
                ? `Selected weeks: ${selectedWeeks.length} | Showing families: ${filteredFamilies.length}`
                : `Selected months: ${selectedMonths.length} | Showing families: ${filteredFamilies.length}`
              }
            </p>
            <button 
              type="button"
              className="btn-clear" 
              onClick={handleClearSelection}
            >
              Clear Selection (Show All)
            </button>
          </div>
        </section>
      )}

      {/* Filtered Families */}
      <section className="card">
        <h2 className="card-header">
          {(viewMode === 'weekly' && selectedWeeks.length === 0) || (viewMode === 'monthly' && selectedMonths.length === 0)
            ? 'All Families' 
            : `Families from Selected ${viewMode === 'weekly' ? 'Weeks' : 'Months'} (${filteredFamilies.length})`
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
