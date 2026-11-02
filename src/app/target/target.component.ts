import { Component, OnInit,OnDestroy, ViewChild } from '@angular/core';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
declare var $: any;
import { ServiceService } from '../services/service.service';
import { Router } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { DatepickerOptions } from 'ng2-datepicker';
import { getYear } from 'date-fns';
import locale from 'date-fns/locale/en-US';

@Component({
  selector: 'app-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.css']
})
export class TargetComponent implements OnInit,OnDestroy {

  users:any;
  p: number = 1;
  total: number = 0;
  heading:any = '';
  action:any = '';
  selectedRow:any = [];
  customers:any = [];
  quantities:any = [];
  invoiceData:any = [];
  public SiteUrl = environment.documentUrl;

  totalAmount: any = 0;
  paidAmount: any = 0;
  remainigAmount: any = 0;

  /* ===== Advanced filters ===== */
  f: any = this.emptyFilters();
  datePreset: string = 'all';
  datePresets = [
    { key: 'all', label: 'All dates' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7', label: 'Last 7 days' },
    { key: 'last30', label: 'Last 30 days' },
    { key: 'this_month', label: 'This month' },
    { key: 'last_month', label: 'Last month' },
    { key: 'this_quarter', label: 'This quarter (FY)' },
    { key: 'last_quarter', label: 'Last quarter (FY)' },
    { key: 'this_fy', label: 'This financial year' },
    { key: 'last_fy', label: 'Last financial year' },
    { key: 'this_year', label: 'This calendar year' },
    { key: 'custom', label: 'Custom range' },
  ];
  showAdvanced = false;
  loading = false;
  exporting = false;
  chips: any[] = [];
  advancedCount = 0;
  dateRangeLabel = '';
  summary: any = { count: 0, inr: null, usd: null };
  summaryRows: any[] = [];
  private filterTimer: any;
  private requestSeq = 0;

  destroy$ = new Subject();
  @ViewChild('pdfViewer') pdfViewer!: PdfViewerComponent;

  bill_date:any;
  options: DatepickerOptions = {
    minYear: getYear(new Date()) - 30, // minimum available and selectable year
    maxYear: getYear(new Date()) + 30, // maximum available and selectable year
    placeholder: '', // placeholder in case date model is null | undefined, example: 'Please pick a date'
    format: 'Y-M-dd', // date format to display in input
    formatTitle: 'LLLL yyyy',
    formatDays: 'EEEEE',
    firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
    locale: locale, // date-fns locale
    position: 'bottom',
    inputClass: 'deal-close-datepicker', // custom input CSS class to be applied
    calendarClass: 'datepicker-default', // custom datepicker calendar CSS class to be applied
    scrollBarColor: '#dfe3e9', // in case you customize you theme, here you define scroll bar color
  };

  constructor(
    private appService: ServiceService,
    private router: Router,
    private toastr: ToastrService
  ) { }
  ngOnDestroy(): void {
    clearTimeout(this.filterTimer);
    this.destroy$.complete();
  }
  ngOnInit(): void {
    this.getAllCustomers();
    this.getList();
    this.newQuantity();  
  }
  newQuantity(){   
    this.addMore();
  }
  setBookingNote(data:any){
    this.invoiceData = data;
  }
  addMore(){
    this.quantities.push({
      id: 0, 
      item: '',  
      qty: 1,
      hsn:'',
      price:''
    });
  }
  removeQuantity(i:number) {  
    this.quantities.splice(i, 1);
  }
  setDescription(counter:number){
    this.quantities[counter].item = $('#item_'+counter).val();
  }
  setQty(counter:number){
    this.quantities[counter].qty = $('#qty_'+counter).val();
  }
  setHsn(counter:number){
    this.quantities[counter].hsn = $('#hsn_'+counter).val();
  }
  setPrice(counter:number){
    this.quantities[counter].price = $('#price_'+counter).val();
  }
  setHeading(){
    this.action = 'Add';
    this.heading = 'Create Invoice';
    this.cleanForm();
  }
  cleanForm(){
    $('#r_id').val(0);
    $('#customer_id').val('');
    $('#invoice_date').val('');
    $('#invoice_no').val('');
    $('#advance').val('');
    $('#currency').val('INR');
    $('#notes').val('');
  }
  Create(){
      $('#addUserBtn').html('Processing...');
      const data = {
        id:$('#r_id').val(),
        customer_id:$('#customer_id').val(),
        invoice_date: $('#invoice_date').val(),
        invoice_no: $('#invoice_no').val(),
        advance: $('#advance').val(),
        currency: $('#currency').val(),
        notes: $('#notes').val(),
        items: this.quantities
      };
      if(this.action == 'Add'){
        this.appService.postData('invoice/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
        this.appService.postData('invoice/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
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
    getBillNo(){
    const data = {
        token: localStorage.getItem('token')
      };
      this.appService.postData('bill-no/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
         $('#invoice_no').val(r.newBillNo);
         $('#invoice_date').val(r.newBillDate);
        }else{
          this.toastr.error(r.message,"Error");
        }
        
      },error=>{
        this.toastr.error("Server Error","Error");
      });
  }
  getCustomerData(){
    const data = {
        token: localStorage.getItem('token'),
        id:$('#customer_id').val()
      };
      this.appService.postData('customer/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
         $('#phone').val(r.user.phone);
         $('#email').val(r.user.email);
         $('#gst_no').val(r.user.gst_no);
         $('#address').val(r.user.address);
         $('#currency').val(r.user.currency);
        }else{
          this.toastr.error(r.message,"Error");
        }
        
      },error=>{
        this.toastr.error("Server Error","Error");
      });
  }
  getAllCustomers(){
    const data = {
        token: localStorage.getItem('token')
      };
      this.appService.postData('customer/list/all',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          this.customers = r.users;
        }else{
          this.toastr.error(r.message,"Error");
        }
        
      },error=>{
        this.toastr.error("Server Error","Error");
      });
  }
  /* Opens the invoice inside the app (preview + share + download).
     window.open() after an API call is blocked on iPhone / Android, so the PDF is shown in-page. */
  generateInvoicePDF(invoice_id:number){
    const inv:any = (this.users || []).find((u:any) => u.id == invoice_id) || {};
    const company = inv.company_full || '';
    const billNo = inv.bill_no || invoice_id;
    const safeName = String(company).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    const amount = inv.total_amount ? String(inv.total_amount) : '';
    const data = {
        token: localStorage.getItem('token'),
        invoice_id: invoice_id,
        inline: 1
      };
    this.pdfViewer.open({
      title: 'Invoice #' + billNo,
      subtitle: [company, amount, inv.display_date2].filter(Boolean).join(' · '),
      fileName: 'Invoice-' + billNo + (safeName ? '-' + safeName : '') + '.pdf',
      shareText: 'Hello' + (company ? ' ' + company : '') + ',\nPlease find Invoice #' + billNo + (inv.display_date2 ? ' dated ' + inv.display_date2 : '') + (amount ? ' for ' + amount : '') + '.\n\nThank you,\nWebD IT Solutions',
      phone: (inv.cust_data && (inv.cust_data.phone || inv.cust_data.mobile)) || '',
      request$: this.appService.postData('invoice/pdf/generate', data).pipe(takeUntil(this.destroy$))
    });
  }
  generateInvoice(){
    if(this.selectedRow.length > 0){
      const data = {
        token: localStorage.getItem('token'),
        selectedRow: this.selectedRow,
      };
      this.appService.postData('invoice/csv/generate',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          window.location.href = r.download_url;
        }else{
          this.toastr.error(r.message,"Error");
        }
        
      },error=>{
        this.toastr.error("Server Error","Error");
      });
    }else{
      Swal.fire(
        'Warning',
        'Please select at least one invoice.',
        'warning'
      )
    }
  }
  selectAllRow(event:any){
    if(event.target.checked){
      $('.item_check').prop('checked',true);
      this.users.forEach((element: any) => {
        this.selectedRow.push(element.id);
      });
    }else{
      $('.item_check').prop('checked',false);
      this.selectedRow = [];
    }
    console.log(this.selectedRow);
  }
  getUser(id:number){
      this.heading = 'Edit Invoice';
      this.action = 'Edit';
      const data = {
        token: localStorage.getItem('token'),
        id: id
      };
      this.appService.postData('invoice/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        if(r.success){
          $('#r_id').val(r.invoiceData.id);
          $('#customer_id').val(r.invoiceData.customer_id);
          $('#invoice_no').val(r.invoiceData.bill_no);
          $('#advance').val(r.invoiceData.advance);
          $('#currency').val(r.invoiceData.currency);
          $('#invoice_date').val(r.invoiceData.bill_date);
          $('#notes').val(r.invoiceData.notes);

          this.quantities = [];
          r.invoiceData.items.forEach((element:any, index:any) => {
              this.quantities.push({
              id: element.id, 
              item: element.item,  
              qty: element.qty,
              hsn:element.hsn,
              price:element.price
              });
          });

          console.log(this.quantities);
          //this.quantities = r.invoiceData.items;

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
  get perPageNum(): number {
    return Number(this.f.per_page) || 50;
  }
  emptyFilters(){
    return {
      keyword: '',
      customer_name: '',
      invoive_status: '',
      currency: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: '',
      bill_from: '',
      bill_to: '',
      has_notes: '',
      sort: 'bill_no_desc',
      per_page: '50'
    };
  }
  /* request payload built from the current filters */
  private buildPayload(extra: any = {}){
    const data: any = { token: localStorage.getItem('token'), page: this.p };
    Object.keys(this.f).forEach(k => {
      const v = this.f[k];
      if(v !== '' && v !== null && v !== undefined){ data[k] = typeof v === 'string' ? v.trim() : v; }
    });
    return Object.assign(data, extra);
  }
  getList(){
    this.getListFromServer(this.buildPayload());
  }
  getListFromServer(form:any){
    const seq = ++this.requestSeq;
    this.loading = true;
    this.buildChips();
    this.appService.postData('target/list',form).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      if(seq !== this.requestSeq){ return; } // a newer filter request is on its way
      var r:any=res;
      this.loading = false;
      this.users = r.users.data;
      this.total = r.users.total;
      this.totalAmount = r.totalAmount;
      this.remainigAmount = r.remainigAmount;
      this.paidAmount = r.paidAmount;
      this.setSummary(r.summary);
    },error=>{
      if(seq !== this.requestSeq){ return; }
      this.loading = false;
      this.toastr.error("Server Error","Error");
    });
  }
  private setSummary(sm:any){
    this.summary = sm || { count: this.total, inr: null, usd: null };
    const rows: any[] = [];
    if(this.summary.inr && this.summary.inr.count > 0){ rows.push({ code: 'INR', label: '₹ INR', sym: '₹', s: this.summary.inr }); }
    if(this.summary.usd && this.summary.usd.count > 0){ rows.push({ code: 'USD', label: '$ USD', sym: '$', s: this.summary.usd }); }
    this.summaryRows = rows;
  }
  /* called on every filter change; text/number inputs are debounced */
  onFilterChange(debounce: boolean = false){
    clearTimeout(this.filterTimer);
    if(debounce){
      this.filterTimer = setTimeout(() => this.applyFilters(), 450);
    }else{
      this.applyFilters();
    }
  }
  applyFilters(){
    clearTimeout(this.filterTimer);
    this.p = 1;
    this.getList();
  }
  searchData(){
    this.applyFilters();
  }
  reset(){
    this.f = this.emptyFilters();
    this.datePreset = 'all';
    this.applyFilters();
  }
  clearChip(key: string){
    if(key === 'date'){
      this.f.date_from = ''; this.f.date_to = ''; this.datePreset = 'all';
    }else if(key === 'amount'){
      this.f.amount_min = ''; this.f.amount_max = '';
    }else if(key === 'bill_range'){
      this.f.bill_from = ''; this.f.bill_to = '';
    }else{
      this.f[key] = key === 'sort' ? 'bill_no_desc' : (key === 'per_page' ? '50' : '');
    }
    this.applyFilters();
  }
  private buildChips(){
    const c: any[] = [];
    const f = this.f;
    if(f.keyword && f.keyword.trim()){ c.push({ key: 'keyword', label: 'Search', value: '"' + f.keyword.trim() + '"' }); }
    if(f.customer_name){
      const cu = (this.customers || []).find((x:any) => String(x.id) === String(f.customer_name));
      c.push({ key: 'customer_name', label: 'Customer', value: cu ? cu.company : '#' + f.customer_name });
    }
    if(f.invoive_status){ c.push({ key: 'invoive_status', label: 'Status', value: f.invoive_status == '1' ? 'Paid' : 'Pending' }); }
    if(f.date_from || f.date_to){
      this.dateRangeLabel = this.rangeText(f.date_from, f.date_to);
      const preset = this.datePresets.find(d => d.key === this.datePreset);
      const name = preset && this.datePreset !== 'custom' && this.datePreset !== 'all' ? preset.label + ' · ' : '';
      c.push({ key: 'date', label: 'Date', value: name + this.dateRangeLabel });
    }else{
      this.dateRangeLabel = '';
    }
    if(f.currency){ c.push({ key: 'currency', label: 'Currency', value: f.currency === '$' ? 'USD' : 'INR' }); }
    if(f.amount_min !== '' && f.amount_min !== null || f.amount_max !== '' && f.amount_max !== null){
      c.push({ key: 'amount', label: 'Amount', value: this.pair(f.amount_min, f.amount_max) });
    }
    if(f.bill_from !== '' && f.bill_from !== null || f.bill_to !== '' && f.bill_to !== null){
      c.push({ key: 'bill_range', label: 'Bill no', value: this.pair(f.bill_from, f.bill_to) });
    }
    if(f.has_notes){ c.push({ key: 'has_notes', label: 'Notes', value: f.has_notes == '1' ? 'With notes' : 'Without notes' }); }
    this.chips = c;
    let adv = 0;
    ['currency','has_notes'].forEach(k => { if(f[k]){ adv++; } });
    if(f.date_from || f.date_to){ adv++; }
    if((f.amount_min !== '' && f.amount_min !== null) || (f.amount_max !== '' && f.amount_max !== null)){ adv++; }
    if((f.bill_from !== '' && f.bill_from !== null) || (f.bill_to !== '' && f.bill_to !== null)){ adv++; }
    if(f.sort !== 'bill_no_desc'){ adv++; }
    if(String(f.per_page) !== '50'){ adv++; }
    this.advancedCount = adv;
  }
  private pair(a:any, b:any){
    const has = (v:any) => v !== '' && v !== null && v !== undefined;
    if(has(a) && has(b)){ return a + ' – ' + b; }
    if(has(a)){ return '≥ ' + a; }
    return '≤ ' + b;
  }
  private rangeText(from:string, to:string){
    const show = (d:string) => {
      if(!d){ return ''; }
      const p = d.split('-');
      const dt = new Date(+p[0], +p[1] - 1, +p[2]);
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    if(from && to){ return from === to ? show(from) : show(from) + ' – ' + show(to); }
    if(from){ return 'From ' + show(from); }
    return 'Up to ' + show(to);
  }
  /* ---------- date presets (financial year = April to March) ---------- */
  setDatePreset(key: string){
    this.datePreset = key;
    if(key === 'custom'){
      this.showAdvanced = true;
      return;
    }
    const t = new Date(); t.setHours(0,0,0,0);
    const y = t.getFullYear(), m = t.getMonth();
    const fyStart = m >= 3 ? y : y - 1;
    let from: Date | null = null, to: Date | null = null;
    switch(key){
      case 'today': from = new Date(t); to = new Date(t); break;
      case 'yesterday': from = new Date(y, m, t.getDate() - 1); to = new Date(from); break;
      case 'last7': from = new Date(y, m, t.getDate() - 6); to = new Date(t); break;
      case 'last30': from = new Date(y, m, t.getDate() - 29); to = new Date(t); break;
      case 'this_month': from = new Date(y, m, 1); to = new Date(y, m + 1, 0); break;
      case 'last_month': from = new Date(y, m - 1, 1); to = new Date(y, m, 0); break;
      case 'this_quarter':
      case 'last_quarter': {
        const fyMonth = (m - 3 + 12) % 12;            // 0 = April
        let qStartFy = Math.floor(fyMonth / 3) * 3;   // 0,3,6,9
        let startMonth = qStartFy + 3;                // calendar month index (may exceed 11)
        if(key === 'last_quarter'){ startMonth -= 3; }
        const startYear = fyStart + Math.floor(startMonth / 12);
        const sm = ((startMonth % 12) + 12) % 12;
        from = new Date(startYear, sm, 1);
        to = new Date(startYear, sm + 3, 0);
        break;
      }
      case 'this_fy': from = new Date(fyStart, 3, 1); to = new Date(fyStart + 1, 2, 31); break;
      case 'last_fy': from = new Date(fyStart - 1, 3, 1); to = new Date(fyStart, 2, 31); break;
      case 'this_year': from = new Date(y, 0, 1); to = new Date(y, 11, 31); break;
    }
    this.f.date_from = from ? this.ymd(from) : '';
    this.f.date_to = to ? this.ymd(to) : '';
    this.applyFilters();
  }
  private ymd(d: Date){
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }
  /* ---------- number helpers ---------- */
  fmt(n:any, code: string = 'INR'){
    const v = Number(n) || 0;
    return v.toLocaleString(code === 'INR' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 });
  }
  pct(part:any, whole:any){
    const w = Number(whole) || 0;
    return w > 0 ? Math.round(((Number(part) || 0) / w) * 100) : 0;
  }
  /* ---------- export filtered invoices to CSV (opens in Excel) ---------- */
  exportCsv(){
    if(this.exporting){ return; }
    this.exporting = true;
    this.appService.postData('target/list', this.buildPayload({ export: 1, page: 1 })).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      this.exporting = false;
      var r:any = res;
      if(!r || !r.success || !r.rows){
        this.toastr.error('Export failed', 'Error');
        return;
      }
      if(!r.rows.length){
        this.toastr.warning('No invoices to export for these filters', 'Nothing to export');
        return;
      }
      const esc = (v:any) => {
        const s = v === null || v === undefined ? '' : String(v);
        return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      const lines: string[] = [];
      lines.push(['S.No','Bill No','Bill Date','Customer','Contact','GST No','Currency','Amount','Advance','Total Amount','Status','Notes'].join(','));
      r.rows.forEach((row:any, i:number) => {
        lines.push([i + 1, row.bill_no, row.bill_date, row.customer, row.contact, row.gst_no, row.currency, row.amount, row.advance, row.total_amount, row.status, row.notes].map(esc).join(','));
      });
      lines.push('');
      lines.push(esc('Filters') + ',' + esc(this.chips.length ? this.chips.map(c => c.label + ': ' + c.value).join(' | ') : 'None (all invoices)'));
      lines.push(['Currency','Records','Total','Paid','Paid Count','Pending','Pending Count','Advance'].join(','));
      [['INR', r.summary && r.summary.inr], ['USD', r.summary && r.summary.usd]].forEach((x:any) => {
        const s = x[1];
        if(s && s.count > 0){ lines.push([x[0], s.count, s.total, s.paid, s.paid_count, s.pending, s.pending_count, s.advance].map(esc).join(',')); }
      });
      if(r.rows.length >= 5000){ lines.push(esc('Note: export limited to first 5000 records')); }
      const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoices_' + this.ymd(new Date()) + (this.chips.length ? '_filtered' : '') + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.toastr.success(r.rows.length + ' invoices exported', 'Downloaded');
    },error=>{
      this.exporting = false;
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
    this.appService.putData('target/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getList();
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }


}
