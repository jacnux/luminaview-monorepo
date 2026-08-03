//id - this is id unique widget
let businessList = null;

$('.gmb-select-widget .location').on('input keydown', function (e) {
    const widget_id = $(this).attr('data-widget-number');

    if ($(this).val().trim()) {
        if (e.keyCode === 13) {
            searchBusinessLists(widget_id);
            e.preventDefault();
        }
        showListingSearchBtn(widget_id);
    } else {
        hideListingSearchAndClearBtns(widget_id);
    }
});

$(document).on('click', '.listing-wrapper .search-listing', function (e) {
    searchBusinessLists($(this).attr('data-widget-number'));
    e.preventDefault();
});

$(document).on('click', '.business-list-selector', function () {
    let widget_id = $(this).attr('data-widget-number');

    const data = businessList[$(this).data('position')];
    initializeListingFromSelection(widget_id, data);
});

hideListingSearchAndClearBtns();
