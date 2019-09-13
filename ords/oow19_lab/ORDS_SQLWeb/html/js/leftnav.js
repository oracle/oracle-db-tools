var baseUrl = "https://apexapps.oracle.com/pls/apex/oll/oll";
var windowWidth = $(window).width();
var inLearningPath = false;
var appuser = '';
var appsession = '';
var contentid = '';
var activityname = '';
var eventid = '';
var OBECompleted = false;
var handled = false;

//Initialization when page loads
$(document).ready(function(){
    if (window.top !== window) {
        $("body").addClass("embed");
    }
  
    //Check if OBE was started within a learning path
    inLearningPath = getParameter("learningpath", location.href);
    if (inLearningPath == "true") {
        //Get parameters required to record completion for learning path
        inLearningPath = true;
        appuser        = getParameter("appuser",      location.href);
        appsession     = getParameter("appsession",   location.href);
        contentid      = getParameter("contentid",    location.href);
        activityname   = getParameter("activityname", location.href);
        eventid        = getParameter("eventid",      location.href);
    } else {
        //Check to see if this OBE is associated with any learning paths on OLL
        amIPartofALearningPath();
    }
    
    var s_prefix = "OBE";
    if (typeof (document.title) != "undefined") {
        var s_pageName = s_prefix + ":" + document.title
    }
    $.getScript("https://www.oracleimg.com/us/assets/metrics/ora_docs.js");
    
    var toc = $("#toc").tocify({
        selectors: "h2,h3,h4,h5"
    }).data("toc-tocify");

    //prettyPrint();
    //$(".optionName").popover({trigger: "hover"});

    //sets options
    toc.setOptions({extendPage: false, showEffect: "fadeIn", smoothScroll: false});

    // Writes all of the current plugin options to the console
    console.log(toc.options);

    //Set up all events
    bindEvents();
    
    //Set up sidebar
    sidebarfun();
});//end doc ready function


//Initialize event handling
function bindEvents() {
    //Event handling for window scrolling
    var mainnav = $(".left-nav-tut");
    $(window).scroll(function(){
        //Manage left nav
        if( $(this).scrollTop() > $("article").offset().top ) {
            mainnav.addClass("left-nav-tutscrl");
        }else{
            mainnav.removeClass("left-nav-tutscrl");
        }	
        
        //Check OBE completion
        if (inLearningPath == true) {
            checkOBECompletion();
        }
    });//end scroll function
    
    // Show Nav Icon Click
    $("#shownav").keypress(function (e) {
        if (e.keyCode == 13) {
            opensidebar();
            if($("#hidenavw").length > 0) {
                $("#hidenavw").focus();
            } else {
                $("#hidenav").focus();
            }
        }
    });
    $("#shownav").click(function(){
        opensidebar();
        if($("#hidenavw").length > 0) {
            $("#hidenavw").focus();
        } else {
            $("#hidenav").focus();
        }
    });
    
    // Hide Nav Icon Click
    $("#hidenav").click(function(){  
        closesidebar();
        $("#shownav").focus();        
    });
    $("#hidenav").keypress(function (e) {
        if (e.keyCode == 13) {
            closesidebar();
            $("#shownav").focus(); 
        }
    });
    $("#hidenavw").click(function(){
        closesidebar();
        $("#shownav").focus();         
    });
    $("#hidenavw").keypress(function (e) {
        if (e.keyCode == 13) {
            closesidebar();
            $("#shownav").focus(); 
        }
    });
    
    /* Window Resize Event */
    $(window).resize(function(){
        //Resize dialog contents
        //sizeDialogContainer();
        
        // Check window width has actually changed and it's not just iOS triggering a resize event on scroll
        if ($(window).width() != windowWidth) {
            // Update the window width for next time
            windowWidth = $(window).width();

            //Manage sidebar
            sidebarfun();
        }
        // Otherwise do nothing
    });
} //);	//End document.ready


//OBE side bar functions
var sidebarfun = function(){
	if ($(window).width() > 769) { 
        opensidebar();
        $("#hidenav").css('display','none');
        $("#hidenavw").css('display','none');
    } else {
        closesidebar();
    };
};


//Opens OBE side bar
var opensidebar = function(){
    // set width 
    $(".left-nav").css('display','block'); 
    $(".navback").css('width',160+'px');  
    $("#main").css('margin-left',160+'px'); 

     // for search results and tutorials
    $("#sidebar").css('display','block');
    $(".navbackwide").css('width',220+'px'); 
    $("#bookContainer").css('margin-left',220+'px'); 
    
    //hide menu icon
    $("#shownav").css('display','none');
    $("#hidenav").css('display','block');
    $("#hidenavw").css('display','block');//wider nav bars			
};


