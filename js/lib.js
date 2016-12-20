var app = {};

app.utils = {
    hyphenate: function (string) {
        return string.replace(/[\s,.]+/g, '-').toLowerCase();
    }
};

app.DOM = {
    removeElement: function (elem) {
        elem.parentNode.removeChild(elem);
    },
    forEachNodeList: function (nodeList, callback) {
        return Array.prototype.forEach.call(nodeList, callback);
    },
    mapNodes: function (nodeList, callback) {
        return Array.prototype.map.call(nodeList, callback);
    }
};



app.FormGenerator = (function() {
    var idCounter = 0,
        stepCounter = 0;

    /*
    * options.tagName (String) - required
    * options.inputType (String) - required
    * options.selectOptions (Array) - optional
    * options.placeholder (String) - optional
    *
    * */
    function createElement(options) {
        var tagName = options.tagName,
            inputType = options.inputType || '',
            selectOptions = options.selectOptions,
            placeholder = options.placeholder,
            $element = $(document.createElement(tagName));

        $element.attr('id', 'id-' + idCounter);
        if (tagName == 'input' || tagName == 'button') {
            $element.attr('type', inputType);
        }
        if (tagName == 'textarea'
            || inputType.search(/text|email|tel|number/) == 0) {
            $element.attr('placeholder', placeholder);
        }
        if (selectOptions) {
            selectOptions.each(function (index, option) {
                var $selectOption = $(document.createElement('option'));
                $selectOption.text(option);
                $element.append($selectOption);
            })
        }
        styleElement($element);
        idCounter++;

        return $element;
    }

    function styleElement($element) {
        var tagName = $element.prop('tagName').toLowerCase(),
            elementType = $element.attr('type');

        if ((tagName == 'input'
                || tagName == 'textarea'
                || tagName == 'select')
                && elementType != 'file'
                && elementType != 'checkbox'
                && elementType != 'radio') {
            $element.addClass('form-control');
        }
        if (tagName == 'button') {
            $element.addClass('btn btn-primary');
        }
    }

    function createRow(options) {
        var $row = $(document.createElement('div')),
            $label,
            $elementWrapper = $(document.createElement('div')),
            $element = createElement(options);

        $row.addClass('form-group');
        if (options.labelText) {
            $label = $(document.createElement('label'));
            $label.addClass('col-sm-3 control-label');
            $label.text(options.labelText);
            if (options.checkboxes || options.radiobuttons) {
                $label.attr('for', 'id-' + idCounter);
            } else {
                $label.attr('for', $element.prop('id'));
            }
            $row.append($label);
            $elementWrapper.addClass('col-sm-9');
        } else {
            $elementWrapper.addClass('col-sm-offset-3 col-sm-9');
        }

        if (options.checkboxes) {
            options.checkboxes.each(function (index, elem) {
                var $checkboxLabel = $(document.createElement('label'));
                $checkboxLabel.addClass('checkbox-inline')
                    .append(createElement(options))
                    .append(document.createTextNode(elem));
                $elementWrapper.append($checkboxLabel);
            })
        } else if (options.radiobuttons) {
            var groupCounter = idCounter;
            options.radiobuttons.each(function (index, elem) {
                var $radioLabel = $(document.createElement('label')),
                    $radiobutton = createElement(options);

                $radiobutton.attr('name', 'radio-group' + groupCounter);
                if (index == 0) {
                    $radiobutton.attr('checked', true);
                }
                $radioLabel.addClass('radio-inline')
                    .append($radiobutton)
                    .append(document.createTextNode(elem));
                $elementWrapper.append($radioLabel);
            })
        } else if (options.controls) {
            options.controls.each(function (index, elem) {
                var $button;
                if (elem != '') {
                    $button = createElement(options);
                    $button.addClass('form__control');
                    $button.addClass((index == 0) ?
                        'form__control-prev pull-left' :
                        'form__control-next pull-right');
                    $button.text(elem);
                    $elementWrapper.append($button);
                }
            })
        } else {
            $elementWrapper.append($element);
        }

        $row.append($elementWrapper);

        return $row;
    }

    function createStep() {
        var $step = $(document.createElement('div'));

        $step.addClass('form__step');
        stepCounter++;
        $step.addClass('form__step-' + stepCounter);

        return $step;
    }

    function getStep() {
        return stepCounter;
    }

    return {
        createElement: createElement,
        createRow: createRow,
        createStep: createStep,
        getStep: getStep
    }
})();




