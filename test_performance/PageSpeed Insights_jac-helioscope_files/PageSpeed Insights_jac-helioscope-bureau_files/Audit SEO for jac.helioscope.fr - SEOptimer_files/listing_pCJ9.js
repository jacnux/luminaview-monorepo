//id - this is id unique widget
var widget_id_for_listing;

function hideListingSearchAndClearBtns(id = false) {
    if(id){
        $('#listing-wrapper' + id + ' .clear-icon').hide();
        $('#listing-wrapper' + id + ' .search-clear-btn').removeClass('hidden').hide();
        $('#listing-wrapper' + id + ' .input-group-addon').removeClass('search-listing');
        $('#listing-wrapper' + id + ' .listing-country-row').css('width', '');
        $('#listing-wrapper' + id + ' .location').css({
            'border-top-left-radius': '',
            'border-bottom-left-radius': '',
        });
    }else{
        $('.listing-wrapper .clear-icon').hide();
        $('.listing-wrapper .search-clear-btn').removeClass('hidden').hide();
        $('.listing-wrapper .input-group-addon').removeClass('search-listing');
        $('.listing-wrapper .listing-country-row').css('width', '');
        $('.listing-wrapper .location').css({
            'border-top-left-radius': '',
            'border-bottom-left-radius': '',
        });
    }
}

const showListingSearchBtn = (id) => {
    $('#listing-wrapper' + id + ' .search-clear-btn').show();

    $('#listing-wrapper' + id + ' .clear-icon').hide();
    $('#listing-wrapper' + id + ' .input-group-addon').addClass('search-listing');
    $('#listing-wrapper' + id + ' .listing-country-row').css('width', '');
    $('#listing-wrapper' + id + ' .location').css({
        'border-top-left-radius': '',
        'border-bottom-left-radius': '',
    });
};

const showListingClearBtn = (id) => {
    $('#listing-wrapper' + id + ' .search-clear-btn').hide();
    $('#listing-wrapper' + id + ' .clear-icon').show();
    $('#listing-wrapper' + id + ' .input-group-addon').removeClass('search-listing');
    $('#listing-wrapper' + id + ' .listing-country-row').css('width', 0);
    $('#listing-wrapper' + id + ' .location').css({
        'border-top-left-radius': '.475rem',
        'border-bottom-left-radius': '.475rem'
    });
};

const disableInput = (id = null) => {
    if (getOptionsPrefix() === 'options-dropdown-') {
        $('form.agency-audit [name=website]').attr('disabled', 'disabled');
        $('form.agency-audit .btn-do-audit').attr('disabled', 'disabled');
        $('form.agency-audit #crawl-options').attr('disabled', 'disabled');
        if (id) {
            $('#listing-wrapper' + id + ' .search-clear-btn').attr('disabled', 'disabled');
            $('#listing-wrapper' + id + ' .search-clear-btn i').hide();
            $('#listing-wrapper' + id + ' .search-clear-btn .search-clear-spinner').show();
        } else {
            $('form.agency-audit .main-button-spinner').show();
        }
    } else {
        $('#options-modal-save').attr('disabled', 'disabled');
        if (id) {
            $('#listing-wrapper' + id + ' .search-clear-btn').attr('disabled', 'disabled');
            $('#listing-wrapper' + id + ' .search-clear-btn i').hide();
            $('#listing-wrapper' + id + ' .search-clear-btn .search-clear-spinner').show();
        } else {
            $('.modal-button-spinner').show();
        }
    }
}

const enableInput = (id = null) => {
    if (id) {
        $('#listing-wrapper' + id + ' .search-clear-btn').removeAttr('disabled');
        $('#listing-wrapper' + id + ' .search-clear-btn i').show();
        $('#listing-wrapper' + id + ' .search-clear-btn .search-clear-spinner').hide();
    }
    if (getOptionsPrefix() === 'options-dropdown-') {
        $('form.agency-audit [name=website]').removeAttr('disabled');
        $('form.agency-audit .btn-do-audit').removeAttr('disabled');
        $('form.agency-audit #crawl-options').removeAttr('disabled');
        if (id === null) {
            $('form.agency-audit .main-button-spinner').hide();
        }
    } else {
        $('#options-modal-save').removeAttr('disabled');
        if (id === null) {
            $('.modal-button-spinner').hide();
        }
    }
}

