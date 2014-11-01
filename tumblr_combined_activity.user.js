// ==UserScript==
// @name         Combined Tumblr Activity
// @namespace    http://ee.walfas.org
// @version      0.3
// @description  Pulls activity from all your sideblogs
// @match        http://www.tumblr.com/*
// @match        https://www.tumblr.com/*
// @copyright    2013-2014, Walfie
// ==/UserScript==

var maxNotes = 50;
var exclude = [];

// Add notifications link to sidebar
jQuery(function() {
    var activity = jQuery(".activity").first().parent();
    var notifications = activity.clone().insertBefore(activity).find('a');
    notifications.attr("href", notifications.attr("href")+"?all");
    notifications.addClass("notifications");
    notifications.find('.hide_overflow').text("Notifications");
    notifications.find('i').toggleClass('icon_activity icon_analytics');
});

if (/activity.*\?all/.test(window.location.href)) {
    var activity_feed = jQuery("#ui_activity_feed").addClass("ui_notes").empty();
    jQuery(".section.first.divider").remove();
    jQuery(".section.last").css("padding-top","10px");

    // Get list of users from sidebar dropdown
    users = [];
    jQuery("#popover_blogs").find(".blog_title").each(function() {
        var user = jQuery(this).attr("href").replace("/blog/","");
        if (exclude.indexOf(user) == -1) {
            users.push(user);
        }
    });

    // Fetch activities page for each user and add all notes to an array
    notes = [];
    deferreds = users.map(function(user) {
        return jQuery.ajax({
            url: "//www.tumblr.com/activity/" + user + "/day",
        }).done(function (html) {
            uiNotes = jQuery.makeArray(jQuery(html).find(".ui_note"));
            notes = notes.concat(uiNotes);
        });
    });

    // When all notes fetched, sort and display
    jQuery.when.apply(null, deferreds).done(function() {
        notes.sort(function(a,b) {
            return getTimestamp(b) - getTimestamp(a);
        });
        notes = notes.slice(0,maxNotes);

        // Check date boundaries
        addDateSeparator(notes[0]);
        for (var i=1; i<notes.length-1; i++) {
            if (differentDays(notes[i],notes[i+1]))
                addDateSeparator(notes[i+1]);
        }

        activity_feed.append(notes);
    });

    // Utility functions
    getTimestamp = function(obj) {
        return jQuery(obj).attr('data-timestamp');
    }

    differentDays = function(note1, note2) {
        var ts1 = getTimestamp(note1);
        var ts2 = getTimestamp(note2);

        var day1 = new Date(ts1 * 1000).setHours(0, 0, 0, 0);
        var day2 = new Date(ts2 * 1000).setHours(0, 0, 0, 0);
        return day1 !== day2;
    }

    addDateSeparator = function(elem) {
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        var timestamp = getTimestamp(elem);
        var date = new Date(timestamp*1000);
        date.setHours(0, 0, 0, 0);

        // Absolute Date
        var dayOfWeek = days[ date.getDay() ];
        var day = date.getDate();
        var month = months[ date.getMonth() ];
        var dateString = dayOfWeek + ', ' + month + ' ' + day;

        // Relative Date
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var timeDiff = Math.abs(today.getTime() - date.getTime());
        var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24)); 

        var rDateString = "";
        switch (diffDays) {
        case 0: rDateString = "Today"; break;
        case 1: rDateString = "Yesterday"; break;
        default: rDateString = diffDays + " days ago"; break;
        }

        jQuery(elem).prepend(jQuery('<div/>', {'class': 'date_header clearfix'})
            .append(jQuery('<div/>', {'class': 'part_relative_date', 'text': dateString}))
            .append(jQuery('<div/>', {'class': 'part_full_date', 'text': rDateString}))
        );
    }
}

