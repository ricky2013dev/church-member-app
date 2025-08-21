import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { getSundayDates, getMostRecentSunday } from '../utils/dateUtils';
import type { Family, Member, Supporter } from '../types';

const AddEditMember: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isEditing = Boolean(id);

  const [family, setFamily] = useState<Family>({
    id: 0,
    family_name: '',
    family_picture_url: '',
    registration_status: 'Visitor',
    input_date: getMostRecentSunday(),
    notes: '',
    main_supporter_id: undefined,
    sub_supporter_id: undefined,
    created_at: '',
    updated_at: '',
    members: []
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showIndividualPictures, setShowIndividualPictures] = useState(false);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const supportersData = await apiService.getSupporters('NOR', 'on'); // Only NOR group and 'on' status supporters
        setSupporters(supportersData);
      } catch (err) {
        console.error('Error fetching supporters:', err);
      }
    };

    fetchSupporters();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      const fetchFamily = async () => {
        try {
          setLoading(true);
          setError(null);
          const familyData = await apiService.getFamily(parseInt(id));
          setFamily(familyData);
          const membersData = familyData.members.sort((a, b) => a.relationship.localeCompare(b.relationship));
          setMembers(membersData);
        } catch (err) {
          console.error('Error fetching family:', err);
          setError('Failed to load family data');
          // Fallback to mock data for development
          const mockFamily: Family = {
            id: parseInt(id),
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
                family_id: parseInt(id),
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
              }
            ]
          };
          setFamily(mockFamily);
          setMembers(mockFamily.members);
        } finally {
          setLoading(false);
        }
      };
      
      fetchFamily();
    } else {
      // Initialize with at least husband and wife
      const newMembers: Member[] = [
        {
          id: 0,
          family_id: 0,
          korean_name: '',
          english_name: '',
          relationship: 'husband',
          phone_number: '',
          birth_date: '',
          picture_url: '',
          memo: '',
          member_group: undefined,
          grade_level: '',
          created_at: '',
          updated_at: '',
          education_status: []
        },
        {
          id: 0,
          family_id: 0,
          korean_name: '',
          english_name: '',
          relationship: 'wife',
          phone_number: '',
          birth_date: '',
          picture_url: '',
          memo: '',
          member_group: undefined,
          grade_level: '',
          created_at: '',
          updated_at: '',
          education_status: []
        }
      ];
      setMembers(newMembers);
    }
  }, [id, isEditing]);

  useEffect(() => {
    // Generate family name from husband and wife names
    const husband = members.find(m => m.relationship === 'husband');
    const wife = members.find(m => m.relationship === 'wife');
    
    let familyName = '';
    if (husband?.korean_name && wife?.korean_name) {
      familyName = `${husband.korean_name} & ${wife.korean_name}`;
    } else if (husband?.korean_name) {
      familyName = husband.korean_name;
    } else if (wife?.korean_name) {
      familyName = wife.korean_name;
    }
    
    setFamily(prev => ({ ...prev, family_name: familyName }));
  }, [members]);

  const handleFamilyChange = (field: keyof Family, value: string | number | undefined) => {
    setFamily(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setMembers(updatedMembers);
  };

  const addChild = () => {
    if (members.filter(m => m.relationship === 'child').length < 10) {
      const newChild: Member = {
        id: 0,
        family_id: family.id,
        korean_name: '',
        english_name: '',
        relationship: 'child',
        phone_number: '',
        birth_date: '',
        picture_url: '',
        memo: '',
        member_group: 'kid',
        grade_level: '',
        created_at: '',
        updated_at: '',
        education_status: []
      };
      setMembers([...members, newChild]);
    }
  };

  const removeChild = (index: number) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!family.family_name.trim()) {
        setError('Family name is required');
        return;
      }

      if (isEditing) {
        // Update existing family
        await apiService.updateFamily(family.id, {
          family_name: family.family_name,
          registration_status: family.registration_status,
          input_date: family.input_date,
          notes: family.notes,
          family_picture_url: family.family_picture_url,
          main_supporter_id: family.main_supporter_id || undefined,
          sub_supporter_id: family.sub_supporter_id || undefined
        });

        // Update or create members
        for (const member of members) {
          const memberData = {
            family_id: family.id,
            korean_name: member.korean_name,
            english_name: member.english_name,
            relationship: member.relationship,
            phone_number: member.phone_number,
            birth_date: member.birth_date,
            picture_url: member.picture_url,
            memo: member.memo,
            member_group: member.member_group,
            grade_level: member.grade_level,
            education_status: member.education_status || []
          };

          if (member.id > 0) {
            // Update existing member
            await apiService.updateMember(member.id, memberData);
          } else {
            // Create new member
            await apiService.createMember(memberData);
          }
        }
      } else {
        // Create new family
        const familyData = {
          family_name: family.family_name,
          registration_status: family.registration_status,
          input_date: family.input_date,
          notes: family.notes || '',
          family_picture_url: family.family_picture_url || '',
          main_supporter_id: family.main_supporter_id || undefined,
          sub_supporter_id: family.sub_supporter_id || undefined,
          members: members.map(member => ({
            korean_name: member.korean_name,
            english_name: member.english_name,
            relationship: member.relationship,
            phone_number: member.phone_number,
            birth_date: member.birth_date,
            picture_url: member.picture_url,
            memo: member.memo,
            member_group: member.member_group,
            grade_level: member.grade_level
          }))
        };

        await apiService.createFamily(familyData);
      }

      // Success - navigate back to search page
      navigate('/search');
    } catch (err) {
      console.error('Error saving family:', err);
      setError(`Failed to save family: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/search');
  };

  const handleFamilyPictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPicture(true);
      setError(null);
      
      const uploadResult = await apiService.uploadFile(file, 'family');
      
      setFamily(prev => ({
        ...prev,
        family_picture_url: uploadResult.url
      }));
      
    } catch (err) {
      console.error('Error uploading family picture:', err);
      setError(`Failed to upload family picture: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploadingPicture(false);
    }
  };

  const sundayDates = getSundayDates();

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{padding: '4rem'}}>
          <div style={{fontSize: '1.125rem', color: '#6b7280'}}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">
        {isEditing ? `${t('edit')} ${t('familyName')}` : `${t('addNew')} ${t('familyName')}`}
      </h1>
      
      {error && (
        <div className="card" style={{backgroundColor: '#fef2f2', borderColor: '#fecaca', marginBottom: '1rem'}}>
          <div style={{color: '#dc2626', fontSize: '0.875rem'}}>
            {error}
          </div>
        </div>
      )}
      
      <div className="card">
        {/* Family Information */}
        <div className="mb-8">
          <h2 className="card-header">Family Information</h2>
          
          <div className="form-grid mb-4">
            <div className="form-group">
              <label className="form-label">
                {t('familyName')}
              </label>
              <input
                type="text"
                value={family.family_name}
                readOnly
                className="form-input"
                style={{backgroundColor: '#f9fafb'}}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                {t('inputDate')} (Sunday only)
              </label>
              <select
                value={family.input_date}
                onChange={(e) => handleFamilyChange('input_date', e.target.value)}
                className="form-input form-select"
              >
                {sundayDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                {t('registrationStatus')}
              </label>
              <select
                value={family.registration_status}
                onChange={(e) => handleFamilyChange('registration_status', e.target.value as 'Visitor' | 'Registration Complete')}
                className="form-input form-select"
              >
                <option value="Visitor">{t('visitor')}</option>
                <option value="Registration Complete">{t('registrationComplete')}</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Main Supporter
              </label>
              <select
                value={family.main_supporter_id || ''}
                onChange={(e) => handleFamilyChange('main_supporter_id', e.target.value ? parseInt(e.target.value) : undefined)}
                className="form-input form-select"
              >
                <option value="">Select main supporter</option>
                {supporters.map(supporter => (
                  <option key={supporter.id} value={supporter.id}>
                    {supporter.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Sub Supporter
              </label>
              <select
                value={family.sub_supporter_id || ''}
                onChange={(e) => handleFamilyChange('sub_supporter_id', e.target.value ? parseInt(e.target.value) : undefined)}
                className="form-input form-select"
              >
                <option value="">Select sub supporter</option>
                {supporters.map(supporter => (
                  <option key={supporter.id} value={supporter.id}>
                    {supporter.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
            <label className="form-label">
              Family Notes
            </label>
            <textarea
              value={family.notes}
              onChange={(e) => handleFamilyChange('notes', e.target.value)}
              rows={5}
              className="form-input form-textarea"
            />
          </div>

            <div className="form-group">
              <label className="form-label">
                {t('familyPicture')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFamilyPictureUpload}
                disabled={uploadingPicture}
                className="form-input"
              />
              {uploadingPicture && (
                <div style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                  Uploading picture...
                </div>
              )}
              {family.family_picture_url && (
                <div style={{marginTop: '0.5rem'}}>
                  <img
                    src={family.family_picture_url}
                    alt="Family picture"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      objectFit: 'cover',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db'
                    }}
                  />
                  <div style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                    Picture uploaded successfully
                  </div>
                </div>
              )}
            </div>

          </div>
          

        </div>

        {/* Members */}
        <div className="mb-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-header" style={{ margin: 0 }}>Family Members</h2>
            <button
              type="button"
              onClick={() => setShowIndividualPictures(!showIndividualPictures)}
              className="btn btn-secondary"
              style={{ 
                fontSize: '0.875rem', 
                padding: '0.5rem 1rem',
                backgroundColor: showIndividualPictures ? '#059669' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              {showIndividualPictures ? '-' : '+'} 
            </button>
          </div>
          
          {members.map((member, index) => (
            <div key={index} className="member-section">
              <div className="member-header">
                <h3 className="member-title">
                  {t(member.relationship)}
                  {member.relationship === 'child' && ` ${index - 1}`}
                </h3>
                {member.relationship === 'child' && (
                  <button
                    onClick={() => removeChild(index)}
                    className="btn btn-danger"
                    style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    {t('koreanName')}
                  </label>
                  <input
                    type="text"
                    value={member.korean_name || ''}
                    onChange={(e) => handleMemberChange(index, 'korean_name', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {t('englishName')}
                  </label>
                  <input
                    type="text"
                    value={member.english_name || ''}
                    onChange={(e) => handleMemberChange(index, 'english_name', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    value={member.phone_number || ''}
                    onChange={(e) => handleMemberChange(index, 'phone_number', e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    {t('birthDate')}
                  </label>
                  <input
                    type="date"
                    value={member.birth_date || ''}
                    onChange={(e) => handleMemberChange(index, 'birth_date', e.target.value)}
                    className="form-input"
                  />
                </div>



                
                {member.relationship === 'child' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        {t('memberGroup')}
                      </label>
                      <select
                        value={member.member_group || ''}
                        onChange={(e) => handleMemberChange(index, 'member_group', e.target.value)}
                        className="form-input form-select"
                      >
                        <option value="">{t('memberGroup')}</option>
                        <option value="college">{t('college')}</option>
                        <option value="youth">{t('youth')}</option>
                        <option value="kid">{t('kid')}</option>
                        <option value="kinder">{t('kinder')}</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        {t('gradeLevel')}
                      </label>
                      <input
                        type="number"
                        value={member.grade_level || ''}
                        onChange={(e) => handleMemberChange(index, 'grade_level', e.target.value)}
                        className="form-input"
                        placeholder="1-12"
                        min={0}
                        max={12}
                      />
                    </div>
                  </>
                )}
                
                {showIndividualPictures && (
                  <>
                  <div className="form-group">
                    <label className="form-label">
                      {t('individualPicture')}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group mt-4">
                  <label className="form-label">
                    {t('memo')}
                  </label>
                  <textarea
                    value={member.memo || ''}
                    onChange={(e) => handleMemberChange(index, 'memo', e.target.value)}
                    rows={2}
                    className="form-input form-textarea"
                  />
                </div>
                </>
                )}
                
         
                  
           
              </div>
              
              
            </div>
          ))}
          
          {members.filter(m => m.relationship === 'child').length < 10 && (
            <button
              onClick={addChild}
              className="add-child-btn"
            >
              + {t('add')} {t('child')}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="actions">
          <button
            onClick={handleCancel}
            className="btn btn-outline"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary"
            style={{opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
          >
            {loading ? 'Saving...' : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditMember;