import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import type { Family } from '../types';

const SearchMember: React.FC = () => {
  const { t } = useLanguage();
  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [searchName, setSearchName] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getFamilies();
        setFamilies(data);
        setFilteredFamilies(data);
      } catch (err) {
        console.error('Error fetching families:', err);
        setError('Failed to load families. Please check if the server is running.');
        setFamilies([]);
        setFilteredFamilies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, []);

  useEffect(() => {
    let filtered = families;

    if (searchName) {
      filtered = filtered.filter(family => 
        family.family_name.toLowerCase().includes(searchName.toLowerCase()) ||
        family.members.some(member => 
          member.korean_name?.toLowerCase().includes(searchName.toLowerCase()) ||
          member.english_name?.toLowerCase().includes(searchName.toLowerCase())
        )
      );
    }

    if (filterWeek) {
      filtered = filtered.filter(family => family.input_date === filterWeek);
    }

    if (filterStatus) {
      filtered = filtered.filter(family => family.registration_status === filterStatus);
    }

    setFilteredFamilies(filtered);
  }, [searchName, filterWeek, filterStatus, families]);

  const getChildrenCount = (family: Family) => {
    return family.members?.filter(member => member.relationship === 'child').length || 0;
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
              {t('inputDate')}
            </label>
            <input
              type="date"
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className="form-input"
            />
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
                      <p style={{marginTop: '0.25rem'}}>{family.input_date}</p>
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