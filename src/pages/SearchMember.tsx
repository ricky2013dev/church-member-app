import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { getSundayDates, formatDateOnly } from '../utils/dateUtils';
import type { Family, Supporter } from '../types';

const SearchMember: React.FC = () => {
  const { t } = useLanguage();
  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [searchName, setSearchName] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSupporterIds, setFilterSupporterIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [familiesData, supportersData] = await Promise.all([
          apiService.getFamilies(),
          apiService.getSupporters('NOR', 'on') // Only NOR supporters with 'on' status for filtering
        ]);
        setFamilies(familiesData);
        setFilteredFamilies(familiesData);
        setSupporters(supportersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check if the server is running.');
        setFamilies([]);
        setFilteredFamilies([]);
        setSupporters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sundayDates = getSundayDates();

  useEffect(() => {
    let filtered = families;

    if (searchName) {
      filtered = filtered.filter(family => 
        family.family_name.toLowerCase().includes(searchName.toLowerCase()) ||
        family.members?.some(member => 
          member.korean_name?.toLowerCase().includes(searchName.toLowerCase()) ||
          member.english_name?.toLowerCase().includes(searchName.toLowerCase())
        )
      );
    }

    if (filterDateFrom || filterDateTo) {
      filtered = filtered.filter(family => {
        const familyDate = family.input_date;
        let dateInRange = true;
        
        if (filterDateFrom) {
          dateInRange = dateInRange && familyDate >= filterDateFrom;
        }
        
        if (filterDateTo) {
          dateInRange = dateInRange && familyDate <= filterDateTo;
        }
        
        return dateInRange;
      });
    }

    if (filterStatus) {
      filtered = filtered.filter(family => family.registration_status === filterStatus);
    }

    if (filterSupporterIds.length > 0) {
      filtered = filtered.filter(family => 
        family.main_supporter_id && filterSupporterIds.includes(family.main_supporter_id)
      );
    }

    setFilteredFamilies(filtered);
  }, [searchName, filterDateFrom, filterDateTo, filterStatus, filterSupporterIds, families]);

  const getChildrenCount = (family: Family) => {
    return family.members?.filter(member => member.relationship === 'child').length || 0;
  };

  const handleSupporterToggle = (supporterId: number) => {
    setFilterSupporterIds(prev => {
      if (prev.includes(supporterId)) {
        return prev.filter(id => id !== supporterId);
      } else {
        return [...prev, supporterId];
      }
    });
  };

  return (
    <div className="container">
      <h1 className="page-title">{t('searchMember')}</h1>
      
      {/* Filters */}
      <div className="filters">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              {t('name')}
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="form-input"
              placeholder={`${t('search')} ${t('name')}`}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              {t('inputDate')} - From (Sunday only)
            </label>
            <select
              value={filterDateFrom}
              onChange={(e) => {
                const newFromDate = e.target.value;
                setFilterDateFrom(newFromDate);
                // Clear "To" date if it's earlier than the new "From" date
                if (filterDateTo && newFromDate && filterDateTo < newFromDate) {
                  setFilterDateTo('');
                }
              }}
              className="form-input form-select"
            >
              <option value="">All dates</option>
              {sundayDates
                .filter(date => !filterDateTo || date <= filterDateTo)
                .map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              {t('inputDate')} - To (Sunday only)
            </label>
            <select
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="form-input form-select"
            >
              <option value="">All dates</option>
              {sundayDates
                .filter(date => !filterDateFrom || date >= filterDateFrom)
                .map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              {t('registrationStatus')}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input form-select"
            >
              <option value="">All</option>
              <option value="Visitor">{t('visitor')}</option>
              <option value="Registration Complete">{t('registrationComplete')}</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Main Supporters (Multiple Selection)
            </label>
            <div style={{
              maxHeight: '120px', 
              overflowY: 'auto', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.375rem', 
              padding: '0.5rem'
            }}>
              {supporters.length === 0 ? (
                <div style={{color: '#6b7280', fontSize: '0.875rem', padding: '0.5rem'}}>
                  No supporters available
                </div>
              ) : (
                supporters.map(supporter => (
                  <label 
                    key={supporter.id}
                    style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      padding: '0.25rem 0',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filterSupporterIds.includes(supporter.id)}
                      onChange={() => handleSupporterToggle(supporter.id)}
                      style={{margin: 0}}
                    />
                    <span>{supporter.name}</span>
                  </label>
                ))
              )}
            </div>
            {filterSupporterIds.length > 0 && (
              <div style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                {filterSupporterIds.length} supporter(s) selected
              </div>
            )}
          </div>
          
          <div className="form-group" style={{display: 'flex', alignItems: 'end'}}>
            <button
              onClick={() => {
                setSearchName('');
                setFilterDateFrom('');
                setFilterDateTo('');
                setFilterStatus('');
                setFilterSupporterIds([]);
              }}
              className="btn btn-outline"
              style={{width: '100%'}}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Family List */}
      <div className="card">
        <h2 className="card-header">
          {t('familyName')} {!loading && `(${filteredFamilies.length})`}
        </h2>
        
        {error && (
          <div className="text-center" style={{padding: '2rem', color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: '0.5rem', marginBottom: '1rem'}}>
            <p style={{marginBottom: '0.5rem'}}>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="text-center" style={{padding: '2rem', color: '#6b7280'}}>
            Loading families...
          </div>
        ) : (
          <div className="family-list">
            {filteredFamilies.map((family) => (
              <Link
                key={family.id}
                to={`/edit/${family.id}`}
                className="family-item"
              >
                <div className="family-item-content">
                  <div className="family-item-left">
                    <div className="family-photo" style={{width: '4rem', height: '4rem'}}>
                      {family.family_picture_url ? (
                        <img 
                          src={family.family_picture_url} 
                          alt={family.family_name}
                          style={{width: '4rem', height: '4rem'}}
                        />
                      ) : (
                        <span className="family-photo-placeholder">No Photo</span>
                      )}
                    </div>
                    <div className="family-info">
                      <h3 style={{fontSize: '1.125rem'}}>{family.family_name}</h3>
                      <p>
                        {t(family.registration_status === 'Visitor' ? 'visitor' : 'registrationComplete')}
                      </p>
                      <p style={{marginTop: '0.25rem'}}>
                        {formatDateOnly(family.input_date)}
                      </p>
                      {family.main_supporter && (
                        <p style={{marginTop: '0.25rem', fontSize: '0.875rem', color: '#059669'}}>
                          Main: {family.main_supporter.name}
                        </p>
                      )}
                      {family.sub_supporter && (
                        <p style={{marginTop: '0.1rem', fontSize: '0.875rem', color: '#0891b2'}}>
                          Sub: {family.sub_supporter.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="family-item-right">
                    <div className="family-date">
                      {getChildrenCount(family)} {t('numberOfChildren')}
                    </div>
                    <div className="family-children">
                      {family.members?.length || 0} members
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!loading && !error && filteredFamilies.length === 0 && families.length > 0 && (
          <div className="text-center" style={{padding: '2rem', color: '#6b7280'}}>
            No families found matching the search criteria.
          </div>
        )}
        
        {!loading && !error && families.length === 0 && (
          <div className="text-center" style={{padding: '2rem', color: '#6b7280'}}>
            No families found in the database. Add some families first.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMember;