$(document).ready(function() {
    let clipboard = new ClipboardJS('.js-clipboard-text');
    let clipboardInput = $('.js-clipboard-input');

    let $clipboardPopup = $('.js-clipboard-popup').length ? $('.js-clipboard-popup') : $('<div class="js-clipboard-popup dt-button-info" style="display:none; opacity:0"><div class="js-clipboard-popup-message"></div></div>').appendTo('body');

    clipboard.on('success', function(e) {
        const message = $(e.trigger).data('message') || 'Content copied to clipboard';
        $clipboardPopup.find('.js-clipboard-popup-message').text(message);
        $clipboardPopup.show('slow');
        $clipboardPopup.animate({
            opacity: 1,
        }, 1500);
        $clipboardPopup.animate({
            opacity: 0,
        }, 1500);
        $clipboardPopup.hide('slow');
        e.clearSelection();
    });

    clipboardInput.on('click',function(e){
        const $source = $(this);
        const $target = $($source.attr('data-target'));
        let disabled = false;

        if ($target.prop('disabled')){
            disabled = true;
            $target.prop('disabled', false);
        }

        $target.select();
        document.execCommand('copy');

        if (disabled){
            $target.prop('disabled', true);
        }

        if ($source.attr('data-message')){
            let $clipboardPopupMessageContainer = $clipboardPopup.find('.js-clipboard-popup-message');
            if ($clipboardPopup.length === 0){
                $clipboardPopupMessageContainer = $clipboardPopup;
            }

            $clipboardPopupMessageContainer.text( $source.attr('data-message') );
        }

        $target.blur();
        $clipboardPopup.show(0);
        removeInputSelection();

        $clipboardPopup
            .animate({
                opacity: 1,
            }, 200)
            .delay(1000)
            .animate({
                opacity: 0,
            }, 800)
            .hide(0);
    });

    $('.js-stop-click').on('click mouseup mousedown', function(event){
        event.stopPropagation();
    });

    $('.js-tooltip').hover(function(){
        $(this).tooltip('show');
    }, function(){
        $(this).tooltip('hide');
    });

    $('.js-disabling-input').on('input', function(){
        const $target = $($(this).attr('data-target'));

        if (this.value){
            $target.removeAttr('disabled');
        } else {
            $target.attr('disabled', 'disabled');
        }
    });

    // for forms - doesn't work in Safari
    $('.js-disable-fields').on('submit', function(event){
        //event.preventDefault();
        //event.stopPropagation();
        // pure js handler - empty submitter button field/param
        //this.submit();
        const $form = $(this);
        setTimeout(function (){
            $form.find('input, button, select').attr('disabled', 'disabled'); // all fields
        }, 5);
    });

    // for buttons
    $('.js-submit-spinner-and-disable').on('click', function(){
        // bootstrap 5 spinner
        let spinnerHtml = '<span class="spinner-border align-middle text-white spinner ms-2 mt-n1 h-15px w-15px"></span>';
        const $button = $(this)
            .append(spinnerHtml)
            .attr('disabled', 'true');

        const $form = $button.closest('form');
        // doesn't work using styles for select2, because select2 has `readonly`
        $form.find('input').attr('readonly', true);
        requestAnimationFrame(() => {
            $form.submit();
        });
    });

    $('.submit-spinner-and-disable input').on('keydown', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            e.stopPropagation();
            $(this).closest('form').find('.js-submit-spinner-and-disable').trigger('click');
        }
    });

    // for forms - doesn't work in Safari
    $('.js-show-spinner').on('submit', function(event){
        // bootstrap 5 spinner
        let spinnerHtml = '<span class="spinner-border align-middle text-white spinner ms-2 mt-n1 h-15px w-15px"></span>';
        const $button = $(event.originalEvent.submitter);

        $button.attr('spinner', 'spinner');
        $button.append(spinnerHtml);
    });


    $('.js-intercom-show').click(function(){
        Intercom('show');
    });

    function setCookie(name, value) {
        let expires;
        let date = new Date();

        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();

        document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

    $('.js-menu-item-confirm-modal > a').click(function(e){
        e.preventDefault();

        const $link = $(this);
        console.log('data-confirm-message');
        if (confirm($link.parent().attr('data-confirm-message'))){
            const pathname = new URL($link.attr('href')).pathname;
            if (pathname.endsWith('dashboard') && pathname.length < 14) {
                setCookie('_language_add', $link.parent().attr('language'));
                console.log('confirm2 with replace');
            } else {
                console.log('data-confirm-message 2');
            }
            window.location.href = $link.attr('href');
        }
    });

    $('.js-show-siblings-on-hover').hover(
        function() {
            $(this).parent().children().attr('style', 'display: block !important');
        }, function() {
            $(this).parent().children().removeAttr("style");
        }
    );

    $('.js-show-siblings-on-click').click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        $(this).parent().children().each(function(){
            var $listItem = $(this);

            if ($listItem.attr('style') === undefined){
                $listItem.attr('style', 'display: block !important');
            } else {
                $listItem.removeAttr("style");
            }
        });
    }).blur(function(){
        $(this).parent().children().removeAttr("style");
    });

    initSelect2Flags();

    // Initialize all Select2 instances immediately
    $('.custom-select2-with-flag-and-edit').each(function() {
        initializeSelect2WithFlags($(this));
    });

    // Reinitialize modal's Select2 when modal opens to ensure proper rendering
    $('#options-modal').on('shown.bs.modal', function() {
        // Destroy existing Select2 instance first
        $('#options-modal-template').select2('destroy');
        initializeSelect2WithFlags($('#options-modal-template'));
    });

    $('.js-link-like').on('click', function(){
        window.location.href = $(this).attr('data-href');
        //$(this).prop("disabled", true);
        return true;
    });

    $('.js-show').on('click', function(){
        if ( $(this).attr('data-show-target') === 'this'){
            var $target = $(this);
        } else {
            var $target = $( $(this).attr('data-show-target') );
        }
        $target.show();
    });
    $('.js-hide').on('click', function(){
        if ( $(this).attr('data-hide-target') === 'this'){
            var $target = $(this);
        } else {
            var $target = $( $(this).attr('data-hide-target') );
        }
        $target.hide();
    });

    $('.js-link').on('mousedown', function(){
        var target = $(this).attr('data-link-target');
        console.log(target);
        window.location.href = target;
        //$(this).prop("disabled", true);
        return true;
    });
});

