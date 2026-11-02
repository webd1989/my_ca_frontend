import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ServiceService } from './service.service';

/*
 * Checks for due To-Do reminders every minute (while the ERP is open in a browser tab)
 * and shows them as pop-ups + desktop notification + a short chime.
 * One instance for the whole app (providedIn: 'root'), started by the header.
 */
@Injectable({ providedIn: 'root' })
export class ReminderService {

  counts$ = new BehaviorSubject<any>({ pending: 0, today: 0, overdue: 0, upcoming: 0, nodate: 0, completed: 0, all: 0 });
  upNext$ = new BehaviorSubject<any[]>([]);
  popups$ = new BehaviorSubject<any[]>([]);

  private timer: any = null;
  private shown = new Set<number>();
  private visibilityBound = false;
  private audioCtx: any = null;

  constructor(private api: ServiceService, private zone: NgZone) { }

  start() {
    if (this.timer) { return; }
    this.check();
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => this.zone.run(() => this.check()), 60000);
    });
    if (!this.visibilityBound) {
      this.visibilityBound = true;
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.timer) { this.zone.run(() => this.check()); }
      });
    }
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    this.shown.clear();
    this.popups$.next([]);
  }

  /* refresh badge counts / up-next list (call after adding or completing tasks) */
  refresh() { this.check(); }

  check() {
    if (!localStorage.getItem('token')) { this.stop(); return; }
    this.api.postData('todo/reminders', {}).subscribe((r: any) => {
      if (!r || !r.success) { return; }
      this.counts$.next(r.counts || this.counts$.value);
      this.upNext$.next(r.up_next || []);
      const fresh = (r.due || []).filter((d: any) => !this.shown.has(d.id));
      if (fresh.length) {
        fresh.forEach((d: any) => this.shown.add(d.id));
        this.popups$.next([...this.popups$.value, ...fresh]);
        this.notify(fresh);
        this.chime();
        this.api.postData('todo/reminded', { ids: fresh.map((d: any) => d.id) }).subscribe(() => { }, () => { });
      }
    }, () => { /* offline / server error: try again next minute */ });
  }

  dismiss(id: number) {
    this.popups$.next(this.popups$.value.filter(p => p.id !== id));
  }

  /* after snooze the same task may pop up again later */
  forget(id: number) {
    this.shown.delete(id);
    this.dismiss(id);
  }

  /* ---------- desktop notifications ---------- */
  get notifySupported(): boolean { return typeof window !== 'undefined' && 'Notification' in window; }
  get notifyPermission(): string { return this.notifySupported ? (window as any).Notification.permission : 'unsupported'; }

  requestPermission(): Promise<string> {
    if (!this.notifySupported) { return Promise.resolve('unsupported'); }
    try {
      const p = (window as any).Notification.requestPermission();
      return p && p.then ? p : Promise.resolve((window as any).Notification.permission);
    } catch (e) {
      return Promise.resolve((window as any).Notification.permission);
    }
  }

  private notify(items: any[]) {
    if (this.notifyPermission !== 'granted') { return; }
    items.slice(0, 3).forEach(item => {
      try {
        const body = [item.description ? String(item.description).slice(0, 120) : '', item.customer_name ? 'Client: ' + item.customer_name : '']
          .filter(Boolean).join('\n') || 'Tap to open your To-Do list';
        const n = new (window as any).Notification('⏰ ' + item.title, {
          body, tag: 'todo-' + item.id, icon: 'assets/images/favicon.png', requireInteraction: true
        });
        n.onclick = () => { window.focus(); window.location.hash = '#/todos'; n.close(); };
      } catch (e) { /* some mobile browsers only allow notifications from a service worker */ }
    });
  }

  /* short two-tone chime (no audio file needed) */
  private chime() {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) { return; }
      this.audioCtx = this.audioCtx || new Ctx();
      const ctx = this.audioCtx;
      [[880, 0], [1320, 0.18]].forEach(([freq, at]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
        g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + at + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.35);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + at);
        o.stop(ctx.currentTime + at + 0.4);
      });
    } catch (e) { /* browser blocked audio until the user interacts with the page */ }
  }
}
