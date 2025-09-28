export interface Reminder {
  id: string;
  title: string;
  content: string;
  dueDate: string;
  telegramId: string;
  status: 'pending' | 'sent';
}

export interface LocaleStrings {
  appTitle: string;
  pendingReminders: string;
  addReminder: string;
  reminderTitle: string;
  reminderContent: string;
  dueDate: string;
  telegramUserId: string;
  telegramUserIdPlaceholder: string;
  submit: string;
  delete: string;
  noReminders: string;
  footerText: string;
  telegramBotToken: string;
  setToken: string;
  tokenSaved: string;
  tokenNotSetWarning: string;
  tokenInfo: string;
  showToken: string;
  hideToken: string;
  statusPending: string;
  statusSent: string;
  edit: string;
  save: string;
  cancel: string;
  filterAll: string;
  filterPending: string;
  filterSent: string;
}