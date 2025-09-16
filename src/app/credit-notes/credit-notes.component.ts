import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-credit-notes',
  templateUrl: './credit-notes.component.html',
  styleUrls: ['./credit-notes.component.css']
})
export class CreditNotesComponent implements OnInit,OnDestroy {

  users:any;
  franchise:any;
  p: number = 1;
  total: number = 0;
  heading:any = '';
  action:any = '';

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
  GeneratePdf(id:number){
    const data = {
      token: localStorage.getItem('token'),
      id: id,
    };
    this.appService.postData('credit-note/pdf/generate',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
  getBillInfo(){
    const data = {
      bill_no:$('#bill_no').val()
    };
    this.appService.postData('bill/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#addUserBtn').html('Save');
      if(r.success){
        $('#amount').val(r.bill_data.amount);
        var bill_no = $('#bill_no').val();
        $('#description').val('CREDIT NOTE IS BEING ISSUED  TO Maersk A/S AGAINST INVOICE NO '+bill_no);
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  Create(){
    $('#addUserBtn').html('Processing...');
    const data = {
      bill_no:$('#bill_no').val(),
      amount:$('#amount').val(),
      description:$('#description').val(),
      date:$('#date').val(),
      size:$('#size').val(),
      from:$('#from').val(),
      to:$('#to').val(),
    };
    if(this.action == 'Add'){
      this.appService.postData('credit-note/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
  
  cleanForm(){
    $('#bill_no').val('');
    $('#amount').val('');
    $('#description').val('');
  }
  getList(){
    const data = {
      token: localStorage.getItem('token'),
      page: this.p
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('credit-note/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
  setHeading(){
    this.action = 'Add';
    this.heading = 'Add New Credit Note';
    this.cleanForm();
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
    this.appService.putData('credit-note/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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

