import React, { useState } from 'react';
import type { LocaleStrings } from '../types';
import { KeyIcon, EyeOpenIcon, EyeClosedIcon, WarningIcon } from './Icons';

interface TelegramSetupProps {
  botToken: string;
  setBotToken: (token: string) => void;
  t: LocaleStrings;
}

const TelegramSetup: React.FC<TelegramSetupProps> = ({ botToken, setBotToken, t }) => {
  const [localToken, setLocalToken] = useState(botToken);
  const [message, setMessage] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSave = () => {
    setBotToken(localToken);
    setMessage(t.tokenSaved);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="bg-card rounded-xl shadow-lg p-6 border border-secondary">
      <div className="flex items-center gap-3 mb-4">
        <KeyIcon />
        <h2 className="text-xl font-semibold">{t.telegramBotToken}</h2>
      </div>
      
      {!botToken && (
         <div className="flex items-center gap-2 p-3 mb-4 text-sm text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-200">
           <WarningIcon />
           <span>{t.tokenNotSetWarning}</span>
         </div>
      )}

      <div className="relative">
        <input
          type={showToken ? 'text' : 'password'}
          value={localToken}
          onChange={(e) => setLocalToken(e.target.value)}
          className="w-full bg-background border border-secondary rounded-lg pl-3 pr-10 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
        />
        <button
          onClick={() => setShowToken(!showToken)}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-text-secondary hover:text-text-primary"
          aria-label={showToken ? t.hideToken : t.showToken}
        >
          {showToken ? <EyeClosedIcon /> : <EyeOpenIcon />}
        </button>
      </div>

      <p className="text-xs text-text-secondary mt-2">{t.tokenInfo}</p>
      
      <button
        onClick={handleSave}
        className="w-full mt-4 bg-accent text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent transition duration-200"
      >
        {t.setToken}
      </button>

      {message && <p className="text-sm text-green-600 mt-3 text-center">{message}</p>}
    </div>
  );
};

export default TelegramSetup;