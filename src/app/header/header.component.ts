import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit,OnDestroy {

  userType:any;
  heading:any = '';
  userData:any;
  super_admins:any;
  equipmentTypes:any;
  modes:any;
  pain_paints:any;
  contracted:any;
  pick_drops:any;
  special_requirements:any;
  selectedCompanyID:any;
  destroy$ = new Subject();
  preffered_communication:any='p_call';
  login_user_type = localStorage.getItem('user_type');

  constructor(
    private appService: ServiceService,
    private router: Router,
    private toastr: ToastrService
    ) { }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.userType = localStorage.getItem('user_type');
    /* setInterval(() => {
      this.GetProfile(); 
      }, 60000); */
    this.GetProfile();
  }
  logout(){
    localStorage.removeItem("token");
    this.router.navigateByUrl('');
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
  choosePrefferedCommunication(id:string){
    $('.preffered').removeClass('active_btn');
    $('#'+id).addClass('active_btn');
    this.preffered_communication = id;
  }
  removeError(id:string){
    $('#'+id).removeClass('error_validation');
  }
  CreateAccount(){
    if($.trim($('#name2').val()) == ''){
      $('#name2').addClass('error_validation');
    }
    if($.trim($('#website2').val()) == ''){
      $('#website2').addClass('error_validation');
    }
    if(this.login_user_type == 'Admin' && $.trim($('#user_id2').val()) == ''){
      $('#user_id2').addClass('error_validation');
      this.toastr.error('Please select user', 'Error');
    }
    var userID = this.login_user_type == 'Admin' ? $('#user_id2').val() : 0;
    $('#addAccountBtn').html('Processing...');
    const data = {
      name:$('#name2').val(),
      user_id:userID,
      phone:$('#phone2').val(),
      email:$('#email2').val(),
      phone_ext:$('#phone_ext2').val(),
      address:'',
      city:$('#city2').val(),
      state:$('#state2').val(),
      zipcode:$('#zipcode2').val(),
      country:$('#country2').val(),
      preffered_communication:this.preffered_communication,
      website:$('#website2').val(),
      linkedin:$('#linkedin2').val(),
      description:$('#description2').val(),
      annual_revenue:$('#annual_revenue2').val(),
      shipment:$('#shipment2').val(),
      source:$('#source2').val(),
      industry:$('#industry2').val(),
      equipment_types:this.equipmentTypes,
      modes:this.modes,
      pain_paints:this.pain_paints,
      contracted:this.contracted,
      pick_drops:this.pick_drops,
      special_requirements:this.special_requirements
    };

      this.appService.postData('company/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#addAccountBtn').html('Save');
        if(r.success){
          this.cleanForm();
          this.toastr.success(r.message, 'Success');
          $('#closeBtn22').trigger('click');
          this.router.navigateByUrl('/companies');
        }else{
          this.toastr.error(r.message, 'Error');
        }
      },error =>{
      });
  }
  cleanForm(){
    $('#name2').val('');
    $('#phone2').val('');
    $('#email2').val('');
    $('#phone_ext2').val('');  
    //$('#address2').val('');  
    $('#city2').val('');  
    $('#state2').val('');  
    $('#country2').val('');  
    $('#zipcode2').val('');  
    $('#website2').val('');  
    $('#linkedin2').val('');  
    $('#description2').val('');  
    $('#annual_revenue2').val('');  
    $('#shipment2').val('');  
    this.preffered_communication='p_call';
  }
  GetProfile(){
    this.appService.getData('profile/get').pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.userData = r.user_date;
        if(r.user_date.status == 2){
          localStorage.removeItem("token");
          this.router.navigateByUrl('');
        }
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

}
