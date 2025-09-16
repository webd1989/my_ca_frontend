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
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit,OnDestroy {

  destroy$ = new Subject();
  fiePath = environment.documentUrl;
  userData:any;
  profilePic:any;

  constructor(
    private appService: ServiceService,
    private router: Router,
    private toastr: ToastrService
  ) { }
  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.GetProfile();
  }
  UpdateProfile(){
    $('#profileUpdateBtn').html('Processing...');
    const data = {
      name:$('#name').val(),
      phone:$('#phone').val(),
      address:$('#address').val(),
      city:$('#city').val(),
      state:$('#state').val(),
      country:$('#country').val(),
      zipcode:$('#zipcode').val(),
    };
    this.appService.postData('profile/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#profileUpdateBtn').html('Update');
      if(r.success){
        this.toastr.success(r.message, 'Success');
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  uploadDoc(){
    $('#uploadBtn').html('Uploading...');
    var file_data = $('#document').prop('files')[0];
    var form  = new FormData();
    form.append('token',localStorage.getItem('token') as string);
    form.append('file',file_data);
      this.appService.postData('profile/pic/upload',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#uploadBtn').html('Upload');
      if(r.success){
        $('#profile_pic').attr('src',r.file_path);
        this.toastr.success(r.message, 'Success');
      }else{
        this.toastr.error(r.message, 'Error');
      }
      });
  }
  GetProfile(){
    this.appService.getData('profile/get').pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.userData = r.user_date;
        $('#name').val(r.user_date.name);
        $('#email').val(r.user_date.email);
        $('#phone').val(r.user_date.phone);
        $('#address').val(r.user_date.address);
        $('#city').val(r.user_date.city);
        $('#state').val(r.user_date.state);
        $('#country').val(r.user_date.country);
        $('#zipcode').val(r.user_date.zipcode);
        this.profilePic = this.fiePath+'storage/profile/'+r.user_date.photo;
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
