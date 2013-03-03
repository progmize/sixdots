/*
 *      Copyright 2012  Samsung Electronics Co., Ltd
 *
 *      Licensed under the Flora License, Version 1.0 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *              http://www.tizenopensource.org/license
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 */

$(document).delegate("#main", "pageinit", function() {
	$("#main .ui-btn-back").bind("vclick", function() {
		tizen.application.exit();
		return false;
	});

	$("#main").bind("pagebeforeshow", displayAlarms);

	$("#alarm-remove-all").bind("vclick", function() {
		removeAll();
		return false;
	});

	$("#alarm-all-list").delegate("li", "vclick", function() {
		alarmInfo($(this).data("id"));
		return false;
	});

	$("#alarm-all-list").delegate("div", "vclick", function() {
		removeAlarm($(this).parent().data("id"));
		return false;
	});
});

$(document).delegate("#absolute-alarm-add", "pageinit", function() {
	$("#absolute-alarm-save").bind("vclick", function() {
		addAlarmAbsolute();
		return false;
	});
});

$(document).delegate("#relative-alarm-add", "pageinit", function() {
	$("#relative-alarm-save").bind("vclick", function() {
		addAlarmRelative();
		return false;
	});
});

function displayAlarms() {
	// get full list of alarms
	var alarmsArray = tizen.alarm.getAll();
	var period, str = "";

	for (var i = 0; i < alarmsArray.length; i++) {
		if (alarmsArray[i].period) {
			period = alarmsArray[i].period + " sec";
		} else {
			period = "none";
		}

		if (alarmsArray[i] instanceof tizen.AlarmAbsolute) {
			var d = alarmsArray[i].date,
				m = d.getMinutes();

			str += '<li class="ui-li-has-multiline" data-id="'
					+ alarmsArray[i].id
					+ '">'
					+ (d.getMonth() + 1)
					+ '/'
					+ d.getDate()
					+ '/'
					+ d.getFullYear()
					+ ' '
					+ d.getHours()
					+ ':'
					+ ((m < 10) ? "0" + m : m)
					+ '<span class="ui-li-text-sub">Absolute alarm (Period: '
					+ period
					+ ')</span> <div data-role="button" data-inline="true">Delete</div></li>';
		} else if (alarmsArray[i] instanceof tizen.AlarmRelative) {
			str += '<li class="ui-li-has-multiline" data-id="'
					+ alarmsArray[i].id
					+ '">'
					+ alarmsArray[i].delay
					+ ' sec<span class="ui-li-text-sub">Relative alarm (Period: '
					+ period
					+ ')</span> <div data-role="button" data-inline="true">Delete</div></li>';
		} else {
			alert("Wrong alarm instance");
			break;
		}
	}
	$("#alarm-all-list").html(str).trigger("create").listview("refresh");
}

function addAlarm(alarm, radioLaunchApp) {
	var arg;

	if (radioLaunchApp.prop("checked")) {
		/* Launching application case */
		arg = null;
	} else {
		/* Launching appservice case */
		arg = new tizen.ApplicationService("http://tizen.org/appcontrol/operation/view",
				null,
				null,
				[new tizen.ApplicationServiceData("id",["sampleapp0"])]);
	}

	try {
		tizen.alarm.add(alarm, "sampleapp0", arg);
	} catch (e) {
		alert("error: " + e.message);
	}
}

function addAlarmAbsolute() {
	var period = parseInt($("#absolute-alarm-period").prop("value")),
		time = $("#alarm-time").datetimepicker("value"),
		year, month, date, hours, minutes,
		splits, d, t;

	if (time == null || period < 0) {
		alert("Getting alarm settings failed");
		return;
	}

	splits = time.split("T");
	d = splits[0].split("-");
	t = splits[1].split(":");

	year = parseInt(d[0]);
	month = parseInt(d[1]) - 1;
	date = parseInt(d[2]);
	hours = parseInt(t[0]);
	minutes = parseInt(t[1]);

	var inputDate = new Date(year, month, date, hours, minutes, 0, 0);
	var myAlarm = new tizen.AlarmAbsolute(inputDate, (period > 0 ? period : null));

	addAlarm(myAlarm, $("#launch-app-absolute"));

	$.mobile.changePage("#main");
}

function addAlarmRelative() {
	var period = parseInt($("#relative-alarm-period").prop("value")),
		delay = parseInt($("#relative-alarm-delay").prop("value"));

	if ((delay < 0) || (period < 0)) {
		alert("Getting alarm settings failed");
		return;
	}

	var myAlarm = new tizen.AlarmRelative(delay, period);

	addAlarm(myAlarm, $("#launch-app-relative"));

	$.mobile.changePage("#main");
}

function removeAll() {
	tizen.alarm.removeAll();
	displayAlarms();
}

function removeAlarm(id) {
	try {
		tizen.alarm.remove(id);
	} catch (e) {
		console.log("Alarm remove failed. The once alarm might be already removed automatically");
	}
	displayAlarms();
}

function alarmInfo(id) {
	var alarm = tizen.alarm.get(id);

	if (alarm) {
		if (alarm instanceof tizen.AlarmAbsolute) {
			alert("Next scheduled alarm is " + alarm.getNextScheduledDate());
		} else {
			alert("Remaining seconds is " + alarm.getRemainingSeconds() + " SECS");
		}
	} else {
		alert("Alarm info retrieving failed<br/>This once alarm might be already removed automatically");
		displayAlarms();
	}
}
