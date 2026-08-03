(function registerPdfMakeFonts() {
    if (!$.fn.dataTable || !$.fn.dataTable.Buttons || !$.fn.dataTable.Buttons.pdfMake) {
        return;
    }

    const pm = $.fn.dataTable.Buttons.pdfMake();
    if (!pm) return;

    const fontsMap = {
        Inter: {
            normal: 'Inter_18pt-Regular.ttf',
            bold: 'Inter_18pt-Bold.ttf',
            italics: 'Inter_18pt-Italic.ttf',
            // у вас немає BoldItalic для Inter -> fallback
            bolditalics: 'Inter_18pt-Bold.ttf',
        },
        NotoSansCJKjp: {
            normal: 'NotoSansCJKjp-Regular.ttf',
            bold: 'NotoSansCJKjp-Bold.ttf',
            // italic відсутній -> fallback на regular/bold
            italics: 'NotoSansCJKjp-Regular.ttf',
            bolditalics: 'NotoSansCJKjp-Bold.ttf',
        },
        NotoSansCJKkr: {
            normal: 'NotoSansCJKkr-Regular.ttf',
            bold: 'NotoSansCJKkr-Bold.ttf',
            italics: 'NotoSansCJKkr-Regular.ttf',
            bolditalics: 'NotoSansCJKkr-Bold.ttf',
        },
        Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf',
        }
    };

    if (typeof pm.addFonts === 'function') {
        pm.addFonts(fontsMap);
    } else {
        pm.fonts = Object.assign({}, pm.fonts || {}, fontsMap);
    }
})();