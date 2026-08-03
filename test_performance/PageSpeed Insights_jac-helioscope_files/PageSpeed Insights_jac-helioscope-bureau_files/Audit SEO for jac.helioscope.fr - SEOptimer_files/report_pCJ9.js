if (isPdfRequest()) {
    document.body.style.zoom = 0.663;
}

/*
window.setTimeout(function(){
    document.getElementsByClassName('section-title')[0].innerText =
        document.getElementsByTagName('body')[0].getAttribute('style') +
        ' ' +
        document.getElementsByTagName('html')[0].getAttribute('style') +
        ' ' +
        window.devicePixelRatio;
}, 15*1000);
*/

let isMobile; //initiate as false
let csrfToken = $('meta[name="csrf-token"]').attr("content");
const websiteIds = Object.keys(websiteNames).map(Number);
let countCheckRequests = 9 + 1; // +1 = llm (GEO-AI vision analysis)

if (typeAudit === 'local-seo') {
    countCheckRequests = 6; // local-seo have 6 ajax check requests (html, localseo, ...) + gmb (for review chart)
    countCheckRequests += 1; // bing local listing
    countCheckRequests += 1; // apple maps listing
    countCheckRequests += 1; // yellow pages listing
    countCheckRequests += 1; // yelp pages listing

    countCheckRequests += (showRecentGoodReviews || showRecentBadReviews) ? 2 : 1; // google reviews (if enable) (request + receive)
    countCheckRequests += (!isAgency || showGeoGridRanking); // geo grid image (if enable)
}
if (typeAudit === 'gbp') {
    countCheckRequests = 2; // gmb + request posts and reviews
    countCheckRequests += (!isAgency || showWorldCloud) // show word cloud
    countCheckRequests += (!isAgency || showRecentGoodReviews || showRecentBadReviews); // google reviews (if enable)
    countCheckRequests += (!isAgency || showRecentPosts); // google posts (if enable)
}
if (typeAudit === 'geo') {
    countCheckRequests = 9; // html, files, metrics, rankings, llm, prompt, promptvisibility, citations (reddit + youtube, bundled), wiki (server not needed for GEO; no localseo/social/insights/backlinks)
}
let requestsTotal = countCheckRequests * websiteIds.length; // update this variables after adding new check requests
if (window.quick_group !== undefined){
    requestsTotal = 1;
}

let requestsCompleted = 0;
let progressPercentsDone = 5;
let formOptions = '';
var currentProgressActions = [];
var scores = {};
const divideTables = isPdfRequest();
let currentProgressAction = lajax.t('Analyzing Website');

let sections = {
    'seo': lajax.t("On-Page SEO"),
    'geo': lajax.t("GEO"),
    'links': lajax.t("Links"),
    'ui': lajax.t("Usability"),
    'performance': lajax.t("Performance"),
    //'rankings': lajax.t("Rankings"),
    //'localseo': lajax.t("GBP"),
};

if(typeAudit === 'local-seo') {
    sections = {
        'localseo': lajax.t("GBP"),
        'listings': lajax.t("Other Listings"),
        'seo': lajax.t("On-Page SEO"),
        'links': lajax.t("Links"),
        'rankings': lajax.t("Rankings"),
        'localseo-reviews': lajax.t("Reviews"),
    };
}

if (typeAudit === 'geo') {
    sections = {
        'geo': lajax.t("Accessibility"),
        'geo-content-analysis': lajax.t("Content Analysis"),
        'geo-prompt-visibility': lajax.t("Prompt Visibility"),
        'important-citations': lajax.t("Citations"),
        'links': lajax.t("Links"),
        'seo': lajax.t("On-Page SEO"),
    };
}

if (typeAudit === 'gbp') {
    sections = {
        'gmb': lajax.t("Completeness"),
        'keyword': lajax.t("Keyword"),
        'reviews': lajax.t("Reviews"),
        'posts': lajax.t("Posts"),
    };
    currentProgressAction = lajax.t('Retrieving Google Business Profile');
}

let targetKeywordRegexp;

const RadarChart = (function () {
    let chart;
    let element;
    let isNew = true;

    // Private methods
    const initChart = function () {
        element = document.getElementById("radar_chart");
        if (!element) {
            return;
        }

        updateChart();

        // Update chart on theme mode change
        KTThemeMode.on("kt.thememode.change", function () {
            // Reinit chart
            updateChart();
        });
    };

    const updateChart = function () {
        if (scores.length === 0) {
            return;
        }

        const data = [];

        // { links: {score: 10, max: 12}, localseo: {score: 0, max: 3}, performance: {score: 11, max: 18}, seo: {score: 35, max: 58}, social: {score: 0, max: 10}, ui: {score: 10, max: 17}, website: {score: 66, max: 118} }
        for (let section in sections) {

            if ( !(section in scores) ) {
                continue;
            }

            let value = Math.round(100 * scores[section].score / scores[section].max); // percentage
            value = (value > 100) ? 100 : value; // limit to 100%

            // scaled value formula from update score
            value = Math.max(Math.round(100-((100-value)*1.5)), 0);

            data.push({
                'name': getSectionName(section),
                'value': value,
                'label':  scoringType ? value : calculateGrade(value),
            });
        }

        if (data.length < 3) {
            return;
        }
        let radarColor = '';
        if (typeof hasForegroundColor !== 'undefined' && hasForegroundColor) {
            radarColor = foregroundColor;
        } else {
            radarColor = KTUtil.getCssVariableValue('--bs-primary');
        }

        const labelsColor = KTUtil.getCssVariableValue('--bs-gray-600');
        const options = {
            series: [
                {
                    name: 'Scores',
                    data: data.map((x) => x.value),
                },
            ],
            chart: {
                toolbar: {
                    show: false,
                },
                height: 270,
                type: 'radar',
            },
            tooltip: {
                y: {
                    title: {
                        formatter: () => ':',
                    },
                    formatter: function (val) {
                        return scoringType ? val : calculateGrade(val);
                    },
                },
                marker: {
                    show: false,
                },
            },
            yaxis: {
                show: false,
                min: 0,
                max: 100,
                tickAmount: 5,
            },
            xaxis: {
                categories: data.map((x) => x.name),
                labels: {
                    style: {
                        colors: [
                            labelsColor,
                            labelsColor,
                            labelsColor,
                            labelsColor,
                            labelsColor,
                        ],
                        fontFamily: $('body').css('font-family'),
                    },
                },
            },
            fill: {
                colors: [
                    radarColor,
                ],
            },
            stroke: {
                colors: [
                    radarColor,
                ],
            },
            markers: {
                colors: [
                    radarColor,
                ],
            },
        };
        if (isPdfRequest()) {
            // no-flex pdf renderer fix
            // direct get full container height working incorrectly
            $(".results-radar-container").parent().css('height', $(".results-scores-container .col-lg-2").height() + 40 + 20);
            options.chart.animations = {
                enabled: false
            }
        }
        if (isNew) {
            chart = new ApexCharts(element, options);
            chart.render();
            isNew = false;
        } else {
            chart.updateOptions({
                series: [
                    {
                        name: 'Scores',
                        data: data.map((x) => x.value),
                    },
                ],
                xaxis: {
                    categories: data.map((x) => x.name),
                    labels: {
                        style: {
                            colors: [
                                labelsColor,
                                labelsColor,
                                labelsColor,
                                labelsColor,
                                labelsColor,
                            ],
                        },
                    },
                },
            })
        }
    };

    // Public methods
    return {
        init: function () {
            initChart();
        },
        update: function () {
            updateChart();
        },
    };
})();

const ScoreCharts = (function () {
    const charts = [];

    function drawChart (chartClasses) {
        if (!chartClasses) {
            return;
        }

        const elements = document.querySelectorAll(charts[chartClasses].selector);
        [].slice.call(elements).map(function(element) {
            const value = parseInt(element.getAttribute('data-value') ?? 0);
            const height = parseInt(element.getAttribute('data-height'));
            charts[chartClasses].label = element.getAttribute('data-label') ?? ' ';
            const fontSize = element.getAttribute('data-font-size') ?? "30px";
            const offsetY = Math.round(parseInt(fontSize)/2 - (chartClasses.match(/website(\d+)-score/) !== null ? 1 : 3));
            const size = height > 150 ? '65%' : height > 100 ? '60%' : '50%';
            const labelColor = KTUtil.getCssVariableValue('--bs-' + 'gray-700');
            const colors = getColors(element, value);

            let options = {
                series: [
                    value,
                ],
                animations: {
                    enabled: true,
                },
                chart: {
                    fontFamily: 'inherit',
                    height: height,
                    sparkline: {
                        enabled: true,
                    },
                    type: 'radialBar',
                },
                grid: {
                    show: false,
                    padding: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                },
                redrawOnParentResize: true,
                plotOptions: {
                    radialBar: {
                        hollow: {
                            margin: 0,
                            size: size,
                        },
                        dataLabels: {
                            showOn: "always",
                            name: {
                                show: false,
                                fontWeight: '700',
                            },
                            value: {
                                color: labelColor,
                                fontSize: fontSize,
                                fontWeight: '700',
                                offsetY: offsetY,
                                show: true,
                                formatter: function () {
                                    return charts[chartClasses].label !== null ? charts[chartClasses].label : '';
                                },
                            },
                        },
                        track: {
                            background: function({ value, seriesIndex, w }) {
                                return colors[1];
                            },
                            strokeWidth: '100%',
                        },
                    },
                },
                colors: [
                    function({ value, seriesIndex, w }) {
                        return colors[0];
                    },
                ],
                // getColors(element, value)[0]],
                stroke: {
                    lineCap: "round",
                },
                labels: [],
            };
            charts[chartClasses].chart = new ApexCharts(element, options);
            charts[chartClasses].chart.render();
        });
    }

    function getColors(element, value) {
        let dialColor = 'danger';
        if (typeof dialColorsBasedOnScoreRanges !== 'undefined') {
            dialColorsBasedOnScoreRanges.forEach(function (colorRange) {
                if (
                    value >= colorRange['range'][0] &&
                    value <= colorRange['range'][1]
                ) {
                    dialColor = colorRange['color'];
                }
            });
        }

        const color = element.getAttribute('data-color') ?? (element.getAttribute('data-fgColor') ?? dialColor);
        let baseColor = color;
        let lightColor;
        if (color[0] === '#') {
            const rgb = hexToRgb(color);
            lightColor = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ', 0.3)';
        } else {
            baseColor = KTUtil.getCssVariableValue('--bs-' + color);
            lightColor = KTUtil.getCssVariableValue('--bs-' + color + '-light');
        }

        return [
            baseColor,
            lightColor,
        ];
    }

    const updateCharts = function (chartClasses) {
        if (charts[chartClasses] && charts[chartClasses].chart) {
            const elements = document.querySelectorAll(chartClasses);
            [].slice.call(elements).map(function(element) {
                const value = parseInt(element.getAttribute('data-value') ?? 0);
                const colors = getColors(element, value);
                charts[chartClasses].label = element.getAttribute('data-label') ?? ' ';
                charts[chartClasses].chart.opts.colors = [colors[0]];
                charts[chartClasses].chart.updateOptions({
                    series: [value],
                    plotOptions: {
                        radialBar: {
                            track: {
                                background: function ({value, seriesIndex, w}) {
                                    return colors[1];
                                }
                            },
                        },
                    },
                    colors: [function({ value, seriesIndex, w }) {
                        return colors[0];
                    }],
                });
            });
        }
    }

    const initCharts = function (elements) {
        [].slice.call(elements).map(function(element) {
            const chartClasses = '.' + element.className.replaceAll(' ', '.');
            if (!charts[chartClasses]) {
                charts[chartClasses] = {
                    'selector': chartClasses,
                }
            }
            drawChart(chartClasses);
        });

        // Update charts on theme mode change
        KTThemeMode.on("kt.thememode.change", function () {
            for (const chart  in charts) {
                charts[chart].chart.destroy();
                drawChart(chart);
            }
        });
    };

    // Public methods
    return {
        update: function (chartClasses) {
            updateCharts(chartClasses);
        },
        init: function (selectors) {
            initCharts(selectors);
        },
    };
})();

const MeterGraphs = (function () {
    let graphs = [];
    let labelColor = '#999999';
    let valueColor = '#cccccc';
    let backgroundColor = 'white';
    let successColor = '';
    let middleColor = '#DFFFEA';
    let dangerColor = '#F15642';
    let needleColor = '';

    const updateGraphs = function () {
        if (KTThemeMode) {
            labelColor = KTUtil.getCssVariableValue('--bs-gray-600');
            valueColor = KTUtil.getCssVariableValue('--bs-gray-700');
            backgroundColor = KTUtil.getCssVariableValue('--bs-body-bg');
            needleColor = KTUtil.getCssVariableValue('--bs-gray-800');
        }

        [].slice.call(graphs).map(function(graph) {
            graph.set('colorsStroke', backgroundColor);
            graph.set('textColor', labelColor);
            graph.set('labelsValueColor', valueColor);
            graph.set('needleColor', needleColor);
            graph.grow();
        });
    };

    const addGraphs = function (id, wid, width, labels, value, max, unit, decimal) {
        if (KTThemeMode) {
            labelColor = KTUtil.getCssVariableValue('--bs-gray-600');
            valueColor = KTUtil.getCssVariableValue('--bs-gray-700');
            backgroundColor = KTUtil.getCssVariableValue('--bs-body-bg');
            successColor = KTUtil.getCssVariableValue('--bs-success');
            needleColor = KTUtil.getCssVariableValue('--bs-gray-800');
        }

        const graph = new RGraph.Meter({
            id: id,
            min: 0,
            max: max,
            value: value,
            options: {
                marginBottom: 40,
                anglesStart: RGraph.PI,
                anglesEnd: RGraph.TWOPI,
                segmentsRadiusStart: parseInt(width * 0.228 + (width - 290) * 0.225),
                needleRadius: parseInt(width * 0.25 + (width - 290) * 0.25),
                needleHead: false,
                tickmarksSmallCount: 0,
                tickmarksLargeCount: 0,
                labelsSpecific: labels,
                linewidth: .00001,
                linewidthSegments: 5,
                colorsStroke: backgroundColor,
                backgroundColor: 'transparent',
                colorsRanges: [
                    [labels[0][1], labels[1][1], successColor],
                    [labels[1][1], labels[2][1], middleColor],
                    [labels[2][1], labels[3][1], dangerColor],
                ],
                textSize: wid === websiteId ? 12 : 9,
                textAccessible: false,
                labelsValueBackgroundStroke: 'transparent',
                labelsValueBackgroundFill: 'transparent',
                textColor: labelColor,
                needleColor: needleColor,
                border: false,
            },
        }).grow();

        graphs.push(graph);
        const element = $('#' + id);
        element.parent().css('min-width', width + 'px');
        const valueLabel = element.parent().find('span');
        valueLabel.css('font-size', width / (isPdfRequest() ? 14 : 15) + 'px');
        valueLabel.css('padding-top', (width === 370 ? '46' : width === 330 ? '52' : '39') + 'px');
        valueLabel.text((unit === '%' ? Math.round(100 - value) : value.toFixed(decimal)) + unit);
        if (!element.hasClass('mt-n15')) {
            element.addClass('mt-n8');
        }
    };

    // Public methods
    return {
        update: function () {
            updateGraphs();
        },
        add: function (id, wid, width, labels, value, max, unit, decimal = 1) {
            addGraphs(id, wid, width, labels, value, max, unit, decimal);
        },
        init: function () {
            graphs = [];
            KTThemeMode.on("kt.thememode.change", function () {
                // Reinit graphs
                updateGraphs();
            });
        },
    };
})();

const DonutChart = function () {
    let backgroundColor ='';
    const initChart = function (wid, selector, className, pieData, colors, totalCount, unit) {
        const element = $('#' + selector + ' .' + className);

        if (!element) {
            return;
        }

        let width = (wid === websiteId) ? 280 : 236;

        element.attr('width', width);
        element.attr('height', parseInt(width * 0.737));
        element.attr('id', selector + className);
        $(element.parent()).addClass((wid === websiteId) ? 'me-11 me-sm-15' : 'me-5 me-9');

        $('span:first', element.parent()).html(unit ? mbFormatter(totalCount, unit) : nFormatter(totalCount, 1))
            .css('font-size', wid === websiteId ? '25px' : '20px');
        $('span:last', element.parent()).addClass(wid === websiteId ? 'fs-6 fs-pdf-8' : 'fs-7 fs-pdf-9');
        const legend = $('.js-donut-legend', element.parent().parent());
        $.each(pieData, function( key, item ) {
            legend.append('<div class="d-flex ' + (wid === websiteId ? 'fs-6' : 'fs-7') + ' fs-pdf-7 fw-semibold align-items-center text-start mb-3">\n' +
                '<div class="bullet bg-' + colors[key] + ' me-3"></div>\n' +
                '<div class="text-gray-500">' + item.label + '</div>\n' +
                '<div class="ms-auto fw-bold text-gray-500">' + (unit ? mbFormatter(item.data, unit) : nFormatter(item.data, 1)) + '</div>\n' +
                '</div>');
        });

        if (KTThemeMode) {
            colors = colors.map((x) => x[0] === '#' ? x : KTUtil.getCssVariableValue('--bs-' + x));
            backgroundColor = KTUtil.getCssVariableValue('--bs-body-bg');
        }

        const options = {
            series: pieData.map((x) => x.data),
            chart: {
                fontFamily: 'inherit',
                type: 'donut',
                width: width,
            },
            plotOptions: {
                pie: {
                    expandOnClick: false,
                    donut: {
                        size: (wid === websiteId) ? '75%' : '70%',
                    },
                },
            },
            states: {
                active: {
                    filter: {
                        type: 'none',
                    },
                },
                hover: {
                    filter: {
                        type: 'none',
                    },
                },
            },
            colorsStroke: backgroundColor, //'transparent',
            colors: colors,
            stroke: {
                width: 2,
                color: backgroundColor,
            },
            labels: pieData.map((x) => x.label),
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
            fill: {
                type: 'true',
                color: backgroundColor,
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return unit ? mbFormatter(value, unit) : nFormatter(value, 1);
                    },
                },
            },
        };

        const chart = new ApexCharts(document.getElementById(selector + className), options);
        chart.render();
        if (isPdfRequest()){
            //element.attr('style', 'width: 85%!important');
        }
    };

    // Public methods
    return {
        init: function (wid, selector, className, pieData, colors, totalCount, unit = '') {
            initChart(wid, selector, className, pieData, colors, totalCount, unit);
        },
    }
}();


// TODO huge refactoring (remove html code everywhere, use cloning, classes and ids instead)
/**
 * @returns {boolean}
 */
function isMobileRequest() {
    if (isMobile === undefined) {
        isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4));
    }

    return isMobile;
}

function csrfFunction(parameter) {
    // sha1 (maybe)
    if (typeof SERDFDFVHA === 'undefined'){
        console.warn('csrf function not exixts');
        return '';
    }

    return SERDFDFVHA(parameter);
}

