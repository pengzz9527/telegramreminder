import React, { useState } from 'react';
import type { Reminder, LocaleStrings } from '../types';
import { CalendarIcon, ChatBubbleIcon, DeleteIcon, DocumentIcon, TitleIcon, EditIcon, SaveIcon, CancelIcon, RetryIcon, ErrorIcon, TagIcon } from './Icons';

interface ReminderListProps {
  reminders: Reminder[];
  allTags: string[];
  deleteReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Omit<Reminder, 'id' | 'title' | 'telegramId'>>) => void;
  retryReminder: (id: string) => void;
  language: 'en' | 'zh';
  t: LocaleStrings;
}

const ReminderList: React.FC<ReminderListProps> = ({ reminders, allTags, deleteReminder, updateReminder, retryReminder, t, language }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [editedTags, setEditedTags] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (reminders.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">{t.noReminders}</p>
      </div>
    );
  }

  const filteredReminders = reminders.filter(reminder => {
    const statusMatch = filter === 'all' || reminder.status === filter;
    const tagMatch = selectedTags.length === 0 || (reminder.tags || []).some(tag => selectedTags.includes(tag));
    return statusMatch && tagMatch;
  });

  const statusOrder = { failed: 1, pending: 2, sent: 3 };
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (a.status !== b.status) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleEditClick = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditedContent(reminder.content);
    setEditedTags((reminder.tags || []).join(', '));
    // Convert stored UTC date to a local datetime string suitable for the input field
    const date = new Date(reminder.dueDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
    setEditedDueDate(localDateTimeString);
  };


  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleSaveClick = (id: string) => {
    if (!editedDueDate) return;
    const tagsArray = editedTags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
    // Convert local datetime string from input back to UTC ISO string for saving
    const localDate = new Date(editedDueDate);
    const utcDate = localDate.toISOString();
    updateReminder(id, { content: editedContent, dueDate: utcDate, tags: tagsArray });
    setEditingId(null);
  };
  
  const getFormattedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return "Invalid Date";
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };


  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 p-4 bg-background rounded-lg border border-secondary">
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-text-secondary mr-2 shrink-0">{t.filterByTag}:</span>
            <button
                onClick={() => setSelectedTags([])}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${selectedTags.length === 0 ? 'bg-primary text-white' : 'bg-secondary hover:bg-slate-300 text-text-primary'}`}
            >
                {t.allTags}
            </button>
            {allTags.map(tag => (
                <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${selectedTags.includes(tag) ? 'bg-primary text-white' : 'bg-secondary hover:bg-slate-300 text-text-primary'}`}
                >
                    {tag}
                </button>
            ))}
        </div>

        <div className="relative shrink-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'sent' | 'failed')}
            className="appearance-none w-full sm:w-auto bg-card border border-secondary rounded-lg pl-3 pr-8 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
            aria-label="Filter reminders by status"
          >
            <option value="all">{t.filterAll}</option>
            <option value="pending">{t.filterPending}</option>
            <option value="sent">{t.filterSent}</option>
            <option value="failed">{t.filterFailed}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
      
      {sortedReminders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-text-secondary">{t.noReminders}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReminders.map((reminder) => {
            const isEditing = editingId === reminder.id;
            const isPending = reminder.status === 'pending';
            const isSent = reminder.status === 'sent';
            const isFailed = reminder.status === 'failed';
            
            const cardBorderColor = isFailed ? 'border-l-danger' : isPending ? 'border-l-accent' : 'border-l-success';
            const statusBadgeColor = isFailed ? 'bg-red-100 text-red-800' : isPending ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
            const statusText = isFailed ? t.statusFailed : isPending ? t.statusPending : t.statusSent;

            return (
              <div key={reminder.id} className={`bg-background rounded-lg p-4 shadow-sm border border-secondary border-l-4 ${cardBorderColor} transition-shadow hover:shadow-md`}>
                {isEditing ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <TitleIcon />
                        <h3 className="text-lg font-bold text-text-primary">{reminder.title}</h3>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadgeColor}`}>{statusText}</span>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      <div>
                        <label htmlFor={`content-${reminder.id}`} className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
                          <DocumentIcon /> {t.reminderContent}
                        </label>
                        <textarea
                          id={`content-${reminder.id}`}
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={3}
                          className="w-full bg-card border border-secondary rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
                        />
                      </div>
                       <div>
                        <label htmlFor={`tags-${reminder.id}`} className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
                           <TagIcon /> {t.tags}
                        </label>
                        <input
                            id={`tags-${reminder.id}`}
                            type="text"
                            value={editedTags}
                            onChange={(e) => setEditedTags(e.target.value)}
                            placeholder={t.tagsPlaceholder}
                            className="w-full bg-card border border-secondary rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label htmlFor={`dueDate-${reminder.id}`} className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
                          <CalendarIcon /> {t.dueDate}
                        </label>
                        <input
                          id={`dueDate-${reminder.id}`}
                          type="datetime-local"
                          value={editedDueDate}
                          onChange={(e) => setEditedDueDate(e.target.value)}
                          className="w-full bg-card border border-secondary rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:outline-none transition"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end items-center gap-2">
                      <button onClick={handleCancelClick} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-secondary rounded-md hover:bg-secondary transition-colors">
                        <CancelIcon /> {t.cancel}
                      </button>
                      <button onClick={() => handleSaveClick(reminder.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
                        <SaveIcon /> {t.save}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <TitleIcon />
                        <h3 className="text-lg font-bold text-text-primary">{reminder.title}</h3>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadgeColor}`}>{statusText}</span>
                      </div>
                      <div className="flex items-center">
                        {isFailed && (
                           <button
                              onClick={() => retryReminder(reminder.id)}
                              className="text-text-secondary hover:text-accent transition-colors p-1 rounded-full"
                              aria-label={`${t.retry} ${reminder.title}`}
                           >
                              <RetryIcon />
                           </button>
                        )}
                        <button
                          onClick={() => handleEditClick(reminder)}
                          className="text-text-secondary hover:text-accent transition-colors p-1 rounded-full"
                          aria-label={`${t.edit} ${reminder.title}`}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-text-secondary hover:text-danger transition-colors p-1 rounded-full"
                          aria-label={`${t.delete} ${reminder.title}`}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                    {reminder.content && (
                      <div className="flex items-start gap-2 mt-2 text-text-secondary pl-8">
                        <DocumentIcon />
                        <p className="whitespace-pre-wrap text-sm">{reminder.content}</p>
                      </div>
                    )}
                     {isFailed && reminder.error && (
                      <div className="flex items-center gap-2 mt-3 p-2 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200">
                        <ErrorIcon />
                        <p className="font-mono text-xs">{reminder.error}</p>
                      </div>
                    )}
                    {reminder.tags && reminder.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {reminder.tags.map(tag => (
                                <span key={tag} className="px-2.5 py-1 text-xs font-medium text-sky-800 bg-sky-100 rounded-full">{tag}</span>
                            ))}
                        </div>
                    )}
                    <div className="mt-4 text-sm text-text-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 bg-secondary/60 px-3 py-1 rounded-full">
                        <CalendarIcon />
                        <span>{getFormattedDate(reminder.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary/60 px-3 py-1 rounded-full">
                        <ChatBubbleIcon />
                        <span>ID: {reminder.telegramId}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  );
};

export default ReminderList;