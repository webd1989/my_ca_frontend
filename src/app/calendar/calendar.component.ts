import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit,OnDestroy {

  users:any;
  p: number = 1;
  total: number = 0;
  login_user_level = localStorage.getItem('user_level');
  selected_colum:any;
  selected_id:any;
  currentIndex:number =0;
  loading:any= true;
  generalMode:any = true;
  selectedRow:any = [];
  selectedSline:any = [];
  selectedBillTo:any = [];
  selectedShipNo:any = [];
  selectedFromAddress:any = [];
  selectedToAddress:any = [];
  selectedVehicle:any = [];
  selectedBillNo:any = [];
  selectedTransName:any = [];
  contacts:any;
  slines:any;
  shipNos:any;
  billedTos:any;
  froms:any;
  tos:any;
  vehicles:any;
  billNos:any;
  tranportors:any;

  slineRun = false;

  destroy$ = new Subject();

  public SiteUrl = environment.documentUrl;

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
    //this.getTragets();
    /* var elements = document.getElementsByClassName("border-0");
    console.log(elements);
    var currentIndex = this.currentIndex;

    document.onkeydown = function(e) {
      switch (e.keyCode) {
        case 37:
          currentIndex = (currentIndex == 0) ? elements.length - 1 : --currentIndex;
          console.log(currentIndex);
          var inputID = elements[currentIndex].id;
          $('#'+inputID).focus();
          break;
        case 39:
          currentIndex = ((currentIndex + 1) == elements.length) ? 0 : ++currentIndex;
          console.log(currentIndex);
          var inputID = elements[currentIndex].id;
          $('#'+inputID).focus();
          break;
        case 40:

          break;
      }
    }; */
  }
  getSlines(){
    if(!this.slineRun){
      const data = {
        token: localStorage.getItem('token'),
        is_billed:$('#f_is_billed').val()
      };
      this.appService.postData('sline/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
            this.slines = r.slines;
            this.slineRun = true;
            this.getBilledTo();
      },error=>{
        this.toastr.error("Server Error","Error");
      });
    }
  }
  getBilledTo(){
    const data = {
      token: localStorage.getItem('token'),
      sline:this.selectedSline
    };
    this.appService.postData('billed-to/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
          this.billedTos = r.billedTos;
          this.selectedBillTo = [];
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getShipNo(){
    const data = {
      token: localStorage.getItem('token'),
      sline:this.selectedSline
    };
    this.appService.postData('ship-no/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
          this.shipNos = r.shipNos;
          this.selectedShipNo = [];
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getFromList(){
    const data = {
      token: localStorage.getItem('token'),
      sline:this.selectedSline
    };
    this.appService.postData('booking-from/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
          this.froms = r.froms;
          this.selectedFromAddress = [];
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getToList(){
    const data = {
      token: localStorage.getItem('token'),
      sline:this.selectedSline
    };
    this.appService.postData('booking-to/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
          this.tos = r.tos;
          this.selectedToAddress = [];
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getVehicleList(){
    const data = {
      token: localStorage.getItem('token'),
      sline:this.selectedSline
    };
    this.appService.postData('vehicle/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
          this.vehicles = r.vehicles;
          this.selectedVehicle = [];
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getBillNoList(){
    const data = {
      token: localStorage.getItem('token'),
      sline:this.selectedSline
    };
    this.appService.postData('bill-no/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
          this.billNos = r.billNos;
          this.selectedBillNo = [];
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getTransportorList(){
    const data = {
      token: localStorage.getItem('token'),
      sline:this.selectedSline
    };
    this.appService.postData('tranportor/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
          this.tranportors = r.transportorNames;
          this.selectedTransName = [];
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getList(){
    const data = {
      token: localStorage.getItem('token'),
      sline: this.selectedSline,
      billed_to:this.selectedBillTo,
      container_no:$("#f_container_no").val(),
      size:$("#f_size").val(),
      from:this.selectedFromAddress,
      to:this.selectedToAddress,
      vehicle_no:this.selectedVehicle,
      sline_handle_by:$("#f_sline_handle_by").val(),
      transport_name:this.selectedTransName,
      l_invo_no:this.selectedBillNo,
      is_billed:$("#f_is_billed").val(),
      shipment_no:this.selectedShipNo,
      is_cont_no_fine:$("#is_cont_no_fine").val(),
      page: this.p,
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('booking/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
          this.selectedShipNo = [];
          $('#closeBtnSlineFilter').trigger('click');
          $('#closeBtnBillToFilter').trigger('click');
          $('#closeBtnShipNoFilter').trigger('click');
          $('#closeBtnFromFilter').trigger('click');
          $('#closeBtnToFilter').trigger('click');
          $('#closeBtnVehicleFilter').trigger('click');
          $('#closeBtnBillNoFilter').trigger('click');
          $('#closeBtnTransNameFilter').trigger('click');
          $('#search_btn').html('<i class="fas fa-search"></i>');
          if(r.success){
            this.users = r.users.data;
            this.total = r.users.total;
            this.shipNos = r.shipNos;
          }else{
            if(r.message == 'Logout'){
              localStorage.removeItem("token");
              this.router.navigateByUrl('');
            }
          }
          this.loading =false;
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  exportData(){
    $('#export_btn').html('....');
    const data = {
      token: localStorage.getItem('token'),
      sline: this.selectedSline,
      billed_to:this.selectedBillTo,
      container_no:$("#f_container_no").val(),
      size:$("#f_size").val(),
      from:this.selectedFromAddress,
      to:this.selectedToAddress,
      vehicle_no:this.selectedVehicle,
      sline_handle_by:$("#f_sline_handle_by").val(),
      transport_name:this.selectedTransName,
      l_invo_no:this.selectedBillNo,
      is_billed:$("#f_is_billed").val(),
      shipment_no:this.selectedShipNo,
      is_cont_no_fine:$("#is_cont_no_fine").val(),
    };
    this.appService.postData('booking/list/export',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
          $('#export_btn').html('<i class="fas fa-download"></i>');
          window.location.href = r.download_url;
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  searchData(){
    $('#search_btn').html('....');
    const data = {
      token: localStorage.getItem('token'),
      sline: this.selectedSline,
      billed_to:this.selectedBillTo,
      container_no:$("#f_container_no").val(),
      size:$("#f_size").val(),
      from:this.selectedFromAddress,
      to:this.selectedToAddress,
      vehicle_no:this.selectedVehicle,
      sline_handle_by:$("#f_sline_handle_by").val(),
      transport_name:this.selectedTransName,
      l_invo_no:this.selectedBillNo,
      is_billed:$("#f_is_billed").val(),
      shipment_no:this.selectedShipNo,
      is_cont_no_fine:$("#is_cont_no_fine").val(),
      page: 1,
    };
    this.getListFromServer(data);
  }
  reset(){
    this.selectedSline = [];
    this.selectedBillTo = [];
    this.selectedShipNo = [];
    this.selectedFromAddress = [];
    this.selectedToAddress=[];
    this.selectedVehicle=[];
    this.selectedBillNo = [];
    this.selectedTransName = [];
    $("#f_container_no").val('');
    $("#f_size").val('');
    $("#f_sline_handle_by").val('');
    $("#f_transport_name").val('');
    $("#f_is_billed").val('');
    $("#is_cont_no_fine").val('');
    const data = {
      token: localStorage.getItem('token'),
      sline: this.selectedSline,
      billed_to: this.selectedBillTo,
      container_no: '',
      size: '',
      from: this.selectedFromAddress,
      to: this.selectedToAddress,
      vehicle_no:this.selectedVehicle,
      sline_handle_by: '',
      transport_name: this.selectedTransName,
      l_invo_no:this.selectedBillNo,
      is_billed:'',
      shipment_no:this.selectedShipNo,
      is_cont_no_fine:'',
      page: 1
    };
    this.slineRun = false;
    this.getSlines();
    this.getListFromServer(data);
  }
  setForInvoice(type:any){
    $('.report_t_btns').removeClass('active_report');
    if(type =='General'){
      $('#general_t_btn').addClass('active_report');
      this.generalMode = true;
    }else{
      $('#invoice_t_btn').addClass('active_report');
      this.generalMode = false;
    }
  }
  setID(id:number){
    $('#r_id').val(id);
  }
  Copy(){
    $('#copyBtn').html('Processing...');
    const data = {
      token: localStorage.getItem('token'),
      row_id: $('#r_id').val(),
      no_of_copy:$('#no_of_copy').val(),
    };
    this.appService.postData('order/copy',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#no_of_copy').val(1);
      this.toastr.success(r.message, 'Success');
      this.getList();
      $('#copyBtn').html('Submit');
      $('#closeBtn').trigger('click');
    },error=>{
      this.toastr.error("Server Error","Error");
    });
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
  selectSlineItem(event:any,rowID:number) {
    if(event.target.checked){
      this.selectedSline.push(rowID);
      //this.invoiceRow.push(invoiceID);
      console.log(this.selectedSline);
      this.getBilledTo();
    }else{
      const index = this.selectedSline.findIndex(function(selectedRow:any) {
        return selectedRow == rowID
      });
      //const index = this.invoiceRow.indexOf(invoiceID);
      if (index > -1) { // only splice array when item is found
        this.selectedSline.splice(index, 1); // 2nd parameter means remove one item only
        console.log(this.selectedSline);
        this.getBilledTo();
      }
    }
  }
  selectBillToItem(event:any,rowID:number) {
    if(event.target.checked){
      this.selectedBillTo.push(rowID);
    }else{
      const index = this.selectedBillTo.findIndex(function(selectedRow:any) {
        return selectedRow == rowID
      });
      //const index = this.invoiceRow.indexOf(invoiceID);
      if (index > -1) { // only splice array when item is found
        this.selectedBillTo.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  }
  selectShipNoItem(event:any,rowID:number) {
    if(event.target.checked){
      this.selectedShipNo.push(rowID);
    }else{
      const index = this.selectedShipNo.findIndex(function(selectedRow:any) {
        return selectedRow == rowID
      });
      if (index > -1) {
        this.selectedShipNo.splice(index, 1);
      }
    }
  }
  selectFromItem(event:any,rowID:number) {
    if(event.target.checked){
      this.selectedFromAddress.push(rowID);
    }else{
      const index = this.selectedFromAddress.findIndex(function(selectedRow:any) {
        return selectedRow == rowID
      });
      if (index > -1) {
        this.selectedFromAddress.splice(index, 1);
      }
    }
  }
  selectToItem(event:any,rowID:number) {
    if(event.target.checked){
      this.selectedToAddress.push(rowID);
    }else{
      const index = this.selectedToAddress.findIndex(function(selectedRow:any) {
        return selectedRow == rowID
      });
      if (index > -1) {
        this.selectedToAddress.splice(index, 1);
      }
    }
  }
  selectVehicleItem(event:any,rowID:number) {
    if(event.target.checked){
      this.selectedVehicle.push(rowID);
    }else{
      const index = this.selectedVehicle.findIndex(function(selectedRow:any) {
        return selectedRow == rowID
      });
      if (index > -1) {
        this.selectedVehicle.splice(index, 1);
      }
    }
  }
  selectBillNoItem(event:any,rowID:number) {
    if(event.target.checked){
      this.selectedBillNo.push(rowID);
    }else{
      const index = this.selectedBillNo.findIndex(function(selectedRow:any) {
        return selectedRow == rowID
      });
      if (index > -1) {
        this.selectedBillNo.splice(index, 1);
      }
    }
  }
  selectTransNameItem(event:any,rowID:number) {
    if(event.target.checked){
      this.selectedTransName.push(rowID);
    }else{
      const index = this.selectedTransName.findIndex(function(selectedRow:any) {
        return selectedRow == rowID
      });
      if (index > -1) {
        this.selectedTransName.splice(index, 1);
      }
    }
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
  getAllContact(){
    const data = {
      token: localStorage.getItem('token')
    };
    this.appService.postData('customer/list/all',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.contacts = r.users;
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  generateInvoice(){
    if(this.selectedRow.length > 0){
      $('#genInvoiceBtn').html('Processing...');
      const data = {
        token: localStorage.getItem('token'),
        selectedRow: this.selectedRow,
        customer_id:$('#customer_id').val(),
        bill_date:$('#bill_date').val(),
        bill_no:$('#bill_no').val(),
        ref_no:$('#ref_no').val(),
        shipment_no:$('#shipment_no').val(),
        work_order_no:$('#work_order_no').val()
      };
      this.appService.postData('booking/invoice',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#genInvoiceBtn').html('Submit');
        if(r.success){
          this.selectedRow = [];
          this.getList();
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
    }else{
      Swal.fire(
        'Warning',
        'Please select at least one record.',
        'warning'
      )
    }
  }
  deleteAll(){
    if(this.selectedRow.length > 0){
      Swal.fire({
        title: 'Are you sure?',
        text: 'This process is irreversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
        }).then((result) => {
        if (result.value) {
          const data = {
            token: localStorage.getItem('token'),
            selectedRow: this.selectedRow
          };
          this.appService.postData('booking/delete/all',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
            var r:any=res;
            this.getList();
            Swal.fire(
              'Removed!',
              'Record removed successfully.',
              'success'
            )
          },error=>{
            this.toastr.error("Server Error","Error");
          });
          
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire(
            'Cancelled',
            'Record still in our database.',
            'error'
          )
        }
        })
    }else{
      Swal.fire(
        'Warning',
        'Please select at least one record.',
        'warning'
      )
    }
  }
  
  /**
   * Write code on Method
   *
   * @return response()
   */
   pageChangeEvent(event: number){
    $('#select_all').prop('checked',false);
    this.p = event;
    this.getList();
  }
  setPreview(colum:any,id:number){
    this.selected_colum = colum;
    this.selected_id = id;
    var value = $('#'+colum+'_'+id).val();
    $('#preview_box').val(value);
  }
  setDataOther(){
    var currentVal = $('#preview_box').val();
    this.SetData(this.selected_colum,this.selected_id);
    $('#'+this.selected_colum+'_'+this.selected_id).val(currentVal);
  }
  SetData(colum:any,id:number){
    var value = $('#'+colum+'_'+id).val();
    var data = {
      value:value,
      id:id,
      colum:colum
    };
    this.appService.postData('booking/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        if(colum == 'container_no'){
          this.getList();
        }
        //this.getList();
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  AddRow(){
    var data = {};
    this.appService.postData('booking/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.getList();
      }else{
        this.toastr.error(r.message, 'Error');
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
    this.appService.putData('booking/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getList();
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  
  search(){

  }

}

