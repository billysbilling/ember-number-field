var numeral = require('numeral'),
    numeralLanguages = require('numeral-languages'),
    i18nContext = require('i18n-context')('ember_number_field', require.resolve('../locales')),
    t = i18nContext.t;

module.exports = require('ember-text-field').extend({

    align: 'right',
    autocomplete: 'off',

    inputmode: 'numeric',
    
    min: null,
    minIncluded: true,
    max: null,
    maxIncluded: true,
    
    init: function() {
        this._super();
        var min = this.get('min'),
            max = this.get('max');
        if (min && typeof(min) !== 'number') {
            this.set('min', Number(min));
        }
        if (max && typeof(max) !== 'number') {
            this.set('max', Number(max));
        }
    },
    
    format: '0,0',
    _value: null,
    formatInputValue: function(value) {
        return Em.isEmpty(value) ? '' : numeral(value).format(this.get('format'));
    },
    unformatInputValue: function(inputValue) {
        return (Em.isEmpty(inputValue) || !this.isValidNumberString(inputValue)) ? null : numeral().unformat(numeral(numeral().unformat(inputValue)).format(this.get('format')));
    },
    validateInputValue: function(inputValue) {
        if (!Em.isEmpty(inputValue)) {
            if (!this.isValidNumberString(inputValue)) {
                throw new UserError(t('invalid_number'));
            }
            var value = this.unformatInputValue(inputValue),
                min = this.get('min'),
                minIncluded = this.get('minIncluded'),
                max = this.get('max'),
                maxIncluded = this.get('maxIncluded');
            if (!Em.isEmpty(min)) {
                if (minIncluded && value < min) {
                    throw new UserError(t('must_be_greater_equal', {number: this.formatInputValue(min)}));
                }
                if (!minIncluded && value <= min) {
                    throw new UserError(t('must_be_greater', {number: this.formatInputValue(min)}));
                }
            }
            if (!Em.isEmpty(max)) {
                if (maxIncluded && value > max) {
                    throw new UserError(t('must_be_less_equal', {number: this.formatInputValue(max)}));
                }
                if (!maxIncluded && value >= max) {
                    throw new UserError(t('must_be_less', {number: this.formatInputValue(min)}));
                }
            }
        }
    },
    isValidNumberString: function(value) {
        var lang = numeralLanguages[numeral.language()] || numeralLanguages.en,
            thousandsDelimiter = lang.delimiters && lang.delimiters.thousands ? lang.delimiters.thousands : ',',
            decimalDelimiter = lang.delimiters && lang.delimiters.decimal ? lang.delimiters.decimal : '.',
            re;
        re = new RegExp('\\' + thousandsDelimiter, 'g');
        value = value.replace(re, '');
        re = new RegExp('\\' + decimalDelimiter, 'g');
        value = value.replace(re, '.');
        return !isNaN(value);
    }
});

module.exports.locale = i18nContext.locale;

module.exports.lang = function() {
    console.warn('.lang() is deprecated. Use .locale() instead');
    return i18nContext.locale.apply(null, arguments);
};