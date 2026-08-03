/**
 * Created on : 2014.08.24., 5:26:26
 * Author     : Lajos Molnar <lajax.m@gmail.com>
 * since 1.0
 */

/**
 * This module facilitates client-side multilingual support.
 */
var lajax = (function () {

    return {
        /**
         *
         * Method that facilitates multilingual support on client side.
         *
         * examples:
         *
         * ~~~
         * alert(lajax.t('Hello!'));
         * alert(lajax.t('Hello {name}'), {name:'World!'});
         * alert(lajax.t('Hello {first_name} {last_name}', {fist_name: 'Veronica', last_name:'Hunter'}));
         * ~~~
         *
         * @param {string} message The message to translate.
         * @param {object} $params Parameter to change within text as json string, i.e.: {fist_name: 'Veronica', last_name:'Hunter'}
         * @returns {string}
         */
        t: function (message, $params) {
            if (typeof (languageItems) !== 'undefined' && typeof (languageItems.getLanguageItems) === 'function') {
                var $messages = languageItems.getLanguageItems();
                if (typeof ($messages) !== 'undefined') {
                    var hash = hex_md5(message);
                    if (typeof ($messages[hash]) !== 'undefined') {
                        message = $messages[hash];
                    } else {
                        if (typeof frontendMissingTranslationHandler !== 'undefined') {
                            message = frontendMissingTranslationHandler(message);
                        }
                    }
                }
            }

            if (typeof ($params) !== 'undefined') {
                var pr;
                var pv;
                for (search in $params) {
                    // plural exception (very limited, need update if there will be more complicated translations)
                    if (message.indexOf('{'+search+',plural,') !== -1) {
                        pv = 'other';
                        if (typeof(Intl) !== 'undefined') {
                            pr = new Intl.PluralRules(reportLanguage);
                            pv = pr.select($params[search]);
                        }
                        var reg = new RegExp(pv+'\{([^}]+)');
                        var replacement = message.match(reg);
                        if (replacement === null) {
                            // switch to english
                            pv = 'other';
                            if (typeof(Intl) !== 'undefined') {
                                pr = new Intl.PluralRules('en-US');
                                pv = pr.select($params[search]);
                            }
                            var reg = new RegExp(pv+'\{([^}]+)');
                            var replacement = message.match(reg);
                        }
                        message = message.substring(0, message.indexOf('{'+search+',plural,'))
                            + replacement[1]
                            + message.substring(message.indexOf('}}')+2);
                    } else {
                        message = message.replace('{' + search + '}', $params[search]);
                    }
                }
            }

            return message;
        }
    };
})();

