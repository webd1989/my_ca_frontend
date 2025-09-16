import { Component, OnInit,OnDestroy } from '@angular/core';
declare var $: any;
import { ServiceService } from '../../services/service.service';
import { Router,ActivatedRoute } from '@angular/router';
import {from, noop, of, Subject} from 'rxjs';
import {map, mergeAll, mergeMap, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { DatepickerOptions } from 'ng2-datepicker';
import { getYear } from 'date-fns';
import locale from 'date-fns/locale/en-US';

@Component({
  selector: 'app-company-view',
  templateUrl: './company-view.component.html',
  styleUrls: ['./company-view.component.css']
})
export class CompanyViewComponent implements OnInit,OnDestroy {

  tasks:any;
  notes:any;
  activities:any;
  accounts:any;
  deals:any;
  contacts:any;
  p: number = 1;
  p2: number = 1;
  p3: number = 1;
  p4: number = 1;
  total: number = 0;
  total2: number = 0;
  total3: number = 0;
  total4: number = 0;
  heading:any = '';
  contact_heading:any = '';
  task_heading:any = '';
  action:any = '';
  contact_action:any = '';
  type:any='p_call';
  n_type:any='p_call';
  task_type:any='p_call';
  show_task_type:any='Call';
  activity_type:any='new';
  userData:any;
  companyData:any;
  taskData:any;
  ownerData:any;
  taskList:any;
  userID:number | undefined;
  preffered_communication:any='p_call';
  preffered_communication_contact:any='p_call';
  accountInfoShow = false;
  shipperInfoShow = false;
  activity_timeline_filters = false;
  task_contact_div = true;
  accountOnwerName:any;
  f_type:any = "";
  total_task:number = 0;
  total_contacts:number=0;
  show_contact_card = false;
  selectedContact:number = 0;
  currentTab = 'Overview';
  noteHeading:any;
  noteAction:any = '';
  total_notes = 0;

  destroy$ = new Subject();

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
    this.getCompanyDetails();
    this.GetOwnerProfile();
    this.getTasks();
    
    //this.getCompanyDeals();
    //this.getCompanyContacts();
    //this.getCompanyTasks();
    this.getActivities();
    //this.getCompanies();
    this.CompanyOverView();
  }
  cleanContactForm(){
    $('#contact_name').val('');
    $('#contact_phone').val('');
    $('#contact_email').val('');
    $('#contact_phone_ext').val('');   
    $('#contact_city').val('');  
    $('#contact_state').val('');  
    $('#contact_country').val('');  
    $('#contact_zipcode').val(''); 
    $('#contact_linkedin').val('');   
    $('#contact_mobile').val('');  
    $('#contact_job_title').val('');
    this.preffered_communication_contact='p_call';
  }
  choosePrefferedCommunicationContact(id:string){
    $('.preffered_contact').removeClass('active_btn');
    $('#'+id).addClass('active_btn');
    this.preffered_communication_contact = id;
  }
  CreateContact(){
    if($.trim($('#contact_name').val()) == ''){
      $('#contact_name').addClass('error_validation');
    }
    $('#createContactBtn').html('Processing...');
    var other_preffered_communication = '';
    if(this.preffered_communication_contact == 'p3_others'){
     other_preffered_communication = $('#other_preffered_communication').val();
    }
    const data = {
      id:$('#contact_r_id').val(),
      name:$('#contact_name').val(),
      phone:$('#contact_phone').val(),
      email:$('#contact_email').val(),
      phone_ext:$('#contact_phone_ext').val(),
      city:$('#contact_city').val(),
      state:$('#contact_state').val(),
      zipcode:$('#contact_zipcode').val(),
      country:$('#contact_country').val(),
      preffered_communication:this.preffered_communication_contact,
      other_preffered_communication:other_preffered_communication,
      linkedin:$('#contact_linkedin').val(),
      source:$('#contact_source').val(),
      company_id:$('#contact_company_id').val(),
      mobile:$('#contact_mobile').val(),
      job_title:$('#contact_job_title').val()
    };
    if(this.contact_action == 'Add'){
      this.appService.postData('contact/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#createContactBtn').html('Save');
        if(r.success){
          this.getCompanyContacts();
          this.cleanContactForm();
          this.toastr.success(r.message, 'Success');
          $('#closeContactBtn').trigger('click');
        }else{
          this.toastr.error(r.message, 'Error');
        }
      },error =>{
      });
    }
    if(this.contact_action == 'Edit'){
      this.appService.postData('contact/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#createContactBtn').html('Save');
        if(r.success){
          this.getCompanyContacts();
          this.cleanContactForm();
          this.toastr.success(r.message, 'Success');
          $('#closeContactBtn').trigger('click');
        }else{
          this.toastr.error(r.message, 'Error');
        }
      },error =>{
      });
    }
    
  }
  DeleteNote(userID:string){
    Swal.fire({
      title: 'Are you sure?',
      text: 'This process is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
      }).then((result) => {
      if (result.value) {
        this.updateNoteStatus(userID,'3');
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
  updateNoteStatus(userID:string,status:string){
    const data = {};
    this.appService.putData('notes/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getNotes();
    },error=>{
      this.toastr.error("Server Error","Error");
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
        this.updateTaskStatus(userID,'3');
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
  updateTaskStatus(userID:string,status:string){
    const data = {};
    this.appService.putData('task/status/update/'+userID+'/'+status,data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.getTasks();
    },error=>{
      this.toastr.error("Server Error","Error");
    });
  }
  SetActivityType(type:string){
    if(type == 'new'){
        $('#new_activity_btn').removeClass('li_active_dull');
        $('#new_activity_btn').addClass('li_active');
        $('#new_complete_task_btn').addClass('li_active_dull');
        $('#new_complete_task_btn').removeClass('li_active');

        $('#Tracking').removeClass('show active');
    $('#LoadDetails').addClass('show active');
    
    }else{
      $('#new_complete_task_btn').addClass('li_active');
      $('#new_complete_task_btn').removeClass('li_active_dull');
      $('#new_activity_btn').addClass('li_active_dull');
      $('#new_activity_btn').removeClass('li_active');

      $('#LoadDetails').removeClass('show active');
    $('#Tracking').addClass('show active');
    }
    this.activity_type = type;
    //this.getCompanyDeals();
    //this.getCompanyContacts();
    //this.getCompanyTasks();
    //this.CompanyOverView();
  }
  removeError(id:string){
    $('#'+id).removeClass('error_validation');
  }
  SetTaskContact(type:string){
    if(type == 'task'){
      this.task_contact_div = true;
        $('#task_tab_btn').removeClass('li_active_dull');
        $('#task_tab_btn').addClass('li_active');
        $('#contact_tab_btn').addClass('li_active_dull');
        $('#contact_tab_btn').removeClass('li_active');
        
    }else{
      this.task_contact_div = false;
      $('#contact_tab_btn').addClass('li_active');
      $('#contact_tab_btn').removeClass('li_active_dull');
      $('#task_tab_btn').addClass('li_active_dull');
      $('#task_tab_btn').removeClass('li_active');
    }
  }
  SetOverviewActivityTimeline(type:string){
    if(type == 'overview'){
      this.currentTab ='Overview';
      this.activity_timeline_filters = false;
        $('#overview_btn').removeClass('li_active_dull');
        $('#overview_btn').addClass('li_active');
        $('#activity_timeline_btn').addClass('li_active_dull');
        $('#activity_timeline_btn').removeClass('li_active');
        $('#notes_btn').addClass('li_active_dull');
        $('#notes_btn').removeClass('li_active');
        this.getActivities();
        this.p2 = 1;
    }else if(type == 'activity_timeline'){
      this.currentTab ='Activity';
      this.activity_timeline_filters = true;
      $('#activity_timeline_btn').addClass('li_active');
      $('#activity_timeline_btn').removeClass('li_active_dull');
      $('#overview_btn').addClass('li_active_dull');
      $('#overview_btn').removeClass('li_active');
      $('#notes_btn').addClass('li_active_dull');
      $('#notes_btn').removeClass('li_active');
    }else{
      this.currentTab ='Notes';
      this.activity_timeline_filters = false;
      $('#notes_btn').removeClass('li_active_dull');
      $('#notes_btn').addClass('li_active');
      $('#activity_timeline_btn').addClass('li_active_dull');
      $('#activity_timeline_btn').removeClass('li_active');
      $('#overview_btn').addClass('li_active_dull');
      $('#overview_btn').removeClass('li_active');
      this.p4 = 1;
      this.getNotes();
    }
  }
  CompanyOverView(){
    const data = {
      token: localStorage.getItem('token'),
      company_id:this.userID
    };
    this.appService.postData('company/overview',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.deals = r.deals;
      this.contacts = r.contacts;
      this.taskList = r.tasks;
      this.accountOnwerName = r.account_owner;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  setTaskType(type:string){
    this.task_type = type;
    if(type == 'p_call'){
      this.show_task_type = 'Call';
    }
    if(type == 'p_email'){
      this.show_task_type = 'Email';
    }
    if(type == 'p_text'){
      this.show_task_type = 'Text';
    }
    
  }
  GetOwnerProfile(){
    this.appService.getData('profile/get').pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.ownerData = r.user_date;
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
  getCompanyDeals(){
    const data = {
      token: localStorage.getItem('token'),
      company_id:this.userID
    };
    this.appService.postData('company/deal/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.deals = r.deals;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  getCompanyContacts(){
    const data = {
      token: localStorage.getItem('token'),
      company_id:this.userID,
      page: this.p3
    };
    this.appService.postData('company/contact/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.contacts = r.contacts;

      this.contacts = r.contacts.data;
      this.total3 = r.contacts.total;
      this.total_contacts = r.total_contacts;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  getCompanyTasks(){
    const data = {
      token: localStorage.getItem('token'),
      company_id:this.userID
    };
    this.appService.postData('task/list/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.taskList = r.tasks;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  selectTask(task:any){
    this.SetActivityType('completed');
    this.activity_type = 'completed';
    $('#LoadDetails').removeClass('show active');
    $('#Tracking').addClass('show active');
    //$('#n_deal_id').val(task.deal_id);
    $('#c_deal_id').val(task.deal_id);
    //$('#n_contact_id').val(task.contact_id);
    $('#c_contact_id').val(task.contact_id);
    //$('#n_task_name').val(task.task_name);
    $('#c_task_id').val(task.id)
    this.n_type = task.type;
  }
  getCompanies(){
    const data = {
      token: localStorage.getItem('token')
    };
    this.appService.postData('company/list/simply',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.accounts = r.users;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  setHeading(){
    this.action = 'Add';
    this.heading = 'Create a Task';
    this.cleanForm();
  }
  setNoteHeading(){
    this.noteAction = 'Add';
    this.noteHeading = 'Create a Note';
    $('#company_notes').val('');
  }
  setContactHeading(){
    this.contact_action = 'Add';
    this.contact_heading = 'Create a Contact';
    //this.cleanForm();
  }
  cleanForm(){
    $('#company_id').val('');
    $('#deal_id').val('');
    $('#contact_id').val('');
    //$('#task_name').val('');  
    $('#task_notes').val('');
    $('#task_date').val('');  
    $('#start_time').val('');  
    $('#end_time').val('');  
    this.type ='p_call';
  }
  CreateShortTask(day:any){
    const data = {
      type:this.task_type,
      day:day,
      company_id:this.userID
    };
    this.appService.postData('task/short/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.getTasks();
        this.cleanForm();
        this.toastr.success(r.message, 'Success');
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  createActivity(){
    $('#n_log_btn').html('Processing...');
    const data = {
      company_id:this.userID,
      deal_id:$('#n_deal_id').val(),
      contact_id:$('#n_contact_id').val(),
      task_name:$('#n_task_name').val(),
      description:$('#n_desciption').val(),
      result:$('#n_result').val(),
      type:this.n_type,
      save_type:'New'
    };$('#task_notes').val('');
    this.appService.postData('activity/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#n_log_btn').html('Log Activity');
      if(r.success){
        this.getTasks();
        this.getCompanyTasks();
        this.getActivities();
       // this.cleanForm();
        this.toastr.success(r.message, 'Success');
       // $('#closeBtn').trigger('click');
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  createCompleteActivity(){
    $('#c_log_btn').html('Processing...');
    const data = {
      company_id:this.userID,
      task_id:$('#c_task_id').val(),
      deal_id:$('#c_deal_id').val(),
      contact_id:$('#c_contact_id').val(),
      description:$('#c_desciption').val(),
      result:$('#c_result').val(),
      save_type:'Complete'
    };
    this.appService.postData('activity/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      $('#c_log_btn').html('Submit');
      if(r.success){
        this.toastr.success(r.message, 'Success');
        this.getTasks();
        this.getCompanyTasks();
        this.getActivities();
       // this.cleanForm();
        
       // $('#closeBtn').trigger('click');
      }else{
        this.toastr.error(r.message, 'Error');
      }
    },error =>{
    });
  }
  Create(){
    $('#addUserBtn').html('Processing...');
    const data = {
      id:$('#task_id').val(),
      company_id:this.userID,
      deal_id:$('#deal_id').val(),
      contact_id:$('#contact_id').val(),
      task_name:'',
      task_notes:$('#task_notes').val(),
      task_date:$('#task_date').val(),
      start_time:$('#start_time').val(),
      end_time:$('#end_time').val(),
      type:this.type,
    };
    if(this.action == 'Add'){
      this.appService.postData('task/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#addUserBtn').html('Save');
        if(r.success){
          this.CompanyOverView();
          this.getTasks();
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
      this.appService.postData('task/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#addUserBtn').html('Save');
        if(r.success){
          this.CompanyOverView();
          this.getTasks();
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
  CreateNote(){
    $('#addNoteBtn').html('Processing...');
    const data = {
      company_notes:$('#company_notes').val(),
      company_id:this.userID,
      id:$('#note_id').val(),
    };
    if(this.noteAction == 'Add'){
      this.appService.postData('notes/create',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#addNoteBtn').html('Save');
        if(r.success){
          this.getNotes();
          $('#company_notes').val('');
          this.toastr.success(r.message, 'Success');
          $('#closeNoteBtn').trigger('click');
        }else{
          this.toastr.error(r.message, 'Error');
        }
      },error =>{
      });
    }
    if(this.noteAction == 'Edit'){
      this.appService.postData('notes/update',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
        var r:any=res;
        $('#addNoteBtn').html('Save');
        if(r.success){
          this.getNotes();
          $('#company_notes').val('');
          this.toastr.success(r.message, 'Success');
          $('#closeNoteBtn').trigger('click');
        }else{
          this.toastr.error(r.message, 'Error');
        }
      },error =>{
      });
    }
    
  }
  choosePrefferedCommunication(id:string){
    $('.preffered').removeClass('active_btn');
    //$('.preffered2').removeClass('active_btn');
    $('#'+id).addClass('active_btn');
    this.type = id;
  }
  choosePrefferedCommunicationN(id:string){
    $('.preffered2').removeClass('active_btn');
    //$('.preffered').removeClass('active_btn');
    $('#'+id).addClass('active_btn');
    this.n_type = id;
  }
  selectActivityTimelineFilter(id:string){
    this.f_type = id;
    $('.filter_tabs').removeClass('active_btn');
    $('#'+id).addClass('active_btn');
    
  }
  pageChangeEvent(event: number){
    this.p = event;
    this.getTasks();
  }
  pageChangeEvent3(event: number){
    this.p3 = event;
    this.getCompanyContacts();
  }
  pageChangeEvent4(event: number){
    this.p4 = event;
    this.getNotes();
  }
  accountInfoShowHide(){
    $('#account_info_div').slideToggle();
    if(!this.accountInfoShow){
      this.accountInfoShow = true;
    }else{
      this.accountInfoShow = false;
    }
  }
  showHideShipperInfo(){
    $('#shipper_info_div').slideToggle();
    if(!this.shipperInfoShow){
      this.shipperInfoShow = true;
    }else{
      this.shipperInfoShow = false;
    }
  }
  getActivities(){
    const data = {
      token: localStorage.getItem('token'),
      company_id: this.userID,
      page: this.p2
    };
    this.appService.postData('activity/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.activities = r.activities.data;
      this.total2 = r.activities.total;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  getNotes(){
    const data = {
      token: localStorage.getItem('token'),
      company_id: this.userID,
      page: this.p4
    };
    this.appService.postData('notes/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.notes = r.notes;
      //this.total4 = r.notes.total;
      this.total_notes = r.total_notes;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  getTasks(){
    const data = {
      token: localStorage.getItem('token'),
      company_id: this.userID,
      page: this.p
    };
    this.appService.postData('task/list',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      this.tasks = r.tasks.data;
      this.total = r.tasks.total;
      this.total_task = r.total_task;
    },error=>{
      //this.toastr.error("Server Error","Error");
    });
  }
  getNoteData(id:number){
    this.noteHeading = 'Edit Note';
    this.noteAction = 'Edit';
    const data = {
      token: localStorage.getItem('token'),
      id: id
    };
    this.appService.postData('notes/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        $('#company_notes').val(r.note_data.notes);
        $('#note_id').val(r.note_data.id);
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
  getTaskData(id:number){
    this.action = 'Edit';
    const data = {
      token: localStorage.getItem('token'),
      id: id
    };
    this.appService.postData('task/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        this.taskData = r.task_data;
        console.log(r.task_data.task_date);
        //$('#task_name').val(r.task_data.task_name);
        $('#task_notes').val(r.task_data.task_notes);
        $('#deal_id').val(r.task_data.deal_id);
        $('#contact_id').val(r.task_data.contact_id);
        this.type = r.task_data.type;
        $('#task_date').val(r.task_data.task_formated_date);
        $('#start_time').val(r.task_data.start_time);
        $('#end_time').val(r.task_data.end_time);
        $('#task_id').val(r.task_data.id);
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
  getTaskDeatils(id:number){
    $('#selected_contact_name').html('Loading Contact Info....');
    this.show_contact_card = true;
    this.task_heading = 'Edit an Account';
    this.action = 'Edit';
    const data = {
      token: localStorage.getItem('token'),
      id: id
    };
    this.appService.postData('contact/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
        $('#selected_contact_name').html(r.user.name);
        $('#selected_contact_email').html(r.user.email+', '+r.user.phone);
        $('#selected_contact_address').html(r.user.city+', '+r.user.state+', '+r.user.country+', '+r.user.zipcode);
        $('#selected_contact_extra_info').html('<b>Source: </b>'+r.user.source+' | <b>Linkedin: </b>'+r.user.linkedin);
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
  getCompanyDetails(){
    const data = {
      token: localStorage.getItem('token'),
      id: this.userID
    };
    this.appService.postData('company/get',data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      var r:any=res;
      if(r.success){
       this.userData = r.user;
       this.companyData = r;
          $('#address').val(r.user.address);
          $('#city').val(r.user.city);
          $('#state').val(r.user.state);
          $('#zipcode').val(r.user.zipcode);
          $('#country').val(r.user.country);
          $('#phone').val(r.user.phone);
          $('#phone_ext').val(r.user.phone_ext);
          $('#email').val(r.user.email);
          $('#source').val(r.user.source);
          $('#preffered_communication').val(r.user.source);
          $('#description').val(r.user.source);
          $('#industry').val(r.user.industry);
          $('#annual_revenue').val(r.user.annual_revenue);
          $('#equipment_types').val(r.equipment_types);
          $('#modes').val(r.modes);
          $('#pain_paints').val(r.pain_paints);
          $('#shipment').val(r.user.shipment);
          $('#pick_drops').val(r.pick_drops);
          $('#special_requirements').val(r.user.special_requirements);
          $('#contracted').val(r.contracted);
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

