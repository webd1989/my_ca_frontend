import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit,OnDestroy {

  destroy$ = new Subject();
  showPass = false;
  isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  year = new Date().getFullYear();

  constructor(
    private appService: ServiceService,
    private router: Router,
  ) { }
  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  ngOnInit(): void {
    document.body.classList.remove('sb-open');
  }
  toggleTheme(){
    this.isDark = !this.isDark;
    const theme = this.isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('erp-theme', theme);
  }
  Login(){
    const data = {
      username: $('#username').val(),
      password: $('#password').val()
    };
    $('#loginBtn').html('Processing...');
    this.appService.login('login',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#loginBtn').html('Login');
      if(r.success){
        localStorage.setItem('token', r.token);
        localStorage.setItem('user_name', r.details.name);
        localStorage.setItem('user_email', r.details.email);
        localStorage.setItem('user_contact', r.details.phone);
        localStorage.setItem('user_type', r.details.type);
        localStorage.setItem('user_level', r.details.level);
        this.router.navigateByUrl('/dashboard');
      }else{
        Swal.fire(
          'Error',
          r.message,
          'error'
        )
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
