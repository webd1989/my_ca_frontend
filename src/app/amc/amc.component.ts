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
  selector: 'app-amc',
  templateUrl: './amc.component.html',
  styleUrls: ['./amc.component.css']
})
export class AmcComponent implements OnInit,OnDestroy {

  users:any;
  accounts:any;
  p: number = 1;
  total: number = 0;
  heading:any = '';
  action:any = '';
  preffered_communication:any='p_call';
  userData:any;
  contactData:any;
  orignalPcData = '';
  customers:any = [];
  
  dob_date = new Date();
  lease_expiration_date = new Date();
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
    inputClass: 'dob-datepicker', // custom input CSS class to be applied
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
    this.getAllCustomers();
    this.getList();
  }
  cleanForm(){
    $('#title').val('');
    $('#description').val('');
    $('#customer_id').val('');
  }
  getAllCustomers(){
    const data = {
        token: localStorage.getItem('token')
      };
      this.appService.postData('customer/list/all',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          this.customers = r.users;
        }else{
          this.toastr.error(r.message,"Error");
        }
        
      },error=>{
        this.toastr.error("Server Error","Error");
      });
  }
  Create(){
    $('#addUserBtn').html('Processing...');
    const data = {
      id:$('#r_id').val(),
      title:$('#title').val(),
      description:$('#description').val(),
      customer_id:$('#customer_id').val(),
    };
    if(this.action == 'Add'){
      this.appService.postData('amc/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
      this.appService.postData('amc/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
      customer_name: $("#customer_name").val(),
      status: $("#status").val(),
      page: this.p
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('amc/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.users = r.users.data;
      this.total = r.users.total;
    },error=>{
      //this.toastr.error("Server Error","Error");
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
    this.heading = 'Create AMC';
    this.cleanForm();
  }
 
  GetProfile(){
    this.appService.getData('profile/get').pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.userData = r.user_date;
      }else{
        
      }
    },error =>{
      
    });
  }
  getUser(id:number){
    this.heading = 'Edit AMC';
    this.action = 'Edit';
    const data = {
      token: localStorage.getItem('token'),
      id: id
    };
    this.appService.postData('amc/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.contactData = r.user;
        $('#r_id').val(r.user.id);
        $('#title').val(r.user.title);
        $('#description').val(r.user.description);
        $('#customer_id').val(r.user.customer_id);
      }else{
        
      }
    },error =>{
     
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
    this.appService.putData('amc/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getList();
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  searchData(){
    const data = {
      token: localStorage.getItem('token'),
      customer_name: $("#customer_name").val(),
      status: $("#status").val(),
      page: this.p
    };
    this.getListFromServer(data);
  }
  reset(){
    $("#customer_name").val('');
    $("#status").val('');
    const data = {
      token: localStorage.getItem('token'),
      customer_name: '',
      status: '',
      page: this.p
    };
    this.getListFromServer(data);
  }
  search(){

  }

}

