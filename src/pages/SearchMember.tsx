import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import type { Family } from '../types';

const SearchMember: React.FC = () => {
  const { t } = useLanguage();
  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [searchName, setSearchName] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    // Mock data for demonstration
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
        members: [
          {
            id: 1,
            family_id: 1,
            korean_name: '김철수',
            english_name: 'Chul-soo Kim',
            relationship: 'husband',
            phone_number: '010-1234-5678',
            birth_date: '1985-03-15',
            picture_url: '',
            memo: '',
            member_group: undefined,
            grade_level: '',
            created_at: '2024-08-18T10:00:00Z',
            updated_at: '2024-08-18T10:00:00Z',
            education_status: []
          },
          {
            id: 2,
            family_id: 1,
            korean_name: '이영희',
            english_name: 'Young-hee Lee',
            relationship: 'wife',
            phone_number: '010-9876-5432',
            birth_date: '1987-07-22',
            picture_url: '',
            memo: '',
            member_group: undefined,
            grade_level: '',
            created_at: '2024-08-18T10:00:00Z',
            updated_at: '2024-08-18T10:00:00Z',
            education_status: []
          },
          {
            id: 3,
            family_id: 1,
            korean_name: '김민지',
            english_name: 'Min-ji Kim',
            relationship: 'child',
            phone_number: '',
            birth_date: '2010-12-05',
            picture_url: '',
            memo: '',
            member_group: 'youth',
            grade_level: '중1',
            created_at: '2024-08-18T10:00:00Z',
            updated_at: '2024-08-18T10:00:00Z',
            education_status: []
          }
        ]
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
        members: [
          {
            id: 4,
            family_id: 2,
            korean_name: '박민수',
            english_name: 'Min-soo Park',
            relationship: 'husband',
            phone_number: '010-5555-1234',
            birth_date: '1990-01-10',
            picture_url: '',
            memo: '',
            member_group: undefined,
            grade_level: '',
            created_at: '2024-08-11T10:00:00Z',
            updated_at: '2024-08-11T10:00:00Z',
            education_status: []
          }
        ]
      }
    ];

    setFamilies(mockFamilies);
    setFilteredFamilies(mockFamilies);
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
    return family.members.filter(member => member.relationship === 'child').length;
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
          {t('familyName')} ({filteredFamilies.length})
        </h2>
        
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
                    {family.members.length} members
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredFamilies.length === 0 && (
          <div className="text-center" style={{padding: '2rem', color: '#6b7280'}}>
            No families found matching the criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMember;