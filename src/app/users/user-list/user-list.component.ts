import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit,OnDestroy {

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
  Create(){
    $('#addUserBtn').html('Processing...');
    const data = {
      id:$('#r_id').val(),
      name:$('#name').val(),
      phone:$('#phone').val(),
      email:$('#email').val(),
      password:$('#password').val(),
      role:$('#role').val(),
      //f_city:$('#f_city').val(),
      level:$('#level').val()
    };
    if(this.action == 'Add'){
      this.appService.postData('user/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
      this.appService.postData('user/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
  getFranchise(){
    var form = {};
    this.appService.postData('all/franchise/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.franchise = r.users;
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  cleanForm(){
    $('#name').val('');
    $('#phone').val('');
    $('#email').val('');
    $('#password').val(''); 
    $('#role').val(''); 
    //$('#f_city').val(''); 
    $('#level').val(''); 
  }
  getList(){
    const data = {
      token: localStorage.getItem('token'),
      page: this.p
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('user/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
    this.heading = 'Add New Employee';
    this.cleanForm();
    this.getFranchise();
  }
  getUser(id:number){
    this.getFranchise();
    this.heading = 'Edit Employee';
    this.action = 'Edit';
    const data = {
      token: localStorage.getItem('token'),
      id: id
    };
    this.appService.postData('user/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        $('#r_id').val(r.user.id);
        $('#name').val(r.user.name);
        $('#email').val(r.user.email);
        $('#phone').val(r.user.phone);
        $('#role').val(r.user.designation);
       // $('#f_city').val(r.user.f_city);
        $('#level').val(r.user.level);
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
    this.appService.putData('user/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
