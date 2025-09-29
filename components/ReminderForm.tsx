import React, { useState, useRef } from 'react';
import type { LocaleStrings, Reminder } from '../types';
import { PlusCircleIcon, UploadIcon, DownloadIcon } from './Icons';

declare var XLSX: any;

interface ReminderFormProps {
  addReminder: (reminder: Omit<Reminder, 'id' | 'status' | 'error'>) => void;
  addMultipleReminders: (reminders: Omit<Reminder, 'id' | 'status' | 'error'>[]) => void;
  allTags: string[];
  t: LocaleStrings;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ addReminder, addMultipleReminders, allTags, t }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [tags, setTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !telegramId) {
      alert('Please fill in all required fields.');
      return;
    }
    const localDate = new Date(dueDate);
    const utcDate = localDate.toISOString();
    
    const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
    addReminder({ title, content, dueDate: utcDate, telegramId, tags: tagsArray });
    setTitle('');
    setContent('');
    setDueDate('');
    setTelegramId('');
    setTags('');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const newReminders = json.map((row, index): Omit<Reminder, 'id' | 'status' | 'error'> | null => {
          const { title, content = '', dueDate, telegramId, tags = '' } = row;

          if (!title || !dueDate || !telegramId) {
            console.warn(`Skipping row ${index + 2} due to missing required fields (title, dueDate, telegramId).`);
            return null;
          }
          
          let utcDate: string;

          if (dueDate instanceof Date) {
            // SheetJS with cellDates:true creates a Date object that is timezone-unaware (parsed as UTC).
            // We need to interpret these date components as local time and then convert to a proper UTC ISO string.
            const parsedDate = dueDate;
            const year = parsedDate.getUTCFullYear();
            const month = parsedDate.getUTCMonth();
            const day = parsedDate.getUTCDate();
            const hours = parsedDate.getUTCHours();
            const minutes = parsedDate.getUTCMinutes();
            const seconds = parsedDate.getUTCSeconds();
            const localDate = new Date(year, month, day, hours, minutes, seconds);

            if (isNaN(localDate.getTime())) {
              console.warn(`Skipping row ${index + 2} due to invalid date from Excel cell.`);
              return null;
            }
            utcDate = localDate.toISOString();
          } else {
            // It's likely a string, which new Date() parses as local time.
            const parsedDate = new Date(dueDate);
            if (isNaN(parsedDate.getTime())) {
              console.warn(`Skipping row ${index + 2} due to invalid date format for dueDate string: "${dueDate}".`);
              return null;
            }
            utcDate = parsedDate.toISOString();
          }

          return {
            title: String(title),
            content: String(content),
            dueDate: utcDate,
            telegramId: String(telegramId),
            tags: String(tags).split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean)
          };
        }).filter((r): r is Omit<Reminder, 'id' | 'status' | 'error'> => r !== null);
        
        if (newReminders.length > 0) {
          addMultipleReminders(newReminders);
        } else {
          alert('No valid reminders found in the file.');
        }

      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert('Failed to process the Excel file. Please ensure it is a valid format.');
      } finally {
        if(fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const data = [
      {
        title: 'Renew Domain',
        content: 'Renew example.com domain name',
        dueDate: '2025/10/20 15:30:00',
        telegramId: '123456789',
        tags: 'work,domain'
      },
      {
        title: 'Doctor Appointment',
        content: 'Annual health check-up',
        dueDate: '2025/11/05 09:00:00',
        telegramId: '@my_telegram_username',
        tags: 'personal,health'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reminders');
    XLSX.writeFile(workbook, 'reminder_template.xlsx');
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
          <label htmlFor="tags" className="block text-sm font-medium text-text-secondary mb-1">{t.tags}</label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t.tagsPlaceholder}
            className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
          />
           <div className="flex flex-wrap gap-2 mt-2">
            {allTags.map(tag => (
              <button
                type="button"
                key={tag}
                onClick={() => {
                  const currentTags = new Set(tags.split(',').map(t => t.trim()).filter(Boolean));
                  if (!currentTags.has(tag)) {
                    currentTags.add(tag);
                    setTags(Array.from(currentTags).join(', '));
                  }
                }}
                className="px-2 py-1 text-xs bg-secondary hover:bg-sky-200 text-text-primary rounded-full transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="telegramId" className="block text-sm font-medium text-text-secondary mb-1">{t.telegramRecipientId}</label>
          <input
            id="telegramId"
            type="text"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder={t.telegramRecipientIdPlaceholder}
            className="w-full bg-background border border-secondary rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
            required
          />
          <p className="text-xs text-text-secondary mt-2">{t.telegramRecipientIdHint}</p>
        </div>
        <button type="submit" className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition duration-200 flex items-center justify-center gap-2">
            <PlusCircleIcon />
            {t.submit}
        </button>
      </form>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-secondary" />
        <span className="px-2 text-xs text-text-secondary uppercase">Bulk Actions</span>
        <hr className="flex-grow border-secondary" />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
            accept=".xlsx, .xls"
        />
        <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-secondary text-text-primary font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-slate-400 transition duration-200 flex items-center justify-center gap-2"
        >
            <UploadIcon />
            {t.importFromExcel}
        </button>
        <button 
            type="button" 
            onClick={handleDownloadTemplate}
            className="w-full bg-secondary text-text-primary font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-slate-400 transition duration-200 flex items-center justify-center gap-2"
        >
            <DownloadIcon />
            {t.downloadTemplate}
        </button>
      </div>
    </div>
  );
};

export default ReminderForm;