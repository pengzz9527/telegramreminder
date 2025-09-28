import React from 'react';

interface LanguageSwitcherProps {
  language: 'en' | 'zh';
  setLanguage: (lang: 'en' | 'zh') => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {
  const inactiveClass = "px-3 py-1.5 text-sm font-medium text-text-secondary rounded-md hover:bg-secondary transition-colors";
  const activeClass = "px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md";

  return (
    <div className="flex items-center bg-secondary/50 p-1 rounded-lg">
      <button
        onClick={() => setLanguage('en')}
        className={language === 'en' ? activeClass : inactiveClass}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('zh')}
        className={language === 'zh' ? activeClass : inactiveClass}
      >
        中文
      </button>
    </div>
  );
};

export default LanguageSwitcher;