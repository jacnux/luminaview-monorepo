window.setGtmEvent = function(event, params) {
    if (!window.dataLayer) {
        console.log('gtm: empty dataLayer');
        return;
    }

    if (!params){
        params = {
            language: $('html').attr('lang').toLowerCase().trim().split('-')[0]
        }
    }

    if (params['language'] === undefined){
        params['language'] = $('html').attr('lang').toLowerCase().trim().split('-')[0];
    }

    if (params) {
        Object.keys(params).forEach(function (item) {
            var temp = {};
            temp[item] = params[item];
            console.log('gtm: push param: ' + item);
            window.dataLayer.push(temp);
        });
    }

    setTimeout(function () {
        console.log('gtm: push event: ' + event);
        window.dataLayer.push({'event': event});
    }, 100);
};

