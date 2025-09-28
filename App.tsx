import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Reminder } from './types';
import { sendTelegramMessage } from './services/telegramService';
import { locales } from './constants';
import ReminderForm from './components/ReminderForm';
import ReminderList from './components/ReminderList';
import LanguageSwitcher from './components/LanguageSwitcher';
import TelegramSetup from './components/TelegramSetup';
import Clock from './components/Clock';
import { BellIcon, LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [language, setLanguage] = useLocalStorage<'en' | 'zh'>('lang', 'en');
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('reminders', []);
  const [botToken, setBotToken] = useLocalStorage<string>('botToken', '');

  const t = useMemo(() => locales[language], [language]);

  const addReminder = (reminder: Omit<Reminder, 'id' | 'status'>) => {
    const newReminder: Reminder = { ...reminder, id: Date.now().toString(), status: 'pending' };
    setReminders([...reminders, newReminder]);
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const updateReminder = (id: string, updates: Pick<Reminder, 'content' | 'dueDate'>) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates, status: 'pending' } : r
    ));
  };

  const checkReminders = useCallback(async () => {
    if (!botToken) return;

    const now = Date.now();
    const dueReminders = reminders.filter(r => r.status === 'pending' && new Date(r.dueDate).getTime() <= now);

    if (dueReminders.length > 0) {
      console.log(`Found ${dueReminders.length} due reminders.`);
      for (const reminder of dueReminders) {
        try {
          const message = `🔔 *${t.reminderTitle}*: ${reminder.title}\n\n📝 *${t.reminderContent}*: \n${reminder.content}`;
          await sendTelegramMessage(botToken, reminder.telegramId, message);
          // If successful, update the reminder status instead of deleting
          setReminders(prev => prev.map(r => 
            r.id === reminder.id ? { ...r, status: 'sent' } : r
          ));
        } catch (error) {
          console.error(`Failed to send reminder ${reminder.id}:`, error);
          // Optional: handle failed reminders, e.g., mark as failed but don't delete
        }
      }
    }
  }, [reminders, botToken, setReminders, t]);

  useEffect(() => {
    const reminderInterval = setInterval(checkReminders, 15000);

    return () => {
      clearInterval(reminderInterval);
    };
  }, [checkReminders]);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <header className="bg-card/80 backdrop-blur-lg border-b border-secondary sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <h1 className="text-2xl font-bold text-text-primary">{t.appTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Clock language={language} />
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <TelegramSetup botToken={botToken} setBotToken={setBotToken} t={t} />
            <ReminderForm addReminder={addReminder} t={t} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-lg p-6 border border-secondary">
              <div className="flex items-center gap-3 mb-6">
                <BellIcon />
                <h2 className="text-xl font-semibold">{t.pendingReminders}</h2>
                <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">{reminders.filter(r => r.status === 'pending').length}</span>
              </div>
              <ReminderList reminders={reminders} deleteReminder={deleteReminder} updateReminder={updateReminder} t={t} />
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-text-secondary text-sm">
        <p>{t.footerText}</p>
      </footer>
    </div>
  );
};

export default App;