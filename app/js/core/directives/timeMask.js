

function TimeMask() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function ($scope, el, attrs, model) {
            var caretPos = 8;

            model.$parsers.push(function (value) {
                if(attrs.originalValue !== undefined && attrs.originalValue.length > value.length){
                    if(value.split(':').length === 3){
                        attrs.originalValue = value;
                        return value;
                    }
                    value = replaceColon(value);
                    model.$viewValue = value;
                    el.val(model.$viewValue);
                    attrs.originalValue = value;
                    setCaretPosition();
                    return model.$viewValue;
                }
                var cleanValue = String(value).replace(/[^0-9\:]/g, '');

                if(cleanValue.length === attrs.originalValue.length){
                    for(var index = 0; index < value.length; index++){
                        if(value[index] !== cleanValue[index]){
                            caretPos = index;
                            break;
                        }
                    }
                    value = attrs.originalValue;
                    el.val(value);
                    setCaretPosition();
                }

                model.$viewValue = value;
                attrs.originalValue = value;                
                return model.$viewValue;
            });

            function replaceColon(value){
                var valSplit = value.split(':');
                if(valSplit[0].length > 2){
                    caretPos = 2;
                    return valSplit[0].substring(0,2)+':'+valSplit[0].substring(2)+':'+valSplit[1];
                }
                else{
                    caretPos = 5;
                    return valSplit[0]+':'+valSplit[1].substring(0,2)+':'+valSplit[1].substring(2);
                }
            }

            function setCaretPosition() {
                var elem = el[0];
                if (elem !== null) {
                    if (elem.createTextRange) {
                        var range = elem.createTextRange();
                        range.move('character', caretPos);
                        range.select();
                    } else {
                        if (elem.selectionStart) {
                            elem.focus();
                            elem.setSelectionRange(caretPos, caretPos);
                        } else {
                            elem.focus();
                        }
                    }
                }
            }
        }
    };
}

angular.module('app').directive('timeMask', TimeMask);

