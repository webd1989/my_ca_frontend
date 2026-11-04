import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from '../services/service.service';
import { ReminderService } from '../services/reminder.service';

type Item = 'domain' | 'hosting' | 'ssl';

@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.css']
})
export class WebsitesComponent implements OnInit, OnDestroy {

  destroy$ = new Subject();

  items: any[] = [];
  rows: any[] = [];
  summary: any = { total: 0, expired: 0, due7: 0, due30: 0, amount30: 0, items_expired: 0, items_due30: 0 };
  registrars: string[] = [];
  hostingProviders: string[] = [];
  customers: any[] = [];
  loading = false;
  firstLoad = true;

  /* filters */
  search = '';
  customerFilter = '';
  windowFilter = '';
  itemFilter = '';
  statusFilter = '1';
  private searchTimer: any;
  private reqSeq = 0;

  /* sorting: nearest expiry first by default; click a column header to flip */
  sortKey: 'next' | Item | 'website' = 'next';
  sortDir: 'asc' | 'desc' = 'asc';

  /* editor */
  editorOpen = false;
  saving = false;
  detecting = false;
  detectMsg = '';
  form: any = this.blank();
  history: any[] = [];

  /* renew */
  renewOpen = false;
  renewing = false;
  renew: any = { site: null, item: 'domain', mode: 'years', years: 1, new_expiry: '', amount: '', notes: '' };

  nudging = false;
  busy: { [id: number]: boolean } = {};
  checking: { [id: number]: boolean } = {};

  readonly itemLabels: any = { domain: 'Domain', hosting: 'Hosting', ssl: 'SSL' };
  readonly sslTypes = ['Free (auto-renew)', 'Paid SSL', 'Hosting AutoSSL', 'Cloudflare'];

  constructor(
    private api: ServiceService,
    private reminders: ReminderService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (!localStorage.getItem('token')) { this.router.navigateByUrl('/'); return; }
    this.load();
    this.loadCustomers();
    // pop-up "Renew" button while already on this page only changes the query string
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(() => { if (!this.firstLoad) { this.openFromQuery(); } });
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
    document.body.style.overflow = '';
    this.destroy$.complete();
  }

  /* ---------------- data ---------------- */
  load(showLoader = true) {
    const seq = ++this.reqSeq;
    if (showLoader) { this.loading = true; }
    const data: any = { status: this.statusFilter };
    if (this.search.trim()) { data.search = this.search.trim(); }
    if (this.customerFilter) { data.customer_id = this.customerFilter; }
    if (this.windowFilter) { data.window = this.windowFilter; }
    if (this.itemFilter) { data.item = this.itemFilter; }
    this.api.postData('website/list', data).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      if (seq !== this.reqSeq) { return; }
      this.loading = false;
      this.firstLoad = false;
      if (!r || !r.success) { this.toastr.error((r && r.message) || 'Could not load websites', 'Error'); return; }
      this.items = r.items || [];
      this.summary = r.summary || this.summary;
      this.registrars = (r.providers && r.providers.registrars) || [];
      this.hostingProviders = (r.providers && r.providers.hosting) || [];
      this.applySort();
      this.openFromQuery();
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

  /* opened from a renewal pop-up: /websites?renew=ID&item=domain */
  private openFromQuery() {
    const q = this.route.snapshot.queryParamMap;
    const id = Number(q.get('renew'));
    if (!id) { return; }
    const site = this.items.find(s => s.id == id);
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    if (site) { this.openRenew(site, (q.get('item') as Item) || 'domain'); }
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 350);
  }

  setWindow(w: string) {
    this.windowFilter = this.windowFilter === w ? '' : w;
    this.load();
  }

  clearFilters() {
    this.search = ''; this.customerFilter = ''; this.windowFilter = ''; this.itemFilter = ''; this.statusFilter = '1';
    this.load();
  }

  get hasFilters(): boolean {
    return !!(this.search.trim() || this.customerFilter || this.windowFilter || this.itemFilter || this.statusFilter !== '1');
  }

