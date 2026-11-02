import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from '../services/service.service';
import { ReminderService } from '../services/reminder.service';
import {
  ymd, dayDiff, dueLabel, isOverdue, time12, minutesToTomorrow10,
  REMINDER_OPTIONS, REPEAT_OPTIONS, PRIORITIES, DEFAULT_CATEGORIES
} from './todo-utils';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit, OnDestroy {

  @ViewChild('quickInput') quickInput?: ElementRef<HTMLInputElement>;
  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;

  destroy$ = new Subject();

  /* list */
  items: any[] = [];
  groups: { key: string, label: string, icon: string, items: any[] }[] = [];
  counts: any = { pending: 0, today: 0, overdue: 0, upcoming: 0, nodate: 0, completed: 0, all: 0 };
  categories: string[] = [];
  customers: any[] = [];
  loading = false;
  firstLoad = true;

  view = 'pending';
  views = [
    { key: 'pending', label: 'All open', icon: 'fa-list-ul' },
    { key: 'overdue', label: 'Overdue', icon: 'fa-exclamation-circle' },
    { key: 'today', label: 'Today', icon: 'fa-sun' },
    { key: 'upcoming', label: 'Upcoming', icon: 'fa-calendar-week' },
    { key: 'nodate', label: 'No date', icon: 'fa-inbox' },
    { key: 'completed', label: 'Completed', icon: 'fa-check-circle' },
  ];
  search = '';
  priorityFilter = '';
  categoryFilter = '';
  private searchTimer: any;
  private reqSeq = 0;

  /* quick add */
  quick = { title: '', when: 'today', date: '', time: '', priority: 2 };
  quickSaving = false;

  /* editor */
  editorOpen = false;
  saving = false;
  form: any = this.blankForm();

  /* row busy flags (button disabled until server responds) */
  busy: { [id: number]: boolean } = {};
  completing: { [id: number]: boolean } = {};
  menuFor: number | null = null;

  notifyPermission = 'unsupported';

  reminderOptions = REMINDER_OPTIONS;
  repeatOptions = REPEAT_OPTIONS;
  priorities = PRIORITIES;
  dueLabel = dueLabel;
  isOverdue = isOverdue;
  time12 = time12;

  private onExternalChange = () => this.load(false);

  constructor(
    private api: ServiceService,
    private reminders: ReminderService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!localStorage.getItem('token')) { this.router.navigateByUrl('/'); return; }
    this.notifyPermission = this.reminders.notifyPermission;
    this.load();
    this.loadCustomers();
    window.addEventListener('erp-todos-changed', this.onExternalChange);
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
    window.removeEventListener('erp-todos-changed', this.onExternalChange);
    this.destroy$.complete();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (this.editorOpen) { this.closeEditor(); }
      this.menuFor = null;
      return;
    }
    // press "n" anywhere (not while typing) to jump to quick add
    const tag = (e.target as HTMLElement).tagName;
    if (e.key === 'n' && !this.editorOpen && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
      e.preventDefault();
      if (this.quickInput) { this.quickInput.nativeElement.focus(); }
    }
  }

  @HostListener('document:click')
  onDocClick() { this.menuFor = null; }

  /* ---------------- loading ---------------- */
  load(showLoader = true) {
    const seq = ++this.reqSeq;
    if (showLoader) { this.loading = true; }
    const data: any = { view: this.view };
    if (this.search.trim()) { data.search = this.search.trim(); }
    if (this.priorityFilter) { data.priority = this.priorityFilter; }
    if (this.categoryFilter) { data.category = this.categoryFilter; }
    this.api.postData('todo/list', data).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      if (seq !== this.reqSeq) { return; }
      this.loading = false;
      this.firstLoad = false;
      if (!r || !r.success) { this.toastr.error((r && r.message) || 'Could not load tasks', 'Error'); return; }
      this.items = r.items || [];
      this.counts = r.counts || this.counts;
      this.categories = r.categories || [];
      this.buildGroups();
      this.reminders.counts$.next(this.counts);
    }, () => {
      if (seq !== this.reqSeq) { return; }
      this.loading = false;
      this.firstLoad = false;
      this.toastr.error('Server Error', 'Error');
    });
  }

  loadCustomers() {
    this.api.postData('customer/list/all', { token: localStorage.getItem('token') }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      if (r && r.success) { this.customers = r.users || []; }
    }, () => { });
  }

  setView(v: string) {
    if (this.view === v) { return; }
    this.view = v;
    this.load();
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 350);
  }

  clearFilters() {
    this.search = ''; this.priorityFilter = ''; this.categoryFilter = '';
    this.load();
  }

  get hasFilters(): boolean { return !!(this.search.trim() || this.priorityFilter || this.categoryFilter); }

  /* group open tasks: Overdue / Today / Tomorrow / Next 7 days / Later / No date */
  private buildGroups() {
    if (this.view !== 'pending') {
      const v = this.views.find(x => x.key === this.view)!;
      this.groups = [{ key: this.view, label: v.label, icon: v.icon, items: this.items }];
      return;
    }
    const g: any = {
      overdue: { key: 'overdue', label: 'Overdue', icon: 'fa-exclamation-circle', items: [] },
      today: { key: 'today', label: 'Today', icon: 'fa-sun', items: [] },
      tomorrow: { key: 'tomorrow', label: 'Tomorrow', icon: 'fa-calendar-day', items: [] },
      week: { key: 'week', label: 'Next 7 days', icon: 'fa-calendar-week', items: [] },
      later: { key: 'later', label: 'Later', icon: 'fa-calendar-alt', items: [] },
      nodate: { key: 'nodate', label: 'No date', icon: 'fa-inbox', items: [] },
    };
    this.items.forEach(it => {
      if (!it.due_date) { g.nodate.items.push(it); return; }
      const d = dayDiff(it.due_date);
      if (d < 0 || isOverdue(it)) { g.overdue.items.push(it); }
      else if (d === 0) { g.today.items.push(it); }
      else if (d === 1) { g.tomorrow.items.push(it); }
      else if (d <= 7) { g.week.items.push(it); }
      else { g.later.items.push(it); }
    });
    this.groups = ['overdue', 'today', 'tomorrow', 'week', 'later', 'nodate'].map(k => g[k]).filter(x => x.items.length);
  }

  trackById(_: number, it: any) { return it.id; }

  /* ---------------- quick add ---------------- */
  private quickDate(): string {
    const t = new Date();
    switch (this.quick.when) {
      case 'today': return ymd(t);
      case 'tomorrow': return ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1));
      case 'monday': {
        const add = ((8 - t.getDay()) % 7) || 7;
        return ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() + add));
      }
      case 'pick': return this.quick.date || '';
      default: return '';
    }
  }

  quickAdd() {
    const title = this.quick.title.trim();
    if (!title) { if (this.quickInput) { this.quickInput.nativeElement.focus(); } return; }
    if (this.quickSaving) { return; }
    const due = this.quickDate();
    // reminder: at the given time; without a time at 10:00 AM that day,
    // but never a pop-up for something that is already in the past
    let remind: any = '';
    if (due) {
      const [h, m] = (this.quick.time || '10:00').split(':').map(Number);
      const p = due.split('-');
      const at = new Date(+p[0], +p[1] - 1, +p[2], h, m, 0);
      if (at.getTime() > Date.now()) { remind = 0; }
    }
    this.quickSaving = true;
    this.api.postData('todo/save', {
      id: 0,
      title,
      due_date: due,
      due_time: due ? this.quick.time : '',
      remind_before: remind,
      priority: this.quick.priority,
      repeat_type: 'none'
    }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      this.quickSaving = false;
      if (r && r.success) {
        this.toastr.success(remind === 0 ? 'Reminder set for ' + dueLabel(r.item) : (due ? 'Added for ' + dueLabel(r.item) : 'Task added'), 'Added');
        this.quick.title = '';
        this.quick.time = '';
        this.quick.priority = 2;
        this.load(false);
        this.reminders.refresh();
        setTimeout(() => this.quickInput && this.quickInput.nativeElement.focus(), 50);
      } else {
        this.toastr.error((r && r.message) || 'Could not add task', 'Error');
      }
    }, () => { this.quickSaving = false; this.toastr.error('Server Error', 'Error'); });
  }

  /* open the full editor with whatever was typed in quick add */
  quickMore() {
    const due = this.quickDate();
    this.openEditor();
    this.form.title = this.quick.title.trim();
    this.form.due_date = due;
    this.form.due_time = this.quick.time;
    this.form.priority = this.quick.priority;
    this.form.remind_before = due ? '0' : '';
  }

  /* ---------------- editor ---------------- */
  blankForm() {
    return {
      id: 0, title: '', description: '', due_date: '', due_time: '', remind_before: '0',
      priority: 2, category: '', customer_id: '', repeat_type: 'none'
    };
  }

  openEditor(item?: any) {
    this.menuFor = null;
    this.form = item ? {
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      due_date: item.due_date || '',
      due_time: item.due_time || '',
      remind_before: item.remind_before === null || item.remind_before === undefined ? '' : String(item.remind_before),
      priority: Number(item.priority) || 2,
      category: item.category || '',
      customer_id: item.customer_id ? String(item.customer_id) : '',
      repeat_type: item.repeat_type || 'none'
    } : this.blankForm();
    if (!item) { this.form.due_date = ymd(new Date()); }
    this.editorOpen = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.titleInput && this.titleInput.nativeElement.focus(), 80);
  }

  closeEditor() {
    this.editorOpen = false;
    document.body.style.overflow = '';
  }

  setDue(when: string) {
    const t = new Date();
    if (when === 'today') { this.form.due_date = ymd(t); }
    if (when === 'tomorrow') { this.form.due_date = ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)); }
    if (when === 'week') { this.form.due_date = ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 7)); }
    if (when === 'none') { this.form.due_date = ''; this.form.due_time = ''; this.form.repeat_type = 'none'; }
    if (when !== 'none' && this.form.remind_before === '') { this.form.remind_before = '0'; }
  }

  onDueDateChange(v: string) {
    if (v && this.form.remind_before === '') { this.form.remind_before = '0'; }
    if (!v) { this.form.due_time = ''; this.form.repeat_type = 'none'; }
  }
  todayStr() { return ymd(new Date()); }
  tomorrowStr() { const t = new Date(); return ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)); }

  get categoryChoices(): string[] {
    const set = new Set<string>([...this.categories, ...DEFAULT_CATEGORIES]);
    return Array.from(set);
  }

  /* human text for when the reminder will ring */
  get reminderPreview(): string {
    const f = this.form;
    if (!f.due_date || f.remind_before === '' || f.remind_before === null) { return ''; }
    const p = f.due_date.split('-');
    const [h, m] = (f.due_time || '10:00').split(':').map(Number);
    const at = new Date(+p[0], +p[1] - 1, +p[2], h, m, 0);
    at.setMinutes(at.getMinutes() - Number(f.remind_before || 0));
    const txt = at.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
    const past = at.getTime() < Date.now();
    return (past ? 'Reminder time has passed (' + txt + '), it will pop up right away' : 'You will be reminded on ' + txt) + (f.due_time ? '' : ' (no time set, so 10:00 AM is used)');
  }

  save() {
    if (this.saving) { return; }
    if (!this.form.title.trim()) {
      this.toastr.warning('Please write what you need to do', 'Task is empty');
      if (this.titleInput) { this.titleInput.nativeElement.focus(); }
      return;
    }
    this.saving = true;
    const f = this.form;
    this.api.postData('todo/save', {
      id: f.id,
      title: f.title.trim(),
      description: f.description,
      due_date: f.due_date,
      due_time: f.due_date ? f.due_time : '',
      remind_before: f.due_date ? f.remind_before : '',
      priority: f.priority,
      category: f.category,
      customer_id: f.customer_id,
      repeat_type: f.due_date ? f.repeat_type : 'none'
    }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      this.saving = false;
      if (r && r.success) {
        this.toastr.success(r.message, f.id ? 'Updated' : 'Added');
        this.closeEditor();
        this.load(false);
        this.reminders.refresh();
      } else {
        this.toastr.error((r && r.message) || 'Could not save task', 'Error');
      }
    }, () => { this.saving = false; this.toastr.error('Server Error', 'Error'); });
  }

  /* ---------------- row actions ---------------- */
  toggle(item: any, ev?: Event) {
    if (ev) { ev.stopPropagation(); }
    if (this.busy[item.id]) { return; }
    this.busy[item.id] = true;
    const wasOpen = item.is_completed != 1;
    if (wasOpen) { this.completing[item.id] = true; }
    this.api.postData('todo/toggle', { id: item.id }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      this.busy[item.id] = false;
      if (r && r.success) {
        if (wasOpen) { this.toastr.success(r.message, '✓ Done'); } else { this.toastr.info(r.message, 'Reopened'); }
        setTimeout(() => { this.completing[item.id] = false; this.load(false); }, wasOpen ? 450 : 0);
        this.reminders.refresh();
      } else {
        this.completing[item.id] = false;
        this.toastr.error((r && r.message) || 'Could not update task', 'Error');
      }
    }, () => { this.busy[item.id] = false; this.completing[item.id] = false; this.toastr.error('Server Error', 'Error'); });
  }

  snooze(item: any, minutes: number, ev?: Event) {
    if (ev) { ev.stopPropagation(); }
    this.menuFor = null;
    if (this.busy[item.id]) { return; }
    this.busy[item.id] = true;
    this.api.postData('todo/snooze', { id: item.id, minutes }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      this.busy[item.id] = false;
      if (r && r.success) {
        this.toastr.info(r.message, 'Snoozed');
        this.reminders.forget(item.id);
        this.load(false);
      } else {
        this.toastr.error((r && r.message) || 'Could not snooze', 'Error');
      }
    }, () => { this.busy[item.id] = false; this.toastr.error('Server Error', 'Error'); });
  }

  snoozeTomorrow(item: any, ev?: Event) { this.snooze(item, minutesToTomorrow10(), ev); }

  remove(item: any, ev?: Event) {
    if (ev) { ev.stopPropagation(); }
    this.menuFor = null;
    Swal.fire({
      title: 'Delete this task?',
      text: item.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then(res => {
      if (!res.value) { return; }
      this.busy[item.id] = true;
      this.api.postData('todo/delete', { id: item.id }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
        this.busy[item.id] = false;
        if (r && r.success) {
          this.toastr.success('Task deleted', 'Deleted');
          this.load(false);
          this.reminders.refresh();
        } else {
          this.toastr.error((r && r.message) || 'Could not delete', 'Error');
        }
      }, () => { this.busy[item.id] = false; this.toastr.error('Server Error', 'Error'); });
    });
  }

  toggleMenu(item: any, ev: Event) {
    ev.stopPropagation();
    this.menuFor = this.menuFor === item.id ? null : item.id;
  }

  /* ---------------- helpers for template ---------------- */
  priorityOf(p: any) { return this.priorities.find(x => x.value == p) || this.priorities[1]; }
  repeatLabel(r: string) { const o = this.repeatOptions.find(x => x.value === r); return o ? o.label : ''; }
  reminderLabel(item: any): string {
    if (item.remind_before === null || item.remind_before === undefined || !item.due_date) { return ''; }
    const o = this.reminderOptions.find(x => x.value === String(item.remind_before));
    return o ? o.label : item.remind_before + ' min before';
  }
  countFor(key: string) { return this.counts ? (this.counts[key] || 0) : 0; }

  enableNotifications() {
    this.reminders.requestPermission().then(p => {
      this.notifyPermission = p;
      if (p === 'granted') { this.toastr.success('Reminders will now also pop up as desktop notifications', 'Notifications on'); }
      else if (p === 'denied') { this.toastr.warning('Notifications are blocked in this browser. Allow them from the site settings (lock icon in the address bar).', 'Blocked'); }
    });
  }
}
