import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';

import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit,OnDestroy {

  destroy$ = new Subject();

  loginUsername:any = '';
  userData:any;
  login_user_type = localStorage.getItem('user_type');
  totalClients: number = 0;
  totalProjcts: number = 0;
  topClients:any = [];
  chartOptions1:any;
  chartOptions2:any;
  chartOptions3:any;
  chartOptions4:any;
  chartOptions5:any;
  chart:any;
  chart2:any;
  chart3:any;
  chart4:any;
  chart5:any;

  constructor(
    private appService: ServiceService,
    private router: Router,
    ) { }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  ngOnInit(): void {
    if(localStorage.getItem('token')){
      this.loginUsername = localStorage.getItem('user_name');
    }else{
      this.router.navigateByUrl('/');
    }
    this.GetProfile();
    this.yearwiseSaleChart();
    this.getYearwiseBusiness();
    this.paidUnpaidChart();
    this.getPaidUnpaid();
  }


yearwiseSaleChart(){
    this.chartOptions1 = {
      title: {
        text: ""
      },
      theme: "light2",
      animationEnabled: true,
      exportEnabled: true,
      axisY: {
      includeZero: true,
      //valueFormatString: "$#,##0k"
      },
      data: [{
      type: "column", //change type to bar, line, area, pie, etc
      yValueFormatString: "#,###.##' INR'",
      color: "#0047bd",
      dataPoints: [
        { label: "2024", y: 0 },
        { label: "2025", y: 0 },
      ]
      }]
    }
    this.chartOptions3 = {
      title: {
        text: ""
      },
      theme: "light2",
      animationEnabled: true,
      exportEnabled: true,
      axisY: {
      includeZero: true,
      //valueFormatString: "$#,##0k"
      },
      data: [{
      type: "column", //change type to bar, line, area, pie, etc
      yValueFormatString: "'$'#,###.##",
      color: "#0047bd",
      dataPoints: [
        { label: "2024", y: 0 },
        { label: "2025", y: 0 },
      ]
      }]
    }
    this.chartOptions5 = {
      title: {
        text: ""
      },
      theme: "light2",
      animationEnabled: true,
      exportEnabled: true,
      axisY: {
      includeZero: true,
      //valueFormatString: "$#,##0k"
      },
      data: [{
      type: "column", //change type to bar, line, area, pie, etc
      yValueFormatString:  "#,###.##' INR'",
      color: "orange",
      dataPoints: []
      }]
    }
  }
  paidUnpaidChart(){
    this.chartOptions2 = {
      animationEnabled: true,
	  title: {
		text: ""
	  },
	  data: [{
		type: "pie",
		startAngle: -90,
		indexLabel: "{name}: {y}",
		yValueFormatString: "#,###.##' INR'",
		dataPoints: [
		  { y: 0, name: "Paid Amount" },
		  { y: 0, name: "Pending Amount" }
		]
	  }]
    }
    this.chartOptions4 = {
      animationEnabled: true,
	  title: {
		text: ""
	  },
	  data: [{
		type: "pie",
		startAngle: -90,
		indexLabel: "{name}: {y}",
		yValueFormatString: "'$'#,###.##",
		dataPoints: [
		  { y: 0, name: "Paid Amount" },
		  { y: 0, name: "Pending Amount" }
		]
	  }]
    }
  }

getChartInstance(chart: object) {
    this.chart = chart;
  }
  getChartInstance2(chart: object) {
    this.chart2 = chart;
  }
  getChartInstance3(chart: object) {
    this.chart3 = chart;
  }
  getChartInstance4(chart: object) {
    this.chart4 = chart;
  }
  getChartInstance5(chart: object) {
    this.chart5 = chart;
  }
  getYearwiseBusiness(){
      const data = {
        token: localStorage.getItem('token'),
      };
      this.appService.postData('yearwise-business/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          this.chartOptions1.data[0].dataPoints = r.result;
          this.chartOptions3.data[0].dataPoints = r.result2;
          this.chartOptions5.data[0].dataPoints = r.result3;
       this.chart.render();
       this.chart3.render();
       this.chart5.render();
        }else{
          
        }
      },error =>{
       
      });
    }
    getPaidUnpaid(){
      const data = {
        token: localStorage.getItem('token'),
      };
      this.appService.postData('paid-unpaid',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          this.topClients = r.result3;
          this.totalClients = r.totalClients;
          this.totalProjcts = r.totalProjects;
          this.chartOptions2.data[0].dataPoints = r.result;
          this.chartOptions4.data[0].dataPoints = r.result2;
          this.chart2.render();
          this.chart4.render();
        }else{
          
        }
      },error =>{
       
      });
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

}
