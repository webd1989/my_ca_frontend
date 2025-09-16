import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit,OnDestroy {

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
  }
  UpdatePassword(){
    $('#passwordUpdateBtn').html('Processing...');
    const data = {
      current_password:$('#current_password').val(),
      new_password:$('#new_password').val(),
      re_password:$('#re_password').val(),
    };
    this.appService.postData('password/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#passwordUpdateBtn').html('Update');
      if(r.success){
        this.toastr.success(r.message, 'Success');
        localStorage.removeItem("token");
        this.router.navigateByUrl('');
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }

}

