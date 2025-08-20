import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ko: {
    dashboard: '대시보드',
    searchMember: '성도 검색',
    addNew: '새 가족 등록',
    familyName: '가정명',
    registrationStatus: '등록 상태',
    inputDate: '입력일',
    numberOfChildren: '자녀 수',
    visitor: '방문자',
    registrationComplete: '등록 완료',
    weeklyRegistrations: '주간 신규 등록',
    recentFamilies: '최근 등록 가족',
    week: '주',
    newFamilies: '신규 가족',
    search: '검색',
    filter: '필터',
    name: '이름',
    koreanName: '한글명',
    englishName: '영문명',
    phoneNumber: '전화번호',
    birthDate: '생년월일',
    relationship: '관계',
    husband: '남편',
    wife: '아내',
    child: '자녀',
    memo: '메모',
    educationStatus: '교육 상태',
    memberGroup: '그룹',
    gradeLevel: '학년',
    college: '대학부',
    youth: '청년부',
    kid: '어린이',
    kinder: '유치부',
    save: '저장',
    cancel: '취소',
    edit: '편집',
    delete: '삭제',
    add: '추가',
    upload: '업로드',
    familyPicture: '가족 사진',
    individualPicture: '개인 사진'
  },
  en: {
    dashboard: 'Dashboard',
    searchMember: 'Search Member',
    addNew: 'Add New',
    familyName: 'Family Name',
    registrationStatus: 'Registration Status',
    inputDate: 'Input Date',
    numberOfChildren: 'Number of Children',
    visitor: 'Visitor',
    registrationComplete: 'Registration Complete',
    weeklyRegistrations: 'Weekly Registrations',
    recentFamilies: 'Recent Families',
    week: 'Week',
    newFamilies: 'New Families',
    search: 'Search',
    filter: 'Filter',
    name: 'Name',
    koreanName: 'Korean Name',
    englishName: 'English Name',
    phoneNumber: 'Phone Number',
    birthDate: 'Birth Date',
    relationship: 'Relationship',
    husband: 'Husband',
    wife: 'Wife',
    child: 'Child',
    memo: 'Memo',
    educationStatus: 'Education Status',
    memberGroup: 'Group',
    gradeLevel: 'Grade Level',
    college: 'College',
    youth: 'Youth',
    kid: 'Kid',
    kinder: 'Kinder',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    upload: 'Upload',
    familyPicture: 'Family Picture',
    individualPicture: 'Individual Picture'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ko');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ko] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};