const searchBusinessLists = (id) => {
    widget_id_for_listing = id; // global var
    const w_id =  $('#listing-wrapper' + id).closest('.gmb-select-widget').attr('id');

    //block location and country input
    $('#listing-wrapper' + id + ' .js-user-country').prop({'disabled': true});
    $('#listing-wrapper' + id + ' .location').prop({'readonly': true});

    disableInput(w_id === 'select-widget2' ? null : id);

    const businessName = $('#listing-wrapper' + id + ' .location').val();
    const businessCountry = $('#listing-wrapper' + id + ' .js-user-country').val();

    if (!businessName.trim()) {
        return;
    }

    const postData = {
        name: businessName,
        country: businessCountry,
    };

    $.post('/google-maps/search', postData)
        .done(function (response) {
            const data = JSON.parse(response);

            if (data.hasOwnProperty('place_results')) {
                populateBusinessLists(id, businessName, data.place_results);

                if ($(`#listing-wrapper${id} .latitude`).val() === ''
                        || $(`#listing-wrapper${id} .longitude`).val() === ''
                        || $(`#listing-wrapper${id} .place_id`).val() === '') {
                    return false;
                }

                if(w_id === 'select-widget2'){
                    $('#listing-wrapper' + id).closest('form').submit();
                }

                if(w_id.indexOf('select-widget3') !== -1 || w_id.indexOf('select-widget4') !== -1) {
                    showListingClearBtn(id);
                }
                return false;
            } else {
                businessList = data.local_results;
                populateBusinessLists(id, businessName, businessList);
                if (Array.isArray(businessList) && businessList.length === 1) {
                    if ($(`#listing-wrapper${id} .latitude`).val() === ''
                        || $(`#listing-wrapper${id} .longitude`).val() === ''
                        || $(`#listing-wrapper${id} .place_id`).val() === '') {
                        return false;
                    }
                    if(w_id === 'select-widget2'){
                        $('#listing-wrapper' + id).closest('form').submit();
                    }
                    if(w_id.indexOf('select-widget3') !== -1 || w_id.indexOf('select-widget4') !== -1) {
                        showListingClearBtn(id)
                    }
                }
            }
        })
        .always(function () {
            if(w_id === 'select-widget2'){
                $('.btn-options.active').click();
            }
            enableInput(w_id === 'select-widget2' ? null : id);
        });
};

const populateBusinessListContent = (id, key, data, last) => {
    const type = getOptionsPrefix() === 'options-modal-' ? $('#options-modal').attr('data-type') : $('.agency-audit .js-change-audit-type.active').attr('data-type');
    let content = '';

    content += '<div class="modal-location-listing' + (checkWebsite(type, data) ? '' : ' disable-no-website" data-bs-toggle="tooltip" title="' + noWebsiteForLocalSeo + (last ? '" style="border-bottom:none;' : '')) +'">';
    content += '<div class="row">';
    content += '<div class="col-xs-12">';
    content += '<div class="business-name">' + (checkWebsite(type, data) ? '<a href="javascript:void(0)" class="business-list-selector" data-widget-number="' + id + '" data-position="' + key + '" data-bs-dismiss="modal">' + data.title + '</a>' : data.title) + '</div>';
    if (data.address) {
        content += '<div class="business-address">' + data.address + '</div>';
    }
    content += '<div class="business-rating">';
    if (data.rating) {
        content += '<div class="business-star-rating">';
        content += '<span class="review-rating">';

        let checked = ' checked';
        let rValue = Math.floor(data.rating),
            partVl = parseInt((parseFloat(data.rating) > rValue ? parseFloat(data.rating) - rValue : rValue - parseFloat(data.rating)) * 100);
        for (let r = 1; r < 6; r++) {
            let half = '';
            if (r > rValue) {
                if (checked !== '') {
                    if ((partVl > 0) && (partVl < 50)) {
                        half = ' half-star-40 half-star';
                    } else if (partVl === 50) {
                        half = ' half-star-55 half-star';
                    } else if (partVl > 50) {
                        half = ' half-star-70 half-star';
                    }
                }
                checked = '';
            }
            content += '<span class="rating-star' + checked + half + '" data-char="★">★</span>';
        }
        content += '</span>';
        content += '<span class="score">(' + data.rating + ')</span>';
        content += '</div>';
    }

    if (data.reviews) {
        content += '<div class="business-reviews">Reviews: ' + data.reviews.toLocaleString() + '</div>';
    }
    content += '</div>';
    content += '</div>';
    content += '</div>';
    content += '</div>';

    return content;
};

const checkWebsite = (type, data) => {
    if (type === 'gbp') {
        return true;
    }
    return data.website !== undefined;
}

