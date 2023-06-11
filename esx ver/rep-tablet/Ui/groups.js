var loadScreen = 7500; // Dont Touch This
var loadSuccess = 6000; // Dont Touch This
var min = 5000; // 5 seconds
var max = 10000; // 10 seconds
var minutes = 00; 
var seconds = 00; 
var tens = 00;
var appendTens = document.getElementById("tens");
var appendSeconds = document.getElementById("seconds");
var appendminutes = document.getElementById("minutes");
var Interval;
var groupID;
var data1;
var data2;
var jobPlayer;
var randomTime = Math.floor(Math.random() * (max - min + 1)) + min;
let notReadyButtonAdded = false;

$(document).on("click", "#create-group", function(e) {
    e.preventDefault();
    $("#main-screen").hide();
    $("#create-screen").hide();
    $(".success_icon").hide();
    $(".text p").html("Please Wait...");
    $(".loader__wrapper").show();
    $("#loader-screen").show();
    setTimeout(function() {
        $(".loader__wrapper").hide();
        $(".success_icon").show();
        $(".text p").html("Created successfully!");
    }, loadSuccess);
    setTimeout(function() {
        $("#loader-screen").fadeOut("1500");
        $("#group-screen").fadeIn("1500");
        $.post("https://rep-tablet/CreateJobGroup", JSON.stringify({}), function() {});
    }, loadScreen);
});

function showNotification() {
    playSound("notify.ogg", "./sounds/", 0.6);
    $.post("https://rep-tablet/readyToJob", JSON.stringify({}), function() {});
}

function playSound(file, dir, volume) {
    var audio = new Audio(dir+file);
    audio.volume = volume;
    audio.play();
}

function closeAllScreen() {
    $("#job-screen").hide();
    $("#create-screen").hide();
    $("#group-screen").hide();
    $("#tasks-screen").hide();
}

$(document).on("click", "#check-out", function(e) {
    e.preventDefault();
    $.post("https://rep-tablet/checkOut", JSON.stringify({}), function() {});
});

$(document).on("click", "#job-ready", function(e) {
    e.preventDefault();
    $("#job-ready").addClass("checked");
    $("#job-ready p").text("waiting for job...");
    $(".spinner").removeClass("bxs-briefcase").addClass("bx-loader-alt spin");
    
    if (!$("#job-notready").length) {
        $("#room-actions").append(
          '<button class="btn animate__animated animate__fadeInRight" id="job-notready">' +
            '<p>not ready</p>' +
            '<i class="fa-regular fa-circle-xmark"></i>' +
          '</button>'
        );
    }
    setTimeout(showNotification, REP.Tablet.Config[jobPlayer].time.first);
});

$(document).on("click", "#job-notready", function(e) {
    e.preventDefault();
    $("#job-ready").removeClass("checked");
    $("#job-ready p").text("ready for work");
    $(".spinner").removeClass("bx-loader-alt spin").addClass("bxs-briefcase");
    $("#job-notready").remove();
    notReadyButtonAdded = false;
    REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container-new", 600, -10);
});

$(document).on("click", "#join-group", function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    $.post("https://rep-tablet/RequestToJoin", JSON.stringify({id: id}), function() {});
});

$(document).on("click", "#disband-group", function(e) {
    var id = $(this).data('id');
    $.post("https://rep-tablet/DisbandGroup", JSON.stringify({id: id}), function() {});
});

$(document).on("click", "#leave-group", function(e) {
    var id = $(this).data('id');
    $.post("https://rep-tablet/LeaveGroup", JSON.stringify({id: id}), function() {});
});

$(document).on("click", "#expand-modal", function(e) {
    e.preventDefault();
    $("#task-overlay").fadeIn("1500");
    $("#task-modal").fadeIn("1500");
});

$(document).on("click", "#task-close", function(e) {
    e.preventDefault();
    $("#task-overlay").fadeOut("1500");
    $("#task-modal").fadeOut("1500");
});

