import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router,ActivatedRoute } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.css']
})
export class InvoiceDetailsComponent implements OnInit,OnDestroy {

  users:any;
  p: number = 1;
  total: number = 0;
  heading:any = '';
  action:any = '';
  userID:number = 0;
  invoiceData:any;
  public SiteUrl = environment.documentUrl;

  destroy$ = new Subject();

  constructor(
    private appService: ServiceService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
  ) { }
  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.userID = this.route.snapshot.params['id'];
    this.getInvoiceData();
    this.getList();
  }
  AddItemInvoice(){
    $('#copyBtn').html('Processing...');
    const data = {
      token: localStorage.getItem('token'),
      id: this.userID,
      container_no:$('#container_no').val()
    };
    this.appService.postData('invoice/item/add',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#copyBtn').html('Submit');
      if(r.success){
        $('#container_no').val('');
        $('#closeBtn').trigger('click');
        this.getList();
        this.toastr.success(r.message,"Success");
      }else{
        this.toastr.error(r.message,"Error");
      }
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getInvoiceData(){
    const data = {
      token: localStorage.getItem('token'),
      id: this.userID 
    };
    this.appService.postData('invoice/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.invoiceData = r.user;
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  saveBill(){
    const data = {
      token: localStorage.getItem('token'),
      id: this.userID,
      bill_date:$('#bill_date').val(),
      bill_no:$('#bill_no').val(),
      ref_no:$('#ref_no').val(),
      shipment_no:$('#shipment_no').val(),
      work_order_no:$('#work_order_no').val(),
      option_1:$('#option_1').val(),
      option_2:$('#option_2').val(),
      option_3:$('#option_3').val(),
      value_1:$('#value_1').val(),
      value_2:$('#value_2').val(),
      value_3:$('#value_3').val(),
    };
    this.appService.postData('invoice/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.toastr.success(r.message,"Success");
      }else{
        this.toastr.error(r.message,"Error");
      }
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  regenerateBill(){
    const data = {
      token: localStorage.getItem('token'),
      id: this.userID 
    };
    this.appService.postData('invoice/regenerate',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        window.open(
          r.download_url,
          '_blank' // <- This is what makes it open in a new window.
        );
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
      id: this.userID 
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('invoice/items/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.users = r.users;
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
  SetData(colum:any,id:number){
    var value = $('#'+colum+'_'+id).val();
    var data = {
      value:value,
      id:id,
      colum:colum
    };
    this.appService.postData('invoice/items/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.getInvoiceData();
        this.getList();
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  updateStatus(userID:string,status:string){
    const data = {};
    this.appService.putData('invoice/items/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getInvoiceData();
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
      search_key: '',
      page: this.p
    };
    this.getListFromServer(data);
  }
  search(){

  }

}

