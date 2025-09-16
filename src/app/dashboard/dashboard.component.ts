import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit,OnDestroy {

  destroy$ = new Subject();

  loginUsername:any = '';
  userData:any;
  p: number = 1;
  total: number = 0;
  tasks:any;
  super_admins:any;
  selected_user: number = 0;
  login_user_type = localStorage.getItem('user_type');
  taskFilterType:any = 'Today';

  reportFilterType:any = 'Today';
  total_task_added: number = 0;
  total_task_completed: number = 0;
  total_calls_made: number = 0;
  total_email_sent: number = 0;
  total_text_sent: number = 0;
  new_account_added: number = 0;
  new_contact_added: number = 0;

  constructor(
    private appService: ServiceService,
    private router: Router,
    ) { }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  ngOnInit(): void {
    if(localStorage.getItem('token')){
      this.loginUsername = localStorage.getItem('user_name');
    }else{
      this.router.navigateByUrl('/');
    }
    this.GetProfile();
    this.getTasks();
    this.getAllUrsers();
    this.getDashboardOverview();
  }
  pageChangeEvent(event: number){
    this.p = event;
    this.getTasks();
  }
  getTasks(){
    const data = {
      token: localStorage.getItem('token'),
      company_id: 0,
      page: this.p,
      filter_by:this.taskFilterType
    };
    this.appService.postData('task/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.tasks = r.tasks.data;
      this.total = r.tasks.total;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  getAllUrsers(){
    const data = {company_id:0};
    this.appService.postData('all/user/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.super_admins = r.users;
      }
    },error =>{
    });
  }
  loadTasks(type:string,id:string){
    $('.report_t_btns').removeClass('active_report');
    $('#'+id).addClass('active_report');
    this.taskFilterType = type;
    this.p = 1;
    this.getTasks();
}
  loadReportFilter(){
    this.selected_user = $('#user_filter').val();
    this.getDashboardOverview();
  }
  loadReport(type:string,id:string){
      $('.report_f_btns').removeClass('active_report');
      $('#'+id).addClass('active_report');
      this.reportFilterType = type;
      this.getDashboardOverview();
  }
  getDashboardOverview(){
    const data = {
      token: localStorage.getItem('token'),
      type:this.reportFilterType,
      user_id:this.selected_user
    };
    this.appService.postData('dashboard/report/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.total_task_added = r.total_task_added;
      this.total_task_completed = r.total_task_completed;
      this.total_calls_made = r.total_calls_made;
      this.total_email_sent = r.total_email_sent;
      this.total_text_sent = r.total_text_sent;
      this.new_account_added = r.new_account_added;
      this.new_contact_added = r.new_contact_added;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  GetProfile(){
    this.appService.getData('profile/get').pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.userData = r.user_date;
      }else{
        
      }
    },error =>{
      Swal.fire(
        'Error',
        'Internal server error',
        'error'
      )
    });
  }

}