function addGroupJobs(data) {
    if (data.status == true) {
        closeAllScreen();
        $("#tasks-screen").show();
        let tasksPerRow = 2;
        $("#tasks-list").html("");
        clearInterval(Interval);
        Interval = setInterval(startTimer, 10);
        let rowHTML = '';
        let taskCounter = 0;
        for (const [k, v] of Object.entries(data.stage)) {
            let max = 1;
            let count = 0;
            if (v.max) max = v.max;
            if (v.count) count = v.count;
        
            if (taskCounter % tasksPerRow === 0) {
                rowHTML += '<div class="row">';
            }
        
            let addOption;
            if (v.isDone) {
                addOption =
                `
                    <div class="__tablet--task-item">
                        <i class="fa-solid fa-expand expand__icon" id="expand-modal"></i>
                        <i class="fa-solid fa-business-time task__icon"></i>
                        <div class="task__name isDone">${v.name}</div>
                        <div class="progress--task">
                            <i class="fa-solid fa-circle-check ${v.id}" style="color: rgb(51, 237, 0);"></i>
                            <p><span id="task-done" style="color: rgb(51, 237, 0);">${max}</span> / <span class="task-require">${max}</span></p>
                        </div>
                    </div>
                `;
            } else {
                addOption =
                `
                    <div class="__tablet--task-item">
                        <i class="fa-solid fa-expand expand__icon" id="expand-modal"></i>
                        <i class="fa-solid fa-business-time task__icon"></i>
                        <div class="task__name">${v.name}</div>
                        <div class="progress--task">
                            <i class="fa-solid fa-circle-info ${v.id}" style="color: rgb(255, 52, 52);"></i>
                            <p><span id="task-count" style="color: rgb(255, 52, 52);">${count}</span> / <span class="task-require">${max}</span></p>
                        </div>
                    </div>
                `;
            }
    
    
            rowHTML += addOption;
            taskCounter++;
    
            if (taskCounter % tasksPerRow === 0) {
                rowHTML += '</div>';
            } else {
                rowHTML += '<div class="connect-line"></div>';
            }
            $(".__tablet--modal-content").html(v.name);
        }
        $("#tasks-list").append(rowHTML);
    } else {
        closeAllScreen();
        $("#group-screen").show();
        var memberList = $('.__tablet--member-list');
        memberList.html("");
        var itemCounter = 0;
        var rowHTML = '<div class="row">';
        var leaderName = "";
        var leaderCID = 0
        for (const [k, v] of Object.entries(data.members)) {
            if (v.player === data.leader) {
                leaderName = v.name;
                leaderCID = v.cid;
            }
        }
        var leaderHTML = '<div class="__tablet--member-item" id="leader-item">';
            leaderHTML += '<i class="fa-solid fa-user-graduate"></i>';
            leaderHTML += '<div class="__tablet--member-role">leader</div>';
            leaderHTML += '<div class="__tablet--member-name">' + leaderName + '</div>';
            leaderHTML += '<span><i class="fa-solid fa-circle online"></i></span>';
            leaderHTML += '</div>';
            rowHTML += leaderHTML;
            itemCounter++;
        
            for (const [k, v] of Object.entries(data.members)) {
                if (k > 0) {
                    var memberHTML = '<div class="__tablet--member-item" id="member-item">';
                    memberHTML += '<i class="fa-solid fa-user"></i>';
                    memberHTML += '<div class="__tablet--member-role">member</div>';
                    memberHTML += '<div class="__tablet--member-name">' + v.name + '</div>';
                    memberHTML += '<span><i class="fa-solid fa-circle online"></i></span>';
                    memberHTML += '</div>';
                    rowHTML += memberHTML;
                    itemCounter++;

                    if (itemCounter == 4) {
                        rowHTML += '</div>';
                        memberList.append(rowHTML);
                        rowHTML = '<div class="row">';
                        itemCounter = 0;
                    }
                }
            }
            var ctd = REP.Tablet.Data.PlayerData.identifier;
            if (ctd !== leaderCID) {
                $("#room-actions").html('<button class="btn animate__animated animate__fadeInRight" id="leave-group">' +
                    '<p>leave group</p>' +
                    '<i class="bx bx-log-out-circle"></i>' +
                '</button>');
            } else {
                $("#room-actions").html(
                    '<button class="btn animate__animated animate__fadeInRight" id="job-ready">' +
                        '<p>ready for work</p>' +
                        '<i class="bx bxs-briefcase icon spinner"></i>' +
                    '</button>' +
                    '<button class="btn animate__animated animate__fadeInRight" id="disband-group">' +
                        '<p>disband group</p>' +
                        '<i class="bx bx-log-out-circle"></i>' +
                    '</button>'
                );
            }
        if (itemCounter > 0) {
            rowHTML += '</div>';
            memberList.append(rowHTML);
        };
    };
};