app.FeedbackFormUI = function () {
    var $form = $('#form-generator'),
        $labelInput = $form.find('#label-text'),
        $elementSelect = $form.find('#element-type'),
        $inputPlaceholder = $form.find('#input-placeholder'),
        $addFieldButton = $form.find('#add-field'),
        $addStepButton = $form.find('#add-step'),
        $generateHTMLButton = $form.find('#generate-html'),
        $additionalFields = $form.find('.form-generator__additional-fieds'),
        $selectOptionsBlock = $form.find('.form-generator__select-options'),
        $checkboxesBlock = $form.find('.form-generator__checkboxes'),
        $radiobuttonsBlock = $form.find('.form-generator__radiobuttons'),
        $controlButtonsBlock = $form.find('.form-generator__control-buttons'),
        $backButtonInput = $form.find('.form-generator__back-button'),
        $editButtonsBlock = $('.edit-buttons'),
        $selectOptions,
        $checkboxes,
        $radiobuttons,
        $controls,
        $step = app.FormGenerator.createStep(),
        $generatedForm = $('#form');

    $generatedForm.append($step);

    function serializeField() {
        var selectValue = $elementSelect.val().split('-'),
            tagName = selectValue[0],
            inputType = selectValue[1],
            placeholder = $inputPlaceholder.val(),
            data = {};

        $selectOptions = $additionalFields.find('.form-generator__select-option');
        $checkboxes = $additionalFields.find('.form-generator__checkbox');
        $radiobuttons = $additionalFields.find('.form-generator__radiobutton');
        $controls = $additionalFields.find('.form-generator__control');

        data.labelText = $labelInput.val().trim();
        data.tagName = tagName;
        if (tagName == 'input' || tagName == 'button') {
            data.inputType = inputType;
        }
        data.placeholder = placeholder;
        if (tagName == 'select') {
            data.selectOptions = $selectOptions.map(function () {
                return this.value;
            });
        }
        if (inputType == 'checkbox') {
            data.checkboxes = $checkboxes.map(function () {
                return this.value;
            });
        }
        if (inputType == 'radio') {
            data.radiobuttons = $radiobuttons.map(function () {
                return this.value;
            });
        }
        if (tagName == 'button' && inputType == 'button') {
            data.controls = $controls.map(function (index, elem) {
                return this.value;
            });
        }

        return data;
    }

    function addStep() {
        $step = app.FormGenerator.createStep();
        $generatedForm.append($step);
        resetForm();
    }

    function removeAdditionalFields($fields) {
        $fields.each(function (index, elem) {
            if (index != 0) {
                $(elem).remove();
            }
        })
    }

    function resetForm() {
        $form.trigger('reset');
        $inputPlaceholder.attr('disabled', false);
        $selectOptionsBlock.hide();
        $checkboxesBlock.hide();
        $radiobuttonsBlock.hide();
        $controlButtonsBlock.hide();
    }

    function addField() {
        var options = serializeField();

        $step.append(app.FormGenerator.createRow(options));
        resetForm();
        removeAdditionalFields($selectOptions);
        removeAdditionalFields($checkboxes);
        removeAdditionalFields($radiobuttons);
    }

    function generateHTML() {
        $('pre').text($generatedForm[0].outerHTML.trim());
    }

    function toggleAdditionalField(e) {
        var $target = $(e.currentTarget),
            $parent = $target.parent(),
            $clonedInput;

        e.preventDefault();
        if ($target.hasClass('form-generator__add-element')) {
            $clonedInput = $parent.find('input:last-child').clone();
            $clonedInput.val('');
            $parent.append($clonedInput);
        } else if ($target.hasClass('form-generator__remove-element')) {
            if ($parent.children('input').length > 1) {
                $parent.find('input:last-child').remove();
            }
        }
    }

    function toggleAdditionalFields(e) {
        var option = e.target.value;

        if (option == 'select') {
            $selectOptionsBlock.show();
        } else {
            $selectOptionsBlock.hide();
        }

        if (option == 'input-checkbox') {
            $checkboxesBlock.show();
        } else {
            $checkboxesBlock.hide();
        }

        if (option == 'input-radio') {
            $radiobuttonsBlock.show();
        } else {
            $radiobuttonsBlock.hide();
        }

        if (option == 'button-button') {
            $controlButtonsBlock.show();
            if (app.FormGenerator.getStep() == 1) {
                $backButtonInput.attr('disabled', true);
            } else {
                $backButtonInput.removeAttr('disabled');
            }
        } else {
            $controlButtonsBlock.hide();
        }

        if (option == 'textarea'
            || option.search(/text|email|tel|number/) != -1) {
            $inputPlaceholder.attr('disabled', false);
        } else {
            $inputPlaceholder.attr('disabled', true);
        }
    }

    function moveField($field, direction) {
        if (direction == 'up') {
            $field.insertBefore($field.prev());
        } else if (direction == 'down') {
            $field.insertAfter($field.next());
        }
    }

    function manipulateField(e) {
        var $clickedButton = $(e.currentTarget),
            $parent = $clickedButton.closest('.form-group');

        if ($clickedButton.hasClass('edit-buttons__delete')) {
            $parent.remove();
        } else if ($clickedButton.hasClass('edit-buttons__down')) {
            moveField($parent, 'down');
        } else if ($clickedButton.hasClass('edit-buttons__up')) {
            moveField($parent, 'up');
        }
    }

    $addFieldButton.on('click', addField);
    $addStepButton.on('click', addStep);
    $generateHTMLButton.on('click', generateHTML);
    $elementSelect.on('change', toggleAdditionalFields);
    $additionalFields.on('click', 'button', toggleAdditionalField);
    $(document).on('click', '.edit-buttons button', manipulateField);

    $generatedForm.on('mouseenter', '.form-group', function (e) {
        $(e.currentTarget).append($editButtonsBlock);
        $editButtonsBlock.show();
    }).on('mouseleave', function () {
        $form.append($editButtonsBlock);
        $editButtonsBlock.hide();
    });
};

