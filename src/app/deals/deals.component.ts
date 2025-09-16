import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { DatepickerOptions } from 'ng2-datepicker';
import { getYear } from 'date-fns';
import locale from 'date-fns/locale/en-US';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.css']
})
export class DealsComponent implements OnInit,OnDestroy {

  users:any;
  accounts:any;
  p: number = 1;
  total: number = 0;
  totalDeal:number=0;
  totalAmt: number = 0;
  heading:any = '';
  action:any = '';
  preffered_communication:any='p_call';
  userData:any;
  deal_close_date = new Date();
  options: DatepickerOptions = {
    minYear: getYear(new Date()) - 30, // minimum available and selectable year
    maxYear: getYear(new Date()) + 30, // maximum available and selectable year
    placeholder: '', // placeholder in case date model is null | undefined, example: 'Please pick a date'
    format: 'M/d/Y', // date format to display in input
    formatTitle: 'LLLL yyyy',
    formatDays: 'EEEEE',
    firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
    locale: locale, // date-fns locale
    position: 'bottom',
    inputClass: 'deal-close-datepicker', // custom input CSS class to be applied
    calendarClass: 'datepicker-default', // custom datepicker calendar CSS class to be applied
    scrollBarColor: '#dfe3e9', // in case you customize you theme, here you define scroll bar color
  };

  destroy$ = new Subject();

  constructor(
    private appService: ServiceService,
    private router: Router,
    private toastr: ToastrService
  ) { }
  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getList();
    this.GetProfile();
    this.getCompanies();
  }
  cleanForm(){
    $('#deal_name').val('');
    $('#revenue').val('');
    $('#cose_date').val('');
    $('#funnel').val('');  
    $('#stage').val('');  
    $('#source').val('');  
    $('#description').val('');
  }
  Create(){
    $('#addUserBtn').html('Processing...');
    const data = {
      id:$('#r_id').val(),
      deal_name:$('#deal_name').val(),
      revenue:$('#revenue').val(),
      cose_date:this.deal_close_date,
      funnel:$('#funnel').val(),
      stage:$('#stage').val(),
      source:$('#source').val(),
      description:$('#description').val(),
      company_id:$('#company_id').val(),
    };
    if(this.action == 'Add'){
      this.appService.postData('deal/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#addUserBtn').html('Save');
        if(r.success){
          this.getList();
          this.cleanForm();
          this.toastr.success(r.message, 'Success');
          $('#closeBtn').trigger('click');
        }else{
          this.toastr.error(r.message, 'Error');
        }
      },error =>{
      });
    }
    if(this.action == 'Edit'){
      this.appService.postData('deal/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#addUserBtn').html('Save');
        if(r.success){
          this.getList();
          this.cleanForm();
          this.toastr.success(r.message, 'Success');
          $('#closeBtn').trigger('click');
        }else{
          this.toastr.error(r.message, 'Error');
        }
      },error =>{
      });
    }
    
  }
  
  getList(){
    const data = {
      token: localStorage.getItem('token'),
      page: this.p,
      f_funnel: $('#f_funnel').val(),
      f_stage: $('#f_stage').val(),
      f_source: $('#f_source').val(),
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('deal/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.users = r.users.data;
      this.total = r.users.total;
      this.totalDeal = r.count;
      this.totalAmt = r.total_amt;
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }

  getCompanies(){
    const data = {
      token: localStorage.getItem('token')
    };
    this.appService.postData('company/list/simply',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.accounts = r.users;
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  /**
   * Write code on Method
   *
   * @return response()
   */
   pageChangeEvent(event: number){
    this.p = event;
    this.getList();
  }
  setHeading(){
    this.action = 'Add';
    this.heading = 'Create an Deal';
    $('.deal-close-datepicker').val('MM/DD/YY');
    this.cleanForm();
  }
  choosePrefferedCommunication(id:string){
    $('.preffered').removeClass('active_btn');
    $('#'+id).addClass('active_btn');
    this.preffered_communication = id;
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
  getUser(id:number){
    this.heading = 'Edit Deal';
    this.action = 'Edit';
    const data = {
      token: localStorage.getItem('token'),
      id: id
    };
    this.appService.postData('deal/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        $('#r_id').val(r.user.id);
        $('#deal_name').val(r.user.deal_name);
        $('#revenue').val(r.user.revenue);
        $('.deal-close-datepicker').val(r.user.cose_date);
        $('#funnel').val(r.user.funnel);
        $('#stage').val(r.user.stage);
        $('#source').val(r.user.source);
        $('#description').val(r.user.description);
        $('#company_id').val(r.user.company_id);
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
  Delete(userID:string){
    Swal.fire({
      title: 'Are you sure?',
      text: 'This process is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
      }).then((result) => {
      if (result.value) {
        this.updateStatus(userID,'3');
        Swal.fire(
          'Removed!',
          'Record removed successfully.',
          'success'
        )
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          'Record still in our database.',
          'error'
        )
      }
      })
  }
  updateStatus(userID:string,status:string){
    const data = {};
    this.appService.putData('deal/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getList();
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  searchData(){
    const data = {
      token: localStorage.getItem('token'),
      search_key: $("#search_key").val(),
      page: this.p
    };
    this.getListFromServer(data);
  }
  reset(){
    const data = {
      token: localStorage.getItem('token'),
      name: '',
      email: '',
      phone: '',
      zipcode: '',
      page: this.p
    };
    this.getListFromServer(data);
  }
  search(){

  }

}

