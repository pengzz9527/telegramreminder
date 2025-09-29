export interface Reminder {
  id: string;
  title: string;
  content: string;
  dueDate: string;
  telegramId: string;
  status: 'pending' | 'sent' | 'failed';
  tags?: string[];
  error?: string;
}

export interface LocaleStrings {
  appTitle: string;
  pendingReminders: string;
  addReminder: string;
  reminderTitle: string;
  reminderContent: string;
  dueDate: string;
  telegramRecipientId: string;
  telegramRecipientIdPlaceholder: string;
  telegramRecipientIdHint: string;
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
  statusFailed: string;
  edit: string;
  save: string;
  cancel: string;
  retry: string;
  filterAll: string;
  filterPending: string;
  filterSent: string;
  filterFailed: string;
  tags: string;
  tagsPlaceholder: string;
  filterByTag: string;
  allTags: string;
  importFromExcel: string;
  remindersImportedSuccess: string;
  downloadTemplate: string;
}