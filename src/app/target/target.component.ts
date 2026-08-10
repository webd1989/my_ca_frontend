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
  selector: 'app-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.css']
})
export class TargetComponent implements OnInit,OnDestroy {

  users:any;
  p: number = 1;
  total: number = 0;
  heading:any = '';
  action:any = '';
  selectedRow:any = [];
  customers:any = [];
  quantities:any = [];
  invoiceData:any = [];
  public SiteUrl = environment.documentUrl;

  totalAmount: number = 0;
  paidAmount: number = 0;
  remainigAmount: number = 0;

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
    this.getAllCustomers();
    this.getList();
    this.newQuantity();  
  }
  newQuantity(){   
    this.addMore();
  }
  setBookingNote(data:any){
    this.invoiceData = data;
  }
  addMore(){
    this.quantities.push({
      id: 0, 
      item: '',  
      qty: 1,
      hsn:'',
      price:''
    });
  }
  removeQuantity(i:number) {  
    this.quantities.splice(i, 1);
  }
  setDescription(counter:number){
    this.quantities[counter].item = $('#item_'+counter).val();
  }
  setQty(counter:number){
    this.quantities[counter].qty = $('#qty_'+counter).val();
  }
  setHsn(counter:number){
    this.quantities[counter].hsn = $('#hsn_'+counter).val();
  }
  setPrice(counter:number){
    this.quantities[counter].price = $('#price_'+counter).val();
  }
  setHeading(){
    this.action = 'Add';
    this.heading = 'Create Invoice';
    this.cleanForm();
  }
  cleanForm(){
    $('#r_id').val(0);
    $('#customer_id').val('');
    $('#invoice_date').val('');
    $('#invoice_no').val('');
    $('#advance').val('');
    $('#currency').val('INR');
    $('#notes').val('');
  }
  Create(){
      $('#addUserBtn').html('Processing...');
      const data = {
        id:$('#r_id').val(),
        customer_id:$('#customer_id').val(),
        invoice_date: $('#invoice_date').val(),
        invoice_no: $('#invoice_no').val(),
        advance: $('#advance').val(),
        currency: $('#currency').val(),
        notes: $('#notes').val(),
        items: this.quantities
      };
      if(this.action == 'Add'){
        this.appService.postData('invoice/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
        this.appService.postData('invoice/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
    getBillNo(){
    const data = {
        token: localStorage.getItem('token')
      };
      this.appService.postData('bill-no/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
         $('#invoice_no').val(r.newBillNo);
         $('#invoice_date').val(r.newBillDate);
        }else{
          this.toastr.error(r.message,"Error");
        }
        
      },error=>{
        this.toastr.error("Server Error","Error");
      });
  }
  getCustomerData(){
    const data = {
        token: localStorage.getItem('token'),
        id:$('#customer_id').val()
      };
      this.appService.postData('customer/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
         $('#phone').val(r.user.phone);
         $('#email').val(r.user.email);
         $('#gst_no').val(r.user.gst_no);
         $('#address').val(r.user.address);
         $('#currency').val(r.user.currency);
        }else{
          this.toastr.error(r.message,"Error");
        }
        
      },error=>{
        this.toastr.error("Server Error","Error");
      });
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
  generateInvoicePDF(invoice_id:number){
    const data = {
        token: localStorage.getItem('token'),
        invoice_id:invoice_id
      };
      this.appService.postData('invoice/pdf/generate',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
  getUser(id:number){
      this.heading = 'Edit Invoice';
      this.action = 'Edit';
      const data = {
        token: localStorage.getItem('token'),
        id: id
      };
      this.appService.postData('invoice/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          $('#r_id').val(r.invoiceData.id);
          $('#customer_id').val(r.invoiceData.customer_id);
          $('#invoice_no').val(r.invoiceData.bill_no);
          $('#advance').val(r.invoiceData.advance);
          $('#currency').val(r.invoiceData.currency);
          $('#invoice_date').val(r.invoiceData.bill_date);
          $('#notes').val(r.invoiceData.notes);

          this.quantities = [];
          r.invoiceData.items.forEach((element:any, index:any) => {
              this.quantities.push({
              id: element.id, 
              item: element.item,  
              qty: element.qty,
              hsn:element.hsn,
              price:element.price
              });
          });

          console.log(this.quantities);
          //this.quantities = r.invoiceData.items;

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
  getList(){
    const data = {
      token: localStorage.getItem('token'),
      bill_no: $("#bill_no").val(),
      customer_name: $("#customer_name").val(),
      invoive_status: $("#invoive_status").val(),
      page: this.p
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('target/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.users = r.users.data;
      this.total = r.users.total;
      this.totalAmount = r.totalAmount;
      this.remainigAmount = r.remainigAmount;
      this.paidAmount = r.paidAmount;
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
      bill_no: $("#bill_no").val(),
      customer_name: $("#customer_name").val(),
      invoive_status: $("#invoive_status").val(),
      page: this.p
    };
    this.getListFromServer(data);
  }
  reset(){
    $("#bill_no").val('');
    $("#customer_name").val('');
    $("#invoive_status").val('');
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
