import React, { useState, useEffect } from 'react';

interface ClockProps {
  language: 'en' | 'zh';
}

const Clock: React.FC<ClockProps> = ({ language }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const locale = language === 'zh' ? 'zh-CN' : 'en-US';

  return (
    <div className="hidden sm:block text-sm font-medium text-text-secondary">
      {currentTime.toLocaleString(locale, formatOptions)}
    </div>
  );
};

export default Clock;