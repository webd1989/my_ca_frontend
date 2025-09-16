import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { DatepickerOptions } from 'ng2-datepicker';
import { getYear } from 'date-fns';
import locale from 'date-fns/locale/en-US';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit,OnDestroy {

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
    this.getList();
  }
  cleanForm(){
    $('#name').val('');
    $('#phone').val('');
    $('#email').val('');
    $('#address').val('');   
    $('#city').val('');  
    $('#gst_no').val(''); 
  }
  removeError(id:string){
    $('#'+id).removeClass('error_validation');
  }
  Create(){
    if($.trim($('#name').val()) == ''){
      $('#name').addClass('error_validation');
    }
    $('#addUserBtn').html('Processing...');
    var other_preffered_communication = '';
    if(this.preffered_communication == 'p_others'){
      other_preffered_communication = $('#other_pc').val();
    }
    const data = {
      id:$('#r_id').val(),
      name:$('#name').val(),
      phone:$('#phone').val(),
      email:$('#email').val(),
      address:$('#address').val(),
      city:$('#city').val(),
      gst_no:$('#gst_no').val(),
    };
    if(this.action == 'Add'){
      this.appService.postData('customer/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
      this.appService.postData('customer/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
      page: this.p
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('customer/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
    this.heading = 'Create a Customer';
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
    this.heading = 'Edit Customer';
    this.action = 'Edit';
    const data = {
      token: localStorage.getItem('token'),
      id: id
    };
    this.appService.postData('customer/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.contactData = r.user;
        $('#r_id').val(r.user.id);
        $('#name').val(r.user.name);
        $('#email').val(r.user.email);
        $('#phone').val(r.user.phone);
        $('#address').val(r.user.address);
        $('#city').val(r.user.city);
        $('#gst_no').val(r.user.gst_no);
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
    this.appService.putData('customer/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
