import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ReminderService } from '../services/reminder.service';
import { dueLabel, isOverdue } from '../todos/todo-utils';

/* page titles shown in the topbar (route -> [section, title]) */
const PAGE_TITLES: {[key: string]: [string, string]} = {
  '/dashboard': ['Overview', 'Dashboard'],
  '/todos': ['Overview', 'To-Do & Reminders'],
  '/invoices': ['Billing', 'Invoices'],
  '/quotations': ['Billing', 'Quotations'],
  '/projects': ['Work', 'Projects'],
  '/amc': ['Work', 'Annual Maintenance (AMC)'],
  '/contacts': ['People', 'Clients'],
  '/users': ['People', 'Team'],
  '/profile': ['Account', 'My Profile'],
  '/change-password': ['Account', 'Change Password'],
  '/company-settings': ['Account', 'Company Settings'],
  '/company-notifications': ['Account', 'Notifications'],
  '/company-authentication': ['Account', 'Two-Factor Authentication'],
};

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit,OnDestroy {

  userType:any;
  heading:any = '';
  userData:any;
  super_admins:any;
  equipmentTypes:any;
  modes:any;
  pain_paints:any;
  contracted:any;
  pick_drops:any;
  special_requirements:any;
  selectedCompanyID:any;
  destroy$ = new Subject();
  preffered_communication:any='p_call';
  login_user_type = localStorage.getItem('user_type');

  /* Aurora theme UI state */
  collapsed = false;
  isDark = false;
  pageTitle = 'Dashboard';
  pageSection = 'Overview';
  today = '';
  displayName = localStorage.getItem('user_name') || 'User';
  userEmail = localStorage.getItem('user_email') || '';
  initial = (this.displayName || 'U').trim().charAt(0).toUpperCase();
  avatarUrl = '';
  private loginTimer: any;

  /* To-Do reminders (badge + bell) */
  todoCounts: any = { overdue: 0, today: 0 };
  todoBadge = 0;
  todoUpNext: any[] = [];
  todoDue = dueLabel;
  isTodoOverdue = isOverdue;

  constructor(
    private appService: ServiceService,
    private router: Router,
    private toastr: ToastrService,
    private reminders: ReminderService
    ) { }

  ngOnDestroy(): void {
    clearInterval(this.loginTimer);
    this.destroy$.next(true);
    document.body.classList.remove('sb-open');
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.userType = localStorage.getItem('user_type');
    this.initThemeUi();
    this.reminders.counts$.pipe(takeUntil(this.destroy$)).subscribe(c => {
      this.todoCounts = c || { overdue: 0, today: 0 };
      // badge = open tasks that are overdue or due today
      this.todoBadge = Number(this.todoCounts.attention) || 0;
    });
    this.reminders.upNext$.pipe(takeUntil(this.destroy$)).subscribe(l => this.todoUpNext = l || []);
    this.reminders.start();
    this.loginTimer = setInterval(() => {
      this.checkLoginTime(); 
      }, 20000);
      this.saveLoginTime();
    this.GetProfile();
  }
  /* ---------- Aurora theme helpers ---------- */
  initThemeUi(){
    const path = (this.router.url || '').split('?')[0];
    const t = PAGE_TITLES[path];
    if(t){ this.pageSection = t[0]; this.pageTitle = t[1]; }
    this.today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    this.isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    this.collapsed = localStorage.getItem('erp-sb-collapsed') === '1';
    document.body.classList.toggle('sb-collapsed', this.collapsed);
    document.body.classList.remove('sb-open');
  }
  toggleTheme(){
    this.isDark = !this.isDark;
    const theme = this.isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('erp-theme', theme);
  }
  toggleCollapse(){
    this.collapsed = !this.collapsed;
    localStorage.setItem('erp-sb-collapsed', this.collapsed ? '1' : '0');
    document.body.classList.toggle('sb-collapsed', this.collapsed);
  }
  toggleMobile(){
    document.body.classList.toggle('sb-open');
  }
  closeMobile(){
    document.body.classList.remove('sb-open');
  }
  logout(){
    this.reminders.stop();
    document.body.classList.remove('sb-open');
    localStorage.removeItem("token");
    this.router.navigateByUrl('');
  }
  checkLoginTime(){
    const data = {};
    this.appService.postData('check/login/time',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        localStorage.removeItem("token");
        this.router.navigateByUrl('');
      }
    },error =>{
    });
  }
  saveLoginTime(){
    const data = {};
    this.appService.postData('save/last/login/time',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
    },error =>{
    });
  }
  getAllUrsers(){
    const data = {company_id:0};
    this.appService.postData('all/user/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.super_admins = r.users;
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  choosePrefferedCommunication(id:string){
    $('.preffered').removeClass('active_btn');
    $('#'+id).addClass('active_btn');
    this.preffered_communication = id;
  }
  removeError(id:string){
    $('#'+id).removeClass('error_validation');
  }
  CreateAccount(){
    if($.trim($('#name2').val()) == ''){
      $('#name2').addClass('error_validation');
    }
    if($.trim($('#website2').val()) == ''){
      $('#website2').addClass('error_validation');
    }
    if(this.login_user_type == 'Admin' && $.trim($('#user_id2').val()) == ''){
      $('#user_id2').addClass('error_validation');
      this.toastr.error('Please select user', 'Error');
    }
    var userID = this.login_user_type == 'Admin' ? $('#user_id2').val() : 0;
    $('#addAccountBtn').html('Processing...');
    const data = {
      name:$('#name2').val(),
      user_id:userID,
      phone:$('#phone2').val(),
      email:$('#email2').val(),
      phone_ext:$('#phone_ext2').val(),
      address:'',
      city:$('#city2').val(),
      state:$('#state2').val(),
      zipcode:$('#zipcode2').val(),
      country:$('#country2').val(),
      preffered_communication:this.preffered_communication,
      website:$('#website2').val(),
      linkedin:$('#linkedin2').val(),
      description:$('#description2').val(),
      annual_revenue:$('#annual_revenue2').val(),
      shipment:$('#shipment2').val(),
      source:$('#source2').val(),
      industry:$('#industry2').val(),
      equipment_types:this.equipmentTypes,
      modes:this.modes,
      pain_paints:this.pain_paints,
      contracted:this.contracted,
      pick_drops:this.pick_drops,
      special_requirements:this.special_requirements
    };

      this.appService.postData('company/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#addAccountBtn').html('Save');
        if(r.success){
          this.cleanForm();
          this.toastr.success(r.message, 'Success');
          $('#closeBtn22').trigger('click');
          this.router.navigateByUrl('/companies');
        }else{
          this.toastr.error(r.message, 'Error');
        }
      },error =>{
      });
  }
  cleanForm(){
    $('#name2').val('');
    $('#phone2').val('');
    $('#email2').val('');
    $('#phone_ext2').val('');  
    //$('#address2').val('');  
    $('#city2').val('');  
    $('#state2').val('');  
    $('#country2').val('');  
    $('#zipcode2').val('');  
    $('#website2').val('');  
    $('#linkedin2').val('');  
    $('#description2').val('');  
    $('#annual_revenue2').val('');  
    $('#shipment2').val('');  
    this.preffered_communication='p_call';
  }
  GetProfile(){
    this.appService.getData('profile/get').pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.userData = r.user_date;
        if(r.user_date.name){
          this.displayName = r.user_date.name;
          this.initial = String(r.user_date.name).trim().charAt(0).toUpperCase() || 'U';
        }
        if(r.user_date.email){ this.userEmail = r.user_date.email; }
        this.avatarUrl = r.user_date.photo ? environment.documentUrl + 'storage/profile/' + r.user_date.photo : '';
        if(r.user_date.status == 2){
          localStorage.removeItem("token");
          this.router.navigateByUrl('');
        }
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