app.FormManager = (function () {
    var stepCounter = 1,
        $form,
        $steps,
        $conditionalSelects,
        steps;

    function init() {
        $form = $('.form');
        $steps = $('.form__step');
        steps = $steps.length;
        $conditionalSelects = $('.conditional-select');
        showStep(stepCounter);

        $form.on('click', '.form__control', function (e) {
            if ($(e.currentTarget).hasClass('form__control-prev')) {
                prevStep();
            } else if ($(e.currentTarget).hasClass('form__control-next')) {
                if (stepCounter < steps) {
                    nextStep();
                } else {
                    localStorage.setItem('data', JSON.stringify(serializeData()));
                    showMessage('Дякуємо за фідбек!');
                }
            }
        });

        $conditionalSelects.each(function (index, select) {
            showConditionalField(select);
        });

        $conditionalSelects.on('change', function () {
            showConditionalField(this);
        });

        $('.form__popup-close').on('click', function () {
            $('.form__popup').hide();
        });
    }

    function showStep(number) {
        $steps.each(function (index, step) {
            var $step = $(step);
            if (!$step.hasClass('form__step-' + number)) {
                $step.hide();
            } else {
                $step.show();
            }
        })
    }

    function nextStep() {
        if (stepCounter < steps) {
            stepCounter++;
            showStep(stepCounter);
        }
    }

    function prevStep() {
        if (stepCounter > 1) {
            stepCounter--;
            showStep(stepCounter);
        }
    }

    function showConditionalField(select) {
        var $select = $(select);
        $select.children().each(function (index, option) {
            var optionValue = $(option).val(),
                $elem = $('[name="' + optionValue + '"]');
            if (optionValue != $select.val()) {
                $elem.closest('.form-group').hide();
                $elem.removeClass('visible').addClass('hidden');
            } else {
                $elem.closest('.form-group').show();
                $elem.addClass('visible').removeClass('hidden');
            }
        });
    }

    function showMessage(message) {
        $('.form__popup-message').text(message);
        $('.form__popup').show();
    }

    function serializeData() {
        var data = {},
            $inputs = $form.find('input, textarea').not('.hidden'),
            $selects = $form.find('select').not('.hidden');

        $inputs.serialize().split('&').forEach(function (elem) {
            var params = elem.split('=');
            data[params[0]] = params[1];
        });
        $selects.each(function (index, elem) {
            var $elem = $(elem);
            if ($elem.hasClass('conditional-select')) {
                data[$elem.attr('name')] = $elem.find(':checked').text();
            } else {
                data[$elem.attr('name')] = $elem.val();
            }
        });

        return data;
    }

    return {
        init: init,
        nextStep: nextStep,
        prevStep: prevStep,
        serializeData: serializeData
    }
})();