$("a.disabled, li.disabled a").click(function(){
    return false;
});

function handleMessageEvent(name, handler){
    const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";

    const eventer = window[eventMethod];
    const messageEvent = (eventMethod === "attachEvent") ? "onmessage" : "message";

    eventer(messageEvent, function (e) {

        if (e.data === name || e.message === name){
            handler(e);
        }
    });
}

function removeInputSelection(){
    const sel = window.getSelection ? window.getSelection() : document.selection;
    if (sel) {
        if (sel.removeAllRanges) {
            return sel.removeAllRanges();
        } else if (sel.empty) {
            return sel.empty();
        }
    }

    return false;
}

function generateReportUrl(params) {
    let goTo;
    //group audits = gmb or local-seo audit
    if (params.type === 'gbp' || params.type === 'local-seo') {
        if (params.location && params.location !== '') {
            params.location = encodeURI(params.location.replace('#', '').replace(/\//g, '~~')).replace(/%20/g, '+');
        }

        const url = '/' + params.type + '-audit/';

        if (params.template === 'none') {
            goTo = 'https://www.' + params.host + params.language + url;
        } else {
            goTo = 'https://' + params.subdomain + '.' + params.auditdomain + url;
            if (params.template !== 'default' && params.template !== '0' && params.template !== '') {
                goTo += 'template/' + params.template + '/';
            }
        }

        if (params.target !== '') {
            goTo += 'keyword/' + encodeURI(params.target).replace(/%20/g, '+') + '/';
        }

        goTo += params.location + '/';
        if (params.latitude !== '' && params.longitude !== '') {
            goTo +=  params.latitude + ':' + params.longitude;
        }

        if (params.competitor1) {
            params.competitor1 = JSON.parse(params.competitor1);
            goTo += '/' + encodeURI(params.competitor1.location.replace('#', '').replace(/\//g, '~~')).replace(/%20/g, '+');
            goTo += '/' + params.competitor1.latitude + ':' + params.competitor1.longitude;
        }

        if (params.competitor2) {
            params.competitor2 = JSON.parse(params.competitor2);
            goTo += '/' + encodeURI(params.competitor2.location.replace('#', '').replace(/\//g, '~~')).replace(/%20/g, '+');
            goTo += '/' + params.competitor2.latitude + ':' + params.competitor2.longitude;
        }
    }
    //seo group for audits
    if (params.type === 'seo') {
        if (params.template === 'none') {
            if (params.host !== '') {
                goTo = 'https://www.' + params.host + params.language;
            } else {
                goTo = "";
            }

        } else {
            if (params.subdomain !== '' && params.auditdomain !== '') {
                goTo = 'https://' + params.subdomain + '.' + params.auditdomain;
            } else {
                goTo = "";
            }

            if (params.template !== 'default' && params.template !== '0' && params.template !== '') {
                goTo += '/template/' + params.template;
            }
        }
        if (params.target !== '') {
            goTo += '/keyword/' + encodeURI(params.target);
        }
        if (params.competitor1 !== '') {
            goTo += '/competitor/' + params.competitor1;
        }
        if (params.competitor2 !== '') {
            goTo += '/competitor2/' + params.competitor2;
        }

        //create url
        goTo += '/' + params.website;
    }
    //geo audit: same as seo but served under /geo-audit/<url>
    if (params.type === 'geo') {
        if (params.template === 'none') {
            goTo = params.host !== '' ? 'https://www.' + params.host + params.language : '';
        } else {
            goTo = (params.subdomain !== '' && params.auditdomain !== '') ? 'https://' + params.subdomain + '.' + params.auditdomain : '';
        }

        goTo += '/geo-audit';

        if (params.template !== 'none' && params.template !== 'default' && params.template !== '0' && params.template !== '') {
            goTo += '/template/' + params.template;
        }
        if (params.target !== '') {
            goTo += '/keyword/' + encodeURI(params.target);
        }
        if (params.competitor1 !== '') {
            goTo += '/competitor/' + params.competitor1;
        }
        if (params.competitor2 !== '') {
            goTo += '/competitor2/' + params.competitor2;
        }

        goTo += '/' + params.website;
    }
    return goTo;
}

function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function initSelect2Flags() {
    $('[data-location-selector="flags"]').each(function() {
        var $select = $(this);
        var defaultValue = $select.val(); // Get the PHP-set default value
        
        // Create a cache for flag images to prevent reloading
        var flagImageCache = {};

        const optionFormatCountry = function(item) {
            if ( !item.id ) {
                return item.text;
            }

            const span = document.createElement('span');
            span.classList.add('d-flex', 'align-items-center');
            let template = '';
            let ln =  (item.id.split(';'))[1];

            template +=`<span class="country-flag-icon flag-icon flag-icon-squared flag-icon-${ln.toLowerCase()}"></span>`;
            template += `<span>${item.text}</span>`;
            span.innerHTML = template;

            return $(span);
        }

        $select.select2({
            templateSelection: optionFormatCountry,
            templateResult: optionFormatCountry,
        });
        
        // Set the default value after initialization
        if (defaultValue) {
            $select.val(defaultValue).trigger('change');
        }
    });
}

function getFlatpickrOptions(defaultDateValue, defaultTimezone) {
    const defaultDate = defaultDateValue
        ? moment(defaultDateValue, "YYYY-MM-DD HH:mm")
        : moment()

    const locale = typeof window.langFlatpickr === 'undefined' ? 'en' : langFlatpickr;

    return {
        enableTime: true,
        minDate: "today",
        locale: locale,
        defaultDate: defaultDate.toDate(),
        dateFormat: "j M Y H:i",
        time_24hr: true,
        disableMobile: true,
        allowInput: false,
        minuteIncrement: 1,
        clickOpens: true,
        inline: false,
        static: true,
        appendTo: document.body,
        position: "below",
        onClose: function(selectedDates, dateStr, instance) {
            // If there was a previous date and no new date was selected, keep the previous date
            if (!dateStr && instance._initialDate) {
                instance.setDate(instance._initialDate, true);
            }
        },
        onReady: function(selectedDates, dateStr, instance) {
            // Store initial date when calendar is ready, but only if we have a defaultDate
            instance._initialDate = defaultDate ? instance.selectedDates[0] : null;

            // Add CSS to ensure calendar visibility
            const style = document.createElement('style');
            style.textContent = `
                .flatpickr-calendar {
                    position: absolute !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                    transform: none !important;
                    top: calc(100% + 5px) !important;
                    left: 0 !important;
                    margin: 0 !important;
                    z-index: 999999 !important;
                    background: #fff !important;
                }
                .flatpickr-calendar:not(.open) {
                    display: none !important;
                }
                .flatpickr-calendar.open {
                    opacity: 1 !important;
                    visibility: visible !important;
                    display: block !important;
                }
                .flatpickr-calendar .select2-results__option {
                    text-align: left !important;
                }
                .flatpickr-calendar::before,
                .flatpickr-calendar::after {
                    display: none !important;
                }
                .flatpickr-input {
                    cursor: pointer !important;
                }
            `;
            document.head.appendChild(style);

            // Ensure calendar is visible by scrolling to it only when it's open
            setTimeout(() => {
                if (instance.calendarContainer && instance.isOpen) {
                    instance.calendarContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);

            // Create timezone selector
            const select = document.createElement('select');
            select.className = 'time-zone-select form-select text-gray-700';
            select.setAttribute('data-control', 'select2');
            select.setAttribute('data-hide-search', 'true');
            select.style.cssText = 'width: 110px; padding: 4px 8px; border: 1px solid #e6e6e6; border-radius: 4px; margin-left: 8px;';
            
            // Create fixed GMT offset options from -12 to +14
            const options = [];
            for (let i = -12; i <= 14; i++) {
                const option = document.createElement('option');
                const sign = i >= 0 ? '+' : '-';
                const hours = String(Math.abs(i)).padStart(2, '0');
                const value = `GMT${sign}${hours}:00`;
                option.value = value;
                option.textContent = `${sign}${hours}:00`;
                
                // Select the timezone if it matches defaultTimezone, otherwise use user's current offset
                if (defaultTimezone) {
                    option.selected = value === defaultTimezone;
                } else {
                    const userOffset = -(new Date().getTimezoneOffset() / 60);
                    option.selected = i === userOffset;
                }
                
                options.push(option);
            }

            // Add options to select
            options.forEach(option => select.appendChild(option));

            // Find the time container and inject the timezone selector
            const timeContainer = instance.calendarContainer.querySelector('.flatpickr-time');
            if (timeContainer) {
                // Create a wrapper div for the timezone selector
                const wrapper = document.createElement('div');
                wrapper.style.cssText = 'display: flex; align-items: center; flex: 1;';
                wrapper.appendChild(select);
                
                // Insert the wrapper after the minute input
                timeContainer.appendChild(wrapper);
                
                // Adjust time container styles
                timeContainer.style.display = 'flex';
                timeContainer.style.alignItems = 'center';
                timeContainer.style.padding = '0 10px';
            }

            // Initialize Select2
            $(select).select2({
                dropdownParent: instance.calendarContainer,
                minimumResultsForSearch: Infinity
            });

            // Convert month dropdown to Select2
            const monthSelect = instance.calendarContainer.querySelector('.flatpickr-monthDropdown-months');
            if (monthSelect) {
                $(monthSelect).select2({
                    dropdownParent: instance.calendarContainer,
                    minimumResultsForSearch: Infinity,
                    width: '120px'
                }).on('select2:select', function(e) {
                    // Get the selected month index (0-11)
                    const monthIndex = parseInt(e.target.value, 10);
                    
                    // Get current date from flatpickr
                    const currentDate = instance.currentYear ? new Date(instance.currentYear, monthIndex) : new Date();
                    
                    // Set the new month
                    instance.changeMonth(monthIndex, false);
                });

                // Handle month navigation arrows
                const prevMonthButton = instance.calendarContainer.querySelector('.flatpickr-prev-month');
                const nextMonthButton = instance.calendarContainer.querySelector('.flatpickr-next-month');
                
                if (prevMonthButton) {
                    prevMonthButton.addEventListener('click', function(e) {
                        e.stopPropagation();
                        instance.changeMonth(-1);
                        // Update Select2 value after month change
                        const newMonth = instance.currentMonth;
                        $(monthSelect).val(newMonth).trigger('change');
                    });
                }
                
                if (nextMonthButton) {
                    nextMonthButton.addEventListener('click', function(e) {
                        e.stopPropagation();
                        instance.changeMonth(1);
                        // Update Select2 value after month change
                        const newMonth = instance.currentMonth;
                        $(monthSelect).val(newMonth).trigger('change');
                    });
                }

                // Add custom styles for month selector
                const style = document.createElement('style');
                style.textContent += `
                    .flatpickr-current-month {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        padding-top: 0 !important;
                        height: 34px !important;
                    }
                    .flatpickr-current-month .select2-container {
                        width: 140px !important;
                    }
                    .flatpickr-current-month .select2-dropdown {
                        width: 140px !important;
                    }
                    .flatpickr-current-month .numInputWrapper {
                        width: 70px !important;
                        margin-left: 8px !important;
                    }
                    .flatpickr-current-month .select2-selection {
                        border: none !important;
                        background: transparent !important;
                        height: 34px !important;
                        display: flex !important;
                        align-items: center !important;
                    }
                    .flatpickr-current-month .select2-selection:focus {
                        border: none !important;
                        outline: none !important;
                    }
                    .flatpickr-current-month .select2-selection__rendered {
                        color: var(--bs-gray-700) !important;
                        font-weight: 600 !important;
                        padding-left: 0 !important;
                        line-height: 34px !important;
                    }
                    .flatpickr-current-month .select2-selection__arrow {
                        display: flex !important;
                        align-items: center !important;
                        height: 100% !important;
                        width: 24px !important;
                        justify-content: center !important;
                        margin-left: 6px !important;
                    }
                    .flatpickr-current-month .select2-selection__arrow b {
                        border: solid #666;
                        border-width: 0 1.5px 1.5px 0;
                        display: inline-block;
                        padding: 3px;
                        margin: 0;
                        transform: rotate(45deg);
                        -webkit-transform: rotate(45deg);
                        width: 7px;
                        height: 7px;
                        background: none;
                        content: '';
                    }
                    .flatpickr-monthSelect-months {
                        display: none !important;
                    }
                    .flatpickr-current-month input.cur-year {
                        font-size: 1rem !important;
                        font-weight: 600 !important;
                        color: var(--bs-gray-700) !important;
                        padding: 0 !important;
                        height: 34px !important;
                        line-height: 34px !important;
                        display: inline-block !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                        text-align: center !important;
                        user-select: none !important;
                        pointer-events: none !important;
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                    }
                    .numInputWrapper:hover {
                        background: transparent !important;
                    }
                    .select2-results__option {
                        padding-right: 18px !important;
                    }
                `;
                document.head.appendChild(style);
            }

            // Add Done button
            const btnContainer = document.createElement('div');
            btnContainer.className = 'p-3 text-end border-top';
            
            const btn = document.createElement('button');
            btn.textContent = btnDoneLabel;
            btn.className = 'btn btn-warning btn-sm me-3';
            btn.type = 'button'; // Prevent form submission
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                instance.close();
            };
            
            btnContainer.appendChild(btn);
            instance.calendarContainer.appendChild(btnContainer);

            // Add click handler for input to toggle calendar
            const input = instance.input;
            let wasOpen = false;
            input.addEventListener('mousedown', (e) => {
                wasOpen = instance.isOpen;
                if (wasOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            
            input.addEventListener('click', (e) => {
                if (wasOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                    instance.close();
                }
            });

            input.addEventListener("keydown", function(e) {
                if (e.key === "Backspace" || e.key === "Delete") {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }, true);

            // Update hidden input with timezone only if we have a date
            if (selectedDates[0]) {
                const date = moment(selectedDates[0]).format('D MMM YYYY HH:mm');
                $('#schedule-alt').val(date + ' ' + select.value);
            }

            // Add change event listener for timezone select
            select.addEventListener('change', function() {
                if (selectedDates[0]) {
                    const date = moment(selectedDates[0]).format('D MMM YYYY HH:mm');
                    $('#schedule-alt').val(date + ' ' + this.value);
                }
            });
        },
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates[0]) {
                const select = instance.calendarContainer.querySelector('.time-zone-select');
                const date = moment(selectedDates[0]).format('D MMM YYYY HH:mm');
                $('#schedule-alt').val(date + ' ' + select.value);
                // Update initial date when a new date is selected
                instance._initialDate = selectedDates[0];
            } else {
                // Clear initial date if no date is selected
                instance._initialDate = null;
            }
        }
    };
}

function getFormattedTimezone(date) {
    const timezoneOffsetMinutes = date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(timezoneOffsetMinutes / 60));
    const offsetMinutes = Math.abs(timezoneOffsetMinutes % 60);
    const offsetSign = timezoneOffsetMinutes <= 0 ? '+' : '-';
    return `GMT${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
}

function timeWithTimezone(date) {
    const timezone = getFormattedTimezone(date);
    const formattedDate = formatDateForDisplay(date);
    return formattedDate + ' ' + timezone;
}

function formatDateForDisplay(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(date.getDate(), 10)} ${months[date.getMonth()]} ${date.getFullYear()} ${String(parseInt(date.getHours(), 10)).padStart(2, '0')}:${String(parseInt(date.getMinutes(), 10)).padStart(2, '0')}`;
}

function htmlspecialchars(html) {
   return html.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function initializeSelect2WithFlags($element) {
    $element.select2({
        minimumResultsForSearch: -1,
        templateResult: function (data) {
            if (!data.element) {
                return data.text;
            }

            const $element = $(data.element);
            const $wrapper = $('<span class="w-100"></span>');
            $wrapper.text(data.text);
            $wrapper.append('<span tabindex="-1" data-bs-toggle="tooltip" data-bs-html="true" data-bs-custom-class="custom-tooltip" data-bs-original-title="' + $($element[0]).attr('data-language-title') + '" style="margin-right: 46px;" class="position-absolute end-0 mt-n1 flag-icon flag-icon-' + $($element[0]).attr('data-language-country') + ' flag-icon-squared"></span>');
            $wrapper.append('<a tabindex="-1" href="' + reportTemplateUrl.slice(0, -1) + $($element[0]).attr('value') + '" target="_blank" onmousedown="event.stopImmediatePropagation();" onmouseup="event.stopImmediatePropagation();" class="position-absolute end-0 me-3 mt-n2"><i style="font-size:30px" class="ki-duotone ki-notepad-edit text-hover-primary" data-bs-toggle="tooltip" data-bs-html="true" data-bs-custom-class="custom-tooltip" data-bs-original-title="' + reportTemplateModifyTooltip + '"><span class="path1"></span><span class="path2"></span></i></a>');
            return $wrapper;
        },
        templateSelection: function (data) {
            if (!data.element) {
                return data.text;
            }

            const $element = $(data.element);
            const $wrapper = $('<span class="w-100"></span>');
            $wrapper.text(data.text);
            $wrapper.append('<span tabindex="-1" data-bs-toggle="tooltip" data-bs-html="true" data-bs-custom-class="custom-tooltip" data-bs-original-title="<p><b>' + $($element[0]).attr('data-language-title') + '</b></p>' + reportTemplateTooltip + '" style="margin-right: 66px; margin-top: -.1rem;" class="position-absolute end-0 flag-icon flag-icon-' + $($element[0]).attr('data-language-country') + ' flag-icon-squared"></span>');
            $wrapper.append('<a tabindex="-1" href="' + reportTemplateUrl.slice(0, -1) + $($element[0]).attr('value') + '" target="_blank" onmousedown="event.stopImmediatePropagation();" onmouseup="event.stopImmediatePropagation();" class="position-absolute end-0 me-10" style="margin-top: -.4rem;"><i data-bs-toggle="tooltip" data-bs-html="true" data-bs-custom-class="custom-tooltip" data-bs-original-title="' + reportTemplateModifyTooltip + '" style="font-size:30px;" class="ki-duotone ki-notepad-edit text-hover-primary"><span class="path1"></span><span class="path2"></span></i></a>');
            return $wrapper;
        },
    }).on('select2:open', function() {
        const $select = $(this);
        const $dropdown = $('.select2-dropdown');
        
        setTimeout(function() {
            // Initialize tooltips only in dropdown
            $dropdown.find('[data-bs-toggle="tooltip"]').tooltip();
            
            // Add click handler for flag icons and other elements in dropdown
            $dropdown.on('mousedown', '[data-bs-toggle="tooltip"]', function() {
                // Only dispose tooltips in the dropdown
                $dropdown.find('[data-bs-toggle="tooltip"]').tooltip('dispose');
            });
        }, 100);
    }).on('select2:close', function() {
        const $select = $(this);
        const $container = $select.next('.select2-container');
        
        // Only dispose tooltips in the Select2 container
        $container.find('[data-bs-toggle="tooltip"]').tooltip('dispose');
        
        // Clean up click handler
        $('.select2-dropdown').off('mousedown', '[data-bs-toggle="tooltip"]');
        
        // Reinitialize container tooltips
        setTimeout(function() {
            $container.find('[data-bs-toggle="tooltip"]').tooltip();
        }, 100);
        
        // Focus on the next focusable element
        const $nextFocusable = $select.closest('div').next().find('input, select, textarea, button, [tabindex]:not([tabindex="-1"])').first();
        if ($nextFocusable.length) {
            $nextFocusable.focus();
        }
    }).on('select2:selecting', function() {
        const $select = $(this);
        // Only dispose tooltips in the Select2 container and dropdown
        const $container = $select.next('.select2-container');
        const $dropdown = $('.select2-dropdown');
        
        $container.find('[data-bs-toggle="tooltip"]').tooltip('dispose');
        $dropdown.find('[data-bs-toggle="tooltip"]').tooltip('dispose');
    }).on('select2:select', function() {
        const $select = $(this);
        setTimeout(function() {
            const $container = $select.next('.select2-container');
            $container.find('[data-bs-toggle="tooltip"]').tooltip();
        }, 100);
    });

    // Initialize tooltips for initial state
    setTimeout(function() {
        const $container = $element.next('.select2-container');
        // Remove the default title attribute
        $container.find('.select2-selection__rendered').removeAttr('title');
        $container.find('[data-bs-toggle="tooltip"]').tooltip();
    }, 100);

    // Remove title attribute whenever selection changes
    $element.on('change', function() {
        setTimeout(function() {
            const $container = $element.next('.select2-container');
            $container.find('.select2-selection__rendered').removeAttr('title');
        }, 0);
    });
}

// Disable manual input in flatpickr time input as "allowInput: false" is not working
const observer = new MutationObserver((mutations) => {
    // Make time fields read-only
    const timeInputs = document.querySelectorAll('.flatpickr-time .numInput');
    timeInputs.forEach(input => {
        input.readOnly = true;
    });
    // Make year field read-only
    const yearInputs = document.querySelectorAll('.flatpickr-current-month input.cur-year');
    yearInputs.forEach(input => {
        input.readOnly = true;
        input.tabIndex = -1;
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

const isValidURL = (url) => {
    url = url.replace(/https?:\/\//).replace(/www\./, '');
    const regex = /^(?:[\p{L}\p{N}\-._~%!$&'()*+,;=]+@)?(?:(?:\d{1,3}\.){3}\d{1,3}|[\p{L}\p{N}\-._~%]+(?:\.[\p{L}\p{N}\-._~%]+)+)(?::\d{1,5})?(?:\/[\p{L}\p{N}\-._~%!$&'()*+,;=:@\/]*)?(?:\?[^\s<>"{}|\\\^\[\]`]+)?(?:#\S*)?$/u;
    return regex.test(url);
}

const cleanWebsiteURL = (url) => {
    const nonHttps = url.toLowerCase().replace(/^https?:\/\//i, '').replace(/^\/|\/$/g, '');
    return nonHttps.replace(/^([^\/]+).*/i, '$1');
}

const auditFormSubmit = (form, language) => {
    const domain = $(form).find('input').val();
    if (domain !== '' && isValidURL(domain)) {
        window.location = language + '/' + domain.toLowerCase().replace(/^https?:\/\//i,'').replace(/\/$/i, '');
    } else {
        alert(checkDomainMessage);
    }
}

const jsTopAlerts = {};

function scrollIntoViewWithFixedHeader(element) {
    const elementRect = element.getBoundingClientRect();
    const isVisible = (
        elementRect.top >= 0 &&
        elementRect.left >= 0 &&
        elementRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        elementRect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

    if (!isVisible) {
        let scrollTop = $(element).offset().top - 10;

        const headerHeight = window.innerWidth >= 992 ? 94 : 0;
        const headerDiscount = $('.header-discount');
        const headerDiscountHeight = headerDiscount.length > 0 ? headerDiscount[0].clientHeight : 0;
        scrollTop = scrollTop - headerHeight - headerDiscountHeight;

        $('html, body').animate({
            scrollTop: scrollTop
        }, 400);
    }
}
function showErrorAlert(message){
    const alert = $('<div>\n' +
        '                <div class="alert alert-dismissible bg-light-danger d-flex align-items-center p-4 mb-7 border border-danger hidden">\n' +
        '                    <i class="ki-duotone ki-shield-tick fs-2tx text-danger me-4"><span class="path1"></span><span class="path2"></span></i>\n' +
        '                    <div class="pe-5 pe-sm-2 fs-3 text-danger w-100 message">' + message + '</div>\n' +
        '                    <button type="button" class="btn btn-icon" data-bs-dismiss="alert" aria-label=\'Close\'>\n' +
        '                        <i class="ki-duotone ki-cross fs-1 text-danger"><span class="path1"></span><span class="path2"></span></i>\n' +
        '                    </button>\n' +
        '                </div>\n' +
        '           </div>');

    clearErrorsAlert();

    const id = 'error-message-' + (new Date).getTime()
    alert.attr('id', id);

    setTimeout(function () {
        $('#kt_app_content_container').prepend(alert);
        alert.show();
        scrollIntoViewWithFixedHeader($('#' + id)[0]);
    }, 5);

    const timer = setTimeout(function () {
        delete jsTopAlerts[timer];
        alert.remove();
    }, 10000);

    jsTopAlerts[timer] = id;
}

function clearErrorsAlert() {
    for (const timer in jsTopAlerts) {
        clearTimeout(timer);
        $('#' + jsTopAlerts[timer]).remove();
        delete jsTopAlerts[timer];
    }
}

function showErrorInline (field, message, classes = '') {
    field.attr('style', 'border-color:red');
    field.parent().append('<div class="text-danger mt-2 js-inline-error fw-normal ' + classes + '">' + message + '</div>');
}

function clearErrorsInline (fields) {
    fields.forEach((field) => {
        field.removeAttr('style');
        field.parent().find('.js-inline-error').remove();
    });
}