//Closes OBE side bar
var closesidebar = function(){
    // set width
    $(".left-nav").css('display','none');
    $(".navback").css('width',40+'px');
    $("#main").css('margin-left',40+'px'); 

    
    // for search results and tutorials
    $("#sidebar").css('display','none');
    $(".navbackwide").css('width',40+'px'); 
    $("#bookContainer").css('margin-left',40+'px');
        
    $("#hidenav").css('display','none');
    $("#hidenavw").css('display','none');//wider nav bars
    $("#shownav").css('display','block');            
    //show menu icon				
};


//Learning Path support functions
function amIPartofALearningPath() {
    var obeid = $('meta[name="contentid"]').attr("content");
    var content = "";
    
    if (obeid === undefined || obeid == null ) return; //No processing when obe does not have a content ID set
    
    var url = baseUrl + "/learning_path/" + obeid;

    $.support.cors = true;
    //$.ajaxSetup({ cache: false });

    $.getJSON(url).done(function(data) {
        //Upon success, check results
        if (data.items.length > 0) {
            //Fade in the Popup and add close button
            var popup = $('#dialog');
            $(popup).fadeIn(300);

            //Add the mask to body
            //$('body').append('<div id="mask"></div>');            
            $('#lpModal').append('<div id="mask"></div>');            
            $('#mask').fadeIn(300);
            $('body').css('overflow','hidden');
            
            //Put this event handler here for clean dynamic handling
            //When clicking on the button close or the mask layer close the popup
            $('a.close, #mask, #dialog-close').on("click", function() {
                $('#mask, #dialog, #lpModal').fadeOut(300, function() {
                    $('#lpModal').css('display','none');
                    $('#mask').remove();                    
                });
                $('body').css('overflow','scroll');
                return false;
            });
            
            content= '<div class="modal-body">'
            content += "Click a link to view this tutorial in the context of a learning path.<br/>";
            
            //Start list of links
            content += '<div id="dialog-container">';
            content += '<ul>';

            //Write Learning Library Links
            $.each(data.items, function(i, item) {
                content += '<li class="dialog"><a  target="_blank" href="' + item.link + '">' + item.learning_path + '</a></li>';     
                //Uncomment to test scroller
                /*
                var i;
                for (i = 0; i < 10; i++) { 
                    content += '<li class="dialog"><a  target="_blank" href="' + item.link + '">' + item.learning_path + '</a></li>';
                }
                */
            });
				
            //End list of links
            content += '</ul>';
			content += '</div>';
			content += '<hr class="wide">';
            content += "<p>Or view the tutorial outside a learning path.</p>";
            content += '</div>'
            $('#dialog-content').html(content);
            $('#lpModal').css('display','block');
            sizeDialogContainer();
        } else {
            console.log("Did not find any associated Learning Paths");
            //Continue silently and let user continue standalone
        }
    }).fail(function(e) {
        console.log("Failed to find any associated Learning Paths");
        //Continue silently and let user continue standalone
    });
}


//If OBE is running as part of a learning path then mark it completed
function checkOBECompletion() {
    if (handled == true || OBECompleted == true) return; 
    
	var position = $(window).scrollTop() / $(document).height();
    if(position > .50) {
        handled = true; //This ensures that the completion is only recorded one time
        //Phone home with OBE data to mark OBE as complete
        var url = baseUrl + "/obe_completed/" + appuser + "/" + appsession + "/" + eventid + "/" + contentid + "/" + activityname;
        $.getJSON(url).done(function(data) {
            if (data.status == "SUCCESS") {
                //Upon success, set completion
                //console.log("Successfully set OBE completion");
                OBECompleted = true;
            }
        }).fail(function(e) {
            //console.log("Failed to set OBE completion");
            handled = false; //Allows function to handle completion event again
        });
    }
}


//Set the height of the list of learning paths
function sizeDialogContainer() {
    var diag = $('#obe_dialog');
    var container = $('#dialog-container');
    var diagh = diag.height();
    var diagtop = diag.offset().top;
    var dctop = container.offset().top;
    var diagbot = diagtop + diag.outerHeight(true);
    
    var h = diagbot - dctop - 140;
    if(h>200){
        container.height(200);
    }else{
        container.height(h);
    }
    
}

//Gets URL parameters
function getParameter(name, url) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}
