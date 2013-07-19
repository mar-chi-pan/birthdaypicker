/*!
  * jQuery Date/Birthday Picker: v0.1 - 17 Jul 2013
  * Forked from http://abecoffman.com/stuff/birthdaypicker - 16 Jul 2013
  *
  * https://github.com/mar-chi-pan/birthdaypicker
  *
  * Copyright (c) 2010 Abe Coffman
  * Dual licensed under the MIT and GPL licenses.
  *
  */

(function ($) {

    // plugin variables
    var today = new Date(),
        todayYear = today.getFullYear(),
        todayMonth = today.getMonth() + 1,
        todayDay = today.getDate();


    $.fn.birthdaypicker = function (options) {

        var settings = {
            "maxAge"        : 120,
            "minAge"        : 0,
            "futureDates"   : false,
            "maxYear"       : todayYear,
            "dateFormat"    : "middleEndian",
            "placeholder"   : false,
            "legend"        : "",
            "texts"         : ["Year", "Month", "Day"],
            "defaultDate"   : false,
            "onChange"      : false,
            "tabindex"      : null
        };

        function monthDays (month, year) {
            if (month === 2) return 28 + (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0));
            return 31 - (month - 1) % 7 % 2;
        }

        return this.each(function () {

            if (options) { $.extend(settings, options); }

            // Create the html picker skeleton
            var $fieldset = $("<fieldset class='birthday-picker'></fieldset>"),
                $year = $("<select class='birth-year' name='birth[year]'></select>"),
                $month = $("<select class='birth-month' name='birth[month]'></select>"),
                $day = $("<select class='birth-day' name='birth[day]'></select>");

            if (settings.legend) {
                $("<legend>" + settings.legend + "</legend>").appendTo($fieldset);
            }

            var tabindex = settings.tabindex;

            // Add the option placeholders if specified
            if (settings.placeholder) {
                $("<option value='0'>" + settings.texts[0] + "</option>").appendTo($year);
                $("<option value='0'>" + settings.texts[1] + "</option>").appendTo($month);
                $("<option value='0'>" + settings.texts[2] + "</option>").appendTo($day);
                if (settings.defaultDate === false) {
                    $year.val(0);
                    $month.val(0);
                    $day.val(0);
                }
            }

            // Deal with the various Date Formats
            if (settings.dateFormat === "bigEndian") {
                $fieldset.append($year).append($month).append($day);
                if ($.isNumeric(tabindex)) {
                    $year.attr('tabindex', tabindex);
                    $month.attr('tabindex', ++tabindex);
                    $day.attr('tabindex', ++tabindex);
                }
            } else if (settings.dateFormat === "littleEndian") {
                $fieldset.append($day).append($month).append($year);
                if ($.isNumeric(tabindex)) {
                    $day.attr('tabindex', tabindex);
                    $month.attr('tabindex', ++tabindex);
                    $year.attr('tabindex', ++tabindex);
                }
            } else {
                $fieldset.append($month).append($day).append($year);
                if ($.isNumeric(tabindex)) {
                    $month.attr('tabindex', tabindex);
                    $day.attr('tabindex', ++tabindex);
                    $year.attr('tabindex', ++tabindex);
                }
            }

            // Set the default date if no placeholders or default given
            settings.defaultValue = settings.defaultDate ?
                new Date(settings.defaultDate) : today;
            if (settings.minAge && settings.defaultDate === false) {
                var year = todayYear - settings.minAge;
                if (settings.defaultValue.getFullYear() < year)
                    settings.defaultValue.setFullYear(year);
            }

            // Build the initial option sets
            // maxYear is more important than minAge
            var startYear = settings.maxYear < todayYear ?
                settings.maxYear : todayYear - settings.minAge;
            var endYear = todayYear - settings.maxAge;
            var maxMonth = todayMonth, maxDays = todayDay;
            if (settings.futureDates && settings.maxYear > startYear) {
                startYear = settings.maxYear;
            }
            for (var i = startYear; i >= endYear; i--) {
                $("<option></option>").attr("value", i).text(i).appendTo($year);
            }
            if (settings.defaultDate || !settings.placeholder) {
                $year.val(settings.defaultValue.getFullYear());
            }

            if (settings.futureDates || $year.val() < todayYear) {
                maxMonth = 12;
            }
            for (i = 0; i < maxMonth; i++) {
                $("<option></option>").attr("value", i + 1).text(i + 1).appendTo($month);
            }
            if (settings.defaultDate || !settings.placeholder) {
                $month.val(settings.defaultValue.getMonth() + 1);
            }

            if (settings.futureDates || $month.val() < todayMonth ||
                    $year.val() < todayYear) {
                maxDays = monthDays(
                    settings.defaultValue.getMonth() + 1,
                    settings.defaultValue.getFullYear()
                );
            }
            for (i = 1; i <= maxDays; i++) {
                $("<option></option>").attr("value", i).text(i).appendTo($day);
            }
            if (settings.defaultDate || !settings.placeholder) {
                $day.val(settings.defaultValue.getDate());
            }

            $(this).append($fieldset);

            // Update the option sets according to options and user selections
            $fieldset.change(function () {
                // currently selected year, the rest of the values need recheck
                var selectedYear = parseInt($year.val(), 10),
                    // max values currently in the markup
                    curMaxMonth = parseInt($month.children(":last").val(), 10),
                    curMaxDay = parseInt($day.children(":last").val(), 10);

                function update(element, curMax, newMax) {
                    if (curMax > newMax) {
                        if (parseInt(element.val(), 10) > newMax) {
                            element.val(newMax);
                        }
                        element.children().filter(function () {
                            return parseInt($(this).attr('value'), 10) > newMax;
                        }).remove();
                    }
                    while (curMax < newMax) {
                        $("<option></option>").attr("value", ++curMax).text(curMax).appendTo(element);
                    }
                }

                // Calculate the maximum number of months and days
                var maxMonth = todayMonth, maxDays = todayDay;
                // First calculate max month
                if (settings.futureDates || selectedYear < todayYear) {
                    maxMonth = 12;
                }
                update($month, curMaxMonth, maxMonth);

                // Calculate max day
                var selectedMonth = parseInt($month.val(), 10);
                if (selectedMonth === 0) {
                    maxDays = 31;
                } else if (settings.futureDates || selectedMonth < todayMonth ||
                        selectedYear < todayYear) {
                    maxDays = monthDays(selectedMonth, selectedYear);
                }
                update($day, curMaxDay, maxDays);

                var selectedDay = parseInt($day.val(), 10);
                // Run the callback function with the selected date
                if ($.isFunction(settings.onChange)) {
                    settings.onChange(
                        [selectedYear, selectedMonth, selectedDay]);
                }
            });
        });
    };
})( jQuery );
