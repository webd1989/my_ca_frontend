import { Component, OnInit, OnDestroy, ElementRef, QueryList, ViewChildren } from '@angular/core';
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
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  /* step 1 = user id + password, step 2 = security code (OTP) */
  step: 'login' | 'otp' = 'login';
  loggingIn = false;
  verifying = false;
  otp: string[] = ['', '', '', '', '', ''];
  otpError = '';
  otpLocked = false;
  shake = false;
  pendingUser = '';
  private pendingPass = '';
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
  /* ---------- step 1: user id + password ---------- */
  Login(){
    if(this.loggingIn){ return; }
    const username = String($('#username').val() || '').trim();
    const password = String($('#password').val() || '');
    if(!username || !password){
      Swal.fire('Error', !username ? 'Please enter your user ID.' : 'Please enter your password.', 'error');
      return;
    }
    this.loggingIn = true;
    this.appService.login('login', { username, password }).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.loggingIn = false;
      if(r.success && r.otp_required){
        // password is correct, now ask for the security code
        this.pendingUser = username;
        this.pendingPass = password;
        this.resetOtp();
        this.otpLocked = false;
        this.step = 'otp';
        this.focusBox(0);
      }else if(r.success && r.token){
        this.finishLogin(r);
      }else{
        Swal.fire('Error', r.message, 'error');
      }
    },error =>{
      this.loggingIn = false;
      Swal.fire('Error', 'Internal server error', 'error');
    });
  }

  /* ---------- step 2: security code ---------- */
  verifyOtp(){
    if(this.verifying || this.otpLocked){ return; }
    const code = this.otp.join('');
    if(code.length < 6){
      this.otpError = 'Please enter all 6 digits.';
      this.doShake();
      this.focusBox(this.otp.findIndex(d => !d));
      return;
    }
    this.verifying = true;
    this.otpError = '';
    this.appService.login('login', { username: this.pendingUser, password: this.pendingPass, otp: code }).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.verifying = false;
      if(r.success && r.token){
        this.finishLogin(r);
      }else{
        this.otpError = r.message || 'Wrong security code.';
        this.otpLocked = !!r.locked;
        this.resetOtp();
        this.doShake();
        if(!this.otpLocked){ this.focusBox(0); }
      }
    },error =>{
      this.verifying = false;
      this.otpError = 'Internal server error. Please try again.';
    });
  }

  backToLogin(){
    this.step = 'login';
    this.pendingPass = '';
    this.resetOtp();
    this.otpError = '';
    this.otpLocked = false;
    setTimeout(() => { $('#username').val(this.pendingUser); $('#password').val('').focus(); }, 50);
  }

  private finishLogin(r:any){
    this.pendingPass = '';
    localStorage.setItem('token', r.token);
    localStorage.setItem('user_name', r.details.name);
    localStorage.setItem('user_email', r.details.email);
    localStorage.setItem('user_contact', r.details.phone);
    localStorage.setItem('user_type', r.details.type);
    localStorage.setItem('user_level', r.details.level);
    this.router.navigateByUrl('/dashboard');
  }

  /* ---------- OTP boxes: typing, backspace, arrows, paste ---------- */
  onOtpInput(i: number, ev: Event){
    const input = ev.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '');
    if(!digits){ this.otp[i] = ''; input.value = ''; return; }
    if(digits.length > 1){                                       // autofill / fast typing
      // if the box already had a digit, keep only the newly typed one(s)
      const fresh = this.otp[i] && digits.startsWith(this.otp[i]) ? digits.slice(1) || digits : digits;
      input.value = fresh.charAt(0);
      this.fillFrom(i, fresh);
      return;
    }
    this.otp[i] = digits;
    input.value = digits;
    this.otpError = '';
    if(i < 5){ this.focusBox(i + 1); } else { this.autoSubmit(); }
  }

  onOtpKey(i: number, ev: KeyboardEvent){
    if(ev.key === 'Backspace'){
      if(this.otp[i]){ this.otp[i] = ''; }
      else if(i > 0){ this.otp[i - 1] = ''; this.focusBox(i - 1); }
      ev.preventDefault();
    }else if(ev.key === 'ArrowLeft' && i > 0){ this.focusBox(i - 1); ev.preventDefault(); }
    else if(ev.key === 'ArrowRight' && i < 5){ this.focusBox(i + 1); ev.preventDefault(); }
    else if(ev.key === 'Enter'){ this.verifyOtp(); }
  }

  onOtpPaste(ev: ClipboardEvent){
    const text = (ev.clipboardData && ev.clipboardData.getData('text')) || '';
    const digits = text.replace(/\D/g, '');
    if(digits){ ev.preventDefault(); this.fillFrom(0, digits); }
  }

  private fillFrom(start: number, digits: string){
    const boxes = this.otpBoxes ? this.otpBoxes.toArray() : [];
    for(let k = 0; k < digits.length && start + k < 6; k++){
      this.otp[start + k] = digits[k];
      if(boxes[start + k]){ boxes[start + k].nativeElement.value = digits[k]; }   // keep the screen in sync
    }
    this.otpError = '';
    const next = this.otp.findIndex(d => !d);
    if(next === -1){ this.focusBox(5); this.autoSubmit(); } else { this.focusBox(next); }
  }

  private autoSubmit(){
    if(this.otp.join('').length === 6){ setTimeout(() => this.verifyOtp(), 120); }
  }

  private resetOtp(){
    this.otp = ['', '', '', '', '', ''];
    if(this.otpBoxes){ this.otpBoxes.forEach(b => b.nativeElement.value = ''); }
  }

  private focusBox(i: number){
    const go = () => {
      const box = this.otpBoxes && this.otpBoxes.toArray()[Math.max(0, i)];
      if(box){ box.nativeElement.focus(); box.nativeElement.select(); return true; }
      return false;
    };
    // focus right away so fast typing goes to the next box; wait for render on first show
    if(!go()){ setTimeout(go, 60); }
  }

  private doShake(){
    this.shake = false;
    setTimeout(() => { this.shake = true; setTimeout(() => this.shake = false, 500); }, 10);
  }

  trackIdx(i: number){ return i; }

}