  /* ---------------- sorting ---------------- */
  sortBy(key: 'next' | Item | 'website') {
    if (this.sortKey === key) { this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'; }
    else { this.sortKey = key; this.sortDir = 'asc'; }
    this.applySort();
  }

  private applySort() {
    const key = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const val = (s: any) => key === 'website' ? (s.website || '') : (key === 'next' ? this.nextExpiry(s) : s[key + '_expiry']);
    this.rows = [...this.items].sort((a, b) => {
      const va = val(a), vb = val(b);
      if (!va && !vb) { return 0; }
      if (!va) { return 1; }           // rows without a date always stay at the bottom
      if (!vb) { return -1; }
      return va < vb ? -dir : (va > vb ? dir : 0);
    });
  }

  sortIcon(key: string) {
    if (this.sortKey !== key) { return 'fa-sort'; }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  private nextExpiry(s: any): string {
    const list = (this.itemFilter ? [this.itemFilter] : ['domain', 'hosting', 'ssl']).map(i => s[i + '_expiry']).filter(Boolean).sort();
    return list[0] || '';
  }

  /* ---------------- expiry helpers ---------------- */
  daysLeft(date: string | null): number | null {
    if (!date) { return null; }
    const p = date.split('-');
    const d = new Date(+p[0], +p[1] - 1, +p[2]);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - t.getTime()) / 86400000);
  }

  state(date: string | null): string {
    const d = this.daysLeft(date);
    if (d === null) { return 'none'; }
    if (d < 0) { return 'expired'; }
    if (d <= 7) { return 'urgent'; }
    if (d <= 30) { return 'soon'; }
    if (d <= 60) { return 'watch'; }
    return 'ok';
  }

  leftText(date: string | null): string {
    const d = this.daysLeft(date);
    if (d === null) { return ''; }
    if (d < 0) { const n = Math.abs(d); return 'Expired ' + (n === 1 ? '1 day' : n + ' days') + ' ago'; }
    if (d === 0) { return 'Expires today'; }
    if (d === 1) { return 'Tomorrow'; }
    if (d <= 60) { return d + ' days left'; }
    const m = Math.round(d / 30);
    if (m < 12) { return m + ' months left'; }
    const y = Math.floor(d / 365);
    const rm = Math.round((d % 365) / 30);
    return y + (y === 1 ? ' year' : ' years') + (rm > 0 && rm < 12 ? ' ' + rm + 'm' : '') + ' left';
  }

