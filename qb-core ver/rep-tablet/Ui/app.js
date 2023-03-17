REP = {};
REP.Tablet = {};
REP.Tablet.Functions = {};
REP.Tablet.Animations = {};
REP.Tablet.Notifications = {};
REP.Tablet.Notifications.Custom = {};

REP.Tablet.Data = {
    isOpen: false,
    PlayerData: {},
};

REP.Tablet.Config = {}
var found = false;

$(function() {
    $(".success_icon").hide();
    $("#job-app").on("click", function(e) {
        e.preventDefault();
        LoadJobCenter();
    });
    $("#map-open").on("click", function(e) {
        REP.Tablet.Functions.CloseTablet();
        $.post('https://rep-tablet/openMap', JSON.stringify({}));
    });

    $(".tablet__back--mainscreen").on("click", function() { 
        $("#job-screen").fadeOut("1500");
        $("#create-screen").fadeOut("1500");
        $("#group-screen").fadeOut("1500");
        $("#tasks-screen").fadeOut("1500");
        $("#main-screen").show();
    });

    $("#date").html(getDate());    
    $(".tablet__info h3").html(getTime());    

    REP.Tablet.Functions.OpenTablet = function() {
        $("#tablet").fadeIn("1500");
        REP.Tablet.Data.IsOpen = true;
    };

    REP.Tablet.Functions.CloseTablet = function() {
        // $("#job-screen").fadeOut("1500");
        // $("#create-screen").fadeOut("1500");
        // $("#group-screen").fadeOut("1500");
        // $("#tasks-screen").fadeOut("1500");
        $("#tablet").fadeOut("1500");
        $.post('https://rep-tablet/Close');
        REP.Tablet.Data.IsOpen = false;
    };

    REP.Tablet.Animations.BottomSlideUp = function(Object, Timeout, Percentage) {
        $(Object).css({'display':'block'}).animate({
            bottom: Percentage+"%",
        }, Timeout);
    };
    
    REP.Tablet.Animations.BottomSlideDown = function(Object, Timeout, Percentage) {
        $(Object).css({'display':'block'}).animate({
            bottom: Percentage+"%",
        }, Timeout, function(){
            $(Object).css({'display':'none'});
        });
    };
    
    REP.Tablet.Animations.TopSlideDown = function(Object, Timeout, Percentage) {
        $(Object).css({'display':'block'}).animate({
            top: Percentage+"%",
        }, Timeout);
    };
    
    REP.Tablet.Animations.TopSlideUp = function(Object, Timeout, Percentage) {
        $(Object).css({'display':'block'}).animate({
            top: Percentage+"%",
        }, Timeout, function(){
            $(Object).css({'display':'none'});
        });
    };

    REP.Tablet.Animations.fadeInAnim = function(Object, Timeout) {
        $(Object).css({
            'display': 'block',
            'opacity': '1',
            'transition': 'opacity .25s ease'
        }, Timeout);
    };

    REP.Tablet.Animations.fadeOutAnim = function(Object, Timeout) {
        $(Object).css({
            'display': 'block',
            'opacity': '0',
            'transition': 'opacity .25s ease'
        }, Timeout, function(){
            $(Object).css({'display':'none'});
        });
    };

    REP.Tablet.Functions.LoadPlayerData = function(data) {
        REP.Tablet.Data.PlayerData = data;

    }

    REP.Tablet.Functions.LoadConfig = function(data) {
        REP.Tablet.Config = data;
    }


    REP.Tablet.Notifications.Custom.Add = function(icon, title, text, color, timeout, accept, deny) {
        $.post('https://rep-tablet/HasTablet', JSON.stringify({}), function(HasTablet) {
            if (HasTablet) {
                if (REP.Tablet.Notifications.Timeout !== undefined && REP.Tablet.Notifications.Timeout !== null) {
                    clearTimeout(REP.Tablet.Notifications.Timeout);
                }
                REP.Tablet.Notifications.Timeout = null;
                  
                if (timeout == null || timeout == undefined) {
                    timeout = 1500;
                }
                if (color != null && color != undefined) {
                    $(".notification-icon-new").css({"color": color});
                    $(".notification-title-new").css({"color":"#FFFFFF"});    
    
                } else if (color == "default" || color == null || color == undefined) {
                    $(".notification-icon-new").css({"color":"#FFFFFF"});
                    $(".notification-title-new").css({"color":"#FFFFFF"});
                }
                playSound("notify.ogg", "./sounds/", 0.6);
                REP.Tablet.Animations.TopSlideDown(".__tablet--notification-container-new", 600, 1);
                $(".notification-icon-new").html('<i class="'+icon+'"></i>');
                $(".notification-title-new").html(title);
                $(".notification-text-new").html(text);
                $(".notification-time-new").html("just now");
                if (accept != "NONE"){
                    $(".notification-accept").html('<i class="'+accept+'"></i>');
                }
                if (deny != "NONE"){ 
                    $(".notification-deny").html('<i class="'+deny+'"></i>');
                }
    
                if (timeout != "NONE"){
                    if (REP.Tablet.Notifications.Timeout !== undefined && REP.Tablet.Notifications.Timeout !== null) {
                        clearTimeout(REP.Tablet.Notifications.Timeout);
                    }
                    REP.Tablet.Notifications.Timeout = setTimeout(function(){
                        REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container-new", 600, -10);
                        REP.Tablet.Notifications.Timeout = setTimeout(function(){
                        }, 500)
                        REP.Tablet.Notifications.Timeout = null;
                    }, timeout);
                };
            };
        });
    };

    REP.Tablet.Notifications.Add = function(icon, title, text, color, timeout) {
        $.post('https://rep-tablet/HasTablet', JSON.stringify({}), function(HasTablet) {
            if(HasTablet) {
                if (timeout == null && timeout == undefined) {
                    timeout = 1500;
                }
        
                if (REP.Tablet.Notifications.Timeout == undefined || REP.Tablet.Notifications.Timeout == null) {
                    if (color != null || color != undefined) {
                        $(".notification-icon").css({"color":color});
                        $(".notification-title").css({"color":color});
                    } else if (color == "default" || color == null || color == undefined) {
                        $(".notification-icon").css({"color":"#e74c3c"});
                        $(".notification-title").css({"color":"#e74c3c"});
                    }

                    REP.Tablet.Animations.TopSlideDown(".__tablet--notification-container", 600, 1);
                    $(".notification-icon").html('<i class="'+icon+'"></i>');
                    $(".notification-title").html(title);
                    $(".notification-text").html(text);
                    $(".notification-time").html("just now");
                    if (timeout != "NONE"){
                        if (REP.Tablet.Notifications.Timeout !== undefined || REP.Tablet.Notifications.Timeout !== null) {
                            clearTimeout(REP.Tablet.Notifications.Timeout);
                        }
                        REP.Tablet.Notifications.Timeout = setTimeout(function(){
                            REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container", 600, -10);
    
                            REP.Tablet.Notifications.Timeout = setTimeout(function(){

                        }, 500)
                            REP.Tablet.Notifications.Timeout = null;
                        }, timeout);
                    }
                } else {
                    if (color != null || color != undefined) {
                        $(".notification-icon").css({"color":color});
                        $(".notification-title").css({"color":color});
                    } else {
                        $(".notification-icon").css({"color":"#e74c3c"});
                        $(".notification-title").css({"color":"#e74c3c"});
                    }

                    $(".notification-icon").html('<i class="'+icon+'"></i>');
                    $(".notification-title").html(title);
                    $(".notification-text").html(text);
                    $(".notification-time").html("just now");
                    if (timeout != "NONE"){
                        if (REP.Tablet.Notifications.Timeout !== undefined || REP.Tablet.Notifications.Timeout !== null) {
                            clearTimeout(REP.Tablet.Notifications.Timeout);
                        }
                        REP.Tablet.Notifications.Timeout = setTimeout(function(){
                            REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container", 600, -10);
                            REP.Tablet.Notifications.Timeout = setTimeout(function(){

                            }, 500)
                            REP.Tablet.Notifications.Timeout = null;
                        }, timeout);
                    }
                }
            }
        });
    }

    $(document).on('click', ".__tablet--notification-container", function() {
        REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container", 600, -10);
        REP.Tablet.Notifications.Timeout = null;
    })
    
    $(document).on('click', ".notification-accept", function() {
        $.post('https://rep-tablet/AcceptNotification', JSON.stringify({}));
        REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container-new", 600, -10);
        REP.Tablet.Notifications.Timeout = null;
    });
    
    $(document).on('click', ".notification-deny", function() {
        $.post('https://rep-tablet/DenyNotification', JSON.stringify({}));
        REP.Tablet.Notifications.Timeout = null;
        REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container-new", 600, -10);
    });    

    $("body").on("keyup", function (e) {
        if (e.which == 27) {
            REP.Tablet.Functions.CloseTablet();
        };
    });

    window.addEventListener('message', function(e) {
        if (e.data.action === 'open') {
            // $("#tasks-screen").hide();
            // $("#group-screen").hide();
            // $("#create-screen").hide();
            // $("#job-screen").hide();
            $("#user-name").html(e.data.name);
            REP.Tablet.Functions.LoadPlayerData(e.data.data);
            REP.Tablet.Functions.OpenTablet();
            REP.Tablet.Data.isOpen = true;
        } else if (e.data.action === 'CustomNotification') {
            REP.Tablet.Notifications.Add(e.data.TabletNotify.icon, e.data.TabletNotify.title, e.data.TabletNotify.text, e.data.TabletNotify.color, e.data.TabletNotify.timeout);
        } else if (e.data.action === 'loadConfig') {
            REP.Tablet.Functions.LoadConfig(e.data.config);
        } else if (e.data.action === 'ReQuest') {
            REP.Tablet.Notifications.Custom.Add(e.data.TabletNotify.icon, e.data.TabletNotify.title, e.data.TabletNotify.text, e.data.TabletNotify.color, e.data.TabletNotify.timeout, e.data.TabletNotify.accept, e.data.TabletNotify.deny);
        } else if (e.data.action==='closeCustomNotification'){
            REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container-new", 600, -10);
        } else if (e.data.action === 'closeAllNotification'){
            REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container-new", 600, -10);
            REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container", 600, -10);
        }
    });

    function getDate() {
        var date = new Date();
        var day = date.getDay();
        var fristDay = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
        var year = date.getFullYear();
        var dayArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var occasion = dayArray[day];
        var currentDate = occasion + ", " + fristDay + "/" + month + "/" + year;
        return currentDate;
    };

    function getTime() {
        var date = new Date();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var amOrPm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; 
        minute = minute < 10 ? '0'+ minute : minute;
        var strTime = `${hour}:${minute}<span> ${amOrPm}</span>`;
        return strTime;
    };
    
    $("#search").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".tablet__job--item").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
}); 