function addGroup(data, job) {
    var addOption;
    var addOption1;
    var row = `<div class="__tablet--row">`;
    var row1 = `<div class="__tablet--row">`;
    var idleList = $("#group-idle");
    var idle = 0;
    var busy = 0;
    idleList.html("");
    var busyList = $("#group-busy");
    busyList.html("");
    if (data && data.length > 0) {
        Object.keys(data).map(function(element) {
            if (data[element]) {
                if (!data[element].status && data[element].job === job) {
                    idle = idle + 1;
                    addOption = `
                        <div class="__tablet--group-item">
                            <i class="fa-solid fa-users icon__idle"></i>
                            <div class="__tablet--group-info-item">
                                <p class="__tablet--group-name">${data[element].gName}</p>
                            </div>
                            <div class="__tablet--group-count">
                                <div class="__tablet--group--count-item">
                                    <i class="fa-solid fa-people-carry-box"></i>
                                    <p class="__tablet--group--count-icon">${REP.Tablet.Config[job].mem}</p>
                                </div>
                                <div class="__tablet--group--count-item">
                                    <i class="fa-solid fa-user"></i>
                                    <p class="__tablet--group--count-icon">${data[element].users}</p>
                                </div>
                            </div>
                            <div class="get__overlay" id="join-group" data-id="${data[element].id}">
                                <i class="fa-solid fa-handshake"></i>
                                <p>join group</p>
                            </div>
                        </div>
                    `;
                    row += addOption;
                    if (idle % 3 === 0) {
                        row += '</div>';
                        idleList.append(row);
                        row = `<div class="__tablet--row">`;
                    }
                } else if (data[element].status && data[element].job === job) {
                    busy = busy + 1;
                    addOption1 =
                        `
                        <div class="__tablet--group-item">
                            <i class="fa-solid fa-users-slash icon__busy"></i>
                            <div class="__tablet--group-info-item">
                                <p class="__tablet--group-name">${data[element].gName}</p>
                            </div>
                            <div class="__tablet--group-count">
                                <div class="__tablet--group--count-item">
                                    <i class="fa-solid fa-people-carry-box"></i>
                                    <p class="__tablet--group--count-icon">${REP.Tablet.Config[job].mem}</p>
                                </div>
                                <div class="__tablet--group--count-item">
                                    <i class="fa-solid fa-user"></i>
                                    <p class="__tablet--group--count-icon">${data[element].users}</p>
                                </div>
                            </div>
                        </div>
                        `;
                    row1 += addOption1;
                    if (busy % 3 === 0) {
                        row1 += '</div>';
                        busyList.append(row1);
                        row1 = `<div class="__tablet--row">`;
                    }
                }
            }
        });
        row += '</div>'; // Add closing tag for idle row
        idleList.append(row);
        row1 += '</div>'; // Add closing tag for busy row
        busyList.append(row1);
        
        if (idle === 0) {
            idleList.html(`<div class="__tablet--group-idle">There are no idle groups available</div>`);
        }
        if (busy === 0) {
            busyList.html(`<div class="__tablet--group-busy">There are no busy groups available</div>`);
        }
    } else {
        idleList.html(`<div class="__tablet--group-idle">There are no idle groups available</div>`);
        busyList.html(`<div class="__tablet--group-busy">There are no busy groups available</div>`);
    }
};

function startTimer() {
    tens++; 
    if(tens <= 9){
      appendTens.innerHTML = "0" + tens;
    }
    
    if (tens > 9){
      appendTens.innerHTML = tens;
      
    } 
    
    if (tens > 99) {
      seconds++;
      appendSeconds.innerHTML = "0" + seconds;
      tens = 0;
      appendTens.innerHTML = "0" + 0;
    }
    
    if (seconds > 9){
      appendSeconds.innerHTML = seconds;
    }
    
    if (seconds > 60){
        minutes++;
        appendminutes.innerHTML = "0" + minutes;
        seconds = 0;
        appendSeconds.innerHTML = "0" + 0;
    }
};

$(function() {  
    window.addEventListener('message', function(e) {
        if (e.data.action === 'refreshApp') {
            closeAllScreen();
            jobPlayer = e.data.job;
            $("#create-screen").fadeIn("1500");
            if (REP.Tablet.Config[e.data.job]) {
                $(".__tablet--header-content").html(REP.Tablet.Config[e.data.job].label);
            }
            addGroup(e.data.data, e.data.job);
        } else if (e.data.action === 'addGroupStage') {
            addGroupJobs(e.data.status);
        } else if (e.data.action === 'reLoop') {
            setTimeout(showNotification, REP.Tablet.Config[jobPlayer].time.second);
        } else if (e.data.action === 'cancelReady') {
            e.preventDefault();
            $("#job-ready").removeClass("checked");
            $("#job-ready p").text("ready for work");
            $(".spinner").removeClass("bx-loader-alt spin").addClass("bxs-briefcase");
            $("#job-notready").remove();
            notReadyButtonAdded = false;
            REP.Tablet.Animations.TopSlideUp(".__tablet--notification-container-new", 600, -10);
        }
    });
});

