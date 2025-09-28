import React, { useState } from 'react';
import type { LocaleStrings, Reminder } from '../types';
import { PlusCircleIcon } from './Icons';

interface ReminderFormProps {
  addReminder: (reminder: Omit<Reminder, 'id' | 'status'>) => void;
  t: LocaleStrings;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ addReminder, t }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [telegramId, setTelegramId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !telegramId) {
      alert('Please fill in all required fields.');
      return;
    }
    addReminder({ title, content, dueDate, telegramId });
    setTitle('');
    setContent('');
    setDueDate('');
    setTelegramId('');
  };

  return (
    <div className="bg-card rounded-xl shadow-lg p-6 border border-secondary">
      <div className="flex items-center gap-3 mb-6">
        <PlusCircleIcon />
        <h2 className="text-xl font-semibold">{t.addReminder}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">{t.reminderTitle}</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">{t.reminderContent}</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-text-secondary mb-1">{t.dueDate}</label>
          <input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
            required
          />
        </div>
        <div>
          <label htmlFor="telegramId" className="block text-sm font-medium text-text-secondary mb-1">{t.telegramUserId}</label>
          <input
            id="telegramId"
            type="text"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder={t.telegramUserIdPlaceholder}
            className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
            required
          />
        </div>
        <button type="submit" className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition duration-200 flex items-center justify-center gap-2">
          <PlusCircleIcon />
          {t.submit}
        </button>
      </form>
    </div>
  );
};

export default ReminderForm;