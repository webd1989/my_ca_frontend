import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';

import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

/* Aurora theme chart palette */
const C_BRAND = '#1f5eff';
const C_VIOLET = '#7c3aed';
const C_GREEN = '#10b981';
const C_ORANGE = '#ff6a1a';
const C_AXIS = '#8a96b2';
const C_GRID = 'rgba(138,150,178,0.18)';
const C_FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

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

  /* KPI values (filled from the paid-unpaid API) */
  paidINR: number = 0;
  pendingINR: number = 0;
  paidUSD: number = 0;
  pendingUSD: number = 0;
  collectionRate: number = 0;
  greeting = '';
  firstName = '';
  today = '';
  fyLabel = '';

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
    this.setHeroText();
    this.GetProfile();
    this.yearwiseSaleChart();
    this.getYearwiseBusiness();
    this.paidUnpaidChart();
    this.getPaidUnpaid();
  }

  setHeroText(){
    const now = new Date();
    const h = now.getHours();
    this.greeting = h < 12 ? 'Good morning' : (h < 17 ? 'Good afternoon' : 'Good evening');
    this.firstName = String(this.loginUsername || 'there').trim().split(' ')[0];
    this.today = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const y = now.getFullYear();
    const start = now.getMonth() >= 3 ? y : y - 1;
    this.fyLabel = start + '-' + String(start + 1).slice(-2);
  }

  /* Indian number format, e.g. 12,34,567 */
  fmt(n:any){
    const v = Number(n) || 0;
    return v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  private baseChart(){
    return {
      title: { text: "" },
      theme: "light2",
      backgroundColor: "transparent",
      animationEnabled: true,
      animationDuration: 900,
      exportEnabled: true,
      toolTip: { cornerRadius: 10, borderThickness: 0, fontFamily: C_FONT, fontColor: '#0f172a', backgroundColor: '#ffffff' },
      axisX: { labelFontColor: C_AXIS, labelFontFamily: C_FONT, labelFontSize: 12, lineColor: C_GRID, tickLength: 0, gridThickness: 0 },
      axisY: { includeZero: true, labelFontColor: C_AXIS, labelFontFamily: C_FONT, labelFontSize: 12, gridColor: C_GRID, gridDashType: "dash", lineThickness: 0, tickLength: 0 },
    };
  }

  private donut(prefixFormat:string){
    return {
      backgroundColor: "transparent",
      animationEnabled: true,
      animationDuration: 900,
      title: { text: "" },
      legend: { fontFamily: C_FONT, fontColor: C_AXIS, fontSize: 13, fontWeight: "normal", verticalAlign: "top", horizontalAlign: "center", markerMargin: 6, itemSpacing: 12 },
      toolTip: { cornerRadius: 10, borderThickness: 0, fontFamily: C_FONT, fontColor: '#0f172a', backgroundColor: '#ffffff' },
      data: [{
        type: "doughnut",
        innerRadius: "72%",
        radius: "88%",
        startAngle: -90,
        showInLegend: true,
        legendText: "{name}",
        indexLabel: "",
        yValueFormatString: prefixFormat,
        dataPoints: this.colorPaid([
          { y: 0, name: "Paid Amount" },
          { y: 0, name: "Pending Amount" }
        ])
      }]
    };
  }

  private colorPaid(points:any[]){
    return (points || []).map((p:any, i:number) => Object.assign({}, p, { color: i === 0 ? C_GREEN : C_ORANGE }));
  }

yearwiseSaleChart(){
    this.chartOptions1 = Object.assign(this.baseChart(), {
      dataPointWidth: 34,
      data: [{
      type: "column",
      yValueFormatString: "'₹'#,###.##",
      color: C_BRAND,
      dataPoints: [
        { label: "2024", y: 0 },
        { label: "2025", y: 0 },
      ]
      }]
    });
    this.chartOptions3 = Object.assign(this.baseChart(), {
      dataPointWidth: 34,
      data: [{
      type: "column",
      yValueFormatString: "'$'#,###.##",
      color: C_VIOLET,
      dataPoints: [
        { label: "2024", y: 0 },
        { label: "2025", y: 0 },
      ]
      }]
    });
    this.chartOptions5 = Object.assign(this.baseChart(), {
      data: [{
      type: "splineArea",
      yValueFormatString: "'₹'#,###.##",
      color: C_BRAND,
      fillOpacity: 0.12,
      lineThickness: 3,
      markerSize: 8,
      markerColor: "#ffffff",
      markerBorderColor: C_BRAND,
      markerBorderThickness: 3,
      dataPoints: []
      }]
    });
  }
  paidUnpaidChart(){
    this.chartOptions2 = this.donut("'₹'#,###.##");
    this.chartOptions4 = this.donut("'$'#,###.##");
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
          this.chartOptions2.data[0].dataPoints = this.colorPaid(r.result);
          this.chartOptions4.data[0].dataPoints = this.colorPaid(r.result2);
          this.paidINR = Number(r.result?.[0]?.y) || 0;
          this.pendingINR = Number(r.result?.[1]?.y) || 0;
          this.paidUSD = Number(r.result2?.[0]?.y) || 0;
          this.pendingUSD = Number(r.result2?.[1]?.y) || 0;
          const tot = this.paidINR + this.pendingINR;
          this.collectionRate = tot > 0 ? Math.round((this.paidINR / tot) * 100) : 0;
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
        if(r.user_date?.name){
          this.firstName = String(r.user_date.name).trim().split(' ')[0];
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
