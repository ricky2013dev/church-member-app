import React from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../contexts/LanguageContext';
import { formatDateOnly } from '../utils/dateUtils';
import type { Family } from '../types';

interface FamilyListItemProps {
  family: Family;
  variant?: 'dashboard' | 'search';
}

const FamilyListItem: React.FC<FamilyListItemProps> = ({ 
  family, 
  variant = 'dashboard' 
}) => {
  const { t } = useLanguage();
  
  const getChildrenCount = (family: Family) => {
    return family.members?.filter(member => member.relationship === 'child').length || 0;
  };

  const getTotalMembersCount = (family: Family) => {
    return family.members?.length || 0;
  };

  return (
    <Link 
      to={`/edit/${family.id}`} 
      className="family-item"
    >
      <div className="family-item-content">
        <div className="family-item-left">
          <div 
            className="family-photo" 
            style={variant === 'search' ? { width: '4rem', height: '4rem' } : undefined}
          >
            {family.family_picture_url ? (
              <img 
                src={family.family_picture_url} 
                alt={family.family_name}
                style={variant === 'search' ? { width: '4rem', height: '4rem' } : undefined}
              />
            ) : (
              <span className="family-photo-placeholder">
                No Photo
              </span>
            )}
          </div>
          
          <div className="family-info">
            <h3 style={variant === 'search' ? { fontSize: '1.125rem' } : undefined}>
              {family.family_name}
            </h3>
            <p>
              {t(
                family.registration_status === 'Visitor'
                  ? 'visitor'
                  : 'registrationComplete'
              )}
            </p>
            {variant === 'search' && (
              <p style={{ marginTop: '0.25rem' }}>
                {formatDateOnly(family.input_date)}
              </p>
            )}
          </div>
        </div>
        
        <div className="family-item-right">
          {variant === 'dashboard' && (
            <div className="family-date">
              {formatDateOnly(family.input_date)}
            </div>
          )}
          
          <div className="family-children">
            {variant === 'search' ? (
              <>
                {getChildrenCount(family)} {t('numberOfChildren')}
              </>
            ) : (
              <>
                {getChildrenCount(family)} {t('numberOfChildren')}
              </>
            )}
          </div>
          
          {variant === 'search' && (
            <div className="family-children">
              {getTotalMembersCount(family)} members
            </div>
          )}
          
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
  );
};

export default FamilyListItem;