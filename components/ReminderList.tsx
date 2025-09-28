import React, { useState } from 'react';
import type { Reminder, LocaleStrings } from '../types';
import { CalendarIcon, ChatBubbleIcon, DeleteIcon, DocumentIcon, TitleIcon, EditIcon, SaveIcon, CancelIcon } from './Icons';

interface ReminderListProps {
  reminders: Reminder[];
  deleteReminder: (id: string) => void;
  updateReminder: (id: string, updates: Pick<Reminder, 'content' | 'dueDate'>) => void;
  t: LocaleStrings;
}

const ReminderList: React.FC<ReminderListProps> = ({ reminders, deleteReminder, updateReminder, t }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');

  if (reminders.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">{t.noReminders}</p>
      </div>
    );
  }

  const statusOrder = { pending: 1, sent: 2 };
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.status !== b.status) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleEditClick = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditedContent(reminder.content);
    // Format date for datetime-local input, adjusting for local timezone
    const date = new Date(reminder.dueDate);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
    setEditedDueDate(localISOTime);
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleSaveClick = (id: string) => {
    if (!editedDueDate) return;
    updateReminder(id, { content: editedContent, dueDate: editedDueDate });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {sortedReminders.map((reminder) => {
        const isEditing = editingId === reminder.id;
        const isPending = reminder.status === 'pending';
        const cardBorderColor = isPending ? 'border-l-accent' : 'border-l-success';
        const statusBadgeColor = isPending ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
        const statusText = isPending ? t.statusPending : t.statusSent;

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
                <div className="mt-4 text-sm text-text-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 bg-secondary/60 px-3 py-1 rounded-full">
                    <CalendarIcon />
                    <span>{new Date(reminder.dueDate).toLocaleString()}</span>
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
  );
};

export default ReminderList;