const populateBusinessLists = (id, businessName, data) => {
    const header = 'Listing search results for "<strong>' + businessName + '"</strong>';
    let content = '';

    if ($.isEmptyObject(data)) {
        content += '<div class="modal-location-listing">';
        content += '<p>There is no result at this location</p>';
        content += '</div>';
    } else {
        const type = getOptionsPrefix() === 'options-modal-' ? $('#options-modal').attr('data-type') : $('.agency-audit .js-change-audit-type.active').attr('data-type');
        data = Array.isArray(data) ? data : [data];
        if (data.length === 1 && checkWebsite(type, data[0])) {
            initializeListingFromSelection(id, data[0]);
            return;
        } else {
            $.each(data, function (key, item) {
                const last = (data.length - key === 1);
                content += populateBusinessListContent(id, key, item, last);
            });
        }
    }

    $('.listing-search-modal-content').html(content);
    $('.listing-search-modal-header').html(header);
    initTooltips();
    $('#options-modal').css('opacity', 0);
    $('#listingSearchModal').modal('show');
};

const initializeListingFromSelection = (id, data) => {
    $('.report-listing-redirect').show();
    let title = data.title;
    title += data.address ? ', ' + data.address : '';

    //$('#listing-wrapper' + id + ' .location').css({'color': 'green'});
    $('#listing-wrapper' + id + ' .location').val(title).trigger('change');
    $('#listing-wrapper' + id + ' .latitude').val(data.gps_coordinates.latitude).trigger('change');
    $('#listing-wrapper' + id + ' .longitude').val(data.gps_coordinates.longitude).trigger('change');
    $('#listing-wrapper' + id + ' .place_id').val(data.place_id).trigger('change');

    //open inputs
    $('#listing-wrapper' + id + ' .listing-name-country-selector-row').removeClass('activate-border');
    $('#listing-wrapper' + id + ' .search-clear-btn').prop('disabled', false).css('cursor', 'pointer');
    $('#listing-wrapper' + id + ' .input-group-addon').addClass('search-listing');
};

$("#listingSearchModal").on('hide.bs.modal', function () {
    setTimeout(function(){
        let params = {
            location: $('#location' + widget_id_for_listing).val(),
            latitude: $('#latitude' + widget_id_for_listing).val(),
            longitude: $('#longitude' + widget_id_for_listing).val(),
            place_id: $('#place_id' + widget_id_for_listing).val(),
        };

        //unblock the input of the text of the location if empty real location
        if (params.location === '' || params.latitude === '' || params.longitude === '' || params.place_id === '') {
            $('#listing-wrapper' + widget_id_for_listing + ' .js-user-country').prop({'disabled': false});
            $('#location' + widget_id_for_listing).prop({'readonly': false});
        }else{
            let w_id =  $('#listing-wrapper' + widget_id_for_listing).closest('.gmb-select-widget').attr('id');

            if(w_id === 'select-widget2'){
                $('#listing-wrapper' + widget_id_for_listing + ' .js-user-country').prop({'disabled': false});
                $('#location' + widget_id_for_listing).prop({'readonly': false});

                $('#select-widget3 .js-user-country').prop({'disabled': false});
                $('#select-widget3 .location').prop({'readonly': false});

                $('#select-widget4 .js-user-country').prop({'disabled': false});
                $('#select-widget4 .location').prop({'readonly': false});
            }else{
                $('#listing-wrapper' + widget_id_for_listing + ' .js-user-country').prop({'disabled': true});
                $('#location' + widget_id_for_listing).prop({'readonly': true});
            }

            if(w_id === 'select-widget2'){
                $('#listing-wrapper' + widget_id_for_listing).closest('form').submit();
            }

            if(w_id.indexOf('select-widget3') !== -1 || w_id.indexOf('select-widget4') !== -1){
                $('#listing-wrapper' + widget_id_for_listing + ' .clear-icon').show();
                $('#listing-wrapper' + widget_id_for_listing + ' .search-icon').hide();
                $('#listing-wrapper' + widget_id_for_listing + ' .search-clear-btn').removeClass('hidden').hide();
                $('#listing-wrapper' + widget_id_for_listing + ' .listing-country-row').css('width', 0);
                $('#listing-wrapper' + widget_id_for_listing + ' .location').css({
                    'border-top-left-radius': '.475rem',
                    'border-bottom-left-radius': '.475rem',
                });
            }
        }
        $('#options-modal').css('opacity', 1);
    },100); // Delay so 100 good - animation to closed modal
});

function initTooltips(root=document) {
    root.querySelectorAll('.disable-no-website').forEach(el => {
        if (!bootstrap.Tooltip.getInstance(el)) {
            new bootstrap.Tooltip(el, {
                container: el.closest('.modal-content'),
                boundary: el.closest('.modal-content')
            });
        }
    });
}

document.querySelectorAll('.modal-body').forEach(body => {
    body.addEventListener('scroll', () => {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            const tooltip = bootstrap.Tooltip.getInstance(el);
            if (tooltip) tooltip.hide();

        });
    });
});