  fmtDate(date: string | null): string {
    if (!date) { return ''; }
    const p = date.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  money(n: any): string {
    const v = Number(n) || 0;
    return v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  siteUrl(s: any) { return 'https://' + s.website; }

  /* ---------------- add / edit ---------------- */
  blank() {
    return {
      id: 0, customer_id: '', website: '', panel_url: '',
      registrar: '', domain_expiry: '', domain_amount: '',
      hosting_provider: '', hosting_plan: '', hosting_expiry: '', hosting_amount: '',
      ssl_type: '', ssl_issuer: '', ssl_expiry: '', ssl_auto_renew: false, ssl_amount: '',
      notify_days: '30', notes: '', status: '1'
    };
  }

  openEditor(site?: any) {
    this.detectMsg = '';
    this.history = [];
    this.form = site ? {
      id: site.id,
      customer_id: site.customer_id ? String(site.customer_id) : '',
      website: site.website || '',
      panel_url: site.panel_url || '',
      registrar: site.registrar || '',
      domain_expiry: site.domain_expiry || '',
      domain_amount: site.domain_amount !== null && site.domain_amount !== undefined ? String(Number(site.domain_amount)) : '',
      hosting_provider: site.hosting_provider || '',
      hosting_plan: site.hosting_plan || '',
      hosting_expiry: site.hosting_expiry || '',
      hosting_amount: site.hosting_amount !== null && site.hosting_amount !== undefined ? String(Number(site.hosting_amount)) : '',
      ssl_type: site.ssl_type || '',
      ssl_issuer: site.ssl_issuer || '',
      ssl_expiry: site.ssl_expiry || '',
      ssl_auto_renew: site.ssl_auto_renew == 1,
      ssl_amount: site.ssl_amount !== null && site.ssl_amount !== undefined ? String(Number(site.ssl_amount)) : '',
      notify_days: String(site.notify_days || 30),
      notes: site.notes || '',
      status: String(site.status || 1)
    } : this.blank();
    this.editorOpen = true;
    document.body.style.overflow = 'hidden';
    if (site) { this.loadHistory(site.id); }
  }

  closeEditor() {
    this.editorOpen = false;
    document.body.style.overflow = '';
  }

  loadHistory(id: number) {
    this.api.postData('website/history', { id }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      if (r && r.success) { this.history = r.items || []; }
    }, () => { });
  }

  save() {
    if (this.saving) { return; }
    if (!this.form.website.trim()) { this.toastr.warning('Please enter the website / domain name', 'Website missing'); return; }
    this.saving = true;
    const f = Object.assign({}, this.form, { ssl_auto_renew: this.form.ssl_auto_renew ? 1 : 0 });
    this.api.postData('website/save', f).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      this.saving = false;
      if (r && r.success) {
        this.toastr.success(r.message, this.form.id ? 'Updated' : 'Added');
        this.closeEditor();
        this.load(false);
        this.reminders.refreshRenewals();
      } else {
        this.toastr.error((r && r.message) || 'Could not save', 'Error');
      }
    }, () => { this.saving = false; this.toastr.error('Server Error', 'Error'); });
  }

  /* fill domain + SSL expiry from the internet */
  detect() {
    if (this.detecting) { return; }
    if (!this.form.website.trim()) { this.toastr.warning('Enter the website first', 'Website missing'); return; }
    this.detecting = true;
    this.detectMsg = '';
    this.api.postData('website/detect', { website: this.form.website }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      this.detecting = false;
      if (!r) { this.detectMsg = 'Could not check right now.'; return; }
      const found: string[] = [];
      if (r.website) { this.form.website = r.website; }
      if (r.ssl && r.ssl.expiry) {
        this.form.ssl_expiry = r.ssl.expiry;
        this.form.ssl_issuer = r.ssl.issuer || this.form.ssl_issuer;
        if (!this.form.ssl_type) { this.form.ssl_type = r.ssl.type === 'Free (auto-renew)' ? 'Free (auto-renew)' : 'Paid SSL'; }
        if (r.ssl.type === 'Free (auto-renew)') { this.form.ssl_auto_renew = true; }
        found.push('SSL ' + this.fmtDate(r.ssl.expiry) + (r.ssl.issuer ? ' (' + r.ssl.issuer + ')' : ''));
      }
      if (r.domain && r.domain.expiry) {
        this.form.domain_expiry = r.domain.expiry;
        if (!this.form.registrar && r.domain.registrar) { this.form.registrar = r.domain.registrar; }
        found.push('Domain ' + this.fmtDate(r.domain.expiry) + (r.domain.registrar ? ' (' + r.domain.registrar + ')' : ''));
      }
      this.detectMsg = found.length
        ? 'Found: ' + found.join(' · ') + (r.domain ? '' : '. Domain date not available for this extension, please enter it manually.') + ' Hosting date has to be entered manually.'
        : (r.message || 'Nothing found. Please enter the dates manually.');
    }, () => { this.detecting = false; this.detectMsg = 'Server error while checking.'; });
  }

  /* quick "check now" from the table: updates SSL / domain dates directly */
  checkNow(site: any) {
    if (this.checking[site.id]) { return; }
    this.checking[site.id] = true;
    this.api.postData('website/detect', { id: site.id, website: site.website, apply: 1 }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
      this.checking[site.id] = false;
      if (r && r.success) {
        const bits: string[] = [];
        if (r.ssl && r.ssl.expiry) { bits.push('SSL ' + this.fmtDate(r.ssl.expiry)); }
        if (r.domain && r.domain.expiry) { bits.push('Domain ' + this.fmtDate(r.domain.expiry)); }
        this.toastr.success(bits.join(' · ') || 'Checked', site.website);
        this.load(false);
        this.reminders.refreshRenewals();
      } else {
        this.toastr.warning((r && r.message) || 'Could not read details', site.website);
      }
    }, () => { this.checking[site.id] = false; this.toastr.error('Server Error', 'Error'); });
  }

  remove(site: any) {
    Swal.fire({
      title: 'Remove this website?',
      text: site.website + ' will be removed from the list and alerts will stop.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then(res => {
      if (!res.value) { return; }
      this.busy[site.id] = true;
      this.api.postData('website/delete', { id: site.id }).pipe(takeUntil(this.destroy$)).subscribe((r: any) => {
        this.busy[site.id] = false;
        if (r && r.success) {
          this.toastr.success('Website removed', 'Removed');
          this.load(false);
          this.reminders.refreshRenewals();
        } else { this.toastr.error((r && r.message) || 'Could not remove', 'Error'); }
      }, () => { this.busy[site.id] = false; this.toastr.error('Server Error', 'Error'); });
    });
  }

  /* ---------------- renew ---------------- */
  openRenew(site: any, item: Item = 'domain') {
    this.renew = {
      site, item, mode: 'years', years: 1, new_expiry: '',
      amount: site[item + '_amount'] !== null && site[item + '_amount'] !== undefined ? String(Number(site[item + '_amount'])) : '',
      notes: ''
    };
    this.renewOpen = true;
    document.body.style.overflow = 'hidden';
  }

  setRenewItem(item: Item) {
    this.renew.item = item;
    const a = this.renew.site[item + '_amount'];
    this.renew.amount = a !== null && a !== undefined ? String(Number(a)) : '';
  }

  closeRenew() {
    this.renewOpen = false;
    document.body.style.overflow = '';
  }

  get currentRenewExpiry(): string { return this.renew.site ? (this.renew.site[this.renew.item + '_expiry'] || '') : ''; }

  /* preview of the new expiry date for "+N years" */
  get renewPreview(): string {
    const r = this.renew;
    if (!r.site) { return ''; }
    if (r.mode === 'date') { return r.new_expiry ? this.fmtDate(r.new_expiry) : ''; }
    const old = r.site[r.item + '_expiry'];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let base = today;
    if (old) {
      const p = old.split('-');
      const d = new Date(+p[0], +p[1] - 1, +p[2]);
      if (d >= today) { base = d; }
    }
    const n = new Date(base.getFullYear() + Number(r.years), base.getMonth(), 1);
    const last = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
    n.setDate(Math.min(base.getDate(), last));
    return n.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  doRenew() {
    if (this.renewing) { return; }
    const r = this.renew;
    if (r.mode === 'date' && !r.new_expiry) { this.toastr.warning('Please pick the new expiry date', 'Date missing'); return; }
    this.renewing = true;
    this.api.postData('website/renew', {
      id: r.site.id, item: r.item,
      years: r.mode === 'years' ? r.years : '',
      new_expiry: r.mode === 'date' ? r.new_expiry : '',
      amount: r.amount, notes: r.notes
    }).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.renewing = false;
      if (res && res.success) {
        this.toastr.success(res.message, 'Renewed');
        this.closeRenew();
        this.load(false);
        this.reminders.refreshRenewals();
      } else { this.toastr.error((res && res.message) || 'Could not renew', 'Error'); }
    }, () => { this.renewing = false; this.toastr.error('Server Error', 'Error'); });
  }

  /* pop-ups close only with the cross / Cancel button: outside click just "bumps" them */
  nudge() {
    this.nudging = false;
    setTimeout(() => { this.nudging = true; setTimeout(() => this.nudging = false, 300); }, 10);
  }

  /* ---------------- export ---------------- */
  exportCsv() {
    if (!this.rows.length) { this.toastr.warning('Nothing to export', 'Empty list'); return; }
    const esc = (v: any) => { const s = v === null || v === undefined ? '' : String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const head = ['Website', 'Client', 'Registrar', 'Domain Expiry', 'Domain Amount', 'Hosting Provider', 'Hosting Plan', 'Hosting Expiry', 'Hosting Amount', 'SSL Type', 'SSL Issuer', 'SSL Expiry', 'SSL Auto-renew', 'SSL Amount', 'Status', 'Notes'];
    const lines = [head.join(',')];
    this.rows.forEach(s => lines.push([
      s.website, s.customer_name, s.registrar, this.fmtDate(s.domain_expiry), s.domain_amount, s.hosting_provider, s.hosting_plan,
      this.fmtDate(s.hosting_expiry), s.hosting_amount, s.ssl_type, s.ssl_issuer, this.fmtDate(s.ssl_expiry), s.ssl_auto_renew == 1 ? 'Yes' : 'No',
      s.ssl_amount, s.status == 2 ? 'Inactive' : 'Active', s.notes
    ].map(esc).join(',')));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const t = new Date();
    a.href = url;
    a.download = 'client-websites-' + t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0') + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  trackById(_: number, s: any) { return s.id; }
}