$(function () {
    history.scrollRestoration = "manual";
    if (navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        $('.js-ajax-alert')
            .removeClass('d-none')
            .find('.alert-message')
            .html(lajax.t('Unfortunately SEOptimer reporting no longer supports your legacy browser (Internet Explorer). Please upgrade to a more modern browser such as Chrome, Firefox, Safari or Microsoft Edge.'));
        $('.tab-results, .tab-recommendations, #progress-bar, .progress-bar-container .progress-bar').hide();
    }

    csrfToken = csrfFunction(navigator['us' + 'er' + 'Ag' + 'en' + 't']) || '';

    if (window.requestIdleCallback) {
        requestIdleCallback(function () {
            Fingerprint2.get(function (components) {
                sendAudit(components); // an array of components: {key: ..., value: ...}
            });
        });
    } else {
        setTimeout(function () {
            Fingerprint2.get(function (components) {
                sendAudit(components); // an array of components: {key: ..., value: ...}
            });
        }, 500);
    }

    if (isMobileRequest()) {
        $('body').addClass('wrapper-mobile');
    }

    if (typeAudit === 'gbp' || typeAudit === 'local-seo') {
        $('.listing-wrapper')
            .addClass('d-flex')
            .removeClass('d-none');
        $('#options-competitor1, #options-competitor2')
            .addClass('d-none')
            .removeClass('d-block');
    }

    /* Select2  init (map-location country dropdown — GBP / Local SEO only, not website audits) */
    if (typeAudit !== 'seo' && typeAudit !== 'geo') {
        const optionFormatCountry = function (item) {
            if (!item.id) {
                return item.text;
            }

            const span = document.createElement('span');
            span.classList.add('d-flex', 'align-items-center');

            let template = `<span class="country-flag-icon flag-icon flag-icon-squared flag-icon-${item.id.toLowerCase()}"></span>`;
            template += `<span>${item.text}</span>`;
            span.innerHTML = template;

            return $(span);
        };

        $('#options-modal-select-widget3 .js-user-country, #options-modal-select-widget4 .js-user-country').select2({
            templateSelection: optionFormatCountry,
            templateResult: optionFormatCountry
        });
        $('.js-user-country').on('select2:open', function () {
            $('.select2-container--open .select2-dropdown').css('min-width', '240px');
        });
    }

    $('.js-action-click').click(function () {
        const $source = $(this);
        const $target = $($source.attr('data-target'));
        const action = $source.attr('data-action');

        $target[action]();
    });

    const elements = $(".knob")
        .filter(function () {
         return $(this).closest(".hidden").length === 0;
     })
    MeterGraphs.init();
    ScoreCharts.init(elements);
    RadarChart.init();

    $('a.submit').on('click touch', function () {
        $(this).closest('form').submit();
        return false;
    });

    /* smooth link anchor scrolling */
    $('body').on('click', 'a.scroll', function (e) {
        e.preventDefault(); // prevent double jumping

        if ($('body').width() < 768) {
            $('.nav>li.main_menu').hide('slow');
        }

        const $linkTarget = $( $(this).attr("href") );
        const $topHeaderMenu = $('.topbar-main');
        let destination = $linkTarget.offset().top;
        //let offset = 200 + ($topHeaderMenu.length > 0 ? 120 : 0);
        let offset = Math.trunc(window.innerHeight * 0.25) - 30; // 25% of window height - some section padding
        let duration = 1500; // ms

        if ($topHeaderMenu.length > 0){
           //offset = offset + $topHeaderMenu.outerHeight();
        }

        if ($(this).attr('data-scroll-duration') != undefined){
            duration = $(this).attr('data-scroll-duration');
        }

        if ($(window).width() < 992) {
            offset = Math.trunc(window.innerHeight * 0.15) - 22; // 15% of window height - some section padding
            $('.navbar-toggle').removeClass('open');
            $('#navigation').hide('slow');
        } else {
            //destination -= 100;
        }

        var targetHash = this.hash;
        $('body,html').animate({
            scrollTop: destination - offset,
        }, duration, 'swing', function() {
            if (history.pushState) {
                history.pushState(null, null, targetHash);
            } else {
                // Fallback for older browser
                window.location.hash = targetHash;
            }
        });
    });

    reInitDetailsButtons();

    const js_main_progress_bar = $('.js-main-progress-bar');
    $('#options-modal')
        .on('hidden.bs.modal', function (e) {
            const optionsBtn = $('#options-btn');
            setTimeout(function() {
                $(js_main_progress_bar).removeAttr('style');
                $(optionsBtn).blur();
            }, 50);
            setTimeout(function () {
                if ($(optionsBtn).attr('data-kt-menu-attach') !== 'parent') {
                    $(optionsBtn).removeClass('btn-no-active');
                    $(optionsBtn).addClass('btn-light-primary');
                }
            }, 300);
        })
        .on('show.bs.modal', function () {
            setTimeout(function () {
                $(js_main_progress_bar).attr('style', 'padding-right: ' + $('body').css('padding-right'));
                formOptions = $(this).find('form').serialize();
            }, 3);

            // GBP competitor fields only exist on the GBP / Local SEO reports (which define
            // gmb_competitor1/2). SEO and GEO reports don't, so guard against both or the
            // ReferenceError kills the modal's show handler (breaking the whole Options button).
            if (typeAudit !== 'seo' && typeAudit !== 'geo') {
                setGbpCompetitorFields( $('#options-modal-select-widget3 .listing-wrapper'), gmb_competitor1 && gmb_competitor1.hasOwnProperty('location') ? JSON.stringify(gmb_competitor1) : '');
                setGbpCompetitorFields( $('#options-modal-select-widget4 .listing-wrapper'), gmb_competitor2 && gmb_competitor2.hasOwnProperty('location') ? JSON.stringify(gmb_competitor2) : '');
            }
        });

    $('#share-button').on('click', function (e) {
        const self = $(this);
        setTimeout(function () {
            if ($(self).attr('aria-expanded') === 'false') {
                $(self).blur();
            }
        }, 50);
    })

    if (!isMobileRequest()) {
        $('#options-btn').on('mousedown click', function (e) {
            if ($(this).attr('data-kt-menu-attach') === 'parent') {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        });
    } else {
        $('#options-btn').on('touch click', function (e) {
            const self = $(this);
            setTimeout(function () {
                if ($(self).attr('data-kt-menu-attach') !== 'parent') {
                    $(self).addClass('btn-active');
                    $(self).removeClass('btn-light-primary');
                }
            }, 1);
            setTimeout(function () {
                if ($(self).attr('data-kt-menu-attach') !== 'parent') {
                    $(self).addClass('btn-no-active');
                    $(self).removeClass('btn-active');
                }
            }, 501);
        });
    }

    $('#options-modal-save').on('click', function () {
        // validate keyword for wrong chars \/?
        const form = $('#options-modal')
        if (formOptions === form.find('form').serialize()) {
            form.modal('hide');
            return;
        }

        const optionsTarget = $('#options-target');
        const targetKeyword = optionsTarget.val();
        const targetWebsite = $('#options-domain').val();
        const optionsCompetitor1 = $('#options-competitor1');
        const optionsCompetitor2 = $('#options-competitor2');

        let location = null;
        let latitude = null;
        let longitude = null;
        let place_id = null;
        if (typeof gmb_main !== 'undefined') {
            location = gmb_main.location;
            latitude = gmb_main.latitude;
            longitude = gmb_main.longitude;
            place_id = gmb_main.place_id;
        }

        clearErrorsInline([optionsTarget, optionsCompetitor1, optionsCompetitor2])
        if (targetKeyword.match(/[\/?#<>"]/) !== null) {
            optionsTarget.attr('style', 'border-color:red');
            showErrorInline(optionsTarget, lajax.t('Special characters are not allowed: ') + '/?#<>"');
            return false;
        }
        // validate website on unique (SEO + GEO are both website audits with plain-URL competitors)
        if (typeAudit === 'seo' || typeAudit === 'geo') {
            const targetCompetitor1 = optionsCompetitor1.val().toLowerCase().replace(/https?:\/\//, '');
            if ((targetCompetitor1 !== '') && (targetCompetitor1 === targetWebsite || !isValidURL(targetCompetitor1))) {
                showErrorInline(optionsCompetitor1, targetCompetitor1 === targetWebsite ? lajax.t('You have entered the same website URL multiple times. Please use unique website URLs.') : checkDomainMessage);
                return false;
            }

            const targetCompetitor2 = optionsCompetitor2.val().toLowerCase().replace(/https?:\/\//, '');
            if ((targetCompetitor2 !== '') && (targetCompetitor2 === targetWebsite || targetCompetitor2 === targetCompetitor1 || !isValidURL(targetCompetitor2))) {
                showErrorInline(optionsCompetitor2, targetCompetitor2 === targetWebsite || targetCompetitor2 === targetCompetitor1 ? lajax.t('You have entered the same website URL multiple times. Please use unique website URLs.') : checkDomainMessage);
                return false;
            }

            // filter competitors
            optionsCompetitor1.val(cleanWebsiteURL(optionsCompetitor1.val()));
            optionsCompetitor2.val(cleanWebsiteURL(optionsCompetitor2.val()));
        } else {
            const competitors = getCompetitorsOptions(typeAudit, 'options-modal-');
            if (competitors.competitor1 === '' && competitors.competitor2 !== '') {
                competitors.competitor1 = competitors.competitor2;
                competitors.competitor2 = '';
            }
            optionsCompetitor1.val(competitors.competitor1);
            optionsCompetitor2.val(competitors.competitor2);
        }

        form.modal('hide');
        $('body').prepend('<div class="page-loader bg-dark flex-column bg-opacity-25 d-flex"><span class="spinner-border text-primary position-absolute start-50 top-50 ms-n8 mt-n8 h-40px w-40px" role="status"></span></div>');
        const optionsTemplate = $('#options-template');
        window.location = generateReportUrl({
            'host': $('#options-host-domain').val(),
            'language': $('#options-language').val(),
            'subdomain': $('#options-sub-domain').val(),
            'auditdomain': $('#options-audit-domain').val(),
            'website': targetWebsite,
            'template': optionsTemplate.val(),
            'target': optionsTarget.val(),
            'competitor1': optionsCompetitor1.val(),
            'competitor2': optionsCompetitor2.val(),
            //google maps audits
            'type': typeAudit,
            'location': location,
            'latitude': latitude,
            'longitude': longitude,
        });
        optionsTemplate.val(template);
    });

    // trigger save button on all modals when ENTER key pressed if input is in focus
    $('.modal input, .modal select').on('keypress', function (e) {
        if (!$(this).hasClass('location')) {
            if (e.which === 13) {
                $(e.target).closest('.modal').find('.btn-submit').trigger('click');
            }
        }
        return true;
    });

    if (typeAudit === 'seo' && targetKeyword !== '') {
        targetKeywordRegexp = new RegExp('(' + escapeRegExp(targetKeyword) + ')', 'gi');
    }

    // report requests
    // start only on report page
    // {0: 'F', 19: 'D-', 25: 'D', 31: 'D+', 37: 'C-', 43: 'C', 49: 'C+', 55: 'B-', 61: 'B', 67: 'B+', 73: 'A-', 79: 'A', 85: 'A+'}
    if (typeof scoreGrades === 'undefined') {
        return;
    }

    let currentWid;
    const progressInterval = setInterval(function () {
        progressPercentsDone++;
        $('.js-main-progress-bar .progress-bar').css('width', progressPercentsDone + '%');
        $('.progress-fill').html(currentProgressAction + " - " + progressPercentsDone + lajax.t("% Complete"));
        if (progressPercentsDone >= 99) {
            clearInterval(progressInterval);
        }
    }, 500);

    // generate field containers for all checks
    $('.faq-box').each(function () {
        const websiteColors = ['primary', 'cyan', 'info'];
        let checkName = $(this).attr('class').match(/field-(\w+)/);
        if (checkName === null) {
            return true;
        }
        checkName = checkName[1];

        for (let ind = websiteIds.length; ind > 0; ind--) {
            currentWid = websiteIds[ind - 1];
            $(this).after( $(this).clone().attr('id', checkName + currentWid) );
            if (websiteIds.length > 1) {
                let $competitorBadgePlace = $('#' + checkName + currentWid).find('.check-badge');
                if ($competitorBadgePlace.length > 0){
                    // no action
                } else {
                    $competitorBadgePlace = $('#' + checkName + currentWid).find('h5');
                }

                const splitName = websiteNames[currentWid].split(',');
                $competitorBadgePlace.after('<div class="d-flex overflow-ellipsis"><h5 class="question website-circle mt-1 website' + ind
                    + ' fs-6 badge badge-light-' + websiteColors[ind - 1]
                    + '"><i class="ki-duotone ki-abstract-39 fs-base text-' + websiteColors[ind - 1]
                    + ' me-2"><span class="path1"></span><span class="path2"></span></i>'
                    + splitName[0] + '</h5></div>');
            }
            if (currentWid !== websiteId) {
                $('#' + checkName + currentWid).addClass('competitor');
                $('#' + checkName + currentWid).find('h5').first().remove();
                if (checkName === 'subpages') {
                    $('#' + checkName + currentWid).remove();
                }
            }
        }

        // check-info
        if (currentWid === websiteId) {
            $('#' + checkName + currentWid).append('<div class="check-info" style="display: none"></div>');
        }
    });

    // click on check of <div class="wrapper report-wrapper explainer">
    $('.explainer .faq-box').click(function (e){
        if ($(this).hasClass('expandable')) {
            $(this).find('.check-info').slideToggle();
        }
    });

    $('.check-group .faq-box').click(function (e) {
        if ($(this).hasClass('field-subpages')){
            return;
        }
        // force remove :target pseudoclass from check container on click
        // broke browser behavior 09/2024
        removeHashFromCurrentUrl(window.location.pathname + window.location.search);
    });

    for (let ind = 0; ind < websiteIds.length; ind++) {
        currentWid = websiteIds[ind];
        if (window.quick_group === undefined) {
            if (typeAudit !== 'gbp') {
                getChecksResult(currentWid, 'html', function (results, currentWid) {
                    //snippet
                    generateSnippet(results.googleSearchPreview, $('#googleSearchPreview' + currentWid + ' .field-value'));
                    //canonicalTag
                    $('#canonicalCheck' + currentWid + ' .field-value-table').append(generateCanonicalList(results.canonicalCheck));
                    // hasHreflang
                    $('#hasHreflang' + currentWid + ' .field-details').append(generateHreflangTable(results.hasHreflang));
                    //hasH1
                    $('#hasH1Header' + currentWid + ' .field-details').append(generateH1HeadersTable(results.hasH1Header));
                    // hasHeaders
                    $('#hasHeaders' + currentWid + ' .field-value-table').append(generateHeadersStatsTable(results.hasHeaders));
                    $('#hasHeaders' + currentWid + ' .field-details').append(generateHeadersTable(results.hasHeaders));
                    // hasImageWithoutAlt
                    $('#hasImageWithoutAlt' + currentWid + ' .field-details').append(generateImageList(results.hasImageWithoutAlt));
                    // hasFriendlyUrl
                    $('#hasFriendlyUrl' + currentWid + ' .field-details').append(generateNonFriendlyUrlTable(results.hasFriendlyUrl));
                    // hasAnalytics
                    $('#hasAnalytics' + currentWid + ' .field-value-table').append(generateAnalyticsList(results.hasAnalytics));
                    // onPageLinks
                    $('#onPageLinks' + currentWid + ' .field-details').append(generateOnPageLinks(results.onPageLinks, currentWid));
                    $('#hasAmp' + currentWid + ' .field-details').append(generateAmpTagsInfo(results.hasAmp));
                    $('#hasFlash' + currentWid + ' .field-details').append(generateFlashList(results.hasFlash));
                    // subpages
                    generateSubpagesTable(results.subpages, $('#subpages' + currentWid));
                    // target keyword
                    $('#targetH1' + currentWid + ' .field-details').append(generateH1HeadersTable(results.targetH1, true));
                    // targetAlt
                    $('#targetAlt' + currentWid + ' .field-details').append(generateTargetImageList(results.targetAlt));
                    if ((typeof (results.localBusinessSchema.data) === 'object') && (results.localBusinessSchema.data.schema.length > 0)) {
                        $('#localBusinessSchema' + currentWid + ' .field-details').html(wrapInButton(schemaDataTable(results.localBusinessSchema.data))).show();
                    }
                    if (typeAudit === 'seo' || typeAudit === 'geo') {
                        if ((typeof (results.identitySchema.data) === 'object') && (results.identitySchema.data.schema.length > 0)) {
                            $('#identitySchema' + currentWid + ' .field-value-table').html(schemaDataTable(results.identitySchema.data)).show();
                        }
                    }
                    data = results.googleMapsWebsiteData.data;
                    if (typeof (data) === 'object' && typeof (data.phone) === 'string' && (data.phone !== '' || data.address !== '')) {
                        html = googleMapsDataOnWebsiteTable(data);
                        $('#googleMapsWebsiteData' + currentWid + ' .field-value-table').html(html).show();
                    }
                    highlightTarget();
                    reInitDetailsButtons();

                    if (popover) {
                        $('.field-subpages a').on('click', function () {
                            const subpagesPopover = $('.js-subpages-popover');
                            if ($(subpagesPopover).css('display') !== 'none') {
                                $(subpagesPopover).hide();
                                return false;
                            }
                            let left = $(this).offset().left;
                            if (left < 0) {
                                left = 0;
                            }

                            $(subpagesPopover)
                                .css({
                                    'left': left,
                                    'top': $(this).offset().top + $(this).outerHeight() + 10,
                                })
                                .show();
                            return false;
                        });
                    }

                    // GEO audit only: generate synthetic discovery prompts from the page
                    // content the html group has just fetched + cached. Not rendered yet —
                    // dumped to console + present in the check-prompt.inc response for testing.
                    if (typeAudit === 'geo') {
                        getChecksResult(currentWid, 'prompt', function (promptResults) {
                            if (isGeoDebug() && promptResults && promptResults.geoSyntheticPrompts) {
                                dumpGeoSyntheticPrompts(promptResults.geoSyntheticPrompts.data);
                            }

                            // Prompt Visibility depends on the prompts being generated + saved,
                            // so chain it off the prompt group.
                            getChecksResult(currentWid, 'promptvisibility', function (visResults) {
                                // Prompt by Prompt Ranking - the visibility matrix. Shows the full
                                // competitor list per cell by default; only falls back to bare ranking
                                // markers (X / #position) when show_competitors is explicitly disabled
                                // (openRouter.showPromptCompetitors = false in local.php).
                                var ranking = visResults && visResults.geoPromptRanking && visResults.geoPromptRanking.data;

                                if (isGeoDebug() && ranking) {
                                    if (ranking.timing) {
                                        console.log('[GEO] Prompt Visibility timing (s):', ranking.timing);
                                    }
                                    if (ranking.extraction) {
                                        console.log('[GEO] Extraction (aggregator) call:', ranking.extraction);
                                    }
                                    dumpGeoPromptVisibility(ranking);
                                }

                                if (ranking) {
                                    $('#geoPromptRanking' + currentWid + ' .field-value-ranking')
                                        .html(generateGeoPromptVisibilityTable(ranking, ranking.show_competitors !== false));
                                }

                                // Platform Snapshot - per-platform citation coverage boxes (same group result).
                                // Prepend the "target mentioned in X / Y responses" summary line (moved here
                                // from the ranking table) so it reads as body text under the check answer.
                                var snapshot = visResults && visResults.geoPlatformSnapshot && visResults.geoPlatformSnapshot.data;
                                if (snapshot) {
                                    $('#geoPlatformSnapshot' + currentWid + ' .field-value-platforms')
                                        .html(generateGeoVisibilitySummaryLine(ranking) + generateGeoPlatformSnapshot(snapshot));
                                }

                                // Competitor Visibility - citation rate per brand across all responses.
                                var competitors = visResults && visResults.geoCompetitorVisibility && visResults.geoCompetitorVisibility.data;
                                if (competitors) {
                                    $('#geoCompetitorVisibility' + currentWid + ' .field-value-competitors')
                                        .html(generateGeoCompetitorVisibility(competitors));
                                }

                                // Competitor Average Position - avg rank per brand where mentioned.
                                var avgPos = visResults && visResults.geoCompetitorAveragePosition && visResults.geoCompetitorAveragePosition.data;
                                if (avgPos) {
                                    $('#geoCompetitorAveragePosition' + currentWid + ' .field-value-avgposition')
                                        .html(generateGeoCompetitorAveragePosition(avgPos));
                                }

                                // Competitor Dominance - rank-weighted share of voice (donut + table).
                                var dominance = visResults && visResults.geoCompetitorDominance && visResults.geoCompetitorDominance.data;
                                if (dominance) {
                                    $('#geoCompetitorDominance' + currentWid + ' .field-value-dominance')
                                        .html(generateGeoCompetitorDominance(dominance, currentWid));
                                }
                            });
                        }, null, function(wid){
                            // nested check
                            currentProgressActions['promptvisibility' + wid] = checkUrls['other'].message;
                            removeCompletedRequestFromProgress('promptvisibility' + wid);
                        });
                    }
                }, null, function(wid){
                    // nested check
                    currentProgressActions['prompt' + wid] = checkUrls['other'].message;
                    removeCompletedRequestFromProgress('prompt' + wid);
                    currentProgressActions['promptvisibility' + wid] = checkUrls['other'].message;
                    removeCompletedRequestFromProgress('promptvisibility' + wid);
                });

                if (typeAudit === 'geo') {
                    // Important Citations - two independent calls on different technical paths, each
                    // keyed off the domain (not the page HTML):
                    //   'wiki'      -> Wikipedia (Wikimedia link index)
                    //   'citations' -> Reddit + YouTube (Google SERP via SerpApi, bundled in one call)
                    getChecksResult(currentWid, 'wiki', function (results, currentWid) {
                        var data = results && results.wikipediaCitations && results.wikipediaCitations.data;
                        if (!data) { return; }
                        // Summary stat tile (backlink-summary style) above the mentions table.
                        $('#wikipediaCitations' + currentWid + ' .field-value-citations-summary')
                            .html(generateWikiCitationsSummary(data));
                        if (data.mentions && data.mentions.length) {
                            $('#wikipediaCitations' + currentWid + ' .field-value-citations')
                                .html(generateCitationsTable(data));
                        }
                    });
                    getChecksResult(currentWid, 'citations', function (results, currentWid) {
                        // One response carries both the Reddit and YouTube checks; render each card.
                        ['redditCitations', 'youtubeCitations'].forEach(function (name) {
                            var data = results && results[name] && results[name].data;
                            if (data && data.mentions && data.mentions.length) {
                                $('#' + name + currentWid + ' .field-value-citations')
                                    .html(generateCitationsTable(data));
                            }
                        });
                    });
                }

                if (typeAudit !== 'geo') { // GEO doesn't use the Google Business Profile (localseo) lookup
                getChecksResult(currentWid, 'localseo', function (results, currentWid) {
                    let data = results.googleMapsProfileExists.data;
                    let html;

                    if (typeof (data) === 'object' && typeof (data.title) === 'string' && data.title !== '') {
                        html = generateGoogleProfileTable(data);
                        $('#googleMapsProfileExists' + currentWid + ' .field-value-table').html(html).show();
                    }

                    data = results.googleMapsProfileCompleteness.data;
                    if ((typeof (data) === 'object') && typeof (data.url) === 'string' && (data.url !== '' || data.address !== '' || data.phone !== '')) {
                        html = googleMapsProfileCompletenessTable(data);
                        $('#googleMapsProfileCompleteness' + currentWid + ' .field-value-table').html(html).show();
                    }

                    data = results.googleMapsReviews.data;
                    // Number class not supported in wkhtmltopdf
                    // typeof(null) === 'object'
                    if (data && (typeof(data) === 'object') && data.reviews) {
                        html = googleMapsProfileRating(data);
                        $('#googleMapsReviews' + currentWid + ' .field-value-table').html(html).show();
                    }

                    reInitDetailsButtons();
                });
                }

                if (typeAudit === 'local-seo') {
                    getChecksResult(currentWid, 'bing', function (results, currentWid) {
                        let html;

                        let data = results.bingMapsProfileExists ? results.bingMapsProfileExists.data : null;
                        if (data && (typeof (data) === 'object') && typeof (data.title) === 'string' && data.title !== '') {
                            html = generateBingProfileTable(data);
                            $('#bingMapsProfileExists' + currentWid + ' .field-value-table').html(html).show();
                        }

                        data = results.bingMapsProfileCompleteness ? results.bingMapsProfileCompleteness.data : null;
                        if (data && (typeof (data) === 'object') && (data.url || data.address || data.phone)) {
                            html = googleMapsProfileCompletenessTable(data);
                            $('#bingMapsProfileCompleteness' + currentWid + ' .field-value-table').html(html).show();
                        }

                        data = results.bingMapsReviews ? results.bingMapsReviews.data : null;
                        if (data && (typeof (data) === 'object') && data.reviews) {
                            // Bing has no per-star breakdown - render the rating line only (no breakdown table).
                            html = googleMapsProfileRating(data, false);
                            $('#bingMapsReviews' + currentWid + ' .field-value-table').html(html).show();

                            // recent review snippets render in their own "Bing Reviews" panel (toggleable per template)
                            const bingReviewsHtml = recentReviewsBlock(data);
                            if (bingReviewsHtml && (!isAgency || showBingReviews)) {
                                $('#bingMapsReviewsList' + currentWid + ' .value-business').html(bingReviewsHtml);
                                $('#bingMapsReviewsList' + currentWid).removeClass('hidden');
                                $('#bing-reviews').show();
                            }
                        }

                        reInitDetailsButtons();
                    });

                    getChecksResult(currentWid, 'apple', function (results, currentWid) {
                        let html;

                        let data = results.appleMapsProfileExists ? results.appleMapsProfileExists.data : null;
                        if (data && (typeof (data) === 'object') && typeof (data.title) === 'string' && data.title !== '') {
                            html = generateAppleProfileTable(data);
                            $('#appleMapsProfileExists' + currentWid + ' .field-value-table').html(html).show();
                        }

                        data = results.appleMapsProfileCompleteness ? results.appleMapsProfileCompleteness.data : null;
                        if (data && (typeof (data) === 'object') && (data.url || data.address || data.phone)) {
                            html = googleMapsProfileCompletenessTable(data);
                            $('#appleMapsProfileCompleteness' + currentWid + ' .field-value-table').html(html).show();
                        }

                        data = results.appleMapsReviews ? results.appleMapsReviews.data : null;
                        if (data && (typeof (data) === 'object') && data.reviews) {
                            html = appleMapsProfileRating(data);
                            $('#appleMapsReviews' + currentWid + ' .field-value-table').html(html).show();

                            // recent review snippets render in their own "Apple Maps Reviews" panel (toggleable per template)
                            const appleReviewsHtml = recentReviewsBlock(data);
                            if (appleReviewsHtml && (!isAgency || showAppleReviews)) {
                                $('#appleMapsReviewsList' + currentWid + ' .value-business').html(appleReviewsHtml);
                                $('#appleMapsReviewsList' + currentWid).removeClass('hidden');
                                $('#apple-reviews').show();
                            }
                        }

                        reInitDetailsButtons();
                    });

                    getChecksResult(currentWid, 'yelp', function (results, currentWid) {
                        let html;

                        let data = results.yelpProfileExists ? results.yelpProfileExists.data : null;
                        if (data && (typeof (data) === 'object') && typeof (data.title) === 'string' && data.title !== '') {
                            html = generateYelpProfileTable(data);
                            $('#yelpProfileExists' + currentWid + ' .field-value-table').html(html).show();
                        }

                        data = results.yelpProfileCompleteness ? results.yelpProfileCompleteness.data : null;
                        if (data && (typeof (data) === 'object') && (data.url || data.address || data.phone)) {
                            html = googleMapsProfileCompletenessTable(data);
                            $('#yelpProfileCompleteness' + currentWid + ' .field-value-table').html(html).show();
                        }

                        data = results.yelpReviews ? results.yelpReviews.data : null;
                        if (data && (typeof (data) === 'object') && data.reviews) {
                            // Yelp ratings are /5 - stars, no breakdown table
                            html = googleMapsProfileRating(data, false);
                            $('#yelpReviews' + currentWid + ' .field-value-table').html(html).show();

                            // recent review snippets render in their own "Yelp Reviews" panel (toggleable per template)
                            const yelpReviewsHtml = recentReviewsBlock(data);
                            if (yelpReviewsHtml && (!isAgency || showYelpReviews)) {
                                $('#yelpReviewsList' + currentWid + ' .value-business').html(yelpReviewsHtml);
                                $('#yelpReviewsList' + currentWid).removeClass('hidden');
                                $('#yelp-reviews').show();
                            }
                        }

                        reInitDetailsButtons();
                    });

                    getChecksResult(currentWid, 'yellowpages', function (results, currentWid) {
                        let html;

                        let data = results.yellowPagesProfileExists ? results.yellowPagesProfileExists.data : null;
                        if (data && (typeof (data) === 'object') && typeof (data.title) === 'string' && data.title !== '') {
                            html = generateYellowPagesProfileTable(data);
                            $('#yellowPagesProfileExists' + currentWid + ' .field-value-table').html(html).show();
                        }

                        data = results.yellowPagesProfileCompleteness ? results.yellowPagesProfileCompleteness.data : null;
                        if (data && (typeof (data) === 'object') && (data.url || data.address || data.phone)) {
                            html = googleMapsProfileCompletenessTable(data);
                            $('#yellowPagesProfileCompleteness' + currentWid + ' .field-value-table').html(html).show();
                        }

                        data = results.yellowPagesReviews ? results.yellowPagesReviews.data : null;
                        if (data && (typeof (data) === 'object') && data.reviews) {
                            // YP review scores are /5 - stars, no breakdown table
                            html = googleMapsProfileRating(data, false);
                            $('#yellowPagesReviews' + currentWid + ' .field-value-table').html(html).show();

                            // recent review snippets render in their own "Yellow Pages Reviews" panel (toggleable per template)
                            const ypReviewsHtml = recentReviewsBlock(data);
                            if (ypReviewsHtml && (!isAgency || showYellowPagesReviews)) {
                                $('#yellowPagesReviewsList' + currentWid + ' .value-business').html(ypReviewsHtml);
                                $('#yellowPagesReviewsList' + currentWid).removeClass('hidden');
                                $('#yellowpages-reviews').show();
                            }
                        }

                        reInitDetailsButtons();
                    });
                }

                // files runs for SEO + GEO (GEO needs hasLlmsTxt)
                if (typeAudit === 'seo' || typeAudit === 'geo') {
                    getChecksResult(currentWid, 'files', function (results, currentWid) {
                        // hasSitemap
                        $('#hasSitemap' + currentWid + ' .field-value-table').append(generateSitemapList(results.hasSitemap, currentWid));
                        // hasRobotsTxt
                        $('#hasRobotsTxt' + currentWid + ' .field-value-table').append(generateRobotsTxtList(results.hasRobotsTxt, currentWid, '<a target="_blank" href="' + infoUrls['robotsGenerator'].url + '" onClick="event.stopPropagation();return true;">' + lajax.t("robots.txt File Generator") + '</a>'));
                        // hasLlms
                        $('#hasLlmsTxt' + currentWid + ' .field-value-table').append(generateRobotsTxtList(results.hasLlmsTxt, currentWid));                    });
                }

                if (typeAudit === 'seo') {
                    // other HTML related checks after html downloaded
                    getChecksResult(currentWid, 'social', function (results, currentWid) {
                        // youtubeActivity
                        $('#youtubeActivity' + currentWid + ' .field-value').append(generateYoutubeActivity(results.youtubeActivity));
                    });
                    getChecksResult(currentWid, 'insights', function (results, currentWid) {
                        // hasOptimizedImages
                        $('#hasOptimizedImages' + currentWid + ' .field-details').append(generateOptimisedImages(results.hasOptimizedImages));
                        // hasTapTargetSizing
                        $('#hasTapTargetSizing' + currentWid + ' .field-details').append(generateTapTargetSizing(results.hasTapTargetSizing));
                        // hasLegibleFontsizes
                        $('#hasLegibleFontsizes' + currentWid + ' .field-details').append(generateLegibleFontsizes(results.hasLegibleFontsizes));
                        // hasMinified
                        $('#hasMinified' + currentWid + ' .field-details').append(generateNonMinifiedList(results.hasMinified));
                        // PageSpeed Insights - Mobile
                        $('#mobilePageInsights' + currentWid + ' .field-details').append(generateInsightsTable(results.mobilePageInsights, 'mobile', currentWid));
                        // PageSpeed Insights - Desktop
                        $('#desktopPageInsights' + currentWid + ' .field-details').append(generateInsightsTable(results.desktopPageInsights, 'desktop', currentWid));

                        reInitDetailsButtons();
                    }, function (checkName, checkValue, currentWid) {
                        if (checkName === 'coreWebVitals') {
                            generateCoreWebVitalsCharts(currentWid, checkValue, '#coreWebVitals' + currentWid);
                        }
                    });
                }

                if (typeAudit === 'seo' || typeAudit === 'geo'){
                    getChecksResult(currentWid, 'metrics', function (results, currentWid) {
                        // GEO-AI vision checks depend on the screenshot the metrics group has just
                        // produced server-side. Fire this FIRST, so that any later rendering error in
                        // this callback (e.g. empty metrics data on a GEO audit) can't prevent it.
                        getChecksResult(currentWid, 'llm', function () {
                            reInitDetailsButtons();
                        });

                        // screenshot
                        if (currentWid === websiteId) {
                            if (results.screenshot !== false) {
                                const desktop_screenshot_path = results.screenshot.value;

                                // pdf fix
                                $('.main-screenshot-container .card-box-thumb-desktop').find('a')
                                    .attr('href', desktop_screenshot_path)
                                    .css('pointer-events', 'auto')
                                    .find('img').attr('src', desktop_screenshot_path).css('opacity', 1);
                                refreshFsLightbox();

                                const img = new Image();
                                img.src = desktop_screenshot_path;

                                img.onload = () => {
                                    $('.main-screenshot-container .card-box-thumb-desktop').removeClass('opacity-0').find('a')
                                        .attr('href', desktop_screenshot_path)
                                        .css('pointer-events', 'auto')
                                        .find('img').attr('src', desktop_screenshot_path).css('opacity', 1);

                                    // mobile screenshot
                                    // const mobile_screenshot = desktop_screenshot_path.replace('-desktop.jpg', '-mobile.jpg');
                                    const mobile_screenshot = desktop_screenshot_path.replace('-desktop.', '-mobile.'); // '*-desktop.jpg' -> '*-mobile.jpg', '*-desktop.png' -> '*-mobile.png'
                                    const mobile_img = new Image();
                                    mobile_img.src = mobile_screenshot;
                                    mobile_img.onload = () => {
                                        $('.main-screenshot-container .card-box-thumb-mobile').removeClass('opacity-0').find('a')
                                            .attr('href', mobile_screenshot)
                                            .css('pointer-events', 'auto')
                                            .find('img').attr('src', mobile_screenshot).css('opacity', 1);
                                        refreshFsLightbox();
                                    }
                                    mobile_img.onerror = () => {
                                        $('.main-screenshot-container .card-box-thumb-mobile').remove();
                                        refreshFsLightbox();
                                    };

                                    // full-page desktop capture (GEO/SEO). Hidden anchor: its lightbox
                                    // link becomes an extra slide once the image is confirmed to load,
                                    // and is removed if the pool didn't produce a full-page shot.
                                    const full_desktop_screenshot = results.screenshot.value.replace('-desktop.jpg', '-full-desktop.jpg');
                                    const full_desktop_img = new Image();
                                    full_desktop_img.src = full_desktop_screenshot;
                                    full_desktop_img.onload = () => {
                                        $('.main-screenshot-container .card-box-thumb-full-desktop').attr('href', full_desktop_screenshot);
                                        refreshFsLightbox();
                                    };
                                    full_desktop_img.onerror = () => {
                                        $('.main-screenshot-container .card-box-thumb-full-desktop').remove();
                                        refreshFsLightbox();
                                    };
                                };
                                img.onerror = () => {
                                    $('.main-screenshot-container .card-box-thumb-desktop').find('a').removeAttr('data-fslightbox');
                                    $('.main-screenshot-container .card-box-thumb-mobile').remove();
                                    refreshFsLightbox();
                                };
                            } else {
                                $('.main-screenshot-container').hide();
                                $('.dashboard-main.col-md-6').removeClass('col-md-6');
                            }
                        }

                        // deviceRendering
                        $('#deviceRendering' + currentWid + ' .rendering-images').append(generateRenderingImages(currentWid, results.deviceRendering));

                        $('#numberOfResources' + currentWid + ' .field-value').append(generateResourceList(results.numberOfResources, currentWid)); // numberOfResources
                        $('#javascriptErrors' + currentWid + ' .field-details').append(generateJavascriptErrorsList(results.javascriptErrors));// javascriptErrors

                        //technologies
                        $('#technologies' + currentWid + ' .field-details').append(generateTechnologiesList(currentWid, results.technologies));

                        // keywords
                        $('#keywords' + currentWid + ' .field-value-tables').append(generateKeywordsAndPhrasesTable(currentWid, results.keywords));

                        // hasDeprecated
                        $('#hasDeprecated' + currentWid + ' .field-details').append(generateDeprecatedTagsTable(results.hasDeprecated));
                        // hasInlineCss
                        $('#hasInlineCss' + currentWid + ' .field-details').append(generateInlineCssTable(results.hasInlineCss));
                        // hasEmail
                        $('#hasEmail' + currentWid + ' .field-details').append(generateEmailTable(results.hasEmail));
                        // hasFacebookPixel
                        $('#hasFacebookPixel' + currentWid + ' .field-value').append(generateFacebookPixels(results.hasFacebookPixel));

                        reInitDetailsButtons();

                    }, function (checkName, checkValue, currentWid) {
                        if (checkName === 'serverResponseTime') {
                            $('#serverResponseTime' + currentWid + ' .charts').html(generateSpeedChartsContainer(currentWid, checkValue));
                            generateSpeedCharts(currentWid, checkValue);
                        }

                        if (checkName === 'pageSize') {
                            $('#pageSize' + currentWid + ' .charts').html(generateSizeChartsContainer(currentWid, checkValue));
                            generateSizeCharts(currentWid, checkValue);
                        }

                        if (checkName === 'hasGzip') {
                            $('#hasGzip' + currentWid + ' .charts').html(generateTransferSizeChartsContainer(currentWid, checkValue));
                            generateTransferSizeCharts(currentWid, checkValue);
                        }
                    }, function(wid){
                        // nested check
                        currentProgressActions['llm' + wid] = checkUrls['other'].message;
                        removeCompletedRequestFromProgress('llm' + wid);
                    });
                }

                if (typeAudit !== 'geo') { // GEO audit doesn't need the server checks (SSL/redirects/DNS)
                    getChecksResult(currentWid, 'server', function (results, currentWid) {

                    });
                }

                getChecksResult(currentWid, 'rankings', function (results, currentWid) {
                    $('#totalTrafficFromSearch' + currentWid + ' .field-details').append(generateBlockStats(currentWid, results.totalTrafficFromSearch, [
                        { data: 'total', icon: 'ki-chart-simple-3', title: lajax.t("Google Organic")},
                        { data: 'paidtotal', icon: 'ki-dollar', title: lajax.t("Paid")},
                        { data: 'aitotal', icon: 'ki-artificial-intelligence', title: lajax.t("AI Overviews")},
                    ]));

                    $('#topKeywordRankings' + currentWid + ' .field-value-table').append(generateTopKeywordRankingsTable(results.topKeywordRankings));
                    $('#topPaidRankings' + currentWid + ' .field-value-table').append(generateTopPaidRankingsTable(results.topPaidRankings));
                    $('#topAIOverviewRankings' + currentWid + ' .field-value-table').append(generateTopAIOverviewRankingsTable(results.topAIOverviewRankings));

                    $('#keywordPositions' + currentWid + ' .positions-table').append(generateKeywordPositionsTable(results.keywordPositions));

                    // Rankings JS dirty hack for PDF (for page-breaking)
                    //if (currentWid === websiteId && isPdfRequest()) {
                    //    $('#rankings .js-header-place:visible:first').html($('#rankings .portlet-heading')[0].outerHTML);
                    //    $('#rankings .portlet-heading:first').hide();
                    //    $('#rankings .js-header-place:visible:first').addClass('pdf-header-hack');
                    //}
                });
            }
        }

        if ((window.quick_group === undefined || quick_group === 'backlinks') && typeAudit !== 'gbp' && typeAudit !== 'geo') {
            getChecksResult(currentWid, 'backlinks', function (results, currentWid) {
                if (results === undefined) {
                    return;
                }

                $('#backlinks' + currentWid + ' .field-details').append(generateBlockStats(currentWid, results.backlinks, [
                    { data: 'backlinks', icon: 'ki-fasten', title: lajax.t("Total Backlinks")},
                    { data: 'allbacklinks', icon: 'ki-exit-right-corner', title: lajax.t("Referring Domains")},
                ], [
                    { data: 'nofollow_backlinks', icon: 'ki-disconnect', title: lajax.t("Nofollow Backlinks")},
                    { data: 'dofollow_backlinks', icon: 'ki-exit-right-corner opacity-0', title: lajax.t("Dofollow Backlinks"), icon2: '<i class="ki-duotone ki-abstract-49 text-gray-600 fs-2x ms-n1 position-absolute"><span class="path1"></span><span class="path2"></span><span class="path3"></span></i>'},
                    { data: 'edu_backlinks', icon: 'ki-teacher', title: lajax.t("Edu Backlinks")},
                    { data: 'gov_backlinks', icon: 'ki-flag', title: lajax.t("Gov Backlinks")},
                    { data: 'ips', icon: 'ki-abstract-26', title: lajax.t("IPs")},
                    { data: 'subnets', icon: 'ki-screen', title: lajax.t("Subnets")},
                ]));
                generateBacklinkSummary(currentWid, results.backlinks);
                $('#backlinksList' + currentWid + ' .field-details').append(generateBacklinksList(currentWid, results.backlinksList));
                $('#backlinksTopPages' + currentWid + ' .field-details').append(generateBacklinksTopPages(currentWid, results.backlinksTopPages));
                $('#backlinksTopAnchors' + currentWid + ' .field-details').append(generateBacklinksTopAnchors(currentWid, results.backlinksTopAnchors));

                $('.disable-external-action').on('click', function (e) {
                    e.stopPropagation();
                });

                if (results.backlinksTopGeographies !== undefined) {
                    generateBacklinksTopGeographiesCharts(currentWid, results.backlinksTopGeographies);
                }

                reInitDetailsButtons();
            });
        }
    }
});

function recursiveLocalBusinessSchema(data, level) {
    let result = '';
    const paddingLeft = 9 + level * 18;
    const styles = level > 0 ? ' style="padding-left: ' + paddingLeft + 'px !important;"' : '';
    for (const key in data) {
        if (!data.hasOwnProperty(key)) {
            continue;
        }
        if (typeof(data[key]) === 'string') {
            result += '<tr><td' + styles + '>' + key + '</td><td>' + data[key] + '</td></tr>';
        }
        if (typeof(data[key]) === 'object') {
            if (!data[key].hasOwnProperty('@type')) {
                // check that all keys are numeric
                if (data[key].length > 0 &&  Object.keys(data[key].some(key => isNaN(Number(key))))) {
                    for (const numKey in data[key]) {
                        if (typeof(data[key][numKey]) === 'string') {
                            if (numKey === '0') {
                                result += '<tr><td' + styles + '>' + key + '</td><td>' + data[key][numKey] + '</td></tr>';
                            } else {
                                result += '<tr><td></td><td>' + data[key][numKey] + '</td></tr>';
                            }
                        } else if (typeof(data[key][numKey]) === 'object') {
                            result += '<tr><td' + styles + '>' + key + '</td><td></td></tr>';
                            result += recursiveLocalBusinessSchema(data[key][numKey], level + 1);
                        }
                    }
                }
            } else {
                result += '<tr><td colspan="2"' + styles + '>' + key + '</td></tr>';
                result += recursiveLocalBusinessSchema(data[key], level + 1);
            }
        }
    }

    return result;
}

// Important Citations (GEO): render the top mentions from a citations check as a compact table
// of linked page titles + snippets, with the source icon (Reddit/Wikipedia) in a left column -
// mirrors the local-listing tables. Built via jQuery DOM so external SerpApi text is auto-escaped.
// Single stat tile for the Wikipedia citations check, matching the backlink-summary/traffic
// card style (generateBlockStats). Shows the total linking-page count ("N+" if the scan was
// truncated). Uses the Wikipedia glyph in place of the ki-duotone icon the other tiles use.
function generateWikiCitationsSummary(data) {
    if (!data) {
        return '';
    }
    // Two tiles, backlink-summary style: distinct articles that link to the site, and the total
    // number of citation links (an article can cite the domain more than once, so citations >= pages).
    var tiles = [
        { value: (data.total || 0) + (data.truncated ? '+' : ''), title: lajax.t('Linking Pages') },
        { value: (data.citations || 0) + (data.citations_truncated ? '+' : ''), title: lajax.t('Total Citations') }
    ];
    var html = '<div class="row backlink-summary-down-stats avoid-break-inside row-gap-3 row-gap-xl-5 gx-3 gx-xl-5">';
    for (var i = 0; i < tiles.length; i++) {
        html += '<div class="col-12 col-sm-6 col-md-5 col-xxl-3 col-pdf-3">\
                    <div class="card h-lg-100">\
                        <div class="card-body d-flex justify-content-start align-items-start flex-column py-7 px-9 p-pdf-6">\
                            <div class="m-0">\
                                <img src="/img/icons/app/Wikipedia.svg" width="40" height="40" alt="">\
                            </div>\
                            <div class="d-flex flex-column mt-6 mt-pdf-5">\
                                <span class="fw-semibold fs-2qx fs-pdf-1 text-gray-800 lh-1 ls-n2">' + tiles[i].value + '</span>\
                                <div class="m-0 mt-2 text-wrap">\
                                    <span class="fw-semibold fs-6 fs-pdf-7 text-gray-500 card-tile-title">' + tiles[i].title + '</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
    }
    html += '</div>';
    return html;
}

function generateCitationsTable(data) {
    var mentions = (data && data.mentions) || [];
    if (!mentions.length) {
        return '';
    }

    // Left-column source icon, chosen from the queried site (data.site e.g. 'reddit.com').
    var site = (data && data.site) || '';
    var iconSrc = '/img/icons/app/Wikipedia.svg';
    if (site.indexOf('reddit') !== -1) {
        iconSrc = '/img/icons/app/Reddit.svg';
    } else if (site.indexOf('youtube') !== -1) {
        iconSrc = '/img/icons/app/YouTube.png';
    }

    var $table = $('<table class="table table-row-dashed table-fluid mb-0 align-middle"></table>');
    var $tbody = $('<tbody></tbody>').appendTo($table);

    for (var i = 0; i < mentions.length; i++) {
        var m = mentions[i];
        var $row = $('<tr></tr>');

        $('<td class="pe-3 w-35px align-top"></td>')
            .append($('<img width="24" height="24" alt="">').attr('src', iconSrc))
            .appendTo($row);

        var $cell = $('<td class="align-top"></td>');
        $('<a target="_blank" rel="nofollow noopener" class="fw-semibold text-hover-primary d-block"></a>')
            .attr('href', m.link)
            .text(m.title || m.link)
            .appendTo($cell);
        // Snippet line: Reddit = the comment text (plain); Wikipedia = the rendered citation, which
        // ships as sanitized HTML (snippet_html) so the cited link is clickable (nofollow, new tab).
        if (m.snippet_html) {
            $('<div class="mt-1 text-gray-600"></div>').html(m.snippet_html).appendTo($cell);
        } else if (m.snippet) {
            $('<div class="mt-1 text-gray-600"></div>').text(m.snippet).appendTo($cell);
        }
        $cell.appendTo($row);
        $row.appendTo($tbody);
    }

    return $table.prop('outerHTML');
}

function schemaDataTable(data) {
    let table = '<div class="row mt-4"><div class="gm-profile-info col-xl-6 col-pdf-9">',
        schema = data.schema;
    table += '<table class="table table-row-dashed table-fluid table-wrapped mb-0">';

    for (const s in schema) {
        if (typeof(schema[s]) === 'string') {
            table += '<tr><td colspan="2">'+schema[s]+'</td></tr>';
        }
        if (typeof(schema[s]) === 'object') {
            table += recursiveLocalBusinessSchema(schema[s], 0);
        }
    }

    table += '</table></div></div>';
    return table;
}

function googleMapsProfileRating(data, includeBreakdown = true) {
    // round to 1 decimal place to avoid float artifacts in the source rating (e.g. 3.2999997 -> 3.3)
    const ratingValue = Math.round((parseFloat(data.rating) || 0) * 10) / 10;
    let rValue = Math.floor(ratingValue),
        partVl = parseInt((ratingValue > rValue ? ratingValue - rValue : rValue - ratingValue) * 100),
        ratingIcons = '<div class="rating">';

    let active = ' is-active';
    for (let r = 1; r < 6; r++) {
        let half = '';
        if (r > rValue) {
            if (active !== '') {
                if ((partVl > 0) && (partVl < 50)) {
                    half = ' half-star-40 half-star';
                } else if (partVl == 50) {
                    half = ' half-star-55 half-star';
                } else if (partVl > 50) {
                    half = ' half-star-70 half-star';
                }
            }
            active = '';
        }

        ratingIcons += '<span class="rating-label' + active + half + '" data-char="★">★</span>';
    }

    ratingIcons += '</div>';

    let html = '<ul class="rating-line"><li>' + ratingValue + '</li>';
    html += '<li>'+ratingIcons+'</li>';
    html += '<li>'+data.reviews+'&nbsp;' + lajax.t('reviews') + '</li><div class="clearfix"></div></ul>';

    // Some providers (e.g. Bing) expose no per-star breakdown; show only the rating line.
    if (!includeBreakdown) {
        return html;
    }

    html += '<div class="row rating-table"><div class="col-lg-6 col-md-6 col-sm-12">';
    html += '<table class="table table-row-dashed table-fluid table-wrapped mb-0">';
    html += '<thead><tr><th>'+lajax.t(data.rating_label)+'</th><th></th></tr></thead>';

    let maxValue = 0,
        content = '';

    if ((typeof(data.rating_details) === 'object') && data.rating_details) {
        $.each(data.rating_details, function(key, value) {
            if (value > maxValue) {
                maxValue = value;
            }
        });

        Object.keys(data.rating_details).sort(function(a, b) {
            return b - a;
        }).reduce(function(obj, key) {
            const width = (maxValue !== 0) ? (data.rating_details[key] / maxValue * 100) : 0;
            content += '<tr><td>' + key + '</td><td class="volume-bar-wrapper min-w-100px"><div><span style="width:' + width + '%;"></span></div></td></tr>';
        }, {});
    }
    
    html += content.length ? content : '<tr class="odd"><td valign="top" colspan="6" class="text-center">' + lajax.t('No data available in table') + '</td></tr>';

    html += '</table></div>';
    
    return html;
}

function googleMapsDataOnWebsiteTable(data) {
    let table = '<div class="row mt-4"><div class="gm-profile-info col-xl-6">',
        fields = {
            phone: lajax.t('Phone'),
            address: lajax.t('Address'),
        };
    table += '<table class="table table-row-dashed table-fluid table-wrapped mb-0">';
    for (const f in fields) {
        if ((typeof(data[f]) === 'string') && data[f] != '') {
            table += '<tr><td>'+fields[f]+'</td><td>'+data[f]+'</td>';
        }
    }
    table += '</table></div></div>';
    
    return table;
}

function googleMapsProfileCompletenessTable(data) {
    let table = '<div class="row mt-4"><div class="gm-profile-info col-xl-6">',
        fields = data.fields;

    table += '<table class="table table-row-dashed table-fluid table-wrapped mb-0">';
    for (const fieldName in fields) {
        if ((typeof(data[fieldName]) === 'string') && data[fieldName] != '') {
            table += '<tr><td>'+fields[fieldName]+'</td><td>'+data[fieldName]+'</td>';
        }
    }
    table += '</table></div></div>';

    return table;
}

function generateGoogleProfileTable(data) {
    let table = '<div class="row mt-4"><div class="col-xl-6">';
    table += '<table class="table table-row-dashed table-fluid table-wrapped mb-0">';
    table += '<tr><td class="pe-0 w-35px align-middle"><img src="/img/icons/google-profile.png" width="24px" height="24px" class="align-middle" /></td><td class="align-middle">' + data.title + '</td></tr></table></div></div>';

    return table;
}

function generateBingProfileTable(data) {
    let table = '<div class="row mt-4"><div class="col-xl-6">';
    table += '<table class="table table-row-dashed table-fluid table-wrapped mb-0">';
    table += '<tr><td class="pe-0 w-35px align-middle"><img src="/img/icons/bing-profile.svg" width="24px" height="24px" class="align-middle" /></td><td class="align-middle">' + data.title + '</td></tr></table></div></div>';

    return table;
}

function generateAppleProfileTable(data) {
    let table = '<div class="row mt-4"><div class="col-xl-6">';
    table += '<table class="table table-row-dashed table-fluid table-wrapped mb-0">';
    table += '<tr><td class="pe-0 w-35px align-middle"><img src="/img/icons/apple-profile.svg" width="24px" height="24px" class="align-middle" /></td><td class="align-middle">' + data.title + '</td></tr></table></div></div>';

    return table;
}

function generateYellowPagesProfileTable(data) {
    let table = '<div class="row mt-4"><div class="col-xl-6">';
    table += '<table class="table table-row-dashed table-fluid table-wrapped mb-0">';
    table += '<tr><td class="pe-0 w-35px align-middle"><img src="/img/icons/yellowpages-profile.svg" width="24px" height="24px" class="align-middle" /></td><td class="align-middle">' + data.title + '</td></tr></table></div></div>';

    return table;
}

function generateYelpProfileTable(data) {
    let table = '<div class="row mt-4"><div class="col-xl-6">';
    table += '<table class="table table-row-dashed table-fluid table-wrapped mb-0">';
    table += '<tr><td class="pe-0 w-35px align-middle"><img src="/img/icons/yelp-profile.svg" width="24px" height="24px" class="align-middle" /></td><td class="align-middle">' + data.title + '</td></tr></table></div></div>';

    return table;
}

// Apple ratings come on a source-dependent scale (Tripadvisor 0-5, Apple 0-100). Normalize to a
// 0-5 scale so we show the same star line as the other listings; the source is still labelled.
function appleMapsProfileRating(data) {
    let source = data.rating_source ? data.rating_source : '';
    let max = Number(data.rating_max) || 5;
    let normalized = Object.assign({}, data);
    normalized.rating = max > 0 ? Math.round((Number(data.rating) / max * 5) * 10) / 10 : Number(data.rating);

    let html = googleMapsProfileRating(normalized, false); // stars + value + reviews, no breakdown table
    if (source) {
        html += '<div class="text-muted fs-7">' + lajax.t('Source') + ': ' + lajax.t(source) + '</div>';
    }
    return html;
}

// Recent review snippets (shared by Apple Maps + Bing), rendered with the same card style as the GBP
// recent reviews (.feature.boxed + .review-rating/.checked + .gmb-review-comment). No good/bad split
// for these sources, so we show what's available (~3). Source is labelled for required attribution.
// Expects data.recent_reviews [{rating, max, text, date, username}] + data.reviews_source.
function recentReviewEscape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function recentReviewsBlock(data) {
    if (!data.recent_reviews || !data.recent_reviews.length) {
        return '';
    }

    const source = data.reviews_source ? data.reviews_source : (data.rating_source || '');
    let html = '';
    if (source) {
        html += '<div class="text-muted fs-7 mb-4">' + lajax.t('via') + ' ' + lajax.t(source) + '</div>';
    }
    html += '<div class="row row-gap-5">';

    data.recent_reviews.forEach(function (r) {
        const rating = Number(r.rating) || 0;

        html += '<div class="col-lg-4">'
            + '<div class="feature boxed boxed--lg boxed--border p-4 p-md-6 avoid-break-inside">';

        // Some sources (e.g. Yelp review highlights) carry no per-review rating/date - in that
        // case we skip the star line and show the reviewer's name in light text above the quote
        // (mirroring the muted source label other review blocks use), instead of empty 0-stars.
        if (rating > 0) {
            const max = Number(r.max) || 5;
            const filled = (max === 5) ? Math.round(rating) : Math.round(rating / max * 5);
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += '<span class="' + (i <= filled ? 'checked' : '') + '">★</span>';
            }
            html += '<div><span class="star-rating"><span class="review-rating">' + stars + '</span>';
            if (r.date) {
                html += ' <span class="gmb-review-date fs-pdf-7">' + recentReviewEscape(r.date) + '</span>';
            }
            html += '</span></div>';
        } else if (r.username) {
            html += '<div class="text-muted fs-7 mb-2">' + recentReviewEscape(r.username) + '</div>';
        }

        if (r.text) {
            html += '<div class="gmb-review-comment fs-pdf-7">' + recentReviewEscape(r.text) + '</div>';
        }
        html += '</div></div>';
    });

    html += '</div>';

    return html;
}

function generateSpeedChartsContainer(wid, check) {
    const html = '<div class="row ' + (wid === websiteId  ? '' : 'competitor-charts-container') + '">\n' +
        '                                            <div class="col-12 col-md-6 col-xl-4">\n' +
        '                                                <div class="avoid-break-inside text-center d-flex flex-wrap flex-center">\n' +
        '                                                    <div class="fs-2 ' + (wid === websiteId ? 'fs-pdf-4' : 'fs-pdf-6') + ' my-5 text-center w-100">' + lajax.t('Server Response') + '</div>\n' +
        '                                                    <div class="position-relative canvas-label">\n' +
        '                                                        <div class="position-absolute translate-middle start-50 top-50 d-flex flex-column flex-center">\n' +
        '                                                             <span class="fw-bolder text-gray-700"></span>\n' +
        '                                                        </div>' +
        '                                                        <canvas class="speed-first-byte" width="100" height="184"></canvas>\n' +
        '                                                    </div>' +
        '                                                </div>\n' +
        '                                            </div>\n' +
        '                                            <div class="col-12 col-md-6 col-xl-4">\n' +
        '                                                <div class="avoid-break-inside text-center d-flex flex-wrap flex-center">\n' +
        '                                                    <div class="fs-2 ' + (wid === websiteId ? 'fs-pdf-4' : 'fs-pdf-6') + ' my-5 text-center w-100">' + lajax.t('All Page Content Loaded') + '</div>\n' +
        '                                                    <div class="position-relative canvas-label">\n' +
        '                                                        <div class="position-absolute translate-middle start-50 top-50 d-flex flex-column flex-center">\n' +
        '                                                             <span class="fw-bolder text-gray-700"></span>\n' +
        '                                                        </div>' +
        '                                                        <canvas class="speed-on-load" width="100" height="184"></canvas>\n' +
        '                                                    </div>' +
        '                                                </div>\n' +
        '                                            </div>\n' +
        '                                            <div class="col-12 col-md-6 col-xl-4">\n' +
        '                                                <div class="avoid-break-inside text-center d-flex flex-wrap flex-center">\n' +
        '                                                    <div class="fs-2 ' + (wid === websiteId ? 'fs-pdf-4' : 'fs-pdf-6') + ' my-5 text-center w-100">' + lajax.t('All Page Scripts Complete') + '</div>\n' +
        '                                                    <div class="position-relative canvas-label">\n' +
        '                                                        <div class="position-absolute translate-middle start-50 top-50 d-flex flex-column flex-center">\n' +
        '                                                             <span class="fw-bolder text-gray-700"></span>\n' +
        '                                                        </div>' +
        '                                                        <canvas class="speed-last-byte" width="100" height="184"></canvas>\n' +
        '                                                    </div>' +
        '                                                </div>\n' +
        '                                            </div>\n' +
        '                                        </div>';

    return wrapInButton(html, wid);
}

function generateSizeChartsContainer(wid, check) {
    const h1 = lajax.t('Download Page Size');
    const h2 = lajax.t('Download Page Size Breakdown');
    const html = '<div class="row mb-4 avoid-break-inside ' + (wid === websiteId  ? '' : 'competitor-charts-container') + '">\n' +
        '                                            <div class="col-12 col-xl-6">\n' +
        '                                                <div class="avoid-break-inside text-center d-flex flex-wrap flex-center">\n' +
        '                                                    <div class="fs-2 ' + (wid === websiteId ? 'fs-pdf-4' : 'fs-pdf-6') + ' my-5 text-center w-100">' + h1 + '</div>\n' +
        '                                                    <div class="position-relative  canvas-label">\n' +
        '                                                        <div class="position-absolute translate-middle start-50 top-50 d-flex flex-column flex-center">\n' +
        '                                                             <span class="fw-bolder text-gray-700"></span>\n' +
        '                                                        </div>' +
        '                                                    <canvas class="total-page-size' + (wid === websiteId ? ' mt-n15': '') + '" width="100" height="281"></canvas>\n' +
        '                                                    </div>' +
        '                                                </div>\n' +
        '                                            </div>\n' +
        '                                            <div class="col-12 col-xl-6 mt-5 mt-xl-0">\n' +
        '                                                <div class="avoid-break-inside text-center">\n' +
        '                                                    <div class="fs-2 ' + (wid === websiteId ? 'fs-pdf-4' : 'fs-pdf-6') + ' my-5 pb-6 pb-sm-3 text-center">' + h2 + '</div>\n' +
        '                                                    <div class="d-flex flex-wrap flex-sm-nowrap justify-content-center">\n' +
        '                                                        <div class="position-relative d-flex flex-center h-175px w-175px ms-11 mb-4 ms-sm-0">\n' +
        '                                                            <div class="position-absolute translate-middle start-50 top-50 d-flex flex-column flex-center">\n' +
        '                                                                 <span class="fw-bolder text-gray-700">&nbsp;</span>\n' +
        '                                                                 <span class="fs-6 fs-pdf-7 fw-semibold text-gray-500">' + lajax.t('Total') + '</span>\n' +
        '                                                            </div>\n' +
        '                                                            <div class="page-size-breakdown pointer-event" width="100" height="386"></div>\n' +
        '                                                        </div>\n' +
        '                                                        <div class="js-donut-legend d-flex flex-column justify-content-center flex-row-fluid pe-0 pe-sm-11 mb-5 min-w-200px mw-200px min-w-xl-250px mw-xl-250px">\n' +
        '                                                     </div>\n'+
        '                                                </div>\n' +
        '                                            </div>\n' +
        '                                        </div>';

    return wrapInButton(html, wid);
}

function generateRenderingImages(wid, check) {
    if (check == false) {
        return;
    }

    let html = '<div class="d-flex col-12 mb-4 flex-wrap flex-md-nowrap ' + (wid === websiteId ? 'justify-content-center justify-content-md-start">' : 'justify-content-start">') +
        '<div class="col-screenshot-mobile d-flex">\n' +
        '                    <div class="screenshot mobile" style="-webkit-user-select: none;">\n' +
        '                        <div class="screenshot-img-container" style="';
    if (check !== false) {
        html += 'background-image:url(' + check.data.mobile + ')!important;';
    }
    html += '">\n';
    html +=  '                        </div>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '                <div class="col-screenshot-tablet d-flex">\n' +
        '                    <div class="screenshot tablet" style="-webkit-user-select: none;">\n' +
        '                        <div class="screenshot-img-container" style="';
    if (check !== false) {
        html += 'background-image:url(' + check.data.tablet + ')!important;';
    }
    html += '">\n';
    html += '\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>\n';

    // Preload images
    const img1 = new Image();
    img1.src = check.data.mobile;
    const img2 = new Image();
    img2.src = check.data.tablet;
    
    return wrapInButton(html, wid);
}

function generateHeadersStatsTable(check) {
    if (check === false) {
        return '';
    }

    let html = '\
        <div class="row mt-4">\
        <div class="table-responsive col-md-6">\
        <table class="table table-row-dashed table-fluid avoid-break-inside mb-0">\
            <thead>\
                <tr>\
                    <th>' + lajax.t('Header Tag') + '</th><th>' + lajax.t('Frequency') + '</th><th></th>\
                </tr>\
            </thead>\
            <tbody>';

    const headings = [];
    let heading_max = 0;
    let length = 0;
    for (let i = 2; i < 7; i++) {
        length = 0;
        if (check.data['h' + i] !== undefined) {
            length = check.data['h' + i]['length'];
        }
        headings.push([
            'H' + i,
            length
        ]);

        if (heading_max < length) {
            heading_max = length;
        }
    }

    for (const heading in headings) {
        html += '<tr><td>%header1%</td><td>%header2%</td><td width="45%" class="volume-bar-wrapper min-w-100px"><div><span style="%style%"></span></div></td></tr>'.strtr({
            "%header1%": headings[heading][0],
            "%header2%": headings[heading][1],
            "%style%": 'width: ' + (Math.round((headings[heading][1] * 100) / heading_max) || 0) + '%'
        });
    }

    html += '</tbody></table></div></div>';

    return html;
}

function generateHeadersTableHtml(list, highlightTarget) {
    let html = '';
    const width = isPdfRequest() ? 20: 10;

    if (highlightTarget === undefined) {
        highlightTarget = false;    // wkhtmltopdf doesn't support default params in function header
    }

    html += '<div class="row"><div class="col-11"><div class="table-part">\
        <table class="table table-row-dashed table-fluid w-100 w-md-50">\
            <thead>\
                <tr>\
                    <th style="width:' + width + '%">' + lajax.t("Tag") + '</th><th>' + lajax.t('Value') + '</th>\
                </tr>\
            </thead>\
            <tbody>';

    let i = 0;

    for (const heading in list) {
        const headings = list[heading];
        if (headings.length > 0) {
            for (const j in headings) {
                // skip tags without target keyword
                if (highlightTarget
                    && (targetKeyword === '' || headings[j].match(targetKeywordRegexp) === null)) {
                    continue;
                }

                //This is to regroup a long table in a set of small tables so that they break in pages better in PDF
                if (divideTables && (i % 6 == 0) && (i > 0)) {
                    html += '</tbody></table></div><div class="table-part"><table class="table table-row-dashed table-fluid w-100 w-md-50"><tbody>';
                }

                i++;

                html += '<tr><td style="width:' + width + '%">%headingId%</td><td>%headingValue%</td></tr>'.strtr({
                    '%headingId%': heading.toUpperCase(),
                    '%headingValue%': highlightTarget ? '<span class="highlight-target">' + headings[j] + '</span>' : headings[j]
                });
            }
        }
    }

    html += '</tbody></table></div></div></div>';

    return wrapInButton(html);
}

function generateHreflangTableHtml(list, highlightTarget) {
    let html = '';
    const width = 30;
    let tableWidth = 50;

    if (highlightTarget === undefined) {
        highlightTarget = false;
    }
    if (isMobileRequest()) {
        tableWidth = 100;
    }

    if (list[1] != undefined) {
        if (list[1].length !== 0) {
            html += '<table class="table table-row-dashed table-fluid mb-0" style="width:' + tableWidth + '%;">\
            <thead>\
                <tr>\
                    <th style="width:' + width + '%">' + lajax.t("Language Code") + '</th>\
                    <th>' + lajax.t('Alternate Page') + '</th>\
                </tr>\
            </thead>\
            <tbody>';

            let j = 0;

            for (let i = 0; i < list.length; i++) {
                if (divideTables && !isMobileRequest() && (j % 6 == 0) && (j > 0)) {
                    html += '</tbody></table></div><div class="table-part"><table class="table table-row-dashed table-fluid mb-0" style="width:' + tableWidth + '%;"><tbody>';
                }

                j++;

                if (list[i]['hreflang'] != undefined)
                    html += '<tr><td style="width:' + width + '%; min-width:80px">%headingId%</td><td>%headingValue%</td></tr>'.strtr({
                        '%headingId%': list[i]['hreflang'],
                        '%headingValue%': highlightTarget ? '<span class="highlight-target">' + list[i]['href'] + '</span>' : list[i]['href']
                    });
            }
            html += '</tbody></table>';
        }
    }

    return wrapInButton(html);
}

function generateHeadersTable(check) {
    if (check === false || check.data.length == 0) {
        return '';
    }
    if (check.data['h1'] != undefined) {
        delete check.data['h1'];
    }

    return generateHeadersTableHtml(check.data);
}

async function generateSnippet(check, $element) {

    if (check === false) {
        return '';
    }
    const width = 600;

    let html = '<div class="snippet" id="snippet"><div id="snip" style="max-width:' + width + '"></div></div>';

    $element.append(html);

    if (check.data.length === 0) {
        $element.find('#snip').after(html);
        return;
    }

    let title = check.data[1];
    let description = check.data['description'];
    let domain = /(([^\/]+)\/\/([^\/]+))/.exec(check.data['url'])[0];
    let date = '';
    const titleLength = 60;

    if (new Date(check.data['date']) != "Invalid Date") {
        date = new Date(check.data['date']);
        date.setUTCHours(0, 0, 0, 0);
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        date = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' — ';
    }

    if (check.data['title'].trim().length <= titleLength) {
        title = check.data['title'];
    } else {
        let truncatedTitle = check.data['title'].substring(0, titleLength);
        if (truncatedTitle.indexOf('|') != -1) {
            truncatedTitle = truncatedTitle.substring(0, truncatedTitle.indexOf('|'));
        }
        const splittedTitle = check.data['title'].substring(truncatedTitle.lastIndexOf(' ') + 1, check.data['title'].length).split(' ');
        let maxWord = '';
        let nameFound = false;
        for (const i in splittedTitle) {
            if (splittedTitle[i] == '|') {
                nameFound = true;
                break;
            }
            if (i == splittedTitle.length - 1) {
                nameFound = true;
                maxWord += ' ' + splittedTitle[i];
                break;
            }
            if (!nameFound) {
                if (splittedTitle[i].length + maxWord.length + ' ...'.length <= 7) {
                    maxWord += ' ' + splittedTitle[i];
                } else {
                    break;
                }
            }
        }
        title = truncatedTitle.substring(0, truncatedTitle.lastIndexOf(' ')) + ' ' + maxWord;
        if (!nameFound) {
            title += ' ' + '...';
        }
    }

    if (check.data['url'].length > 50) {
        check.data['url'] = check.data['url'].substring(0, 50) + '...';
        domain = check.data['url'];
    }

    if (check.data['description'].length >= 150) {
        check.data['description'] = check.data['description'].replace(/&nbsp;/g, '');
        check.data['description'] = check.data['description'].substring(0, 150) + '...';
        description = check.data['description'].substring(0, check.data['description'].lastIndexOf(' ')) + ' ...';
    }

    html = '<div style="';
    if (isPdfRequest()) {
        html += 'width: 870px;">';
        document.getElementById('snippet').style.maxWidth = '920px';
        $('.competitor #snippet').css('maxWidth', '920px');
        // $('.competitor #snippet').css('width', '870px');
    } else {
        html += 'max-width: 900px;">'
    }

    let sizeFavicon = 0;

    function getImageDimensions(data) {
        return new Promise(function (resolved, rejected) {
            const preloadFavicon = new Image();
            preloadFavicon.onload = function () {
                resolved(preloadFavicon.height === 32 ? 26 : 18)
            };
            preloadFavicon.src = data
        })
    }

    if (check.data['favicon'] !== undefined) {
        sizeFavicon = await getImageDimensions(check.data['favicon']);
    }

    html += '<cite class="snippet-top-link-cite">';

    html += check.data['favicon'] === undefined ? '' : '<div class="d-flex overflow-hidden"><span class="favicon-container' +
        (check.data['favicon'].indexOf('notfound_favicon.svg') > 0 ? ' notfound-favicon' : '')  + '"><img ' +
        (sizeFavicon === 26 ? 'class="sz26" ' : '') + 'src="' + check.data['favicon'] +
        '" style="width:' + sizeFavicon + 'px; height:' + sizeFavicon + 'px;"></span>';
    html += check.data['favicon'] === undefined ? '<span class="snippet-top-link-domain">' + domain + '</span><span class="snippet-top-link-after-domain"><span class="snippet-arrow"><svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></span></span>'
        : '<div><span class="snippet-site-name">' + (check.data['siteName'] === undefined || check.data['siteName'] ==='' ? domain.replace(/https?:\/\//, '') : check.data['siteName']) +
        '</span><span class="snippet-top-link-domain">' + domain +
        '<span class="snippet-top-link-after-domain"><span class="snippet-arrow"><svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></span></span></span></div>';
    html += check.data['favicon'] === undefined ? '' : '</div>';

    html += '<div>';

    html += '<div class="snippet-text"><a class="snippet-link"><h3 class="snippet-H3 snippet-text">' + title + '</h3></a></div>';

    html += '<div class="snippet-main-block"><div class="snippet-inside-main-block"><span class="snippet-top-link-after-domain">';

    if (description.length != 0) {
        html += date;
    }

    html += '</span><span class="snippet-main-description snippet-text">' + description + '</span></div></div>';

    html += '</div>';
    html += '</cite>';
    html += '</div>';

    $element.find('#snip').after(html);

    return;
}

function generateCanonicalList(check) {
    if (check === false) {
        return '';
    }

    let html = '';
    if (check.data.length !== 0) {
        html += '<div class="table-responsive col-xl-6 mt-4"><table class="table table-row-dashed table-fluid mb-0"><tbody>';
        for (let i = 0; i < check.data.length; i++) {
            html += '<tr><td>' + check.data[i] + '</td></tr>';
        }
        html += '</tbody></table></div>';
    }

    return html;
}

function generateHreflangTable(check, highlightTarget) {
    if (highlightTarget === undefined) {
        highlightTarget = false;    // wkhtmltopdf doesn't support default params in function header
    }

    if ((check === false) || (check.data.length === 0)) {
         return '';
    }

    // do not generate if not passed for target
    if (highlightTarget && (check.passed === false)) {
        return '';
    }

    return generateHreflangTableHtml(check.data, highlightTarget);
}

function generateH1HeadersTable(check, highlightTarget) {
    if (highlightTarget === undefined) {
        highlightTarget = false;    // wkhtmltopdf doesn't support default params in function header
    }
    if (check === false || check.data.length === 0 || check.data['h1'] == undefined) {
        return '';
    }

    // do not generate if not passed for target
    if (highlightTarget && check.passed === false) {
        return '';
    }

    return generateHeadersTableHtml({'h1': check.data['h1']}, highlightTarget);
}

function generateKeywordsTable(check, type = 'keywords') {
    if (check.data === undefined || check.data[type].length == 0) {
        return '';
    }

    const data = check.data[type];
    if (data === false) {
        return '';
    }

    let html = '\
        <div class="fs-2 my-4 text-center text-gray-700 avoid-break-after">' + (type==='keywords' ? lajax.t("Individual Keywords") : lajax.t("Phrases")) + '</div><div class="table-responsive table-part"><table class="table table-row-dashed table-fluid">\
            <thead>\
                <th style="width:20%">' + (type ==='keywords' ? lajax.t("Keyword") : lajax.t("Phrase")) + '</th>\
                <th style="width:' + (isPdfRequest() ? 12 : 15) + '%">' + lajax.t("Title") + '</th>\
                <th style="width:' + (isPdfRequest() ? 17 : 15) + '%">' + lajax.t("Meta Description Tag") + '</th>\
                <th style="width:' + (isPdfRequest() ? 13 : 15) + '%">' + lajax.t("Headings Tags") + '</th>\
                <th style="width:' + (isPdfRequest() ? 13 : 15) + '%">' + lajax.t("Page Frequency") + '</th>\
                <th style="width:' + (isPdfRequest() ? 25 : 20) + '%"></th>\
            </thead>\
            <tbody>';

    let j = 1;
    for (const i in data) {
        const word = data[i];

        html += '\
            <tr>\
                <td>' + word.word + '</td>\
                <td><i class="ki-duotone fs-1 ' + (word.title ? 'ki-check text-success' : 'ki-cross text-danger') + '"><span class="path1"></span><span class="path2"></span></i></td>\
                <td><i class="ki-duotone fs-1 ' + (word.description ? 'ki-check text-success' : 'ki-cross text-danger') + '"><span class="path1"></span><span class="path2"></span></i></td>\
                <td><i class="ki-duotone fs-1 ' + (word.headers ? 'ki-check text-success' : 'ki-cross text-danger') + '"><span class="path1"></span><span class="path2"></span></i></td>\
                <td>' + Number(word.count) + '</td>\
                <td class="volume-bar-wrapper min-w-100px"><div><span style="width: ' + Number(word.grade) + '%;"></span></div></td>\
            </tr>';
        j++;
    }

    html += '</tbody></table></div>';

    return html;
}

function generateKeywordsAndPhrasesTable(wid, check) {
    const html = '<div class="answer keywords field-details field-value-table avoid-break-inside">'
        + generateKeywordsTable(check, 'keywords')
        + '</div><div class="answer phrases field-details field-value-table avoid-break-inside">'
        + generateKeywordsTable(check, 'phrases')
        + '</div>';

    return wrapInButton(html, wid);
}

function generateImageList(check) {
    if (check === false || check.data.list.length == 0) {
        return '';
    }
    let html = '';
    const firstColumnWidth = isPdfRequest() ? 70 : 50;

    html += '<div class="table-part"><table class="table table-row-dashed table-fluid table-wrapped">' +
        '<thead><tr><th width="%width%px">#</th><th>%imageLink%</th></tr></thead><tbody>'.strtr({
            '%imageLink%': lajax.t("Image link"),
            '%width%' : firstColumnWidth,
        });

    let j = 0;
    for (let i = 0; i < check.data.list.length; i++) {
        const imageUrl = check.data.list[i];

        if (divideTables && !isMobileRequest() && (j % 6 == 0) && (j > 0)) {
            html += '</tbody></table></div><div class="table-part"><table class="table table-row-dashed table-fluid table-wrapped"><tbody>';
        }

        html += '<tr><td width="%width%px">%id%</td><td data-raw-data="%raw-data%">%url%</td></tr>'.strtr({
            '%id%': parseInt(j) + 1,
            '%url%': imageUrl,
            '%width%' : firstColumnWidth,
        });

        j++;
    }

    html += '</tbody></table></div>';

    if (j == 0) {
        return '';
    }

    return wrapInButton(html);
}

function generateTargetImageList(check) {
    if (check === false || check.data.list.length == 0) {
        return '';
    }

    let html = '<div class="table-part"><table class="table table-row-dashed table-fluid table-wrapped">' +
        '<thead><tr><th width="50px">#</th><th style="width:45%">%imageLink%</th><th>%imageAlt%</th></tr></thead><tbody>'.strtr({
            '%imageLink%': lajax.t("Image link"),
            '%imageAlt%': lajax.t("Alt Text"),
        });

    let j = 0;
    for (let i = 0; i < check.data.list.length; i++) {
        const image_tag = check.data.list[i];
        let matches = image_tag.match('alt\\s*=\\s*"(.+?)"');
        if (matches === null || matches.length != 2) {
            continue;
        }
        const alt_text = matches[1];
        matches = image_tag.match('src\\s*=\\s*"(.+?)"');
        let image_url = '';
        if (matches !== null && matches.length === 2) {
            image_url = matches[1];
        }

        // skip images without target keyword
        if ((targetKeyword === '') || alt_text.match(targetKeywordRegexp) === null) {
            continue;
        }

        if (divideTables && !isMobileRequest() && (j % 6 == 0) && (j > 0)) {
            html += '</tbody></table></div><div class="table-part"><table class="table table-row-dashed table-fluid table-wrapped"><tbody>';
        }

        html += '<tr><td width="50px">%id%</td><td data-raw-data="%raw-data%">%url%</td><td>%alt%</td></tr>'.strtr({
            '%id%': parseInt(j) + 1,
            '%url%': image_url.replace(/^.*[\\\/]/, ''),
            '%alt%': '<span class="highlight-target">' + alt_text.replace(/^.*[\\\/]/, '') + '</span>',
        });
        j++;
    }

    html += '</tbody></table></div>';
    if (j == 0) {
        return '';
    }

    return wrapInButton(html);
}

function generateNonFriendlyUrlTable(check) {
    if (check === false || check.data.length == 0) {
        return '';
    }

    let firstColWidth = 5;
    let secondColWidth = 40;
    let secondColMinWidth = ' min-width: 280px;';
    let checkColWidth = 9;

    if (isPdfRequest()) {
        secondColMinWidth = '';
    }

    let html = '';
    html += '\
        <div class="table-responsive table-part">\
            <table class="table first table-row-dashed table-fluid">\
            <thead>\
                <th style="width:' + firstColWidth + '%;">' + lajax.t("Line") + '</th>\
                <th style="width:' + secondColWidth + '%;' + secondColMinWidth + '" >' + lajax.t("Link") + '</th>\
                <th style="width:' + checkColWidth + '%;"><div>' + lajax.t("Underscores") + '</div></th>\
                <th style="width:' + checkColWidth + '%;"><div>' + lajax.t("Parameters") + '</div></th>\
                <th style="width:' + checkColWidth + '%;"><div>' + lajax.t("Symbols") + '</div></th>\
                <th style="width:' + checkColWidth + '%;"><div>' + lajax.t("File Names").replace(new RegExp(' ', 'g'), '&nbsp;') + '</div></th>\
                <th style="width:' + checkColWidth + '%;"><div>' + lajax.t("Path Depth").replace(new RegExp(' ', 'g'), '&nbsp;') + '</div></th>\
                <th style="width:' + checkColWidth + '%;"><div>' + lajax.t("Length") + '</div></th>\
            </thead>\
            <tbody>';

    const labelCheckNo = '<i class="ki-duotone fs-1 ki-cross text-danger"><span class="path1"></span><span class="path2"></span></i>';
    const labelCheckYes = '<i class="ki-duotone fs-1 ki-check text-success"><span class="path1"></span><span class="path2"></span></i>';
    for (const l in check.data) {
        const link = check.data[l];

        if (divideTables && isPdfRequest() && (l % 6 == 0) && (l > 0)) {
            html += '</tbody></table></div><div class="table-responsive table-part"><table class="table table-row-dashed table-fluid"><tbody>';
        }

        html += '\
            <tr>\
                <td style="width:' + firstColWidth + '%;">' + link.line + '</td>\
                <td style="word-wrap: break-word; word-break: break-all;width:' + secondColWidth + '%;' + secondColMinWidth + '" >' + link.link + '</td>\
                <td style="width:' + checkColWidth + '%;">' + (link.details[0] == 1 ? labelCheckNo : labelCheckYes) + '</td>\
                <td style="width:' + checkColWidth + '%;">' + (link.details[1] == 1 ? labelCheckNo : labelCheckYes) + '</td>\
                <td style="width:' + checkColWidth + '%;">' + (link.details[2] == 1 ? labelCheckNo : labelCheckYes) + '</td>\
                <td style="width:' + checkColWidth + '%;">' + (link.details[3] == 1 ? labelCheckNo : labelCheckYes) + '</td>\
                <td style="width:' + checkColWidth + '%;">' + (link.details[4] == 1 ? labelCheckNo : labelCheckYes) + '</td>\
                <td style="width:' + checkColWidth + '%;">' + (link.details[5] == 1 ? labelCheckNo : labelCheckYes) + '</td>\
            </tr>';
    }

    html += '</tbody></table></div>';

    return wrapInButton(html);
}

function generateAnalyticsList(check) {
    if (check === false) {
        return '';
    }
    let html = '';
    if (check.data.length > 0) {
        html += '\
            <div class="table-responsive table-part col-xl-6 mt-4"><table class="table table-row-dashed table-fluid">\
                <tbody>';
        for (const i in check.data) {
            const record = check.data[i];
            html += '\
                    <tr>\
                        <td>\
                            <img class="table-icon" src="/img/analytics/' + record.id + '.png" />&nbsp;&nbsp;' + record.name + '\
                        </td>\
                    </tr>';
        }
        html += '\
                </tbody>\
            </table></div>';
    }

    return html;
}

function generateDeprecatedTagsTable(check) {
    if (check === false || check.data.length == 0) {
        return '';
    }
    let html = '<div class="table-responsive"><table class="table table-row-dashed table-fluid">\
        <thead>\
            <th>' + lajax.t("Line") + '</th>\
            <th>' + lajax.t("Deprecated Tags") + '</th>\
            <th>' + lajax.t("Occurrences") + '</th>\
        </thead>\
        <tbody>';

    for (const i in check.data) {
        const tag = check.data[i];
        html += '<tr><td>%line%</td><td>%tag%</td><td>%html%</td></tr>'.strtr({
            '%line%': tag['line'],
            '%tag%': tag['tag'],
            '%html%': tag['html'].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        });
    }
    html += '\
            </tbody>\
        </table></div>';

    return wrapInButton(html);
}

function generateInlineCssTable(check) {
    if (check === false || check.data.length == 0) {
        return '';
    }

    const width = isPdfRequest() ? 100: 70;

    let html = '\
        <div class=" table-part"><table class="table table-row-dashed table-fluid table-wrapped">\
            <thead><tr>\
                <th style="width: ' + width + 'px;">' + lajax.t("Line") + '</th>\
                <th>' + lajax.t("Style") + '</th>\
            </tr></thead>\
            <tbody>';

    let i = 0;
    for (const style in check.data) {

        if (divideTables && !isMobileRequest() && (i % 6 == 0) && (i > 0)) {
            html += '</tbody></table></div><div class="table-part"><table class="table table-row-dashed table-fluid table-wrapped"><tbody>';
        }

        const object = check.data[style];

        html += '\
            <tr>\
                <td style="width: ' + width + 'px;">' + Number(object['line']) + '</td>\
                <td>' + object['style'] + '</td>\
            </tr>';

        i++;
    }
    html += '</tbody></table></div>';

    return wrapInButton(html);
}

function generateEmailTable(check) {
    if (check === false || check.data.length == 0) {
        return '';
    }
    let html = '\
        <div class="table-responsive col-xl-6"><table class="table table-row-dashed table-fluid">\
            <thead><tr>\
                <th>' + lajax.t("Line") + '</th>\
                <th>Email</th>\
            </tr></thead>\
            <tbody>';

    for (const l in check.data) {
        const details = check.data[l];
        html += '\
            <tr>\
                <td>' + details['line'] + '</td>\
                <td>' + details['email'] + '</td>\
            </tr>';
    }

    html += '</tbody></table></div>';

    return wrapInButton(html);
}

function generateTopKeywordRankingsTable(check) {
    if (check == false || (check && check.hideTable))  {
        return;
    }

    let HeadersString = '<th width="25%">' + lajax.t('Keyword') + '</th>';
    HeadersString += '<th width="' + (isPdfRequest() ? '12%' : '10%') + '">' + lajax.t('Location').replace(' ', '&nbsp;').replace(' ', '<br>') + '</th>';
    HeadersString += '<th width="10%">' + lajax.t('Position') + '</th>';
    HeadersString += '<th>' + lajax.t('Total Searches') + '</th>';
    HeadersString += '<th>' + lajax.t('Estimated Traffic') + '</th>';
    HeadersString += '<th width="15%" style="min-width: 120px;"></th>';
    let html = '\
        <table class="table table-row-dashed align-middle my-0 avoid-break-inside">\
            <thead><tr>' + HeadersString + '</tr></thead>\
            <tbody>';

    if ((typeof check.data === 'object') && (check.data !== null)) {
        let maxValue = 0;

        $.each(check.data, function (key, value) {
            const etv = parseInt((value.etv).replace(/,/g, ''));
            if (etv > maxValue) {
                maxValue = etv;
            }
        });

        $.each(check.data, function (i, item) {
            const etv = parseInt((item.etv).replace(/,/g, ''));
            const width = (maxValue !== 0) ? (etv / maxValue * 100) : 0;
            let rowContent = '';

            rowContent += '<td>' + item.key + '</td>';
            rowContent += '<td class="flag-col"><span class="country-flag-icon flag-icon flag-icon-' + item.country_code.toLowerCase() + ' flag-icon-squared"></span></td>';
            rowContent += '<td>' + item.position + '</td>';
            rowContent += '<td>' + numberWithCommas(item.search_volume) + '</td>';
            rowContent += '<td>' + numberWithCommas(item.etv) + '</td>';
            rowContent += '<td width="25%" class="volume-bar-wrapper min-w-125px"><div><span class="table-chart-item" style="width: ' + width + '%;"></span></div></td>';
            const htmlRow = '<tr>' + rowContent + '</tr>';

            html += htmlRow;
        });
        html += '</tbody></table>';
    } else {
        html = '<div>' + lajax.t('No ranking results found for site') + '</div>';
    }

    // Track button hack for main website only
    if ($('.field-topKeywordRankings .field-track').length > 2) { // template and main website
        $('.field-topKeywordRankings .field-track').each(function(index) {
            if (index > 1) {
                $(this).remove();
            }
        })
    }

    return html;
}

function generateTopPaidRankingsTable(check) {
    if (check == false || (check && check.hideTable))  {
        return;
    }

    let HeadersString = '<th width="25%">' + lajax.t('Keyword') + '</th>';
    HeadersString += '<th width="' + (isPdfRequest() ? '12%' : '10%') + '">' + lajax.t('Location').replace(' ', '&nbsp;').replace(' ', '<br>') + '</th>';
    HeadersString += '<th width="10%">' + lajax.t('Position') + '</th>';
    HeadersString += '<th>' + lajax.t('Total Searches') + '</th>';
    HeadersString += '<th>' + lajax.t('Estimated Traffic') + '</th>';
    HeadersString += '<th width="15%" style="min-width: 120px;"></th>';
    let html = '\
        <table class="table table-row-dashed align-middle my-0 avoid-break-inside">\
            <thead><tr>' + HeadersString + '</tr></thead>\
            <tbody>';

    if ((typeof check.data === 'object') && (check.data !== null)) {
        let maxValue = 0;

        $.each(check.data, function (key, value) {
            const etv = parseInt((value.etv).replace(/,/g, ''));
            if (etv > maxValue) {
                maxValue = etv;
            }
        });

        $.each(check.data, function (i, item) {
            const etv = parseInt((item.etv).replace(/,/g, ''));
            const width = (maxValue !== 0) ? (etv / maxValue * 100) : 0;
            let rowContent = '';

            rowContent += '<td>' + item.key + '</td>';
            rowContent += '<td class="flag-col"><span class="country-flag-icon flag-icon flag-icon-' + item.country_code.toLowerCase() + ' flag-icon-squared"></span></td>';
            rowContent += '<td>' + item.position + '</td>';
            rowContent += '<td>' + numberWithCommas(item.search_volume) + '</td>';
            rowContent += '<td>' + numberWithCommas(item.etv) + '</td>';
            rowContent += '<td width="25%" class="volume-bar-wrapper min-w-125px"><div><span class="table-chart-item" style="width: ' + width + '%;"></span></div></td>';
            const htmlRow = '<tr>' + rowContent + '</tr>';

            html += htmlRow;
        });
        html += '</tbody></table>';
    } else {
        html = '<div>' + lajax.t('No ranking results found for site') + '</div>';
    }

    return html;
}

function generateTopAIOverviewRankingsTable(check) {
    if (check == false || (check && check.hideTable))  {
        return;
    }

    let HeadersString = '<th width="25%">' + lajax.t('Keyword') + '</th>';
    HeadersString += '<th width="' + (isPdfRequest() ? '12%' : '10%') + '">' + lajax.t('Location').replace(' ', '&nbsp;').replace(' ', '<br>') + '</th>';
    HeadersString += '<th width="10%">' + lajax.t('Position') + '</th>';
    HeadersString += '<th>' + lajax.t('Total Searches') + '</th>';
    HeadersString += '<th>' + lajax.t('Estimated Traffic') + '</th>';
    HeadersString += '<th width="15%" style="min-width: 120px;"></th>';
    let html = '\
        <table class="table table-row-dashed align-middle my-0 avoid-break-inside">\
            <thead><tr>' + HeadersString + '</tr></thead>\
            <tbody>';

    if ((typeof check.data === 'object') && (check.data !== null)) {
        let maxValue = 0;

        $.each(check.data, function (key, value) {
            const etv = parseInt((value.etv).replace(/,/g, ''));
            if (etv > maxValue) {
                maxValue = etv;
            }
        });

        $.each(check.data, function (i, item) {
            const etv = parseInt((item.etv).replace(/,/g, ''));
            const width = (maxValue !== 0) ? (etv / maxValue * 100) : 0;
            let rowContent = '';

            rowContent += '<td>' + item.key + '</td>';
            rowContent += '<td class="flag-col"><span class="country-flag-icon flag-icon flag-icon-' + item.country_code.toLowerCase() + ' flag-icon-squared"></span></td>';
            rowContent += '<td>' + item.position + '</td>';
            rowContent += '<td>' + numberWithCommas(item.search_volume) + '</td>';
            rowContent += '<td>' + numberWithCommas(item.etv) + '</td>';
            rowContent += '<td width="25%" class="volume-bar-wrapper min-w-125px"><div><span class="table-chart-item" style="width: ' + width + '%;"></span></div></td>';
            const htmlRow = '<tr>' + rowContent + '</tr>';

            html += htmlRow;
        });
        html += '</tbody></table>';
    } else {
        html = '<div>' + lajax.t('No ranking results found for site') + '</div>';
    }

    return html;
}

function generateKeywordPositionsTable(check) {
    if (check == false) {
        return ;
    }

    const positions = check.data;
    let maxValue = 0;

    $.each(positions, function (key, value) {
        if (value > maxValue) {
            maxValue = value;
        }
    });

    let content = '';
    $.each(positions, function (key, value) {
        const width = (maxValue !== 0) ? (value / maxValue * 100) : 0;
        content += '<tr><td>' + key + '</td><td>' + numberWithCommas(value) + '</td><td class="volume-bar-wrapper min-w-100px"><div><span class="table-chart-item" style="width:' + width + '%;"></span></div></td></tr>';

    });

    content = content.length ? content : '<tr class="odd"><td valign="top" colspan="6" class="text-center">' + lajax.t('No data available in table') + '</td></tr>';

    return content;
}

function generateTotalTrafficStatsWithData(check) {
     if (check == false) {
        return;
    }

    const descriptions = lajax.t('This shows you the Estimated Traffic Volume your page receives from it’s Keyword Rankings');
     // consider old checks from cache and db
    let data = {};
    if ((!check['data'] || Object.keys(check['data']).length === 0) && check['value'] > 1 ) {
        data['total'] = check['value'];
    } else {
        data = check['data'];
    }

    const config = {
        'total' : {
            '%title%' : lajax.t('Google Organic'),
            '%value%' : (data['total']) ? numberWithCommas(data['total']) : 0,
        },
        'paidtotal': {
            '%title%' : lajax.t('Paid'),
            '%value%' : (data['paidtotal']) ? numberWithCommas(data['paidtotal']) : 0,
        },
        'aitotal': {
            '%title%' : lajax.t('AI Overviews'),
            '%value%' : (data['aitotal']) ? numberWithCommas(data['aitotal']) : 0,
        },
    };


    const template = '<div class="faq-box col-md mb-5">\
        <div class="row flex-column">\
            <div class="">\
                <div class="js-header-place"></div>\
                <h5 class="question" data-wow-delay=".1s">%title%</h5>\
                <div class="answer field-value">\
                    <span>' + lajax.t('This shows you the Estimated Traffic Volume your page receives from it’s Keyword Rankings') + '</span>\
                    <div class="competitor-sizer">\
                        <div class="row g-3 mt-0">\
                            <div class="grow-0 shrink w-auto">\
                                <div class="card h-lg-100">\
                                    <div class="card-body d-flex justify-content-start align-items-start flex-column pb-7 px-9 p-pdf-6">\
                                        <div class="m-0">\
                                            <i class="ki-duotone ki-chart-simple-3 fs-2hx text-gray-600"><span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span></i>\
                                        </div>\
                                        <div class="d-flex flex-column mt-6 me-10">\
                                            <span class="fw-semibold fs-2qx fs-pdf-1 text-gray-800 lh-1 ls-n2">%value%</span>\
                                            <div class="m-0 mt-2 text-wrap">\
                                                <span class="fw-semibold fs-6 fs-pdf-7 text-gray-500 card-tile-title">' + lajax.t('Monthly Traffic Volume') + '</span>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
        </div>';

    let html = '<div class="row">';
    for (const key in data) {
        if (config[key] === undefined || data[key] === 0) {
            continue;
        }

        let tmp = template;
        for (const prop in config[key]) {
            tmp = tmp.replace( prop, config[key][prop]);
        }
        html += tmp;
    }

    html += '</div>';
    return html;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function generateSubpagesTable(check, $element) {
    if (check === false) {
        return '';
    }

    const locationUrl = window.location.protocol + '//' +  window.location.host;
    let html = '';
    const length = Object.keys(check.data).length;
    const limit = 12;
    let current = 0;
    let tableClass = 'table table-row-dashed table-fluid mb-0';

    if (length === 0) {
        html = '<div class="row no-subpages">' + lajax.t("No Sub-Pages Found") + '</div>';

        $element.append(html);

        return;
    }

    if (isMobileRequest()) {
        tableClass += ' table-wrapped'
    }

    if (length < limit) {

        html = '<table class="' + tableClass + '">\
                <thead>\
                    <tr><th width="100%">' + lajax.t("Page") + '</th></tr>\
                </thead>\
                <tbody>';

        $.each(check.data, function () {
            let title = this.title.trim();
            let fullLink = this.link;

            if ((template !== undefined) && (template.toString() !== '0')) {
                fullLink = '/template/' + template + fullLink;
            }

            current++;

            if (title === '') {
                title = '<i>' + lajax.t("Image Link") + '</i>';
            }
            if (isPdfRequest()) {
                html += '<tr><td>%title%</td></tr>'.strtr({
                    '%title%': title
                });
            } else {
                html += '<tr><td><a class="no-link-pdf" %link% >%title%</a></td></tr>'.strtr({
                    '%link%': 'href="' + locationUrl + fullLink + '"',
                    '%title%': title
                });
            }
        });

        html += '</tbody></table>';

        $element.find('.field-value').before(html);

        return html;
    }

    $.each(check.data, function () {
        let title = this.title.trim();
        let fullLink = this.link;

        if ((template !== undefined) && (template.toString() !== '0')) {
            fullLink = '/template/' + template + fullLink;
        }

        current++;

        if (title === '') {
            title = '<i>' + lajax.t("Image Link") + '</i>';
        }
        if (isPdfRequest()) {
            html += '<tr><td>%title%</td></tr>'.strtr({
                '%title%': title
            });
        } else {
            html += '<tr><td><a class="no-link-pdf" %link% >%title%</a></td></tr>'.strtr({
                '%link%': 'href="' + fullLink + '"',
                '%title%': title
            });
        }
        if (current === limit) {
            $element.find('.field-value').before('<table class="' + tableClass + '">\
                <thead>\
                    <tr><th width="100%">' + lajax.t("Page") + '</th></tr>\
                </thead>\
                <tbody>' + html + '</tbody></table>' +
                '<div id="subpagesmore" class="btn-block btn btn-light btn-sm btn-show-subpagesmore hidden-pdf mt-4" onclick="showMore(\'subpagesmore\'); return click;">' + lajax.t("Show me more") + '</div>');

            html = '<div class="subpagesmore row-hidden"><div class=" table-part"><table class="' + tableClass + ' mb-0"><tbody>';
        }

        if (divideTables && !isMobileRequest() && (current > limit) && (current % 4 == 0)) {
            html += '</tbody></table></div></div><div class="subpagesmore row-hidden"><div class=" table-part"><table class="' + tableClass + ' mb-0"><tbody>';
        }

    });

    html += '</tbody></table></div></div>';

    if (current > limit) {
        html += '<div class="btn-block btn btn-light btn-sm btn-hide-subpagesmore hidden-pdf mt-4" style="display:none;" onclick="hideMore(\'subpagesmore\'); return click;">' + lajax.t("Hide Details") + '</div>';
    }

    if (length === 0) {
        html = '<div class="row">' + lajax.t("No Sub-Pages Found") + '</div>';
    }

    $element.append(html);

    return html;
}

/**
 * @param {object} check
 * @param wid
 * @returns {string}
 */
function generateOnPageLinks(check, wid) {
    if (check === false || check.data.links.length === 0) {
        return '';
    }
    const width = isPdfRequest() ? 70 : 60;

    let html = '<div class="table-responsive table-part"><table class="table table-row-dashed table-fluid">';
    html += '<thead><tr><th width="%width%%">%page%</th><th width="%widthSmall%%">%type%</th><th width="%widthSmall%%">%follow%</th></tr></thead><tbody>'.strtr({
        '%width%' : width,
        '%widthSmall%': (100 - width) / 2,
        '%page%': lajax.t("Page"),
        '%type%': lajax.t("Type"),
        '%follow%': lajax.t("Follow/ Nofollow")
    });
    let i = 0;
    for (const j in check.data.links) {
        const link = check.data.links[j];
        let linkType = link.type;
        let linkJuice = link.juice;

        if (linkJuice === 'Follow') {
            linkJuice = '<span class="badge badge-light-success">' + lajax.t('Follow') + '</span>';
        } else if (linkJuice === 'Nofollow') {
            linkJuice = '<span class="badge badge-light-danger">' + lajax.t('Nofollow') + '</span>';
        }

        if (linkType === 'External') {
            linkType = '<span class="badge badge-light">' + lajax.t('External')  + '</span>';
        } else if (linkType === 'Internal') {
            linkType = '<span class="badge badge-light-primary">' + lajax.t('Internal') + '</span>';
        }

        i++;

        /* This is to regroup a long table in a set of small tables so that they break in pages better in PDF */
        if (divideTables && !isMobileRequest() && (i % 6 == 0)) {
            html += '</tbody></table></div><div class="table-responsive table-part"><table class="table table-row-dashed table-fluid"><tbody>';
        }

        html += '<tr class=""><td width="%width%%">%link%</td><td width="%widthSmall%%">%linkType%</td><td width="%widthSmall%%">%linkJuice%</td></tr>'.strtr({
            '%width%' : width,
            '%widthSmall%': (100 - width) / 2,
            '%link%': link.link,
            '%linkType%': linkType,
            '%linkJuice%': linkJuice
        });
    }

    html += '</tbody></table></div>';

    // 'On-Page Links'
    let selector = check.name + wid;
    const colors = ['primary', 'success', 'danger'];

    const sizeDonutData = [
        {
            data: check.data.internalFollowCount + check.data.internalNofollowCount,
            label: lajax.t('Internal Links'),
        },
        {
            data: check.data.externalFollowCount,
            label: lajax.t('External Links: Follow'),
        },
        {
            data: check.data.externalNofollowCount,
            label: lajax.t('External Links: Nofollow'),
        }
    ]
    setTimeout(function() {
        $('#' + selector + ' .on-page-links-container').removeClass('d-none');
        DonutChart.init(wid, selector, 'on-page-links', sizeDonutData, colors, check.data.total);
    }, 250);

    return wrapInButton(html);
}

function generateYoutubeActivity(check) {
    if (check === false || check === undefined || check.data === false) {
        return '';
    }

    const activityStats = [
        { data: check.data.subscribers, icon: 'ki-people', title: lajax.t("Followers")},
        { data: check.data.views, icon: 'ki-eye', title: lajax.t("View Count")},
    ]
    let html = '<div class="w-100">\
            <div class="item-image-social youtube-image_official"></div>\
            <div class="competitor-sizer"><div class="row row-gap-5 gx-3 gx-xl-5">';

    for (const i in activityStats) {
        html+='<div class="col-10 col-sm-7 col-md-10 col-xxl-6 col-pdf-6">\
                    <div class="card h-lg-100">\
                        <div class="card-body d-flex justify-content-start align-items-start flex-column pb-7 px-9 p-pdf-6">\
                            <div class="m-0">\
                                <i class="ki-duotone ' + activityStats[i].icon + ' fs-2hx text-gray-600">\
                                    <span class="path1"></span>\
                                    <span class="path2"></span>\
                                    <span class="path3"></span>\
                                    <span class="path4"></span>\
                                    <span class="path5"></span>\
                                </i>\
                            </div>\
                            <div class="d-flex flex-column mt-6 mt-pdf-5">\
                                <span class="fw-semibold fs-2qx fs-pdf-1 text-gray-800 lh-1 ls-n2">' + nFormatter(activityStats[i].data, 1) + '</span>\
                                <div class="m-0 mt-2 text-wrap">\
                                    <span class="fw-semibold fs-6 fs-pdf-7 text-gray-500 card-tile-title">' + activityStats[i].title + '</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
    }
    html += '</div></div>\
    </div>';
    return html;
}

function generateSitemapList(check, wid) {
    if (check === false) {
        return '';
    }

    let html = '';

    if (check.data.urls.length > 0) {
        html += '<div class="table-responsive table-part col-xl-6 mt-4"><table class="table table-row-dashed table-fluid table-wrapped"><tbody>';

        let l = 0;
        for (const i in check.data.urls) {

            if (divideTables && !isMobileRequest() && (l % 6 == 0) && (l > 0)) {
                html += '</tbody></table></div><div class="table-responsive table-part col-xl-6"><table class="table table-row-dashed table-fluid"><tbody>';
            }

            html += '<tr><td>' + check.data.urls[i] + '</td></tr>';

            l++;
        }

        html += '</tbody></table></div>';

    } else {
        if (!isAgency && (wid == websiteId)) {
            html += '<p class="our-free-tool d-flex flex-wrap align-items-center mb-0">' + lajax.t("Create it yourself with our free tool:") + ' &nbsp; <a target="_blank" href="' + infoUrls['sitemapGenerator'].url + '" onClick="event.stopPropagation();return true;">' + lajax.t("XML Sitemap Generator") + '</a></p>'
        }
    }
    if (check.data.found > check.data.tested) {
        html += '<div class="mt-4">' + lajax.t('More Sitemaps were found, but not tested.') + '</div>';
    }

    return html;
}

function generateRobotsTxtList(check, wid, toolLink) {
    if (check === false) {
        return '';
    }
    let html = '';

    if (check.passed) {
        html += '<div class="table-responsive col-xl-6 mt-4 table-part"><table class="table table-row-dashed table-fluid"><tbody><tr><td>' + check.data + '</td></tr></tbody></table></div>';
    } else {
        if (toolLink && !isAgency && (wid == websiteId)) {
            html += '<p class="our-free-tool d-flex align-items-center flex-wrap ">' + lajax.t("Create it yourself with our free tool:") + '&nbsp;' + toollink + '</p>'
        }
    }

    return html;
}

function generateNonMinifiedList(check) {
    if (check === false || check === undefined) {
        return '';
    }
    let html = '';

    if (check.data.length > 0) {
        html += '<div class="table-responsive table-part"><table class="table table-row-dashed table-fluid">\
           <thead><tr><th>' + lajax.t("File") + '</th><th style="width:14%;">' + lajax.t("File Size") + '</th><th style="width:14%;">' + lajax.t("Save Size") + '</th><th style="width:14%;">' + lajax.t("Save Percentage") + '</th></tr></thead>\
           <tbody>';

        for (const i in check.data) {

            const link = check.data[i];

            html += '<tr><td>' + link[0] + '</td><td>' + link[1] + '</td><td>' + link[2] + '</td><td>' + link[3] + '</td></tr>';
        }

        html += '</tbody></table></div>';

        $('.field-%field% .js-collapse-in'.replace('%field%', check.name)).show();
    }

    return wrapInButton(html);
}


function generateBacklinksList(wid, check) {
    if (check === false || check === undefined || check.data === false || check.data === undefined || check.data.length === 0) {
        return '';
    }

    let rows = '<div class="table-part table-responsive">\n' +
        '           <table class="table table-row-dashed top-backlinks-table">\n' +
        '               <thead>\n' +
        '                  <tr>\n' +
        '                     <th width="5%">' + lajax.t('Domain strength').replace(new RegExp(' ', 'g'), '<br/>') + '</th>\n' +
        '                     <th width="35%" class="top-backlinks-ref-url-cell">' + lajax.t('Referring Page URL') + '</th>\n' +
        '                     <th width="30%" class="hidden-pdf">' + lajax.t('Referring Page Title') + '</th>\n' +
        '                     <th width="30%" class="hidden-pdf">' + lajax.t('Anchor Text') + '</th>\n' +
        '                 </tr>\n' +
        '               </thead>\n' +
        '               <tbody>\n';

    for (const i in check.data) {
        const rowData = check.data[i];
        if (!rowData['url'] || !rowData['anchor_text']) {
            continue;
        }

        rows += '<tr><td>%domain_strength%</td><td class="top-backlinks-ref-url-cell"><span rel="nofollow" href="//%url%">%url%</span></td><td class="hidden-pdf">%title%</td><td class="hidden-pdf">%anchor_text%</td></tr>'.strtr({
            '%domain_strength%': rowData['domain_authority'],
            '%url%': rowData['url'],
            '%title%': rowData['title'],
            '%anchor_text%': rowData['anchor_text'],
        });
    }

    rows += '</tbody></table></div>';

    $('.field-backlinks-list').show();

    return wrapInButton(rows, wid);
}

function generateBacklinksTopPages(wid, check) {
    let i;
    let rowData;
    if (check === false || check === undefined || check.data === false || check.data === undefined || check.data.length === 0) {
        return '';
    }

    let maxValue = 0;
    for (i in check.data) {
        rowData = check.data[i];
        if (rowData['backlinks'] && rowData['backlinks'] > maxValue) {
            maxValue = rowData['backlinks'];
        }
    }

    let rows = '<div class="table-part table-responsive">\n' +
        '           <table class="table table-row-dashed" style="width: 100%">\n' +
        '               <thead>\n' +
        '                  <tr>\n' +
        '                     <th style="width: 50%">' + lajax.t('URL') + '</th>\n' +
        '                     <th style="width: 12%">' + lajax.t('Backlinks') + '</th>\n' +
        '                     <th style="min-width: ' + (isPdfRequest() ? 250 : 170) + 'px"></th>\n' +
        '                 </tr>\n' +
        '               </thead>\n' +
        '               <tbody>\n';

    for (i in check.data) {
        rowData = check.data[i];
        if (!rowData['url'] || !rowData['backlinks']) {
            continue;
        }

        const width = (rowData['backlinks'] / maxValue) * 100;
        rows += '<tr><td class="top-backlinks-ref-url-cell"><span rel="nofollow" href="//%url%">%url%</span></td><td class="no-break-pdf">%backlinks%</td><td class="volume-bar-wrapper min-w-100px"><div><span style="width: %width%"></span></div></td></tr>'.strtr({
            '%url%': shortenText(rowData['url']),
            '%backlinks%': numberWithCommas(rowData['backlinks']),
            '%width%': width + '%',
        });
    }

    rows += '</tbody></table></div>';

    $('.field-backlinks-list').show();

    return wrapInButton(rows, wid);
}

function shortenText(text) {
    const maxLength = 70;

    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '...';
    }
    return text;
}

function generateBacklinksTopAnchors(wid, check) {
    let i;
    let rowData;
    if (check === false || check === undefined || check.data === false || check.data === undefined || check.data.length === 0) {
        return '';
    }

    let maxValue = 0;
    for (i in check.data) {
        rowData = check.data[i];
        if (rowData['backlinks'] && rowData['backlinks'] > maxValue) {
            maxValue = rowData['backlinks'];
        }
    }

    let rows = '<div class="table-part table-responsive">\n' +
        '           <table class="table table-row-dashed">\n' +
        '               <thead>\n' +
        '                  <tr>\n' +
        '                     <th style="width: 50%">' + lajax.t('Anchor') + '</th>\n' +
        '                     <th style="width: 12%">' + lajax.t('Backlinks') + '</th>\n' +
        '                     <th style="min-width: ' + (isPdfRequest() ? 250 : 170) + 'px"></th>\n' +
        '                 </tr>\n' +
        '               </thead>\n' +
        '               <tbody>\n';

    for (i in check.data) {
        rowData = check.data[i];
        if (!rowData['anchor'] || !rowData['backlinks']) {
            continue;
        }

        const width = (rowData['backlinks'] / maxValue) * 100;
        rows += '<tr><td class="top-backlinks-ref-url-cell">%anchor%</td><td class="no-break-pdf">%backlinks%</td><td class="volume-bar-wrapper min-w-100px"><div><span style="width: %width%"></span></div></td></tr>'.strtr({
            '%anchor%': rowData['anchor'],
            '%backlinks%': numberWithCommas(rowData['backlinks']),
            '%width%': width + '%',
        });
    }

    rows += '</tbody></table></div>';

    $('.field-backlinks-list').show();

    return wrapInButton(rows, wid);
}

function generateBacklinksTopGeographiesCharts(wid, check) {
    if (check.data === undefined || check.data.countries === undefined || check.data.tlds === undefined || check.data.countries.length === 0 || check.data.tlds.length === 0) {
        return false;
    }

    // Top Countries
    const countries = check.data.countries.slice(0, 4);
    const totalCountriesCount = countries.reduce(function (a, b) {
        return a + b.count;
    }, 0);

    const allbacklinks = check.data.allbacklinks;

    if (totalCountriesCount < allbacklinks) {
        countries.push({
            country: 'Other',
            count: allbacklinks - totalCountriesCount,
        });
    }

    const countriesPieData = countries.map(function (item) {
        return {
            data: item.count,
            label: item.country === 'Other' ? item.country : item.country.toUpperCase(),
        };
    });

    let selector = check.name + wid;
    const colors = ['primary', 'success', 'cyan', 'danger', 'gray-400'];

    setTimeout(function () {
        DonutChart.init(wid, selector, wid === websiteId ? 'backlink-top-countries-chart' : 'backlink-top-countries-chart-competitor', countriesPieData, colors, allbacklinks);
    }, 250);

    // Top TLDs
    const tlds = check.data.tlds.slice(0, 4);
    const totalTldsCount = tlds.reduce(function (a, b) {
        return a + b.count;
    }, 0);

    if (totalTldsCount < allbacklinks) {
        tlds.push({
            tld: 'Other',
            count: allbacklinks - totalTldsCount,
        });
    }

    const tldsPieData = tlds.map(function (item) {
        return {
            data: item.count,
            label: item.tld,
        };
    });

    selector = check.name + wid;

    setTimeout(function() {
        DonutChart.init(wid, selector, wid === websiteId ? 'backlink-top-tlds-chart' : 'backlink-top-tlds-chart-competitor', tldsPieData, colors, allbacklinks);
    }, 250);

    let chartsContainer;
    if (wid === websiteId){
        chartsContainer = $('#' + selector).find('.top-geographies-container');
    } else {
        chartsContainer = $('#' + selector).find('.top-geographies-container-competitor');
        chartsContainer.addClass('competitor-charts-container');
    }

    chartsContainer.show();

    return true;
}

function generateAmpTagsInfo(check) {
    if (check === false || check === undefined || check.data === false || check.data === undefined) {
        return '';
    }

    const strTemplate = '<tr><td>%title%</td><td><i class="ki-duotone fs-1 %classes%"><span class="path1"></span><span class="path2"></span></i></td></tr>';

    let rows = '<div class="table-part table-responsive">\n' +
        '           <div class="col-md-6 p-0">\n' +
        '               <table class="table table-row-dashed">\n' +
        '                   <thead>\n' +
        '                       <tr>\n' +
        '                           <th>' + lajax.t('AMP Indicator') + '</th>\n' +
        '                           <th></th>\n' +
        '                       </tr>\n' +
        '                   </thead>\n' +
        '                   <tbody>\n' +
        strTemplate.strtr({
            '%title%': lajax.t('AMP Related Doctype Declaration'),
            '%classes%': check.data.isAmpOpenTag ? 'ki-check text-success' : 'ki-cross text-danger',
        }) +
        strTemplate.strtr({
            '%title%': lajax.t('AMP Runtime'),
            '%classes%': check.data.isAmpScriptTag ? 'ki-check text-success' : 'ki-cross text-danger',
        }) +
        strTemplate.strtr({
            '%title%': lajax.t('AMP CSS Boilerplate'),
            '%classes%': check.data.hasAmpBoilerplate ? 'ki-check text-success' : 'ki-cross text-danger',
        }) +
        strTemplate.strtr({
            '%title%': lajax.t('Embedded Inline Custom CS'),
            '%classes%': check.data.hasAmpCustomStyles ? 'ki-check text-success' : 'ki-cross text-danger',
        });
    if (check.data.customStyleLengthAlert === true) {
        rows += '                       <tr>\n' +
            '                           <td colspan="2" class="text-danger"> * ' + lajax.t('Custom styles size is larger than 70 Kb') + '</td>\n' +
            '                       </tr>\n';
    }

    rows += strTemplate.strtr({
            '%title%': lajax.t('AMP Images'),
            '%classes%': check.data.hasAmpImgTag ? 'ki-check text-success' : 'ki-cross text-danger',
        });
    rows += strTemplate.strtr({
        '%title%': lajax.t('AMP HTML Canonical Link'),
        '%classes%': check.data.hasCanonicalLink ? 'ki-check text-success' : 'ki-cross text-danger',
    });
    rows += '</tbody></table></div></div>'
    return wrapInButton(rows);
}

function nFormatter(num, digits) {
    if (num === null || num === undefined) {
        return 0;
    }

    const si = [
        {value: 1, symbol: ""},
        {value: 1E3, symbol: "K"},
        {value: 1E6, symbol: "M"},
        {value: 1E9, symbol: "G"},
        {value: 1E12, symbol: "T"},
        {value: 1E15, symbol: "P"},
        {value: 1E18, symbol: "E"}
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }

    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

function mbFormatter (value, unit) {
    const multiplier = 100;
    return Math.round(multiplier * value / (1024 * 1024)) / multiplier + unit;
}

function generateBlockStats(wid, check, primaryStats, otherStats, skipEmpty = false) {
    if (check === false || check.data === false || check.data === undefined) {
        return '';
    }

    let html = '<div class="backlink-summary avoid-break-inside "></div>';
    html += '<div class="competitor-sizer">\
        <div class="row backlink-summary-down-stats avoid-break-inside mb-5 row-gap-3 row-gap-xl-5 gx-3 gx-xl-5">';

    for (const i in primaryStats) {
        if (skipEmpty && !check.data[primaryStats[i].data]){
            continue;
        }
        html += '<div class="col-12 col-sm-6 col-md-5 col-xxl-3 col-pdf-3">\
                    <div class="card h-lg-100">\
                        <div class="card-body d-flex justify-content-start align-items-start flex-column py-7 px-9 p-pdf-6">\
                            <div class="m-0">\
                                <i class="ki-duotone ' + primaryStats[i].icon + ' fs-2hx text-gray-600">\
                                    <span class="path1"></span>\
                                    <span class="path2"></span>\
                                    <span class="path3"></span>\
                                    <span class="path4"></span>\
                                    <span class="path5"></span>\
                                    <span class="path6"></span>\
                                    <span class="path7"></span>\
                                </i>\
                            </div>\
                            <div class="d-flex flex-column mt-6 mt-pdf-5">\
                                <span class="fw-semibold fs-2qx fs-pdf-1 text-gray-800 lh-1 ls-n2">' + nFormatter(check.data[primaryStats[i].data], 1) + '</span>\
                                <div class="m-0 mt-2 text-wrap">\
                                    <span class="fw-semibold fs-6 fs-pdf-7 text-gray-500 card-tile-title">' + primaryStats[i].title + '</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
    }

    html += '</div>';

    if (otherStats){
        html += '<div class="row backlink-summary-down-stats avoid-break-inside row-gap-3 row-gap-xl-5 gx-3 gx-xl-5">';
        for (const i in otherStats) {
            if (skipEmpty && !check.data[otherStats[i].data]){
                continue;
            }
            html += '<div class="col-12 col-sm-6 col-md-4 col-xxl-2 col-pdf-2">\
                    <div class="card h-lg-100">\
                        <div class="card-body d-flex justify-content-start align-items-start flex-column py-7 px-9 p-pdf-6 pb-pdf-5">\
                            <div class="m-0 pdf-hidden">' + (otherStats[i].icon2 ? otherStats[i].icon2 : '' ) + '\
                                <i class="ki-duotone ' + otherStats[i].icon + ' fs-2hx text-gray-600">\
                                    <span class="path1"></span>\
                                    <span class="path2"></span>\
                                    <span class="path3"></span>\
                                    <span class="path4"></span>\
                                    <span class="path5"></span>\
                                    <span class="path6"></span>\
                                    <span class="path7"></span>\
                                </i>\
                            </div>\
                            <div class="d-flex flex-column mt-6 mt-pdf-0">\
                                <span class="fw-semibold fs-2qx fs-pdf-1 text-gray-800 lh-1 ls-n2">' + nFormatter(check.data[otherStats[i].data], 1) + '</span>\
                                <div class="m-0 mt-2 text-wrap mt-pdf-1 lh-pdf-1_2">\
                                    <span class="fw-semibold fs-6 fs-pdf-7 text-gray-500 card-tile-title">' + otherStats[i].title + '</span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
        }
        html += '</div>';
    }

    html += '</div>';

    return wrapInButton(html, wid);
}

function generateTechnologiesList(wid, check) {
    if (check === false || check.data.length === 0) {
        return '';
    }

    let l = 0;
    let iconWidth = 8;
    let tableWidth = 66;

    if (isMobileRequest()) {
        tableWidth = 100;
        iconWidth = 12;
    }

    if (isPdfRequest()){
        iconWidth = 6;
    }

    let html = '<div class="avoid-break-before table-part" style="width:' + tableWidth + '%;"><table class="table table-row-dashed table-fixed"><thead><th style="width:' + iconWidth + '%; min-width: 24px;"></th><th>%technology%</th><th style="width:25%;">%version%</th></thead><tbody>'.strtr({
        '%technology%': lajax.t("Technology"),
        '%version%': lajax.t("Version")
    });

    for (const i in check.data) {
        const technology = check.data[i];

        if (divideTables && !isMobileRequest() && (l % 6 == 0) && (l > 0)) {
            html += '</tbody></table></div><div class="table-part" style="width:' + tableWidth + '%;"><table class="table table-row-dashed table-fixed"><tbody>';
        }

        html += '<tr><td class="text-left" style="width:' + iconWidth + '%;">';

        let iconProperty = 'icon';
        if (isPdfRequest()){
            iconProperty = 'icon_pdf';
        }

        if (technology[iconProperty] !== false) {
            if (isPdfRequest()) {
                html += '<i><img class="technologies-img" src="%icon%" onerror="this.style.display=\'none\'"></i>'.strtr({
                    '%icon%': technology[iconProperty]
                });
            } else {
                html += '<a href="%website%" target="_blank"><img class="technologies-img" src="%icon%" onerror="this.style.display=\'none\'"></a>'.strtr({
                    '%website%': technology.website,
                    '%icon%': technology[iconProperty]
                });
            }
        }

        html += '</td><td style="vertical-align: middle;">%name%</td><td style="vertical-align: middle; width:25%;" class="text-center;">%version%</td></tr>'.strtr({
            '%name%': technology.name,
            '%version%': technology.version
        });

        l++;
    }

    html += '</tbody></table></div>';

    return wrapInButton(html, wid);
}

function generateResourceList(check, wid = websiteId) {
    if (check === false || check.data.total === undefined) {
        return '';
    }

    const resourceList = [{
            class : 'ps-total-resources-image',
            value : Number(check.data.total),
            title : lajax.t("Total Objects"),
        },
        {
            class: 'ps-html-size-image',
            value: Number(check.data.html),
            title: lajax.t("Number of HTML Pages"),
        },
        {
            class: 'ps-js-resources-image',
            value: Number(check.data.js),
            title: lajax.t("Number of JS Resources"),
        },
        {
            class: 'ps-css-resources-image',
            value: Number(check.data.css),
            title: lajax.t("Number of CSS Resources"),
        },
        {
            class: 'ps-image-size-image',
            value: Number(check.data.images),
            title: lajax.t("Number of Images"),
        },
        {
            class: 'ps-static-resources-image',
            value: Number(check.data.other),
            title: lajax.t("Other Resources"),
        },
    ]

    const html = '<div class="resources-breakdown mt-8 mb-1">' + resourceList.reduce((accumHtml, item) => accumHtml +
        '<div class="activity-item" align="center">\
              <div class="item-image %class%"></div>\
              <div class="item-content">\
                  <p class="value-item">%value%</p>\
                  <p class="title-item mb-0">%title%</p>\
            </div>\
        </div>'.strtr({'%class%': item.class, '%value%': item.value, '%title%': item.title}), '') + '</div>';

    return wrapInButton(html, wid);
}

function generateInsightsTable(check, type, index) {
    let i;
    if ((check === false) || (check.data.length === 0)) {
        return '';
    }

    if (check.data['insights'].length === 0) {
        return '';
    }

    generatePageInsightsScoreResult(type, check.data['score'], index);

    const colors = [
        'var(--bs-success)', // green
        'var(--bs-orange)', // red
        'var(--bs-danger)', // red
    ];
    let html = '<div class="col-md-6 col-sm-12"><table class="table table-row-dashed table-fluid"><thead><tr><th>' + lajax.t('Lab Data') + '</th><th>' + lajax.t('Value') + '</th></tr></thead><tbody>';

    for (i in check.data['insights']) {
        let labDataValue = check.data['insights'][i]['value'];
        const score = parseFloat(check.data['insights'][i]['score']);
        const colorId = (score >= 0.9) ? 0 : (score >= 0.5) ? 1 : 2;

        if (check.data['insights'][i]['postfix']){
            labDataValue = labDataValue + ' ' + check.data['insights'][i]['postfix'];
        }

        html += '<tr><td>' + lajax.t(check.data['insights'][i]['name']) + '</td><td style="color:' + colors[colorId] + ';-webkit-text-fill-color:' + colors[colorId] + '">' + labDataValue + '</td></tr>'
    }

    html += '</tbody></table></div>';

    $('#' + type + 'PageInsightsTable' + index).show();

    html += '<div class="col-md-6 col-sm-12"><table class="table table-row-dashed table-fluid"><thead><tr><th>' + lajax.t('Opportunities') + '</th><th class="w-pdf-80px mw-pdf-80px">' + lajax.t('Estimated Savings') + '</th></tr></thead><tbody>';

    for (i in check.data['opportunities']) {
        const score = parseFloat(check.data['opportunities'][i]['score']);
        const colorId = (score >= 0.9) ? 0 : (score >= 0.5) ? 1 : 2;

        html += '<tr><td>' + lajax.t(check.data['opportunities'][i]['name']) + '</td ><td style="color:' + colors[colorId] + ';-webkit-text-fill-color:' + colors[colorId] + '">' + check.data['opportunities'][i]['value'] + ' s</td></tr>';
    }

    html += '</tbody></table></div>';
    $('#desktopPageInsights'+index +' .website1').first().hide();
    $('#desktopPageInsights'+index +' .website1').last().hide();
    return html;
}

function backlinkSummaryScore(currentWid, title, type, value) {
    const $field = $('#backlinks' + currentWid + ' .field-details').find('.backlink-summary').eq(0);
    const defaultSize = isPdfRequest() ? 150 : 128;
    const size = currentWid === websiteId ? defaultSize : Math.round(defaultSize * 0.82);
    const className = 'backlink-' + type + '-score-' + currentWid;
    const colors = [
        'success', // green
        'warning', // orange
        'danger', // red
    ];

    let colorKey = 0;
    if (value <= 24) {
        colorKey = 2;
    } else if (value >= 25 && value <= 49) {
        colorKey = 1;
    }

    const colorId = colors[colorKey];

    const item = $('<div class="backlink-summary-score-item d-inline-block" style="width:' + size + 'px">\
            <div style="width: ' + size + 'px" class="text-center ' + className + '" data-width="' + size + '" data-height="' + size + '" data-fgColor="' + colorId +  '" data-font-size="20px"></div>\
            <p class="score_name" style="width:' + size + 'px">' + title + '</p>\
        </div>');

    $field.attr('align', 'center').addClass('backlink-summary-score d-inline-block').append(item);

    const $element = $field.find('.' + className);

    $element
        .attr('data-label', value)
        .attr('data-value', value)
        .attr('data-color', colorId)
        .css('visibility', 'visible')
        .css('color', colorId)
        .css('-webkit-text-fill-color', colorId);

    setTimeout(function() {
        ScoreCharts.init($element);
    }, 150);
}

function generateBacklinkSummary(currentWid, backlinks) {
    if (backlinks === false || backlinks.data === false || backlinks.data === undefined) {
        return '';
    }

    const domainStrength = (backlinks.data.domain_authority !== null && backlinks.data.domain_authority !== undefined) ? backlinks.data.domain_authority : backlinks.data.mozda;
    const pageAuthority = backlinks.data.page_strength;

    backlinkSummaryScore(currentWid, lajax.t('Domain Strength').replace(' ', '<br/>'), 'domain', domainStrength);
    backlinkSummaryScore(currentWid, lajax.t('Page Strength').replace(' ', '<br/>'), 'page', pageAuthority);
}

function generatePageInsightsScoreResult(type, totalScore, index) {
    const colors = [
        'success', // green
        'warning', // orange
        'danger', // red
    ];

    if (totalScore === undefined) {
        totalScore = 0;
    }

    const colorId = colors[(totalScore >= 90) ? 0 : (totalScore >= 50) ? 1 : 2];
    const $scoreGraph = $('#' + type + 'PageInsights' + index + '  .graph-container');

    const size = index === websiteId ? KTUtil.getCssVariableValue('--pagespeed-chart-size') : KTUtil.getCssVariableValue('--pagespeed-chart-competitor-size');
    const className = type + '-insight-score-' + index;
    const $element = $('<div class="text-center ' + className + '" data-width="' + size + '" data-height="' + size + '" data-fgColor="' + colorId + (index === websiteId ? '' : '" data-font-size="20px') + '"></div>');

    $scoreGraph.attr('align', 'center').append($element);
    $element
         .attr('data-label', totalScore)
         .attr('data-value', totalScore)
         .attr('data-color', colorId)
         .css('visibility', 'visible')
         .css('color', colorId)
         .css('-webkit-text-fill-color', colorId);

    $scoreGraph.show();

    setTimeout(function() {
        ScoreCharts.init($element);
        //setTimeout(function() {
            //$element.find('svg').removeAttr('width');
            //$element.find('svg').removeAttr('viewBox');
            //$element.find('svg').removeAttr('transform');
            //$element.find('svg').css('width', '100%');
        //}, 150);
    }, 150*2);

}

function percentage(num, per) {
    return (num / 100) * per;
}

function generateJavascriptErrorsList(check) {
    if ((check === false) || (check.data.length === 0)) {
        return '';
    }

    let html = '<div class="table-responsive table-part"><table class="table table-row-dashed table-fluid"><tbody>';
    html += '<thead><tr><th>' + lajax.t('Error Output') + '</th></tr></thead>';
    for (const i in check.data) {
        const text = check.data[i].text;
        html += '<tr><td>%text%</td></tr>'.strtr({
            '%text%': text,
        });
    }

    html += '</tbody></table></div>';
    return wrapInButton(html);
}

function generateOptimisedImages(check) {
    if (check === false || check.data.length == 0) {
        return '';
    }

    let html = '';
    html += '\
            <div class="table-responsive table-part">\
                <table class="table table-row-dashed table-fluid table-wrapped">\
                <thead><tr>\
                    <th>' + lajax.t("Image") + '</th>\
                    <th style="width:14%;">' + lajax.t("Save Size") + '</th>\
                    <th style="width:14%;">' + lajax.t("Save Percentage") + '</th>\
                </tr></thead>\
                <tbody>';

    let i = 0;

    for (const l in check.data) {
        const link = check.data[l];

        if (divideTables && !isMobileRequest() && (i % 6 == 0) && (i > 0)) {
            html += '</tbody></table></div><div class="table-responsive table-part"><table class="table table-row-dashed table-fluid"><tbody>';
        }

        html += '<tr><td style="word-break: break-all;">' + link[0] + '</td><td style="width:14%;">' + link[1] + '</td><td style="width:14%;">' + link[2] + '</td></tr>';

        i++;
    }

    html += '</tbody></table></div>';

    return wrapInButton(html);
}

function generateFlashList(check) {
    if (check === false || check.data === null || check.data.length == 0) {
        return '';
    }

    let html = '';
    html += '\
        <div class="table-responsive table-part">\
            <table class="table table-row-dashed table-fluid">\
            <thead>\
                <tr><th>' + lajax.t("HTML Block") + '</th></tr>\
            </thead>\
            <tbody>';

    for (const l in check.data) {
        html += '<tr><td style="word-break: break-all;">' + check.data[l].html + '</td></tr>';
    }

    html += '</tbody></table></div>';

    return wrapInButton(html);
}

function generateTapTargetSizing(check) {
    if (check === false || check.data.length == 0) {
        return '';
    }

    let html = '';
    html += '\
        <div class="table-responsive table-part">\
            <table class="table table-row-dashed table-fluid">\
            <thead>\
                <tr><th>' + lajax.t("Element&nbsp;Label") + '</th><th>' + lajax.t("CSS Selector") + '</th><th>' + lajax.t("HTML Block") + '</th></tr>\
            </thead>\
            <tbody>';

    for (const l in check.data) {
        const link = check.data[l];
        html += '<tr><td style="">' + link[0] + '</td><td style="word-break: break-all;">' + link[1] + '</td><td style="word-break: break-all;">' + link[2] + '</td></tr>';
    }

    html += '</tbody></table></div>';

    return wrapInButton(html);
}

function generateLegibleFontsizes(check) {
    if (check === false || check.data.length == 0) {
        return '';
    }

    let html = '';
    html += '\
        <div class="table-responsive avoid-break-inside">\
            <table class="table table-row-dashed table-fluid">\
            <thead>\
                <tr><th>' + lajax.t("Font Size") + '</th><th>' + lajax.t("Text Block") + '</th><th>' + lajax.t("Style Location") + '</th></tr>\
            </thead>\
            <tbody>';

    for (const l in check.data) {
        const link = check.data[l];
        html += '<tr><td style="word-break: break-all;">' + link[0] + '</td><td style="word-break: break-all;">' + link[1] + '</td><td style="word-break: break-all;">' + link[2] + '</td></tr>';
    }

    html += '</tbody></table></div>';

    return wrapInButton(html);
}

function generateCoreWebVitalsCharts(currentWid, check, mainSelector) {
    let chartData;
    if (check === false) {
        return false;
    }

    if (check.data.length === 0) {
        return false;
    }

    let chartsContainer = $(mainSelector).find('.charts-container');
    chartsContainer.show();
    chartsContainer[0].outerHTML = wrapInButton(chartsContainer[0].outerHTML, currentWid);
    chartsContainer = $(mainSelector).find('.charts-container'); // refresh
    if (currentWid !== websiteId){
        chartsContainer.addClass('competitor-charts-container');
    }

    let canvasContainer = chartsContainer.find('#graph-largest-contentful-paint').attr('id', 'graph-largest-contentful-paint-' + currentWid);
    const width = (currentWid === websiteId) ? 330 : 300;

    if (!Array.isArray(check.data['largest-contentful-paint'])){
        chartData = check.data['largest-contentful-paint'];
        drawMeterChart(canvasContainer, chartData['min'], chartData['max'], chartData['value'], chartData['ranges'], chartData['unit'], chartData['precision'], chartData['precision'], currentWid, width, 1);
    } else {
        canvasContainer.closest('.js-web-vitals-details').remove();
    }

    canvasContainer = chartsContainer.find('#graph-interaction-to-next-paint').attr('id', 'graph-interaction-to-next-paint-' + currentWid);
    if (!Array.isArray(check.data['interaction-to-next-paint'])) {
        chartData = check.data['interaction-to-next-paint'];
        drawMeterChart(canvasContainer, chartData['min'], chartData['max'], chartData['value'], chartData['ranges'], chartData['unit'], chartData['precision'], chartData['precision'], currentWid, width, 0);
    } else {
        canvasContainer.closest('.js-web-vitals-details').remove();
    }

    canvasContainer = chartsContainer.find('#graph-cumulative-layout-shift').attr('id', 'graph-cumulative-layout-shift-' + currentWid);
    if (!Array.isArray(check.data['cumulative-layout-shift'])){
        chartData = check.data['cumulative-layout-shift'];
        drawMeterChart(canvasContainer, chartData['min'], chartData['max'], chartData['value'], chartData['ranges'], ' ', chartData['precision'], chartData['precision'], currentWid, width, 2);
    } else {
        canvasContainer.closest('.js-web-vitals-details').remove();
    }

    return true;
}

function drawMeterChart(element, min, max, value, ranges, unit, scaleDecimals, valueDecimals, wid, width, decimal) {
    element.attr('width', width);
    element.css({
        'width' : width + 'px'
    });
    element.attr('height', parseInt(width * 0.624));

    const labels = [
            [' ', 0],
            [ranges[1][0], ranges[1][0]],
            [ranges[1][1], ranges[1][1]],
            [' ', max],
        ];
    MeterGraphs.add(element.attr('id'), wid, width, labels, value, max, unit, decimal);
}

function generateSpeedCharts(wid, check) {
    if (check !== false) {
        const selector = 'serverResponseTime' + wid;
        const width = wid === websiteId ? 330 : 300;

        $('#' + selector + ' .speed-first-byte').attr('width', width)
            .attr('height', parseInt(width * 0.624))
            .attr('id', selector + 'speed-first-byte')
            .css({'width' : width + 'px'});
        $('#' + selector + ' .speed-on-load').attr('width', width)
            .attr('height', parseInt(width * 0.624))
            .attr('id', selector + 'speed-on-load')
            .css({'width' : width + 'px'});
        $('#' + selector + ' .speed-last-byte').attr('width', width)
            .attr('height', parseInt(width * 0.624))
            .attr('id', selector + 'speed-last-byte')
            .css({'width' : width + 'px'});

        let labels = [
            [' ', 0, '#999999'],
            ['0.5s', 0.5, '#999999'],
            ['1s', 1, '#999999'],
            [' ', 3, '#999999'],
        ];
        MeterGraphs.add(selector + 'speed-first-byte', wid, width, labels, Math.round(check.data.responseTime / 1) / 1000, 3, 's', 3)

        labels = [
            [' ', 0],
            ['5s', 5],
            ['10s', 10],
            [' ', 20]
        ];
        MeterGraphs.add(selector + 'speed-on-load', wid, width, labels, Math.round(check.data.loadTime / 100) / 10, 20, 's')

        labels = [
            [' ', 0],
            ['10s', 10],
            ['15s', 15],
            [' ', 20]
        ];
        MeterGraphs.add(selector + 'speed-last-byte', wid, width, labels, Math.round(check.data.completeTime / 100) / 10, 20, 's')
    }
}

// Download Page Size
function generateSizeCharts(wid, check) {
    if (check === false) {
        return false;
    }

    const selector = check.name + wid;
    const width = (wid === websiteId) ? 370 : 330;

    $('#'+selector + ' .total-page-size').attr('width', width)
        .attr('height', parseInt(width * 0.624))
        .attr('id', selector + 'total-page-size')
        .css({'width' : width + 'px'});

    $('#'+selector + ' .page-size-breakdown').attr('width', width)
        .attr('height', parseInt(width * 0.737))
        .attr('id', selector + 'page-size-breakdown');

    // 'Download Page Size'
    const labels = [
        [' ', 0],
        ['', 3], // instead '3MB' - fix the numbers run into each other
        ['5MB', 5],
        [' ', 20],
    ];
    MeterGraphs.add(selector + 'total-page-size', wid, width, labels, Math.round(100 * check.data.total / (1024 * 1024)) / 100, 20, 'MB', 2)

    // 'Download Page Size Breakdown'
    const colors = ['danger', 'cyan', 'success', 'primary', 'gray-400'];

    const sizeDonutData = [
        {
            data: check.data.html,
            label: 'HTML',
        },
        {
            data: check.data.css,
            label: 'CSS',
        },
        {
            data: check.data.js,
            label: 'JS',
        },
        {
            data: check.data.image,
            label: lajax.t('Images'),
        },
        {
            data: check.data.other,
            label: lajax.t('Other'),
        },
    ]
    setTimeout(function() {
        DonutChart.init(wid, selector, 'page-size-breakdown', sizeDonutData, colors, check.data.total, 'MB');
    }, 250);

    return true;
}

function roundRect(ctx, x, y, width, height) {
    const radius = height / 2;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, -Math.PI/2, Math.PI/2, false);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y+radius, radius, Math.PI/2, 3*Math.PI/2, false);
    ctx.closePath();
    ctx.fill();
}

function generateTransferSizeChartsContainer(wid, check) {
    const html = '<div class="row mb-4 avoid-break-inside ' + (wid === websiteId  ? '' : 'competitor-charts-container') + '">\
            <div class="col-12 col-xl-6">\
                <div class="avoid-break-inside text-center d-flex flex-wrap flex-center">\
                    <div class="fs-2 fs-pdf-4 my-5 text-center w-100">' + lajax.t('Compression Rate') + '</div>\
                     <div class="position-relative canvas-label">\
                        <div class="position-absolute translate-middle start-50 top-50 d-flex flex-column flex-center">\
                            <span class="fw-bolder text-gray-700"></span>\
                        </div>\
                        <canvas class="compression-page-size' + (wid === websiteId ? ' mt-n15': '') + '" width="100" height="281"></canvas>\
                    </div>\
                </div>\
            </div>\
            <div class="' + (wid === websiteId ? 'col-11' : 'col-12') + ' col-sm-10 offset-sm-1 col-xl-6 offset-xl-0">\
                <div class="avoid-break-inside d-flex flex-column compression-rates">\
                    <div class="fs-2 fs-pdf-4 my-5 text-center">' + lajax.t('Compression Rates') + '</div>\
                    <div class="compression-percentage2" width="100" height="250"></div>\
                </div>\
            </div>\
        </div>';

    return wrapInButton(html, wid);
}

// Website Compression (Gzip, Deflate, Brotli)
function generateTransferSizeCharts(wid, check) {
    if (check === false) {
        return false;
    }

    const selector = check.name + wid;
    const width = wid === websiteId ? 370 : 330;
    $('#'+selector + ' .compression-page-size').attr('width', width)
        .attr('height', parseInt(width * 0.624))
        .attr('id', selector + 'compression-page-size')

    // 'Compression Page Size'
    const ranges = [
        ['', 0],
        ['66%', 33],
        ['33%', 66], // instead '33%' - fix the numbers run into each other
        ['', 100],
    ];
    MeterGraphs.add(selector + 'compression-page-size', wid, width, ranges, Math.round(check.data.rate.total), 100, '%');

    const labels = {
        "html": 'HTML',
        "css": 'CSS',
        "js": 'JS',
        "image": lajax.t('Images'),
        "other": lajax.t('Other'),
        "total": lajax.t('Total')
    };
    const colors = ['danger', 'cyan', 'success', 'primary', 'gray-400', 'info'];


    // use uncompressed for Compression Rates
    $.each(labels, function (index) {
        if (check.data.rate[index] !== 0) {
            check.data[index] = check.data[index] * 100 / check.data.rate[index];
        }
    });

    check.data.total = check.data.html + check.data.css + check.data.js + check.data.image + check.data.other;

    let i = 0;
    const elem =  $('#' + selector + ' .compression-percentage2');

    $.each(labels, function (index) {
        if (check.data[index] !== 0) {
            const progress = check.data.rate[index];
            elem.append('<div class="d-flex flex-stack flex-wrap flex-sm-nowrap ' + (wid === websiteId ? 'fs-7' : 'fs-8') + '">                 \n' +
                '                <div class="d-flex align-items-center me-3">\n' +
                '                    <div class="min-w-65px">\n' +
                '                        <span class="' + (index === 'total' ? 'text-gray-700 fw-bolder' : 'text-gray-500 fw-semibold') + ' d-block ' + (wid === websiteId ? 'fs-7' : 'fs-8') + '">' + this + '</span>\n' +
                '                    </div>                   \n' +
                '                </div>                   \n' +
                '                <div class="d-flex align-items-center flex-grow-1 pe-0 pe-xxl-2">  \n' +
                '                    <div class="progress ' + (wid === websiteId ? 'h-10px' : 'h-8px') + ' w-100 me-2' + ((index !== 'other') ? (' bg-light-' + colors[i] + '">\n') : ('" style="background-color: rgba(var(--bs-gray-400-rgb), 0.2);">'))  + // make pseudo light color for gray-400 (other)
                '                        <div class="progress-bar bg-' + colors[i] + '" role="progressbar" style="width: ' + progress + '%" aria-valuenow="' + progress + '" aria-valuemin="0" aria-valuemax="100"></div>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '                <div class="' + (index === 'total' ? 'text-gray-700 fw-bolder' : 'text-gray-500 fw-semibold') + ' ' + (wid === websiteId ? 'fs-7 fs-pdf-8' : 'fs-8 fs-pdf-9') + ' text-end text-sm-left w-100 w-sm-unset me-2 me-sm-0 text-nowrap ' + (wid === websiteId ? 'min-w-180px min-w-lg-200px min-w-pdf-250px' : 'min-w-150px min-w-lg-175px min-w-pdf-220px') + '">\n' +
                '                    <span class="text-gray-700 fw-bolder">' + (100 - progress) + '% '+ '</span>\n' +
                '                    ' + lajax.t('compressed of') + ' ' + (Math.round(100 * check.data[index] / (1024 * 1024)) / 100).toFixed(2) + 'MB' +
                '                </div>\n' +
                '            </div>');
            if (index !== 'total') {
                elem.append('<div class="separator separator-dashed my-2 my-sm-3"></div>');
            }
        }
        i++;
    });

    elem.wrapInner('<div class="d-flex mw-450px flex-column mx-auto"></div>');

    return true;
}

function generateTagsTable(check) {
    if (check === false || check.data.length == 0) {
        return '';
    }
    let html = '\
        <div class="table-responsive table-part"><table class="table table-row-dashed table-fluid">\
            <thead>\
                <th class="min-w-sm-150px">' + lajax.t("Tag") + '</th>\
                <th>' + lajax.t("Content") + '</th>\
            </thead>\
            <tbody>';

    for (const name in check.data) {
        const content = check.data[name];
        html += '<tr><td>' + name + '</td><td>' + content + '</td></tr>';
    }
    html += '</tbody></table></div>';

    return wrapInButton(html);
}

function generateFacebookPixels(check) {
    if (check === false || check.data.length == 0 || check.data === false) {
        return '';
    }
    let html = '\
        <br /><table class="table table-row-dashed table-fluid mb-0 mt-3" style="width:50%;">\
            <thead><tr>\
                <th>' + lajax.t("Pixel ID") + '</th>\
            </tr></thead>\
            <tbody>';
    for (const l in check.data) {
        html += '\
            <tr>\
                <td>' + check.data[l] + '</td>\
            </tr>';
    }
    html += '</tbody></table>';

    return html;
}

function highlightTarget() {
    if (targetKeyword === '') {
        return;
    }
    $('.highlight-target').each(function () {
        const text = $(this).text().replace(targetKeywordRegexp, '<span class="highlighted-keyword">$1</span>');
        $(this).html(text).removeClass('highlight-target');
    });
    // highlight with no spaces
    const reg = new RegExp('(' + escapeRegExp(targetKeyword.replace(' ', '')) + ')', 'gi');
    $('.highlight-target2').each(function () {
        const text = $(this).text().replace(reg, '<span class="highlighted-keyword">$1</span>');
        $(this).html(text).removeClass('highlight-target2');
    });
}

function removeCompletedRequestFromProgress(key) {
    // Progress is tracked per (website, check): with competitors the same check name runs
    // once per website, so keying by name alone made every website after the first collide
    // on one key -> only the first completion counted, and the bar hung short of 100%.
    //const key = wid + '::' + requestName;
    let toIncrementCounter = true;
    if (currentProgressActions[key] === undefined){
        // already deleted
        toIncrementCounter = false;
    }
    delete currentProgressActions[key];
    const currentProgressActionsKeys = Object.keys(currentProgressActions);
    currentProgressAction = currentProgressActions[currentProgressActionsKeys[Math.floor(Math.random()*currentProgressActionsKeys.length)]];
    updateProgressBar(toIncrementCounter);
}

// checkUrls generates in ReportAsset
function getChecksResult(wid, requestName, callback, syncCallback = null, failCallback = null, postData = null) {
    // endpoint not registered for this report view - skip without hanging the progress bar
    if (checkUrls[requestName] === undefined) {
        updateProgressBar();
        return;
    }
    if (undefined === checkUrls[requestName].message){
        currentProgressAction = checkUrls['other'].message;
    } else {
        currentProgressAction = checkUrls[requestName].message;
    }

    currentProgressActions[requestName + wid] = currentProgressAction;

    // if (undefined === progressActions[checkUrl]) currentProgressAction = progressActions['other'];
    // else currentProgressAction = progressActions[checkUrl];
    // currentProgressActions[checkUrl] = currentProgressAction;
    let templateId = 0;
    if (window.template !== undefined){
        templateId = window.template;
    }

    let animSpeed = 400;
    // container width calculation fix
    if (isPdfRequest()){
        animSpeed = 0;
    }

    let data = {
        'type_audit': typeAudit,
        'wid': wid,
        'template': templateId,
        'keyword': targetKeyword,
        '_csrf': csrfToken + csrfFunction(wid.toString())
    }

    if (typeof gmb_main !== 'undefined') {
        // Each business must look up ITS OWN listing. websiteIds is ordered [primary, competitor1,
        // competitor2] and aligns with gmb_main / gmb_competitor1 / gmb_competitor2. Without the
        // per-wid mapping every competitor column reused the primary's GBP and showed the primary
        // business in all the listing checks (GBP/Bing/Apple/Yellow Pages).
        data.gbp = gmb_main;
        if (wid !== websiteId && typeof websiteIds !== 'undefined') {
            if (wid === websiteIds[1] && typeof gmb_competitor1 !== 'undefined') {
                data.gbp = gmb_competitor1;
            } else if (wid === websiteIds[2] && typeof gmb_competitor2 !== 'undefined') {
                data.gbp = gmb_competitor2;
            }
        }
    }

    if (postData !== null) {
        data = postData;
    }

    $.post({
        'url': checkUrls[requestName].url,
        'data': data,
        'headers': {
            'userId': userId
        },
        'success': function (response) {
            // remove completed request action and update progressbar
            removeCompletedRequestFromProgress(requestName + wid);

            // parse each check
            $.each(response.results, function (i, check) {
                // skip empty check
                if ((check === false) || (check.passed === undefined) || (check.append === 'waiting')) {
                    return;
                }
                // Is the check included in the audit type?
                if (check.types_audit !== undefined && Array.isArray(check.types_audit)) {
                    if (check.types_audit.indexOf(typeAudit) === -1) {
                        return;
                    }
                }

                let icon = 'bi bi-info';
                if (check.passed === true) {
                    icon = 'text-success ki-check';
                } else if (check.passed === false) {
                    icon = 'ki-cross text-danger';
                }
                icon += (wid === websiteId) ? ' mt-n4' : '';

                const $checkContainer = $("#" + check.name + wid); // <div class='faq-box' id='topKeywordRankings79459'>
                const $checkPanel = $checkContainer.closest('.portlet');
                //show result and parent section like 'Rankings'
                const $sectionContainer = $checkContainer
                    .find(".field-value")
                    .html(check.answer)
                    .closest('.faq-box')
                    .fadeIn(animSpeed)
                    .closest('.container-check');

                const isSectionOpened = $sectionContainer.is(':visible');

                if (wid === websiteId){
                    $sectionContainer.show(animSpeed, function(){
                        if (syncCallback) {
                            syncCallback(i, check, wid);
                        }
                    });
                } else {
                    $sectionContainer.show();

                    if (syncCallback) {
                        syncCallback(i, check, wid);
                    }

                    if (!isSectionOpened){
                        $sectionContainer.hide();
                    }
                }

                if ((check.append2 !== undefined) && (check.append2 != '')) {
                    $checkContainer.find(".field-value").append('<div class="append2">' + check.append2 + '</div>');
                }

                $checkContainer.find(".bg-icon i").addClass(icon);

                // show check info
                if (wid === websiteId){
                    showCheckInfo(check, $checkContainer);
                } else {
                    // update competitor total score
                    updateScore('website' + wid, check);
                    return;
                }

                $checkPanel.show(); //subsection
                $checkContainer.closest('.check-group').fadeIn(animSpeed);
                const $headerPlace = $checkPanel.find('.js-header-place:visible:first');

                if (isPdfRequest() && ($headerPlace.length !== 0)){
                    // wkhtmltopdf/chrome page breaking header hack
                    // replace heading into avoid-breaking container if exists
                    $checkPanel.find('.js-header-container').addClass('card-header-inside').insertAfter($headerPlace);
                }
                displayRecommendation(check, wid);
                if (typeof scoreGrades !== 'undefined') {
                    // Bing/Apple/Yellow Pages each load + render as their own section, but their scores
                    // aggregate into a single "Other Listings" dial (the repurposed 'listings' dial).
                    const otherListingsSections = ['binglocalseo', 'applelocalseo', 'yelplocalseo', 'yellowpageslocalseo'];
                    let scoreSection = otherListingsSections.indexOf(check.section) !== -1 ? 'listings' : check.section;
                    // GEO audit only: the LLM content-analysis checks (section 'geo' in config, so they
                    // stay part of the GEO section in the SEO audit) are pulled into their own
                    // "GEO Content Analysis" dial/section here. SEO audit is untouched.
                    const geoContentAnalysisChecks = ['identitySchema', 'geoEntityDefinition', 'geoContactTransparency', 'geoAnswerAlignment', 'geoCitationReadiness', 'geoContentStructure', 'geoContentFreshness', 'geoAuthorityTrust', 'geoContentAnalysis'];
                    // GEO audit: robots/sitemap/noindex are section 'seo' in config but render in and
                    // score into the GEO Accessibility (geo) dial here. SEO audit keeps them in SEO.
                    const geoAccessibilityChecks = ['hasRobotsTxt', 'hasSitemap', 'hasNoindexTags', 'hasNoindexHeaders'];
                    if (typeAudit === 'geo') {
                        if (geoContentAnalysisChecks.indexOf(check.name) !== -1) {
                            scoreSection = 'geo-content-analysis';
                        } else if (geoAccessibilityChecks.indexOf(check.name) !== -1) {
                            scoreSection = 'geo';
                        }
                    }
                    updateScore(scoreSection, check);
                    updateScore('website', check);
                    // make gbp(localseo) section not only based on its completeness, but also based on review scores
                    if(check.section === 'reviews' && typeAudit === 'local-seo') {
                        updateAnotherScore(check);
                    }
                }
            });

            // user's functions
            if (callback !== undefined) {
                callback(response.results, wid);
            }
        }
    }).fail(function(response) {
        if (failCallback) {
            failCallback(wid);
        }
        removeCompletedRequestFromProgress(requestName + wid);
        // do nothing on fail and skip user's callback
        //updateProgressBar();
        // other HTML related checks
        //if (requestName == "html") {
        //    updateProgressBar();
        //    updateProgressBar();
        //    updateProgressBar();
        //}
        if ((response.responseJSON != undefined) && (response.responseJSON.status === 404)) {
            $('.js-ajax-alert')
                .removeClass('d-none')
                .find('.alert-message')
                .html(response.responseJSON.message);
        }
        // Show error on fatal error
        if (response.status === 500) {
            $('.js-ajax-alert')
                .removeClass('d-none')
                .find('.alert-message')
                .html(lajax.t('There has been an error running this report. Please contact support or try again later.'));
        }
        return false;
    });
}

function showCheckInfo(check, $container) {
    let showExpand = false;
    const $checkInfo = $container.find('.check-info');

    if (check['what'] !== undefined && (check['what'] != '')) {
        $checkInfo.append('<p class="what">' + check['what'] + '</p>');
        showExpand = true;
    }

    if (check['how'] !== undefined && (check['how'] != '')) {
        $checkInfo.append('<p class="how">' + check['how'] + '</p>');
        showExpand = true;
    }

    if (check['more-info'] !== undefined && (check['more-info'] != '')) {
        if (!isAgency){
            $checkInfo.append('<p class="more-info"><a href="' + check['more-info'] + '" target="_blank">' + lajax.t('Learn more in our guide') + '</a></p>');
            showExpand = true;
        }
    }

    if (showExpand) {
        $container.addClass('expandable');
    }

    return true;
}

function updateProgressBar(incCounter = true) {
    if (incCounter){
        requestsCompleted++;
    }

    progress = Math.round(95 * (requestsCompleted / requestsTotal) + 5);
    if (progress > progressPercentsDone) {
        progressPercentsDone = progress;
    }
    progressPercentsDone = Math.min(progressPercentsDone, 99);
    if (currentProgressAction === undefined) {
        currentProgressAction = lajax.t('Finalizing Results');
    }

    if (requestsCompleted >= requestsTotal) {
        $(window).trigger('resize');
        $('.progress-bar-container .progress-bar').css('width', '100%');
        $('.progress-fill').html(lajax.t('Finalizing Results') + " - 100" + lajax.t("% Complete"));
        setTimeout(function () {
            $('#progress-bar-loading').animate({
                opacity: '0'
            }, 'slow', function(bar){
                $('#progress-bar-loading').hide();
                setTimeout(function() {
                    const foo = document.createElement('div');
                    foo.id = 'pdfready';
                    document.body.appendChild(foo);
                }, 2500);
            });
        }, 2000);
    }
}

function displayRecommendation(check, wid) {

    if ((check.recommendation === null) || (check.recommendation === undefined) || (check.recommendation === '')) {
        return false;
    }

    const container = $("#recommendations");
    let priority = '<span class="badge py-2 px-3 fs-7 badge-light-danger fs-pdf-7">' + lajax.t("High Priority") + '</span>';
    const item = $(".recommendation-item-template", container).clone().removeClass("recommendation-item-template").addClass("recommendation-item");

    if (check.maxScore - check.score <= 2) {
        priority = '<span class="badge py-2 px-3 fs-7 badge-light-success fs-pdf-7">'+lajax.t("Low Priority")+'</span>';
    } else if (check.maxScore - check.score <= 5) {
        priority = '<span class="badge py-2 px-3 fs-7 badge-light-warning fs-pdf-7">'+lajax.t("Medium Priority")+'</span>';
    }

    // add new recommendation
    item.data("pass", Number(check.passed));
    item.data("maxscore", check.maxScore);
    item.data("score", check.score);
    item.data("category", getSectionName(check.section));
    item.data("sortScore", check.maxScore - check.score);

    $(".recommendation-category", item).text(getSectionName(check.section));
    $("a", item).attr('href', '#' + check.name + wid);
    $(".recommendation-title", item).text(check.recommendation);
    $(".recommendation-priority", item).html(priority);
    // @todo probably outdated
    $(".recommendation-what", item).text(check.what);
    $(".recommendation-why", item).text(check.why);
    $(".recommendation-how", item).text(check.how);
    item.attr('data-sort-score', item.data("sortScore"));
    container.append(item);

    //sort recommendations by priority
    container
        .children(".recommendation-item")
        .sort(function (a, b) {
            return $(a).data("sortScore") > $(b).data("sortScore") ? -1 : 1;
        })
        .appendTo(container);

    if (isPdfRequest()) {
        const children = container.children(".recommendation-item");
        if (children.length > 1) {
            children
                .removeClass('avoid-break-before').first()
                .addClass('avoid-break-before');
        }
    }

    $(".recommendation-item.row-hidden", container).fadeIn().removeClass("row-hidden");

    const recommendationCount = $("#recommendations .recommendation-item").length;

    if (recommendationCount > 0) {
        $('.recommendation-btn-block').show();
        $('#recommendation_count').html(recommendationCount);
        $('.tab-recommendations').show();
        return true;
    }

    $('.recommendation-btn-block').hide();
    return false;
}

function getSectionName(section) {
    // Bing/Apple/Yellow Pages keep their own sections, but in the recommendations table they are
    // grouped under a single "Other Listings" category.
    if (['binglocalseo', 'applelocalseo', 'yelplocalseo', 'yellowpageslocalseo'].indexOf(section) !== -1) {
        return lajax.t("Other Listings");
    }

    if (section in sections){
        return sections[section];
    }

    return lajax.t("Other");
}

// Reviews update GBP (localseo) for Local SEO Audit
function updateAnotherScore(check, section='localseo') {
    if (check.maxScore === 0 || check.maxScore === undefined) {
        return false;
    }
    let percentage;

    if (scores[section] === undefined) {
        scores[section] = {
            'score': 0,
            'max': 0
        };
    }

    scores[section].max += check.maxScore;
    scores[section].score += check.score;
    percentage = Math.round(100 * scores[section].score / scores[section].max);
    $(".knob." + section + "-score")
        .attr('data-label', scoringType ? percentage : calculateGrade(percentage))
        .attr('data-value', percentage)
    ScoreCharts.update(".knob." + section + "-score.main-score");
}

function updateScore(section, check) {
    if (window.quick_group === undefined) {
        $('.' + section + '-hidden').show(); //show header section

        // skip unscorable checks (with maxScore = 0)
        if (check.maxScore === 0 || check.maxScore === undefined) {
            return false;
        }

        $('.' + section + '-score-hidden').show(); //show score section

        let percentage;
        let messages;

        if (scores[section] === undefined) {
            scores[section] = {
                'score': 0,
                'max': 0
            };
        }

        scores[section].max += check.maxScore;
        scores[section].score += check.score;

        percentage = Math.round(100 * scores[section].score / scores[section].max);
        percentage = (percentage > 100) ? 100 : percentage; // limit to 100%
        // scaling
        // "To explain, even if a website is terrible, it often still scores something like 50 or 60 out of 100 in our reporting.
        // I think our grading bracked (like F) account for this, so most of the higher grades are clustered above 60,
        // but the scoring chart itself would look strange if user received F but the circle was populated 60%, and customers eventually pointed this out."
        let notScaled = false;
        // SCALING DISABLE
        // const unscaledCharts = ['listings', 'localseo', 'posts', 'reviews'];
        // notScaled = unscaledCharts.includes(section);
        const scaled = notScaled ? percentage : Math.max(Math.round(100 - ((100 - percentage) * 1.5)), 0);

        $(".knob." + section + "-score")
            .attr('data-label', scoringType ? scaled : calculateGrade(scaled))
            .attr('data-value', scaled)
            .css('visibility', 'visible');
        ScoreCharts.update(".knob." + section + "-score.main-score");
        setTimeout(function() {
            ScoreCharts.update(".knob." + section + "-score.check-score");
        }, 150);
        //if (section === 'website' && typeAudit === 'gbp') {
        //    section = 'gbp';
        //}

        messages = scoreMessage(section, scaled);
        $('.' + section + '-score-message').text(messages.title);

        if (messages.description !== undefined) {
            $('.' + section + '-score-description').text(messages.description);
        }
        setTimeout(function() {
            RadarChart.init();
        }, 150);
    }
}

function calculateGrade(percentage) {
    let grade = 'F';
    for (const minScore in scoreGrades) {
        if (percentage >= minScore) {
            grade = scoreGrades[minScore];
        }
    }
    return grade;
}

// GEO debug switch. Driven by the `geoDebug` JS var (params.openRouter.debug, overridable
// in local.php). When off, no console output and the checks behave conventionally.
function isGeoDebug() {
    return typeof geoDebug !== 'undefined' && geoDebug;
}

// Plain-text dump of the synthetic discovery prompts.
function dumpGeoSyntheticPrompts(prompts) {
    if (!Array.isArray(prompts) || !prompts.length) {
        console.log('[GEO] Synthetic discovery prompts: none');
        return;
    }
    const lines = ['=== GEO SYNTHETIC DISCOVERY PROMPTS (' + prompts.length + ') ==='];
    prompts.forEach(function (p, i) {
        const text = (p && p.prompt) ? p.prompt : p;
        const intent = (p && p.intent) ? ' [' + p.intent + ']' : '';
        lines.push((i + 1) + '.' + intent + ' ' + text);
    });
    console.log(lines.join('\n'));
}

// Plain-text dump of the GEO Prompt Visibility raw results: for each prompt x engine,
// the prompt, the engine name, and the full original response. One readable blob.
function dumpGeoPromptVisibility(data) {
    if (!data || !Array.isArray(data.cells)) {
        console.log('[GEO] Prompt Visibility: no data');
        return;
    }
    const lines = [];
    lines.push('==================================================');
    lines.push('GEO PROMPT VISIBILITY — RAW LLM RESPONSES');
    lines.push('Target: ' + (data.target || ''));
    if (data.summary) {
        lines.push('Target mentioned in ' + (data.summary.target_mentions || 0) + ' / ' + (data.summary.total || 0) + ' responses');
    }
    if (data.timing) {
        lines.push('TIMING (s): total ' + data.timing.total
            + ' | generation ' + data.timing.generation_wall
            + ' | extraction ' + data.timing.extraction_wall);
        if (data.timing.slowest_call_by_model) {
            const bm = data.timing.slowest_call_by_model;
            lines.push('  slowest call per engine: ' + Object.keys(bm).map(function (m) { return m + ' ' + bm[m] + 's'; }).join(' | '));
        }
    }
    if (data.extraction) {
        const ex = data.extraction;
        lines.push('EXTRACTION CALL: ' + ex.model
            + ' | ' + (ex.time != null ? ex.time + 's' : '?')
            + ' | HTTP ' + ex.http_code
            + ' | finish ' + ex.finish_reason
            + ' | parsed ' + ex.results_parsed + '/' + ex.blocks_sent + ' cells'
            + (ex.error ? ' | ERROR: ' + ex.error : ''));
        if (ex.raw) {
            lines.push('  EXTRACTION RAW (problem): ' + ex.raw);
        }
    }
    lines.push('==================================================');

    data.cells.forEach(function (c, i) {
        const promptText = (data.prompts && data.prompts[c.prompt_index]) || ('#' + c.prompt_index);
        lines.push('');
        lines.push('----- [' + (i + 1) + '/' + data.cells.length + '] --------------------------------');
        lines.push('PROMPT:   ' + promptText);
        lines.push('ENGINE:   ' + c.model);
        if (c.finish_reason || c.native_finish_reason) {
            var fin = c.finish_reason || '?';
            if (c.native_finish_reason && c.native_finish_reason !== c.finish_reason) {
                fin += ' (native: ' + c.native_finish_reason + ')';
            }
            if (c.finish_reason === 'length') { fin += '  <-- TRUNCATED (hit token cap)'; }
            else if (c.finish_reason === 'error') { fin += '  <-- model halted mid-response (e.g. Gemini recitation filter); partial text kept'; }
            lines.push('FINISH:   ' + fin);
        }
        if (c.time != null) {
            lines.push('TIME:     ' + c.time + 's');
        }
        if (c.http_code != null) {
            lines.push('HTTP:     ' + c.http_code + (c.http_code === 0 ? '  <-- no response (timeout/connection failure)' : ''));
        }
        if (c.target_mentioned) {
            lines.push('TARGET:   mentioned (position ' + (c.target_position || '?') + ')');
        }
        if (Array.isArray(c.brands) && c.brands.length) {
            lines.push('BRANDS:   ' + c.brands.join(', '));
        }
        if (c.error) {
            lines.push('ERROR:    ' + c.error);
        }
        if (c.raw) {
            lines.push('RAW BODY (failed call): ' + c.raw);
        }
        lines.push('RESPONSE:');
        lines.push(c.response || c.snippet || '(empty)');
    });

    console.log(lines.join('\n'));
}

// Brand logos for the AI platforms (Simple Icons, simpleicons.org). The project's icon fonts
// (Keenicons, FontAwesome, Ionicons, ...) don't carry AI-brand marks, so these 4 are inlined as
// SVG (fill=currentColor so they inherit the card's gray text colour, and render in Chrome PDF).
const GEO_PLATFORM_ICONS = {
    'ChatGPT': '<svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>',
    'Claude': '<svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>',
    'Gemini': '<svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"/></svg>',
    'Perplexity': '<svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z"/></svg>'
};

// Competitor Visibility: a listing table of every brand cited across all responses, its citation
// rate (% of responses it appears in), and an absolute blue bar. Target flagged with a "You" badge.
function generateGeoCompetitorVisibility(data) {
    if (!data || !Array.isArray(data.competitors) || !data.competitors.length) {
        return '';
    }
    const esc = function (s) {
        return $('<div>').text(s === undefined || s === null ? '' : String(s)).html();
    };

    // Half-width table (col-md-6), matching the H2-H6 Header Tag Usage / Organic Keyword Positions look.
    // geo-competitor-bar-table: PDF-only widening + bar-column width (see pdf-themed.css).
    let html = '<div class="row"><div class="table-responsive col-md-6 geo-competitor-bar-table"><table class="table table-row-dashed table-fluid align-middle avoid-break-inside mb-0">\
        <thead><tr>\
            <th>' + lajax.t('Competitor') + '</th>\
            <th class="text-nowrap text-start" style="width:1%">' + lajax.t('Citation Rate') + '</th>\
            <th></th>\
        </tr></thead><tbody>';
    data.competitors.forEach(function (c) {
        const rate = (c.rate != null ? c.rate : 0);
        // Absolute: bar width == the citation rate itself (so the widest bar is NOT forced to 100%).
        const bar = Math.max(0, Math.min(100, rate));
        const youBadge = c.is_target ? ' <span class="badge badge-light-success ms-1">' + lajax.t('You') + '</span>' : '';
        html += '<tr>\
            <td>' + esc(c.name) + youBadge + '</td>\
            <td class="text-nowrap text-start" style="width:1%">' + rate + '%</td>\
            <td class="volume-bar-wrapper min-w-100px"><div><span style="width:' + bar + '%;"></span></div></td>\
        </tr>';
    });
    html += '</tbody></table></div></div>';
    return html;
}

// Dedicated donut renderer for Competitor Dominance - intentionally separate from the shared
// DonutChart so tweaks here (hex colours, %-legend, no centre number, larger size) can't affect
// the on-page / backlink charts, and so the legend bullet colours always match the chart exactly.
function renderGeoDominanceDonut(wid, pieData, colors) {
    const el = document.getElementById('geoDominanceChart' + wid);
    if (!el || typeof ApexCharts === 'undefined') {
        return;
    }
    const isPrimary = (wid === websiteId);
    const size = isPrimary ? 306 : 233; // ~10% smaller again (was 340/259)

    // Legend: colour bullet (inline hex, always matches the chart), label, whole-number %.
    // Scaled up in step with the larger donut - bigger text, bigger bullets, more row spacing.
    const $legend = $('#geoCompetitorDominance' + wid + ' .geo-dominance-legend');
    $legend.empty();
    const legendFs = isPrimary ? 'fs-4' : 'fs-6';
    const bulletSize = isPrimary ? 14 : 10;
    pieData.forEach(function (item, i) {
        $legend.append('<div class="d-flex ' + legendFs + ' fs-pdf-7 fw-semibold align-items-center text-start mb-4">' +
            '<div class="bullet me-4" style="width:' + bulletSize + 'px;height:' + bulletSize + 'px;border-radius:' + (bulletSize / 2) + 'px;background-color:' + colors[i] + '"></div>' +
            '<div class="text-gray-500">' + $('<div>').text(item.label).html() + '</div>' +
            '<div class="ms-auto fw-bold text-gray-500">' + Math.round(item.data) + '%</div>' +
            '</div>');
    });

    // Diagnostic: exact label -> value -> colour mapping fed to ApexCharts. If this logs and the
    // 5th colour here matches what you see, the render is correct; if it never logs, the browser
    // is running a cached/old report.js (server/proxy cache) rather than this code.
    if (typeof isGeoDebug === 'function' && isGeoDebug()) {
        console.log('[GEO] Dominance donut:', pieData.map(function (p, i) {
            return { label: p.label, value: p.data, color: colors[i] };
        }));
    }

    let bg = '#ffffff';
    if (typeof KTThemeMode !== 'undefined' && KTThemeMode && typeof KTUtil !== 'undefined') {
        bg = KTUtil.getCssVariableValue('--bs-body-bg') || '#ffffff';
    }

    // ApexCharts always draws slices CLOCKWISE - there is no counter-clockwise option (internally
    // fullAngle = abs(endAngle - startAngle), so a negative endAngle does nothing). To make the
    // slices sweep LEFT from 12 o'clock while keeping dominance order, feed the chart the REVERSED
    // arrays: a clockwise draw of the reversed order reads as counter-clockwise in original order.
    // The legend above is built from the original order, so it stays top-to-bottom by dominance.
    const chartData = pieData.slice().reverse();
    const chartColors = colors.slice().reverse();

    const chart = new ApexCharts(el, {
        series: chartData.map(function (x) { return x.data; }),
        // height == width keeps the SVG square so it doesn't reserve extra vertical whitespace below
        // the donut; parentHeightOffset:0 drops ApexCharts' default 15px padding around the chart.
        chart: { type: 'donut', width: size, height: size, parentHeightOffset: 0, fontFamily: 'inherit' },
        labels: chartData.map(function (x) { return x.label; }),
        colors: chartColors,
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '72%', // ring ~20% thicker than the previous 77% hole
                    // Centre caption is drawn as an HTML overlay (see generateGeoCompetitorDominance)
                    // so it can wrap to two lines without clipping - disable ApexCharts' own label.
                    labels: { show: false },
                },
            },
        },
        dataLabels: { enabled: false }, // names live in the key beside the chart (ApexCharts has no native leader-line labels)
        legend: { show: false },
        stroke: { width: 2, colors: [bg] },
        states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
        tooltip: { y: { formatter: function (v) { return Math.round(v) + '%'; } } },
    });
    chart.render().then(function () {
        // seochecker.css:259 globally forces every pie's 5th slice fill to gray. Re-assert our
        // palette inline after render - inline style beats that author rule (it has no !important),
        // so the correct colour shows regardless of how many slices this chart has.
        el.querySelectorAll('.apexcharts-pie-series path').forEach(function (path, i) {
            if (chartColors[i]) {
                path.style.setProperty('fill', chartColors[i]);
            }
        });
    });
}

// Competitor Dominance: rank-weighted share of voice as a donut (top brands + "Other" in gray),
// with a query table alongside (share % and raw weighted score) - the table is temporary so the
// numbers can be verified; the chart is the intended final display.
function generateGeoCompetitorDominance(data, wid) {
    if (!data || !Array.isArray(data.competitors) || !data.competitors.length) {
        return '';
    }
    const esc = function (s) {
        return $('<div>').text(s === undefined || s === null ? '' : String(s)).html();
    };

    // ---- donut: dominance share per brand, remainder grouped as "Other" (gray) ----
    // Uses its OWN render path (renderGeoDominanceDonut) with explicit hex colours so the chart
    // and legend always match - the shared DonutChart maps named colours differently between the
    // two, which is what made the 5th slice red in the legend but grey on the chart.
    let chartHtml = '';
    const chart = data.chart;
    if (chart && Array.isArray(chart.slices) && chart.slices.length) {
        const palette = ['#009EF7', '#50CD89', '#7239EA', '#FFC700', '#F1416C', '#181C32'];
        const pieData = chart.slices.map(function (s) { return { label: s.name, data: s.value }; });
        const colors = pieData.map(function (p, i) { return palette[i % palette.length]; });
        if (chart.other > 0) {
            pieData.push({ label: lajax.t('Other'), data: chart.other });
            colors.push('#B5B5C3');
        }
        // Two-line caption centred in the donut hole (own HTML overlay rather than ApexCharts' centre
        // label, which clips a long single line). pe-none so slice tooltips still work through it.
        const isPrimary = (wid === websiteId);
        const capFs = isPrimary ? 'fs-2' : 'fs-6';
        const capMax = isPrimary ? 165 : 120;
        chartHtml = '<div class="row mb-2 avoid-break-inside">\
            <div class="col-12">\
                <div class="d-flex flex-wrap flex-sm-nowrap justify-content-center align-items-center">\
                    <div class="geo-dominance-legend d-flex flex-column justify-content-center mb-5 mb-sm-0 me-sm-10 min-w-225px mw-225px min-w-xl-300px mw-xl-300px"></div>\
                    <div class="d-flex flex-center position-relative">\
                        <div id="geoDominanceChart' + wid + '" class="geo-dominance-donut"></div>\
                        <div class="geo-dominance-caption pe-none position-absolute top-50 start-50 translate-middle text-center text-gray-500 fw-semibold lh-sm ' + capFs + ' fs-pdf-7" style="max-width:' + capMax + 'px">' + lajax.t('Competitor Dominance') + '</div>\
                    </div>\
                </div>\
            </div>\
        </div>';
        setTimeout(function () {
            renderGeoDominanceDonut(wid, pieData, colors);
        }, 250);
    }

    // The chart is the user-facing output. The query table below is retained but hidden from users
    // (kept for debugging / quick verification) - remove the `d-none` wrapper to bring it back.
    let tableHtml = '';
    if (chart) {
        let maxShare = 0;
        data.competitors.forEach(function (c) { if (c.share > maxShare) { maxShare = c.share; } });
        if (maxShare <= 0) { maxShare = 1; }

        tableHtml = '<div class="d-none"><table class="table table-row-dashed table-sm align-middle mb-0">\
            <thead><tr>\
                <th style="width:40%">' + lajax.t('Competitor') + '</th>\
                <th style="width:15%">' + lajax.t('Dominance') + '</th>\
                <th style="width:15%">' + lajax.t('Score') + '</th>\
                <th></th>\
            </tr></thead><tbody>';
        data.competitors.forEach(function (c) {
            const share = (c.share != null ? c.share : 0);
            const bar = Math.max(0, Math.min(100, Math.round((share * 100) / maxShare)));
            const youBadge = c.is_target ? ' <span class="badge badge-light-success ms-1">' + lajax.t('You') + '</span>' : '';
            tableHtml += '<tr>\
                <td>' + esc(c.name) + youBadge + '</td>\
                <td>' + share + '%</td>\
                <td class="text-gray-500">' + (c.score != null ? c.score : 0) + '</td>\
                <td class="volume-bar-wrapper min-w-100px"><div><span style="width:' + bar + '%;"></span></div></td>\
            </tr>';
        });
        tableHtml += '</tbody></table></div>';
    }

    return chartHtml + tableHtml;
}

// Competitor Average Position: listing of each brand's average rank across the responses where it
// is mentioned (lower is better). The relative bar is inverse to the average (a #1 is a full bar).
function generateGeoCompetitorAveragePosition(data) {
    if (!data || !Array.isArray(data.competitors) || !data.competitors.length) {
        return '';
    }
    const esc = function (s) {
        return $('<div>').text(s === undefined || s === null ? '' : String(s)).html();
    };

    // Half-width table (col-md-6), matching the H2-H6 Header Tag Usage / Organic Keyword Positions look.
    // geo-competitor-bar-table: PDF-only widening + bar-column width (see pdf-themed.css).
    let html = '<div class="row"><div class="table-responsive col-md-6 geo-competitor-bar-table"><table class="table table-row-dashed table-fluid align-middle avoid-break-inside mb-0">\
        <thead><tr>\
            <th>' + lajax.t('Competitor') + '</th>\
            <th class="text-nowrap text-start" style="width:1%">' + lajax.t('Average Position') + '</th>\
            <th></th>\
        </tr></thead><tbody>';
    data.competitors.forEach(function (c) {
        const avg = (c.avg != null ? c.avg : 0);
        // inverse: #1 -> 100%, #2 -> 50%, #4 -> 25% (better positions get longer bars)
        const bar = avg > 0 ? Math.max(0, Math.min(100, Math.round(100 / avg))) : 0;
        const youBadge = c.is_target ? ' <span class="badge badge-light-success ms-1">' + lajax.t('You') + '</span>' : '';
        html += '<tr>\
            <td>' + esc(c.name) + youBadge + '</td>\
            <td class="text-nowrap text-start" style="width:1%">' + avg + '</td>\
            <td class="volume-bar-wrapper min-w-100px"><div><span style="width:' + bar + '%;"></span></div></td>\
        </tr>';
    });
    html += '</tbody></table></div></div>';
    return html;
}

// Platform Snapshot: one informational card per AI platform (styled like the SEO Backlink Summary
// metric blocks) - brand logo on top, large citation-coverage %, platform name as the gray subtitle.
function generateGeoPlatformSnapshot(data) {
    if (!data || !Array.isArray(data.platforms) || !data.platforms.length) {
        return '';
    }
    const esc = function (s) {
        return $('<div>').text(s === undefined || s === null ? '' : String(s)).html();
    };
    let html = '<div class="row backlink-summary-down-stats avoid-break-inside row-gap-3 row-gap-xl-5 gx-3 gx-xl-5">';
    data.platforms.forEach(function (p) {
        const pct = (p.percent != null ? p.percent : 0);
        const icon = GEO_PLATFORM_ICONS[p.platform] || '';
        html += '<div class="col-6 col-md-3 col-pdf-3">\
            <div class="card h-lg-100">\
                <div class="card-body d-flex justify-content-start align-items-start flex-column py-7 px-9 p-pdf-6">\
                    ' + (icon ? '<div class="m-0 text-gray-500 platform-snapshot-icon">' + icon + '</div>' : '') + '\
                    <div class="d-flex flex-column mt-6 mt-pdf-5">\
                        <span class="fw-semibold fs-2qx fs-pdf-1 text-gray-800 lh-1 ls-n2">' + pct + '%</span>\
                        <div class="m-0 mt-2 text-wrap">\
                            <span class="fw-semibold fs-6 fs-pdf-7 text-gray-500 card-tile-title">' + esc(p.platform) + '</span>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>';
    });
    html += '</div>';
    return html;
}

// "<target> mentioned in X / Y AI responses (Model: n · ...)" - shown as body text under the
// Platform Snapshot check for a bit of context. Built from the ranking data's summary block.
// Returns '' when there is nothing to show.
function generateGeoVisibilitySummaryLine(ranking) {
    if (!ranking || !ranking.summary) { return ''; }
    const esc = function (s) {
        return $('<div>').text(s === undefined || s === null ? '' : String(s)).html();
    };
    const summary = ranking.summary;
    const models = ranking.models || [];
    let line = '<strong>' + esc(ranking.target) + '</strong> ' + lajax.t('mentioned in') + ' '
        + (summary.target_mentions || 0) + ' / ' + (summary.total || 0) + ' ' + lajax.t('AI responses');
    if (summary.by_model) {
        const parts = models.map(function (m) { return esc(m) + ': ' + (summary.by_model[m] || 0); });
        if (parts.length) {
            line += ' (' + parts.join(' · ') + ')';
        }
    }
    return '<div class="mb-4">' + line + '.</div>';
}

// Render of the GEO Prompt Visibility matrix (prompt x model -> target ranking marker). With
// showBrands=true (default) each cell also lists the competing brands; showBrands=false gives the
// user-facing "Prompt by Prompt Ranking" view - just the X / position badge, no brand lists.
function generateGeoPromptVisibilityTable(data, showBrands) {
    if (showBrands === undefined) { showBrands = true; }
    if (!data || !Array.isArray(data.cells)) {
        return '';
    }
    const esc = function (s) {
        return $('<div>').text(s === undefined || s === null ? '' : String(s)).html();
    };
    const models = data.models || [];
    const prompts = data.prompts || [];
    const cellMap = {};
    data.cells.forEach(function (c) {
        cellMap[c.prompt_index + '|' + c.model] = c;
    });

    let html = '';
    // The "target mentioned in X / Y responses" summary line now lives under the Platform Snapshot
    // check (see generateGeoVisibilitySummaryLine), for more context - it is no longer shown here.

    // Give the prompt column more room in the leaner ranking view. Use a fixed table layout with an
    // evenly-split model column width so a longer brand name / model label can't blow out one column
    // (it wraps instead) - keeps every model column the same width regardless of content.
    const promptWidth = showBrands ? 40 : 50;
    const modelWidth = models.length ? (100 - promptWidth) / models.length : 0;
    // Floor the table width so it never squishes below a readable size. On mobile this exceeds the
    // container, overflows, and the .table-responsive wrapper scrolls it horizontally instead of
    // squashing columns / spilling text. On desktop the container is wider, so width:100% wins.
    const promptMinPx = showBrands ? 240 : 260;
    const modelMinPx = showBrands ? 120 : 70;
    const tableMinWidth = promptMinPx + models.length * modelMinPx;
    html += '<table class="table table-row-dashed table-sm align-middle" style="table-layout:fixed;width:100%;min-width:' + tableMinWidth + 'px;"><thead><tr><th style="width:' + promptWidth + '%;white-space:normal;">' + lajax.t('Prompt') + '</th>';
    models.forEach(function (m) { html += '<th style="width:' + modelWidth + '%;word-break:break-word;white-space:normal;">' + esc(m) + '</th>'; });
    html += '</tr></thead><tbody>';

    const labelNo = '<i class="ki-duotone fs-1 ki-cross text-danger"><span class="path1"></span><span class="path2"></span></i>';

    prompts.forEach(function (p, pi) {
        html += '<tr><td class="align-top" style="word-break:break-word;overflow-wrap:anywhere;white-space:normal;">' + esc(p) + '</td>';
        models.forEach(function (m) {
            const c = cellMap[pi + '|' + m];
            let cell = '<span class="text-muted">·</span>';
            if (c) {
                if (c.target_mentioned && c.target_position) {
                    // graduated by rank: 1-3 green, 4-6 orange/yellow, 7+ red
                    const p = c.target_position;
                    const posClass = p <= 3 ? 'badge-light-success' : (p <= 6 ? 'badge-light-warning' : 'badge-light-danger');
                    cell = '<span class="badge ' + posClass + '">#' + esc(p) + '</span>';
                } else if (c.error) {
                    cell = '<span class="text-muted" title="' + esc(c.error) + '">—</span>';
                } else {
                    cell = labelNo;
                }
                if (showBrands && Array.isArray(c.brands) && c.brands.length) {
                    // Cap the displayed brand list at 10 - big lists (e.g. 22) blow out the PDF cell.
                    // This is display-only: the target's own rank badge (c.target_position) and all
                    // aggregate stats (visibility %, average position) come from the full data set and
                    // are unaffected.
                    const MAX_BRANDS = 10;
                    let list = '<ol class="text-muted fs-8 mb-0 mt-2 ps-3 text-start">';
                    c.brands.slice(0, MAX_BRANDS).forEach(function (b) { list += '<li>' + esc(b) + '</li>'; });
                    list += '</ol>';
                    if (c.brands.length > MAX_BRANDS) {
                        list += '<div class="text-muted fs-8 mt-1">+' + (c.brands.length - MAX_BRANDS) + ' ' + lajax.t('more') + '</div>';
                    }
                    cell += list;
                }
            }
            html += '<td class="text-start align-top" style="word-break:break-word;overflow-wrap:anywhere;white-space:normal;">' + cell + '</td>';
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
}

function scoreMessage(section, score) {
    if (scoreMessages[section] === undefined) {
        return '';
    }
    const minScores = Object.keys(scoreMessages[section]).sort().reverse();
    for (const i in minScores) {
        if (score >= minScores[i]){
            return scoreMessages[section][minScores[i]];
        }
    }
}

function showMore(block){
    $('.btn-show-'+block).hide('slow');
    $('.'+block).show('slow');
    $('.btn-hide-'+block).show('slow');
}

function hideMore(block){
    $('.'+block).hide('slow');
    $('.btn-hide-'+block).hide('slow');
    $('.btn-show-'+block).show('slow');
    const destination = $('#' + block).offset().top;
    $('body,html').animate({
        scrollTop: destination + 50
    }, 1500);
}

function reInitDetailsButtons() {
    $('.js-collapse-in').off('click');
    $('.js-collapse-out').off('click');

    $('.js-collapse-in').on('click',function(event){
        event.stopPropagation();
        const $expander = $(this);
        const $container = $expander.closest('.js-collapse-parent');
        $expander.slideUp();
        $container.find('.js-collapse-target').slideDown(500,function(){
        });
    });
    $('.js-collapse-out').on('click',function(event){
        event.stopPropagation();
        const $collapser = $(this);
        const $container = $collapser.closest('.js-collapse-parent');
        const $expander = $container.find('.js-collapse-in');
        $container.find('.js-collapse-target').slideUp(500,function(){
            $expander.slideDown();
        });
        const top = $container.find('.js-collapse-target').offset().top;
        const v_top = $(document).scrollTop();

        const v_bottom = $(document).scrollTop() + $(window).height();
        if( !(top >= v_top && top <= v_bottom) ){
            $("html, body").stop().animate({
                scrollTop: top - ($(window).height()/2)
            }, 500);
        }
    });

    // specific alternate
    $('body')
        .off('click','.js-visible-in')
        .off('click','.js-visible-out')
        .on('click','.js-visible-in',function(){
            const $expander = $(this);
            const $container = $expander.closest('.js-visible-parent');
            $expander.slideUp();
            $container.find('.js-visible-target').css({
                'visibility' : 'visible',
                'height': 'auto',
                'overflow': 'visible',
                'display': 'none'
            }).slideDown(500, function(){
                $(this).css({
                    'visibility' : 'visible',
                    'height': 'auto',
                    'overflow': 'visible'
                });

            });
        })
        .on('click','.js-visible-out',function(){
            const $collapser = $(this);
            const $container = $collapser.closest('.js-visible-parent');
            const $expander = $container.find('.js-visible-in');
            $container.find('.js-visible-target').slideUp(500,function(){
                $(this).css({
                    'visibility': 'hidden',
                    'display': 'block',
                    'height': '0',
                    'overflow': 'hidden',
                });
                $expander.slideDown();
            });
            const top = $container.find('.js-visible-target').offset().top;
            const v_top = $(document).scrollTop();
            const v_bottom = $(document).scrollTop() + $(window).height();

            if( !(top >= v_top && top <= v_bottom) ){
                $("html, body").stop().animate({
                    scrollTop: top - ($(window).height()/2)
                }, 500);
            }
        });

    // prevent hide info box on more link click
    $('.check-info .more-info').on('click', function (event){
        event.stopPropagation();
        return true;
    });

    // prevent expand info box Trial SignUp link click
    $('.btn-report-signup').on('click', function (event) {
        event.stopPropagation();
        return true;
    });
}

/**
 *
 * @param {String} html
 * @returns {String}
 */
function wrapInButton(html, wid) {
    let result;
    if (html == '') {
        return '';
    }

    if (isPdfRequest()) {
        result = '<div class="answer headers field-value-table">' + html + '</div>';
    } else {
        result = '' +
            '<div class="js-collapse-parent">\n' +
            '   <a class="btn btn-light btn-sm js-collapse-in">'+lajax.t("Show Details")+'</a>\n' +
            '   <div class="js-collapse-target collapse">\n' +
            '       <div class="answer headers field-value-table">' + html + '</div>\n' +
            '       <a class="btn btn-light btn-sm js-collapse-out mt-3">'+lajax.t("Hide Details")+'</a>\n' +
            '   </div>\n' +
            '</div>';
    }

    if (wid === undefined) {
        return result;
    }
    if (wid === websiteId) {
        return html;
    }
    return '<div class="field-details">' + result + '</div>';
}

/**
 *
 * @param replacePairs
 * @returns {string}
 */
String.prototype.strtr = function (replacePairs) {
    "use strict";
    let str = this.toString(), key, re;
    for (key in replacePairs) {
        if (replacePairs.hasOwnProperty(key)) {
            re = new RegExp(key, "g");
            str = str.replace(re, replacePairs[key]);
        }
    }
    return str;
};

function isOldPdfRequest() {
    // Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.34 (KHTML, like Gecko) wkhtmltopdf Safari/534.34
    return (navigator.userAgent.indexOf('wkhtmltopdf') !== -1);
}

function isPdfRequest(){
    // simplify testing
    return typeof isPdf === 'undefined' ? false : isPdf;
    //return (navigator.userAgent.indexOf('chromepdf') !== -1) || isOldPdfRequest();
}

function sendAudit(components) {
    $.post(infoUrls['reportAnalytics'].url, {
        wid: websiteId,
        components: components,
        user_id: userId,
        owner_id: ownerId,
        current_page: currentPage,
        referrer: referrer,
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * history.pushState probably should update the CSS :target selector, since using the browser back and forward buttons to navigate back and forward after using history.pushState does indeed update it.
 * It has an open BUG in webkit, and there is talk of standardizing the behavior to be one way or the other, rather than the current inconsistent behavior.
 * If they choose to make it update the CSS, then your code will just work as-is.
 *
 * @param url
 */
function removeHashFromCurrentUrl(url) {
    history.pushState({}, document.title, url); // called as you would normally
    const onpopstate = window.onpopstate; // store the old event handler to restore it later
    window.onpopstate = function() { // this will be called when we call history.back()
        window.onpopstate = onpopstate; // restore the original handler
        history.forward(); // go forward again to update the CSS
    };
    history.back(); // go back to trigger the above function

    return true;
}

window.onpageshow = function() {
    $('#options-template').trigger('change');
}
