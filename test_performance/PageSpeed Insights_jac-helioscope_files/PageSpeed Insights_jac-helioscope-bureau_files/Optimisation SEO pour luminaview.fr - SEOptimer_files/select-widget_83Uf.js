$('form.agency-audit .btn-do-audit').click(function () {
    let id = 'select-widget2';
    const type = $('.agency-audit .js-change-audit-type.active').attr('data-type');

    //website audits group (SEO + GEO both take a plain URL, no map lookup)
    if (type === 'seo' || type === 'geo') {
        $(this).closest('form').submit();
        return false;
    }

    //google business maps audits
    if (type === 'gbp' || type === 'local-seo') {
        let params = {
            location: $('#' + id + ' .location').val(),
            latitude: Math.round($('#' + id + ' .latitude').val() * 1000) / 1000,
            longitude: Math.round($('#' + id + ' .longitude').val() * 1000) / 1000,
            place_id: $('#' + id + ' .place_id').val(),
        };
        if (params.location.trim() === '') {
            return false;
        }

        if (params.latitude === '' || params.longitude === '' || params.place_id === '') {
            $('#' + id + ' .listing-wrapper .search-listing').click();
            return false;
        } else {
            $('#' + id + ' .js-user-country').prop({'disabled': false});
            $('#' + id + ' .location').prop({'readonly': false});
            $(this).closest('form').submit();
            return false;
        }
    }
});

$('.gmb-select-widget .location').keydown(function (e) {
    if (e.keyCode !== 13) {
        let id = $(this).closest('.gmb-select-widget').attr('id');

        //Cleaning fields
        $('#' + id + ' .latitude').val('');
        $('#' + id + ' .longitude').val('');
        $('#' + id + ' .place_id').val('');
    }
});

$('.clear-icon').click(function(){
    let id = $(this).closest('.gmb-select-widget').attr('id');
    const $userCountry = $('#' + id + ' .js-user-country');

    setDefaultCountry($userCountry);
    $userCountry.prop({'disabled': false});
    $('#' + id + ' .select2-selection--single').removeAttr('disabled');
    $('#' + id + ' .listing-country-row').css('width', '');
    $('#' + id + ' .location').val('').prop({'readonly': false}).css({
        'border-top-left-radius': '',
        'border-bottom-left-radius': '',
    });
    $('#' + id + ' .latitude').val('');
    $('#' + id + ' .longitude').val('');
    $('#' + id + ' .place_id').val('');

    $(this).hide();
});

function setDefaultCountry(element) {
    element.val(userCountryCode).trigger('change');
}

function setGbpCompetitorFields (listingWrapper, dataCompetitor) {
    listingWrapper.find('.search-clear-btn').hide();
    listingWrapper.find('.input-group-addon').removeClass('search-listing');
    if (dataCompetitor) {
        listingWrapper.find('.location').attr('readonly', true).css({
            'border-top-left-radius': '.475rem',
            'border-bottom-left-radius': '.475rem',
        });
        listingWrapper.find('.js-user-country').attr('disabled', true);
        listingWrapper.find('.listing-country-row').css('width', 0);
        dataCompetitor = JSON.parse(dataCompetitor);
        listingWrapper.find('.clear-icon').show();
    } else {
        listingWrapper.find('.clear-icon').hide();
        listingWrapper.find('.location').removeAttr('readonly').css({
            'border-top-left-radius': '',
            'border-bottom-left-radius': '',
        });
        const $userCountry = listingWrapper.find('.js-user-country');
        $userCountry.removeAttr('disabled');
        setDefaultCountry($userCountry);

        listingWrapper.find('.listing-country-row').css('width', '');
    }
    listingWrapper.find('.location').val(typeof dataCompetitor.location === 'string' ? dataCompetitor.location : '');
    listingWrapper.find('.place_id').val(typeof dataCompetitor.place_id === 'string' ? dataCompetitor.place_id : '');
    listingWrapper.find('.longitude').val(['string', 'number'].includes(typeof dataCompetitor.longitude) ? dataCompetitor.longitude : '');
    listingWrapper.find('.latitude').val(['string', 'number'].includes(typeof dataCompetitor.latitude) ? dataCompetitor.latitude : '');
}

function getCompetitorsOptions (type, prefix) {
    // SEO and GEO are website audits: competitors are plain URL text inputs.
    // GBP / Local SEO use the map-location widget (select-widget3/4) below.
    if (type === 'seo' || type === 'geo') {
        let competitor1 = $(`#${prefix}competitor1`).val();
        let competitor2 = $(`#${prefix}competitor2`).val();
        // filter competitors
        competitor1 = cleanWebsiteURL(competitor1);
        competitor2 = cleanWebsiteURL(competitor2);
        return {competitor1, competitor2}
    }
    let competitor1 = {
        location: $(`#${prefix}select-widget3 .location`).val(),
        latitude: Math.round($(`#${prefix}select-widget3 .latitude`).val() * 1000) / 1000,
        longitude: Math.round($(`#${prefix}select-widget3 .longitude`).val() * 1000) / 1000,
        place_id: $(`#${prefix}select-widget3 .place_id`).val(),
    };
    if (competitor1.location && competitor1.latitude && competitor1.longitude && competitor1.place_id) {
        competitor1 = JSON.stringify(competitor1);
    } else {
        competitor1 = '';
    }

    let competitor2 = {
        location: $(`#${prefix}select-widget4 .location`).val(),
        latitude: Math.round($(`#${prefix}select-widget4 .latitude`).val() * 1000) / 1000,
        longitude: Math.round($(`#${prefix}select-widget4 .longitude`).val() * 1000) / 1000,
        place_id: $(`#${prefix}select-widget4 .place_id`).val(),
    };
    if (competitor2.location && competitor2.latitude && competitor2.longitude && competitor2.place_id) {
        competitor2 = JSON.stringify(competitor2);
    } else {
        competitor2 = '';
    }
    return {competitor1, competitor2}
}

function getGmbMain (prefix) {
    let gmbMain = '';
    if (prefix === 'options-modal-') {
        gmbMain = {
            location: gmb_main.location,
            latitude: Math.round(gmb_main.latitude * 1000) / 1000,
            longitude: Math.round(gmb_main.longitude * 1000) / 1000,
            place_id: gmb_main.place_id,
        };
    } else {
        gmbMain = {
            location: $('#select-widget2 .location').val(),
            latitude: Math.round($('#select-widget2 .latitude').val() * 1000) / 1000,
            longitude: Math.round($('#select-widget2 .longitude').val() * 1000) / 1000,
            place_id: $('#select-widget2 .place_id').val(),
        };
    }

    if (gmbMain.location && gmbMain.latitude && gmbMain.longitude && gmbMain.place_id) {
        gmbMain = JSON.stringify(gmbMain);
    } else {
        gmbMain = '';
    }
    return gmbMain;
}
