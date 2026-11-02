import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from '../services/service.service';
import { ReminderService } from '../services/reminder.service';
import { dueLabel, isOverdue, minutesToTomorrow10 } from '../todos/todo-utils';

/* Reminder cards that pop up on any page when a To-Do reminder is due */
@Component({
  selector: 'app-reminder-popup',
  templateUrl: './reminder-popup.component.html',
  styleUrls: ['./reminder-popup.component.css']
})
export class ReminderPopupComponent implements OnInit, OnDestroy {

  popups: any[] = [];
  busy: { [id: number]: boolean } = {};
  snoozeOpen: number | null = null;
  private sub?: Subscription;

  dueLabel = dueLabel;
  isOverdue = isOverdue;

  constructor(
    private reminders: ReminderService,
    private api: ServiceService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.sub = this.reminders.popups$.subscribe(p => this.popups = p);
  }
  ngOnDestroy(): void {
    if (this.sub) { this.sub.unsubscribe(); }
  }

  done(item: any) {
    if (this.busy[item.id]) { return; }
    this.busy[item.id] = true;
    this.api.postData('todo/toggle', { id: item.id }).subscribe((r: any) => {
      this.busy[item.id] = false;
      if (r && r.success) {
        this.toastr.success(r.message, 'Done');
        this.reminders.dismiss(item.id);
        this.reminders.refresh();
        window.dispatchEvent(new CustomEvent('erp-todos-changed'));
      } else {
        this.toastr.error((r && r.message) || 'Could not update the task', 'Error');
      }
    }, () => { this.busy[item.id] = false; this.toastr.error('Server Error', 'Error'); });
  }

  snooze(item: any, minutes: number) {
    if (this.busy[item.id]) { return; }
    this.busy[item.id] = true;
    this.snoozeOpen = null;
    this.api.postData('todo/snooze', { id: item.id, minutes }).subscribe((r: any) => {
      this.busy[item.id] = false;
      if (r && r.success) {
        this.toastr.info(r.message, 'Snoozed');
        this.reminders.forget(item.id);
        window.dispatchEvent(new CustomEvent('erp-todos-changed'));
      } else {
        this.toastr.error((r && r.message) || 'Could not snooze', 'Error');
      }
    }, () => { this.busy[item.id] = false; this.toastr.error('Server Error', 'Error'); });
  }

  snoozeTomorrow(item: any) { this.snooze(item, minutesToTomorrow10()); }

  open(item: any) {
    this.reminders.dismiss(item.id);
    this.router.navigateByUrl('/todos');
  }

  close(item: any) { this.reminders.dismiss(item.id); }

  dismissAll() { this.popups.slice().forEach(p => this.reminders.dismiss(p.id)); }
}
