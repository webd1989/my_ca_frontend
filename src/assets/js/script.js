/* Sidebar :: Start */
$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
    $("#sidebar").hover(function(){
        $('#sidebar').toggleClass("active");
    });
    
});

$(window).resize(function() {
    if ($(window).width() < 768) {
        $('#sidebar').removeClass('active');
    } 
}).resize();
/* Sidebar :: End */

/* Tooltip :: Start */
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
});
/* Tooltip :: End */

/* Status Dropdown :: Start */
$(function(){
   $(".dropdown-menu").on('click', 'a', function(){
       $(this).parents('.dropdown').find('span span').text($(this).text());
   });
});

$(function(){
   $(".dropdown-menu-filter").on('click', 'a', function(){
       $(this).parents('.dropdown').find('span').text($(this).text());
   });
});

function dropdownevent(id, className){
     const a = document.getElementById(id);
    if(className === "assigned"){
        a.classList.add('status-success');
        a.classList.remove('status-wraning');
        a.classList.remove('status-info');
    return;
    }
    else if(className === "dispatch"){
        a.classList.add('status-info');
        a.classList.remove('status-wraning');
        a.classList.remove('status-success');
    return;
    }
    a.classList.add('status-warning');
    a.classList.remove('status-success');
    a.classList.remove('status-info');
};
/* Status Dropdown :: End */

/* Filter Dropdown Checkbox :: Start */

$('.dropdown-menu').on('click', function(e) {
  if($(this).hasClass('dropdown-menu-form')) {
      e.stopPropagation();
  }
});

/* Filter Dropdown Checkbox :: End */

/* Dropify :: Start */
$('.dropify').dropify({
        messages: {
            'default': 'Upload Your Rate Confirmation and Other Files, Or Drop Them Here',
            'replace': 'Drag and drop or click to replace',
            'remove':  'Remove',
            'error':   'Ooops, something wrong happended.'
        }
    });

/* Dropify :: Start */

/* Select 2 :: Start */
$(document).ready(function(){
  $(".del-adddriver").click(function(){
    $(".select-driver-2").css("visibility", "hidden");
    $(".addriver-icon").show();
  });
  $(".addriver-icon").click(function(){
    $(".select-driver-2").css("visibility", "visible");
    $(".addriver-icon").hide();
  });
});

$(function() {
      $('.select2-selection').addClass('form-select');
      $(".select-driver .select2-selection").prepend("<i class='far fa-user' style='color:#aaa;'></i>");
      $(".select-search .select2-selection").prepend("<i class='far fa-search' style='color:#aaa;'></i>");
});
     $("#add-driver").select2({
        theme: "bootstrap5",
        placeholder: "Unassigned",
        allowClear: false,
        
    });
     $("#add-driver-2").select2({
        theme: "bootstrap5",
        placeholder: "Unassigned",
        allowClear: false,
        
    });
     $("#add-truck").select2({
        theme: "bootstrap5",
        placeholder: "Search by Truck #",
        allowClear: false,
        
    });
     $("#add-trailer").select2({
        theme: "bootstrap5",
        placeholder: "Search by Trailer #",
        allowClear: false,
        
    });
     $("#facility-list, #facility-list4, #facility-list5").select2({
        theme: "bootstrap5",
        placeholder: "Choose a Facility",
        allowClear: false,
        
    });
     $("#facility-list1").select2({
        theme: "bootstrap5",
        placeholder: "Choose a Facility",
        allowClear: false,
        
    });
     $("#facility-list2").select2({
        theme: "bootstrap5",
        placeholder: "Choose a Facility",
        allowClear: false
    });
     $("#facility-list3").select2({
        theme: "bootstrap5",
        placeholder: "Choose a Facility",
        allowClear: false
    });
     
     $("#facility-list6").select2({
        theme: "bootstrap5",
        placeholder: "Choose a Facility",
        allowClear: false
    });
     $("#facility-list7").select2({
        theme: "bootstrap5",
        placeholder: "Choose a Facility",
        allowClear: false
    });
     $("#add-customer").select2({
        theme: "bootstrap5",
        placeholder: "Choose a Customer",
        allowClear: false
    });
     $("#customer-branch").select2({
        theme: "bootstrap5",
        placeholder: "Choose a Customer Branch",
        allowClear: false
    });
     $("#load-type").select2({
        theme: "bootstrap5",
        placeholder: "Load Type",
        allowClear: false,
    });
     $("#load-id").select2({
        theme: "bootstrap5",
        placeholder: "ID",
        allowClear: false
    });
     $("#truckstatus").select2({
        theme: "bootstrap5",
        placeholder: "Truck Status",
        allowClear: false
    });
     $("#message-subject").select2({
        theme: "bootstrap5",
        placeholder: "Enter Here",
        allowClear: false
    });
     $("#payment-terms").select2({
        theme: "bootstrap5",
        placeholder: "Payment Terms",
        allowClear: false
    });
     $("#commission-type").select2({
        theme: "bootstrap5",
        placeholder: "Commission Type",
        allowClear: false
    });
     $("#select-tags").select2({
        theme: "bootstrap5",
        placeholder: "Select Tags",
        allowClear: false
    });
     $("#carriers").select2({
        theme: "bootstrap5",
        placeholder: "Select Carriers",
        allowClear: false
    });
     $("#branch-manager").select2({
        theme: "bootstrap5",
        placeholder: "Select Branch Manager",
        allowClear: false
    });
     $("#docs-name").select2({
        theme: "bootstrap5",
        placeholder: "Select Document NAme",
        allowClear: false
    });
     $("#finance-category").select2({
        theme: "bootstrap5",
        placeholder: "Select Category",
        allowClear: false
    });
     $("#income-category").select2({
        theme: "bootstrap5",
        placeholder: "Select Category",
        allowClear: false
    });
     $("#event-type").select2({
        theme: "bootstrap5",
        placeholder: "Select Event Type",
        allowClear: false
    });
     $("#event-type1").select2({
        theme: "bootstrap5",
        placeholder: "Select Event Type",
        allowClear: false
    });
     $("#reason").select2({
        theme: "bootstrap5",
        placeholder: "Select Reason",
        allowClear: false
    });
     $("#reason1").select2({
        theme: "bootstrap5",
        placeholder: "Select Reason",
        allowClear: false
    });
     $("#reason3").select2({
        theme: "bootstrap5",
        placeholder: "Select Reason",
        allowClear: false
    });
     $("#reason4").select2({
        theme: "bootstrap5",
        placeholder: "Select Reason",
        allowClear: false
    });
     $("#flag-type").select2({
        theme: "bootstrap5",
        placeholder: "Select Flag Type",
        allowClear: false
    });
     $("#flag-type1").select2({
        theme: "bootstrap5",
        placeholder: "Select Flag Type",
        allowClear: false
    });
     $("#select-carrier").select2({
        theme: "bootstrap5",
        placeholder: "Select Carrier",
        allowClear: false
    });
     $("#load-booked-by").select2({
        theme: "bootstrap5",
        placeholder: "Load Booked By",
        allowClear: false
    });
     $("#income-category").select2({
        theme: "bootstrap5",
        placeholder: "Select Category",
        allowClear: false
    });
