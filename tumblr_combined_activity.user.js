// ==UserScript==
// @name         Combined Tumblr Activity
// @namespace    http://ee.walfas.org
// @version      0.1
// @description  Pulls activity from all your sideblogs
// @match        http://www.tumblr.com/*
// @copyright    2013, Walfie
// ==/UserScript==

var maxNotes = 50;

var notifications = jQuery(".activity").first();
notifications.parent().clone().appendTo("#dashboard_controls_open_blog");
notifications.attr("href", notifications.attr("href")+"?all").text("Notifications");
notifications.attr("class","notifications");
var nStyle = jQuery("<style>.controls_section li .notifications:after { background-position: 12px -439px; }</style>");
jQuery('html > head').append(nStyle);

if (/activity\/.*\?all/.test(window.location.href)) {
    var activity = jQuery(".activity").first();
    activity.parent().attr("class","");

    jQuery("#ui_activity_feed").addClass("ui_notes").empty();
    jQuery(".section.first.divider").remove();
    jQuery(".section.last").css("padding-top","10px");
    users = [];

    jQuery("#popover_blogs").find(".blog_title").each(function() {
        users.push(jQuery(this).attr("href").replace("/blog/",""))
    });

    notes = [];

    deferreds = users.map(function(user) {
        return jQuery.ajax({
            url: "http://www.tumblr.com/activity/" + user + "/day",
        }).done(function (html) {
            uiNotes = jQuery.makeArray(jQuery(html).find(".ui_note"));
            notes = notes.concat(uiNotes);
        });
    });

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

        af = jQuery("#ui_activity_feed").addClass("ui_notes").empty().append(notes);
    });

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

        var dayOfWeek = days[ date.getDay() ];
        var day = date.getDate();
        var month = months[ date.getMonth() ];
        var dateString = dayOfWeek + ', ' + month + ' ' + day;

        jQuery(elem).prepend(jQuery('<div/>', {'class': 'date_header clearfix'})
            .append(jQuery('<div/>', {'class': 'part_full_date', 'text': dateString}))
        );
    }
}
else
    notifications.parent().attr("class","");

