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
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit,OnDestroy {

  users:any;
  p: number = 1;
  total: number = 0;
  totalAmt: number = 0;
  totalDeduction: number = 0;
  totalTds: number = 0;
  totalSettlement:number = 0;
  totalRecAmt:number = 0;
  heading:any = '';
  action:any = '';
  customers:any = [];
  selectedRow:any = [];
  public SiteUrl = environment.documentUrl;

  destroy$ = new Subject();

  bill_date:any;
  rec_date:any;
  options: DatepickerOptions = {
    minYear: getYear(new Date()) - 30, // minimum available and selectable year
    maxYear: getYear(new Date()) + 30, // maximum available and selectable year
    placeholder: 'Bill Date', // placeholder in case date model is null | undefined, example: 'Please pick a date'
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
  options2: DatepickerOptions = {
    minYear: getYear(new Date()) - 30, // minimum available and selectable year
    maxYear: getYear(new Date()) + 30, // maximum available and selectable year
    placeholder: 'REC Date', // placeholder in case date model is null | undefined, example: 'Please pick a date'
    format: 'dd-M-Y', // date format to display in input
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
    this.getInvoiceCustomers();
  }
  SetData(colum:any,id:number){
    var value = $('#'+colum+'_'+id).val();
    var data = {
      value:value,
      id:id,
      colum:colum
    };
    this.appService.postData('payment/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        if(colum == 'deduction' || colum == 'tds_amt'){
          this.getList();
        }
       // this.getList();
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  generateInvoice(){
    if(this.selectedRow.length > 0){
      const data = {
        token: localStorage.getItem('token'),
        selectedRow: this.selectedRow,
      };
      this.appService.postData('invoice/csv/generate',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
  selectAllRow(event:any){
    if(event.target.checked){
      $('.item_check').prop('checked',true);
      this.users.forEach((element: any) => {
        this.selectedRow.push(element.id);
      });
    }else{
      $('.item_check').prop('checked',false);
      this.selectedRow = [];
    }
    console.log(this.selectedRow);
  }
  onChangeCategory(event:any,rowID:number) {
    if(event.target.checked){
      this.selectedRow.push(rowID);
      //this.invoiceRow.push(invoiceID);
      console.log(this.selectedRow);
    }else{
      const index = this.selectedRow.findIndex(function(selectedRow:any) {
        return selectedRow == rowID
      });
      //const index = this.invoiceRow.indexOf(invoiceID);
      if (index > -1) { // only splice array when item is found
        this.selectedRow.splice(index, 1); // 2nd parameter means remove one item only
        console.log(this.selectedRow);
      }
    }
  }
  GeneratePdf(){
    const data = {
      token: localStorage.getItem('token'),
      is_paid: $("#is_paid").val(),
      bill_no: $("#bill_no").val(),
      bill_date:this.bill_date,
      rec_date:this.rec_date,
      customer_name: $("#customer_name").val(),
      customer_gst: $("#customer_gst").val(),
      courier_no: $("#courier_no").val(),
      amount: $("#amount").val(),
      payment_mode: $("#payment_mode").val()
    };
    this.appService.postData('invoice/pdf/generate',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.toastr.success("Report generated successfully","Success");
        window.open(r.download_url, "_blank");
      }else{
        this.toastr.error(r.message,"Error");
      }
      
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  GenerateCSV(){
    const data = {
      token: localStorage.getItem('token'),
      is_paid: $("#is_paid").val(),
      bill_no: $("#bill_no").val(),
      bill_date:this.bill_date,
      rec_date:this.rec_date,
      customer_name: $("#customer_name").val(),
      customer_gst: $("#customer_gst").val(),
      courier_no: $("#courier_no").val(),
      amount: $("#amount").val(),
      payment_mode: $("#payment_mode").val()
    };
    this.appService.postData('payment/csv/generate',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.toastr.success("CSV generated successfully","Success");
        window.location.href = r.download_url;
      }else{
        this.toastr.error(r.message,"Error");
      }
      
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getList(){
    const data = {
      token: localStorage.getItem('token'),
      is_paid: $("#is_paid").val(),
      bill_no: $("#bill_no").val(),
      bill_date:this.bill_date,
      rec_date:this.rec_date,
      customer_name: $("#customer_name").val(),
      customer_gst: $("#customer_gst").val(),
      courier_no: $("#courier_no").val(),
      amount: $("#amount").val(),
      payment_mode: $("#payment_mode").val(),
      page: this.p
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('target/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.users = r.users.data;
      this.total = r.users.total;
      this.totalAmt = r.totalAmt;
      this.totalDeduction = r.totalDeduction;
      this.totalTds = r.totalTds;
      this.totalSettlement = r.totalSettlement;
      this.totalRecAmt = r.totalRecAmt;
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getInvoiceCustomers(){
    const data = {
      token: localStorage.getItem('token')
    };
    this.appService.postData('invoice/customers',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.customers = r.customers;
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
    this.appService.putData('target/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getList();
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  searchData(){
    const data = {
      token: localStorage.getItem('token'),
      is_paid: $("#is_paid").val(),
      bill_no: $("#bill_no").val(),
      bill_date:this.bill_date,
      rec_date:this.rec_date,
      customer_name: $("#customer_name").val(),
      customer_gst: $("#customer_gst").val(),
      courier_no: $("#courier_no").val(),
      amount: $("#amount").val(),
      payment_mode: $("#payment_mode").val(),
      page: 1
    };
    this.getListFromServer(data);
  }
  reset(){
    $("#is_paid").val('');
    $("#bill_no").val('');
    $("#customer_name").val('');
    $("#customer_gst").val('');
    $("#courier_no").val('');
    $("#amount").val('');
    $("#payment_mode").val('');
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
