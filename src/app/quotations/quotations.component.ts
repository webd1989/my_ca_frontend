import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { DatepickerOptions } from 'ng2-datepicker';
import { getYear } from 'date-fns';
import locale from 'date-fns/locale/en-US';

@Component({
  selector: 'app-quotations',
  templateUrl: './quotations.component.html',
  styleUrls: ['./quotations.component.css']
})
export class QuotationsComponent implements OnInit,OnDestroy {

  users:any;
  p: number = 1;
  total: number = 0;
  heading:any = '';
  action:any = '';
  selectedRow:any = [];
  customers:any = [];
  quantities:any = [];
  quotationData:any;
  public SiteUrl = environment.documentUrl;

  destroy$ = new Subject();

  bill_date:any;
  options: DatepickerOptions = {
    minYear: getYear(new Date()) - 30, // minimum available and selectable year
    maxYear: getYear(new Date()) + 30, // maximum available and selectable year
    placeholder: '', // placeholder in case date model is null | undefined, example: 'Please pick a date'
    format: 'Y-M-dd', // date format to display in input
    formatTitle: 'LLLL yyyy',
    formatDays: 'EEEEE',
    firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
    locale: locale, // date-fns locale
    position: 'bottom',
    inputClass: 'deal-close-datepicker', // custom input CSS class to be applied
    calendarClass: 'datepicker-default', // custom datepicker calendar CSS class to be applied
    scrollBarColor: '#dfe3e9', // in case you customize you theme, here you define scroll bar color
  };

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
 
  setHeading(){
    this.action = 'Add';
    this.heading = 'Create Quotation';
    this.cleanForm();
  }
  cleanForm(){
    $('#r_id').val('');
    $('#description').val('');
    $('#title').val('');
  }
  Create(){
      $('#addUserBtn').html('Processing...');
      const data = {
        id:$('#r_id').val(),
        description:$('#description').val(),
        title:$('#title').val()
      };
      if(this.action == 'Add'){
        this.appService.postData('quotation/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
        this.appService.postData('quotation/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
 


  generateQuotationPDF(invoice_id:number){
    const data = {
        token: localStorage.getItem('token'),
        invoice_id:invoice_id
      };
      this.appService.postData('quotation/pdf/generate',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          window.open(r.download_url, "_blank");
        }else{
          this.toastr.error(r.message,"Error");
        }
        
      },error=>{
        this.toastr.error("Server Error","Error");
      });
  }
  generateInvoice(){
    if(this.selectedRow.length > 0){
      const data = {
        token: localStorage.getItem('token'),
        selectedRow: this.selectedRow,
      };
      this.appService.postData('quotation/csv/generate',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          window.location.href = r.download_url;
        }else{
          this.toastr.error(r.message,"Error");
        }
        
      },error=>{
        this.toastr.error("Server Error","Error");
      });
    }else{
      Swal.fire(
        'Warning',
        'Please select at least one invoice.',
        'warning'
      )
    }
  }

  getList(){
    const data = {
      token: localStorage.getItem('token'),
      bill_no: $("#bill_no").val(),
      customer_name: $("#customer_name").val(),
      amount: $("#amount").val(),
      page: this.p
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('quotation/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.users = r.users.data;
      this.total = r.users.total;
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
    this.appService.putData('quotation/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getList();
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getQuotation(id:number){
      this.heading = 'Edit Quotation';
      this.action = 'Edit';
      const data = {
        token: localStorage.getItem('token'),
        id: id
      };
      this.appService.postData('quotation/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          this.quotationData = r.user;
          $('#r_id').val(r.user.id);
          $('#title').val(r.user.title);
          $('#description').val(r.user.description);
        }else{
          
        }
      },error =>{
       
      });
  }
  searchData(){
    const data = {
      token: localStorage.getItem('token'),
      title_search: $("#title_search").val(),
      status_search: $("#status_search").val(),
      page: this.p
    };
    this.getListFromServer(data);
  }
  reset(){
    $("#title_search").val('');
    $("#status_search").val('');
    const data = {
      token: localStorage.getItem('token'),
      search_key: '',
      page: 1
    };
    this.getListFromServer(data);
  }
  search(){

  }

}
