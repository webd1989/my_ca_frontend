import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router,ActivatedRoute } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { DatepickerOptions } from 'ng2-datepicker';
import { getYear } from 'date-fns';
import locale from 'date-fns/locale/en-US';

@Component({
  selector: 'app-customer-data',
  templateUrl: './customer-data.component.html',
  styleUrls: ['./customer-data.component.css']
})
export class CustomerDataComponent implements OnInit,OnDestroy {

  destroy$ = new Subject();

  userID:any;
  contactData:any;
  p: number = 1;
  total: number = 0;
  bookings:any;

  totalQty: number = 0;
  totalAmt: number = 0;
  totalAdvance: number = 0;
  totalRemainingAmt: number = 0;
  totalTransport: number = 0;
  totalRawMaterial: number = 0;

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
    this.getUser(this.userID);
    this.getList();
  }
  pageChangeEvent(event: number){
    this.p = event;
    this.getList();
  }
  getList(){
    const data = {
      token: localStorage.getItem('token'),
      page: this.p,
      type:'Customer',
      id:this.userID
    };
    this.getListFromServer(data);
  }
  getListFromServer(form:any){
    this.appService.postData('booking/type/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.bookings = r.users.data;

      this.totalQty=r.totalQty;
      this.totalAmt=r.totalAmt;
      this.totalAdvance=r.totalAdvance;
      this.totalRemainingAmt=r.totalRemainingAmt;
      this.totalTransport=r.totalTransport;
      this.totalRawMaterial=r.totalRawMaterial;
      
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  getUser(id:number){
    const data = {
      token: localStorage.getItem('token'),
      id: 0,
      phone:id
    };
    this.appService.postData('contact/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.contactData = r.user;
      }else{
        
      }
    },error =>{
     
    });
  }

}
