import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css']
})
export class CompanyListComponent implements OnInit,OnDestroy {

  SiteUrl = environment.documentUrl;

  users:any;
  user_accounts:any;
  p: number = 1;
  total: number = 0;
  heading:any = '';
  action:any = '';
  preffered_communication:any='p_call';
  userData:any;
  equipmentTypes:any;
  modes:any;
  pain_paints:any;
  contracted:any;
  pick_drops:any;
  special_requirements:any;
  selectedCompanyID:any;
  userIdsRow:any = [];
  super_admins:any;
  login_user_type = localStorage.getItem('user_type');
  

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
    this.getAllUrsers();
  }
  getAllUrsers(){
    const data = {company_id:0};
    this.appService.postData('all/user/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.super_admins = r.users;
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  selectCompanyID(id:number){
    this.userIdsRow= [];
    this.selectedCompanyID = id;
    const data = {company_id:id};
    this.appService.postData('all/user/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.user_accounts = r.users;
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  cleanForm(){
    $('#name').val('');
    $('#phone').val('');
    $('#email').val('');
    $('#phone_ext').val('');  
    //$('#address').val('');  
    $('#city').val('');  
    $('#state').val('');  
    $('#country').val('');  
    $('#zipcode').val('');  
    $('#website').val('');  
    $('#linkedin').val('');  
    $('#description').val('');  
    $('#annual_revenue').val('');  
    $('#shipment').val('');  
    this.preffered_communication='p_call';
  }
  removeError(id:string){
    $('#'+id).removeClass('error_validation');
  }
  setStatus(id:number){
    const data = {token: localStorage.getItem('token'),id:id,status:$('#company_status_'+id).val()};
    this.appService.postData('update/company/status',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.getList();
        this.toastr.success(r.message, 'Success');
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  Create(){
    if($.trim($('#name').val()) == ''){
      $('#name').addClass('error_validation');
    }
    if($.trim($('#website').val()) == ''){
      $('#website').addClass('error_validation');
    }
    if(this.login_user_type == 'Admin' && $.trim($('#user_id').val()) == ''){
      $('#user_id').addClass('error_validation');
      this.toastr.error('Please select user', 'Error');
    }
    $('#addUserBtn').html('Processing...');
    var userID = this.login_user_type == 'Admin' ? $('#user_id').val() : 0;
    const data = {
      id:$('#r_id').val(),
      user_id:userID,
      name:$('#name').val(),
      phone:$('#phone').val(),
      email:$('#email').val(),
      phone_ext:$('#phone_ext').val(),
      address:'',
      city:$('#city').val(),
      state:$('#state').val(),
      zipcode:$('#zipcode').val(),
      country:$('#country').val(),
      preffered_communication:this.preffered_communication,
      website:$('#website').val(),
      linkedin:$('#linkedin').val(),
      description:$('#description').val(),
      annual_revenue:$('#annual_revenue').val(),
      shipment:$('#shipment').val(),
      source:$('#source').val(),
      industry:$('#industry').val(),
      equipment_types:this.equipmentTypes,
      modes:this.modes,
      pain_paints:this.pain_paints,
      contracted:this.contracted,
      pick_drops:this.pick_drops,
      special_requirements:this.special_requirements
    };
    if(this.action == 'Add'){
      this.appService.postData('company/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
      this.appService.postData('company/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
    this.appService.postData('company/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
    this.heading = 'Create an Account';
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
    $('#AccountFormHeading').html('Edit an Account');
    this.action = 'Edit';
    const data = {
      token: localStorage.getItem('token'),
      id: id
    };
    this.appService.postData('company/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        $('#r_id').val(r.user.id);
        $('#name').val(r.user.name);
        $('#email').val(r.user.email);
        $('#phone').val(r.user.phone);
        $('#phone_ext').val(r.user.phone_ext);
       // $('#address').val(r.user.address);
        $('#city').val(r.user.city);
        $('#state').val(r.user.state);
        $('#zipcode').val(r.user.zipcode);
        $('#country').val(r.user.country);
        $('#website').val(r.user.website);
        $('#linkedin').val(r.user.linkedin);
        $('#description').val(r.user.description);
        $('#annual_revenue').val(r.user.annual_revenue);
        $('#shipment').val(r.user.shipment);
        $('#source').val(r.user.source);
        $('#industry').val(r.user.industry);
       // $('#equipment_types').val(r.user.equipment_types);
        //$('#modes').val(r.user.modes);
        //$('#pain_paints').val(r.user.pain_paints);
        //$('#contracted').val(r.user.contracted);
        //$('#pick_drops').val(r.user.pick_drops);
        //$('#special_requirements').val(r.user.special_requirements);
        this.preffered_communication = r.user.preffered_communication;
        this.equipmentTypes = JSON.parse(r.user.equipment_types);
        this.modes = JSON.parse(r.user.modes);
        this.pain_paints = JSON.parse(r.user.pain_paints);
        this.contracted = JSON.parse(r.user.contracted);
        this.pick_drops = JSON.parse(r.user.pick_drops);
        this.special_requirements = JSON.parse(r.user.special_requirements);

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
  importData(){

      $('#uploadBtn').html('Uploading...');
      var file_data = $('#document').prop('files')[0];
      var form  = new FormData();
      form.append('token',localStorage.getItem('token') as string);
      form.append('file',file_data);
      this.appService.postData('upload/accounts',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#uploadBtn').html('Upload');
      if(r.success){
          this.toastr.success(r.message, 'Success');
          $('#importClose').trigger('click');
          this.getList();
        }else{
          this.toastr.error(r.message, 'Error');
        }
      });
  }
  updateStatus(userID:string,status:string){
    const data = {};
    this.appService.putData('company/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getList();
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  onChangeCategory(event:any,userID:number) {
    
    if(event.target.checked){
      this.userIdsRow.push({
        user_id: userID
      });
      //this.invoiceRow.push(invoiceID);
    }else{
      const index = this.userIdsRow.findIndex(function(userIdsRow:any) {
        return userIdsRow.user_id == userID
      });
      //const index = this.invoiceRow.indexOf(invoiceID);
      if (index > -1) { // only splice array when item is found
        this.userIdsRow.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
    console.log(this.userIdsRow);
  }
  assignTo(){
    const data = {user_account_id:this.userIdsRow,company_id:this.selectedCompanyID};
    this.appService.postData('assign/company',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.getList();
        $('#closeBtn3').trigger('click');
        this.toastr.success(r.message, 'Success');
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
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
