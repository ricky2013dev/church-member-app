import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Supporter, GroupPinCode } from '../types';

const Supporters: React.FC = () => {
  const { user } = useAuth();
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [groupPinCodes, setGroupPinCodes] = useState<GroupPinCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingSupporter, setIsAddingSupporter] = useState(false);
  const [editingSupporter, setEditingSupporter] = useState<Supporter | null>(null);
  const [isManagingGroupCodes, setIsManagingGroupCodes] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    group_code: '',
    phone_number: '',
    email: '',
    profile_picture_url: '',
    gender: 'male' as 'male' | 'female',
    status: 'on' as 'on' | 'off',
    pin_code: '',
    display_sort: 0
  });
  const [uploadingPicture, setUploadingPicture] = useState(false);

  useEffect(() => {
    fetchSupporters();
    fetchGroupPinCodes(); // Always fetch for form dropdown
  }, [user]);

  const fetchSupporters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSupporters();
      setSupporters(data);
    } catch (err) {
      console.error('Error fetching supporters:', err);
      setError('Failed to load supporters. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPinCodes = async () => {
    try {
      const data = await apiService.getGroupPinCodes();
      setGroupPinCodes(data);
    } catch (err) {
      console.error('Error fetching group pin codes:', err);
      setError('Failed to load group pin codes.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.pin_code || formData.pin_code.length !== 4) {
      setError('Pin code must be exactly 4 digits');
      return;
    }

    if (!/^\d{4}$/.test(formData.pin_code)) {
      setError('Pin code must contain only numbers');
      return;
    }

    try {
      setError(null);
      
      if (editingSupporter) {
        await apiService.updateSupporter(editingSupporter.id, formData);
      } else {
        await apiService.createSupporter(formData);
      }
      
      await fetchSupporters();
      resetForm();
    } catch (err) {
      console.error('Error saving supporter:', err);
      setError(`Failed to save supporter: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (supporter: Supporter) => {
    setEditingSupporter(supporter);
    setFormData({
      name: supporter.name,
      group_code: supporter.group_code,
      phone_number: supporter.phone_number || '',
      email: supporter.email || '',
      profile_picture_url: supporter.profile_picture_url || '',
      gender: supporter.gender,
      status: supporter.status,
      pin_code: supporter.pin_code,
      display_sort: supporter.display_sort,
    });
    setIsAddingSupporter(true);
  };

  const handleDelete = async (supporter: Supporter) => {
    if (!confirm(`Are you sure you want to delete "${supporter.name}"?`)) {
      return;
    }

    try {
      setError(null);
      await apiService.deleteSupporter(supporter.id);
      await fetchSupporters();
    } catch (err) {
      console.error('Error deleting supporter:', err);
      setError(`Failed to delete supporter: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      group_code: groupPinCodes.length > 0 ? groupPinCodes[0].group_code : '', 
      phone_number: '', 
      email: '', 
      profile_picture_url: '', 
      gender: 'male', 
      status: 'on',
      pin_code: '',
      display_sort: 0
    });
    setEditingSupporter(null);
    setIsAddingSupporter(false);
    setError(null);
  };

  const handleUpdateGroupPinCode = async (groupCode: string, newPinCode: string) => {
    if (!/^\d{4}$/.test(newPinCode)) {
      setError('Group pin code must be exactly 4 digits');
      return;
    }

    try {
      setError(null);
      await apiService.updateGroupPinCode(groupCode, newPinCode);
      await fetchGroupPinCodes();
    } catch (err) {
      console.error('Error updating group pin code:', err);
      setError(`Failed to update group pin code: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handlePinCodeChange = (value: string) => {
    // Only allow numbers and limit to 4 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setFormData(prev => ({ ...prev, pin_code: numericValue }));
  };

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPicture(true);
      setError(null);
      
      const uploadResult = await apiService.uploadFile(file, 'member');
      
      setFormData(prev => ({
        ...prev,
        profile_picture_url: uploadResult.url
      }));
      
    } catch (err) {
      console.error('Error uploading picture:', err);
      setError(`Failed to upload picture: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploadingPicture(false);
    }
  };


  // Filter supporters based on user's group permissions
  const filteredSupporters = supporters.filter(supporter => {
    // Show all supporters if current user is ALL
    if (user?.group_code === 'ALL') {
      return true;
    }
    // Show NOR supporters only if current user is NOR
    if (supporter.group_code === 'NOR' && user?.group_code !== 'NOR') {
      return false;
    }
    return true;
  });

  const groupedSupporters = filteredSupporters.reduce((acc, supporter) => {
    if (!acc[supporter.group_code]) {
      acc[supporter.group_code] = [];
    }
    acc[supporter.group_code].push(supporter);
    return acc;
  }, {} as Record<string, Supporter[]>);

  // Sort each group by status (on first, off later) then by display_sort
  Object.keys(groupedSupporters).forEach(groupCode => {
    groupedSupporters[groupCode].sort((a, b) => {
      // First sort by status: 'on' comes before 'off'
      if (a.status !== b.status) {
        return a.status === 'on' ? -1 : 1;
      }
      // Then sort by display_sort (ascending)
      return a.display_sort - b.display_sort;
    });
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0rem' }}>
        <h1 className="page-title">Supporters</h1>
        <div style={{ display: 'flex', gap: '0rem' }}>
          {user?.group_code === 'ALL' && (
            <button
              onClick={() => setIsManagingGroupCodes(!isManagingGroupCodes)}
              className="btn btn-outline"
            >
              {isManagingGroupCodes ? 'Hide' : 'Manage'} Group Pin
            </button>
          )}
          <button
            onClick={() => setIsAddingSupporter(true)}
            className="btn btn-primary"
            disabled={isAddingSupporter}
          >
            + Add New 
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{backgroundColor: '#fef2f2', borderColor: '#fecaca', marginBottom: '1rem'}}>
          <div style={{color: '#dc2626', fontSize: '0.875rem'}}>
            {error}
          </div>
        </div>
      )}

      {/* Group Pin Code Management (CAR supporters only) */}
      {user?.group_code === 'ALL' && isManagingGroupCodes && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h2 className="card-header">Group Pin Code Management</h2>
          <div style={{padding: '1rem'}}>
            <p style={{marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280'}}>
              Only CAR supporters can modify group pin codes. Other supporters will see these as read-only.
            </p>
            
            {groupPinCodes.map(groupCode => (
              <div key={groupCode.group_code} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ minWidth: '80px', fontWeight: '500' }}>
                  {groupCode.group_name}:
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  defaultValue={groupCode.pin_code}
                  maxLength={4}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    letterSpacing: '0.25em',
                    fontSize: '1rem',
                    width: '100px'
                  }}
                  onBlur={(e) => {
                    const newValue = e.target.value;
                    if (newValue !== groupCode.pin_code && newValue.length === 4) {
                      handleUpdateGroupPinCode(groupCode.group_code, newValue);
                    }
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Last updated: {new Date(groupCode.updated_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAddingSupporter && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h2 className="card-header">
            {editingSupporter ? 'Edit Supporter' : 'Add New Supporter'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Enter supporter name"
                  required
                />
              </div>
              
              { user?.group_code !== 'NOR'  &&  (<div className="form-group">
                <label className="form-label">Group Code *</label>
                <select
                  value={formData.group_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, group_code: e.target.value }))}
                  className="form-input form-select"
                  required
                >
                  {groupPinCodes.map(group => (
                    <option key={group.group_code} value={group.group_code}>
                      {group.group_code} - {group.group_name}
                    </option>
                  ))}
                </select>
              </div>)}

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="form-input"
                  placeholder="010-1234-5678"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                  placeholder="supporter@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                  className="form-input form-select"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'on' | 'off' }))}
                  className="form-input form-select"
                  required
                >
                  <option value="on">On (Active)</option>
                  <option value="off">Off (Inactive)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Display Sort *</label>
                <input
                  type="number"
                  value={formData.display_sort}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_sort: parseInt(e.target.value) || 0 }))}
                  className="form-input"
                  placeholder="Sort order (e.g., 1, 2, 3...)"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pin Code *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.pin_code}
                  onChange={(e) => handlePinCodeChange(e.target.value)}
                  className="form-input"
                  placeholder="4-digit pin code"
                  maxLength={4}
                  required
                  style={{
                    textAlign: 'center',
                    letterSpacing: '0.25em',
                    fontSize: '1.125rem'
                  }}
                />
                <div style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                  Personal 4-digit pin code for login
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  disabled={uploadingPicture}
                  className="form-input"
                />
                {uploadingPicture && (
                  <div style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                    Uploading picture...
                  </div>
                )}
                {formData.profile_picture_url && (
                  <div style={{marginTop: '0.5rem'}}>
                    <img
                      src={formData.profile_picture_url}
                      alt="Profile picture"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '2px solid #d1d5db'
                      }}
                    />
                    <div style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem'}}>
                      Picture uploaded successfully
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="actions">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingSupporter ? 'Update Supporter' : 'Add Supporter'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Supporters List */}
      {loading ? (
        <div className="text-center" style={{padding: '2rem', color: '#6b7280'}}>
          Loading supporters...
        </div>
      ) :  (
        <div>
          {Object.keys(groupedSupporters).sort().map(groupCode => !(user?.group_code === 'NOR' && groupCode === 'ALL') && (
            <div key={groupCode} className="card" style={{marginBottom: '1.5rem'}}>
              <h2 className="card-header">
                {groupPinCodes.find(g => g.group_code === groupCode)?.group_name || groupCode} ({groupedSupporters[groupCode].length})
              </h2>
              
              {groupedSupporters[groupCode].length === 0 ? (
                <div className="text-center" style={{padding: '1rem', color: '#6b7280'}}>
                  No supporters in this group.
                </div>
              ) : (
                <div style={{display: 'grid', gap: '0.5rem'}}>
                  {groupedSupporters[groupCode].map(supporter => (
                    <div
                      key={supporter.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        backgroundColor: supporter.status === 'on' ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${supporter.status === 'on' ? '#bbf7d0' : '#fecaca'}`,
                        borderRadius: '0.5rem',
                        opacity: supporter.status === 'off' ? 0.7 : 1
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <div style={{position: 'relative'}}>
                          {supporter.profile_picture_url ? (
                            <img
                              src={supporter.profile_picture_url}
                              alt={supporter.name}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                                border: '2px solid #d1d5db'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '60px',
                              height: '60px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem',
                              color: '#6b7280'
                            }}>
                              {supporter.gender === 'male' ? '👨' : '👩'}
                            </div>
                          )}
                          <div style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '16px',
                            height: '16px',
                            backgroundColor: supporter.status === 'on' ? '#10b981' : '#ef4444',
                            borderRadius: '50%',
                            border: '2px solid white'
                          }} />
                        </div>
                        
                        <div>
                          <h4 style={{margin: 0, fontSize: '1.125rem', fontWeight: 600}}>
                            {supporter.name} --{supporter.display_sort} 
                            <span style={{
                              marginLeft: '0.5rem',
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              backgroundColor: supporter.status === 'on' ? '#10b981' : '#ef4444',
                              color: 'white',
                              borderRadius: '1rem',
                              textTransform: 'uppercase'
                            }}>
                              {supporter.status}
                            </span>
                          </h4>

                          <p style={{margin: '0.125rem 0', fontSize: '0.75rem', color: '#9ca3af'}}>
                            {supporter.gender === 'male' ? '♂️ Male' : '♀️ Female'}
                          </p>
                        </div>
                      </div>
                      
                      {( user?.group_code !== 'NOR' || user?.id === supporter.id ) && ( 
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button
                          onClick={() => handleEdit(supporter)}
                          className="btn btn-outline"
                          style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
                        >
                          Edit
                        </button>
                        
                        { user?.group_code !== 'NOR'  && (<button
                          onClick={() => handleDelete(supporter)}
                          className="btn btn-danger"
                          style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
                        >
                          Delete
                        </button>)}
                        
                      </div>)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {supporters.length === 0 && !loading && (
            <div className="text-center" style={{padding: '3rem', color: '#6b7280'}}>
              <h3 style={{marginBottom: '1rem'}}>No supporters found</h3>
              <p>Click "Add New Supporter" to create your first supporter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Supporters;