/* Select 2 :: End */

/* To Calendar :: Start */
function ToCalendarDropoff() {
    if (document.getElementById('dropofffcfs').checked) {
        document.getElementById('toCalandarBoxdropoff').style.display = 'block';
    }
    else document.getElementById('toCalandarBoxdropoff').style.display = 'none';
}
function ToCalendarDropoff1() {
    if (document.getElementById('dropofffcfs1').checked) {
        document.getElementById('toCalandarBoxdropoff1').style.display = 'block';
    }
    else document.getElementById('toCalandarBoxdropoff1').style.display = 'none';
}
function ToCalendarPickup() {
    if (document.getElementById('pickupfcfs').checked) {
        document.getElementById('toCalandarBoxpickup').style.display = 'block';
    }
    else document.getElementById('toCalandarBoxpickup').style.display = 'none';
}
function ToCalendarPickup1() {
    if (document.getElementById('pickupfcfs1').checked) {
        document.getElementById('toCalandarBoxpickup1').style.display = 'block';
    }
    else document.getElementById('toCalandarBoxpickup1').style.display = 'none';
}
/* To Calendar :: end */

/* Toggle hide & show :: Start */
    $('.toggle-trigger').click(function(){
        $(this).closest('.toggle-trigger').toggleClass('active');
        $(this).closest('.toggle-block').find('.toggle-able').stop().toggle();
    });
/* Toggle hide & show :: End */

/* Edit content :: Start */
document.querySelectorAll("p.edit-text, h6.edit-text").forEach(function(node){
    node.ondblclick=function(){
        var val=this.innerHTML;
        var input=document.createElement("textarea");
        input.setAttribute('rows', 3);
        input.className = 'form-control';
        input.value=val;
        input.onblur=function(){
            var val=this.value;
            this.parentNode.innerHTML=val;
        }
        this.innerHTML="";
        this.appendChild(input);
        input.focus();
    }
});
// update edit content
$('.edit-content .edit-text').dblclick(function(){
    $(this).closest('.edit-content').find('.update-content').stop().show();
});
$('.update-content').click(function(){
    $(this).closest('.edit-content').find('.update-content').stop().hide();
});
// alert successful popup
$(".sendButton").click(function(){
      $(".toast").show();
      setTimeout(function(){
        $(".toast").hide();
      }, 3000);
    });
    $(".sendButton .close").click(function(){
        $(".toast").hide();
    });
/* Edit content :: End */

$(document).ready(function(){
  $(".hide-tracking").click(function(){
    // 
    $(".view-side-area").toggleClass("active");
  });
});


