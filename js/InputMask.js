/*
InputMask - Client side Javascript Form Validation.
Copyright (C) 2009 by Gregory J Lamoree

This file is part of the Web Application Toolkit. 

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/*
    Implementing client side validation/field masking in two steps:
        1. Include this file (InputMask.js) in your header
            <head>
                ...
                <script src='InputMask.js' language='javascript' ></script>
                ...
            </head>
        2. Add a 'mask' attribute to your input element
            <input type='text' name='datefield' value='' mask='90/90/9999' />
            
        Optionally you can also add the following attributes:
            * maskname - The text in this attribute will replace the field's
                actual name in error messages.
            * maskerror - The text in this attribute will replace the
                system generated error text. This is not valid for mask-macros.
                
        Masks can be made up of the folling command characters:
            A - Required Alphabetic character (A-Za-z)
            a - Optional Alphabetic character (A-Za-z)
            C - Required Character of any kind
            c - Optional Character of any kind
            9 - Required digit (0-9)
            0 - Optional digit (0-9)
        Any other characters will act as literals and will be inserted
        into the field, by the system, automatically, as the user types.
        If you wish to use one of the command characters as a literal,
        preceede it with a backslash (\).
        
        Instead of using the positional command characters listed above,
        you can use the following mask-macros wich will effect the entire
        field:
            [numeric]       - All characters must be a digit (0-9)
                              The number entered can also be preceded by a
                              negative sign.
                              This macro can also take two parameters:
                                [numeric {min} {max}]
                              If used, they will define the minimum and maximum
                              numbers allowed in the field. i.e. [numeric 10 100]
                              means the number entered must be between ten and
                              one hundred.
            [alphabetic]  - All characters must be alphanumeric (A-Za-z)
                              This macro can also take two parameters:
                                [alphabetic {min} {max}]
                              If used, they will define the minimum and maximum
                              length allowed in the field. i.e. [alphanumeric 10 100]
                              means the text entered must be between ten and
                              one hundred letters long.
            
            [alphanumeric]  - All characters must be alphanumeric (A-Za-z0-9)
                              This macro can also take two parameters:
                                [alphanumeric {min} {max}]
                              If used, they will define the minimum and maximum
                              length allowed in the field. i.e. [alphanumeric 10 100]
                              means the text entered must be between ten and
                              one hundred characters long.
            
            [word]          - All characters must be alphanumeric (A-Za-z0-9),
                              a space ( ) or a dash (-). The intent is to allow
                              normal words without any symbols.
                              This macro can also take two parameters:
                                [word {min} {max}]
                              If used, they will define the minimum and maximum
                              length allowed in the field. i.e. [word 10 100]
                              means the text entered must be between ten and
                              one hundred characters long.
            [character]     - Any character may be entered into this field.                  
                              This macro can also take two parameters:
                                [character {min} {max}]
                              If used, they will define the minimum and maximum
                              length allowed in the field. i.e. [character 10 100]
                              means the text entered must be between ten and
                              one hundred characters long.
            [html]          - Any html may be entered into this field.                  
                              This macro can also take four parameters:
                                [html {height} {width} {min} {max}]
                              If used, they will define the height, width, minimum and maximum
                              for the height and width of as well as the
                              length allowed in the field. i.e. [html 400px 200px 10 1000]
                              means the html entered will be displayed in an area
                              400px high by 200px wide and must be between ten and
                              one thousand characters long.
            [date]          - Entry must be a valid date.
                              This macro requires a parameter specifying the
                              proper format of the date. Valid options are:
                                [date yyyy-mm-dd]
                                [date yyyy/mm/dd]
                                [date mm/dd/yyyy]
                                [date dd-mm-yyyy]
                                [date dd/mm/yyyy]
                              
            ********* Future Tags *********
            [email]         - Only a valid email address may be entered into this field.                  
                              This macro can also take two parameters:
                                [email {min} {max}]
                              If used, they will define the minimum and maximum
                              length allowed in the field. i.e. [email 10 100]
                              means the text entered must be between ten and
                              one hundred characters long.
                              
        All masks (standard and macro) can also be preceeded with the following
        modifier:
            [required] -       This modifier will require data to be enter into the
                               field before the form is allowed to be submitted. 
                               i.e. mask='[required]90/90/9999' 

        All masks (standard and macro) can also be succeeded with the following
        modifiers: // These might not work outside of teh WebAppToolkit 
            [default value]  - On Load, if the value of the field is empty,
                               trimmed for spaces, the value specified as the value
                               parameter will be entered into the field.
                               If the value is in braces {}, it will be evaluated
                               as javascript;
            
            [calc value]     - When any field on the form is changed, the value 
                               specified as the value parameter will be entered
                               into the field. If the value is in braces {},
                               it will be evaluated as javascript;
            
            
*/

function RMIMaddLoadEvent(func) { 
  var oldonload = window.onload; 
  if (typeof window.onload != 'function') { 
    window.onload = func; 
  } else { 
    window.onload = function() { 
      if (oldonload) { 
        oldonload(); 
      } 
      func(); 
    } 
  } 
} 

function RMIMgetcssvalue(theClass,element) {
    var cssRules;
    var value = "";
    
    var added;
    for (var S = 0; S < document.styleSheets.length; S++){
        cssRules = null;
        added = false;
        try {
            if (document.styleSheets[S].rules) {
                cssRules = document.styleSheets[S].rules;
            } else if (document.styleSheets[S].cssRules) {
                cssRules = document.styleSheets[S].cssRules;
            } else {
                //no rules found... or browser unknown
            }
            if(cssRules) {
                for (var R = 0; R < cssRules.length; R++) {
                    if (" "+cssRules[R].selectorText.toLowerCase().replace(","," ").replace("{"," ").indexOf(theClass.toLowerCase()) != -1) {
                        if(cssRules[R].style[element]){
                            value = cssRules[R].style[element];
                            //break;
                        }
                    }
                }
            }
        } catch(e) {}
    }
    return value;
}


function RMIMcheckForPaste(event) {
    var e = event.element();
    if ((e.previousValue && e.value.length > e.previousValue.length + 1) ||
        (!e.previousValue && e.value.length > 1)) { 
      if (e.onpaste) {
        e.onpaste(e)
      } else if (e.readAttribute("onpaste")) {
        eval(e.readAttribute("onpaste"));
      }
    }
      e.previousValue = e.value;
    }
    
    function RMIMfirefoxOnPaste() {
    $$('textarea').each(function(e) { 
      if (e.onpaste || e.readAttribute("onpaste")) {
        Event.observe(e,'input',RMIMcheckForPaste);
      }
    });
}
    
  
function RMIMstopEvent(e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;

    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
}

function RMIMgetSelectionStart(o) {
    if (o.createTextRange) {
        var r = document.selection.createRange().duplicate()
        r.moveEnd('character', o.value.length)
        if (r.text == '') return o.value.length
        return o.value.lastIndexOf(r.text)
    } else {
        return o.selectionStart;
    }
}

function xRMIMgetSelectionStart(o) {
    if (o.selectionStart || oField.selectionStart == '0') {
        return o.selectionStart;
    } else {
        var r = document.selection.createRange().duplicate()
        r.moveEnd('character', o.value.length)
        if (r.text == '') return o.value.length
        return o.value.lastIndexOf(r.text)
    }
}

function RMIMgetSelectionEnd(o) {
    if (o.createTextRange) {
        var r = document.selection.createRange().duplicate()
        r.moveStart('character', -o.value.length)
        return r.text.length
    } else return o.selectionEnd
}

function xRMIMsetCaretPosition(elem, caretPos) {
    if(elem != null) {
        if(elem.createTextRange) { // IE
            elem.focus();
            var range = elem.createTextRange();
            range.moveStart('character', 0);
            range.moveEnd('character', 0);
            range.move('character', caretPos);
            range.select();
        } else {
            if(elem.selectionStart) {
                //elem.blur();
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            } else {
                elem.focus();
            }
        }
    }
}

function RMIMsetCaretPosition(ctrl, pos)
{
    if(ctrl.setSelectionRange)
    {
        ctrl.focus();
        ctrl.setSelectionRange(pos,pos);
    }
    else if (ctrl.createTextRange)
    {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
}

function RMIMfixAndroidCaretPosition(e) {
    var evt=window.event || e;
    var theObject;
    if (evt.propertyName === undefined) {
        theObject = evt.currentTarget;
    } else {  // Internet Explorer
        theObject = evt.srcElement;
    }

    //alert(evt.type);
    var keycode = 0;
    
    if(window.event) // IE
    {            
        keycode = evt.keyCode;
    }
    else if(e.which)
    {
        keycode = evt.which;
    }
    if (keycode == 8 || (keycode >= 33 && keycode <= 46) || evt.type == 'mouseup' ) {
        theObject.setAttribute('maskcaret',RMIMgetSelectionStart(theObject));
    }
    return true;
}

function RMIMOnPropModified(e) {
    var evt=window.event || e;
    var theObject;
    if (IMDestroyCalendar == true) {
        document.getElementById("IMCalendar").style.display = "none";
    }
    //alert("Hello");
    if (evt.propertyName === undefined) {
        theObject = evt.currentTarget;
    } else {  // Internet Explorer
        theObject = evt.srcElement;
    }
    //alert(theObject.getAttribute('oldbackground'));
    if(theObject.getAttribute('oldbackground') == '' || theObject.getAttribute('oldbackground') == null) {
        //theObject.setAttribute('oldbackground', theObject.style.backgroundColor);
    }

    if (evt.charCode == '13') {
        if (typeof SubmitForm == 'function') {
            SubmitForm(theObject.form, theObject.form.getAttribute('submitto'), theObject.form.getAttribute('submitvalue'));
        } else {
            theObject.form.submit();
        }
        return false;
    }

    try {
        if(!(theObject.getAttribute('processing') == 'TRUE')) {
            theObject.setAttribute('processing','TRUE');
            
            if (theObject.type=='text') {
                
                var theMask = theObject.getAttribute('mask');
                var theValue = theObject.value.toString();
                
                if(evt.type != 'blur' && evt.type != 'onblur' && evt.type != 'paste' && evt.type != 'onpaste') {
                    if(window.event) // IE
                    {            
                        var tmpValue = theValue.substr(0,theObject.getAttribute('maskcaret'))+String.fromCharCode(evt.keyCode)+theValue.substr(theObject.getAttribute('maskcaret'));
                        //document.getElementById('count').value += String.fromCharCode(evt.keyCode);
                    }
                    else if(e.which && evt.which !=8) // Netscape/Firefox/Opera
                    {
                        var tmpValue = theValue.substr(0,theObject.getAttribute('maskcaret'))+String.fromCharCode(evt.which)+theValue.substr(theObject.getAttribute('maskcaret'));
                        //document.getElementById('count').value += String.fromCharCode(evt.which);
                    } else {
                        theObject.setAttribute('processing', 'FALSE');
                        RMIMsetCalc(theObject.form);
                        return true;
                    }
                    theValue = tmpValue;
                }
                
                //document.getElementById('count').value = RMIMgetSelectionStart(theObject);
                //document.getElementById('count').value = theValue + ", " + theObject.value;
                var oldValue = theObject.value;
                
                // Remove Literal (non-entered) characters from theValue
                //if(oldValue.length > theValue.length || (RMIMgetSelectionStart(theObject) < theValue.length && evt.type != 'blur')) {
                /*
                    var theLiterals = theMask.replace(/[09aAcC]/g,"");
                    for(i=0;i<theLiterals.length;i++) {
                        theValue = theValue.replace(theLiterals.substr(i,1),"");
                    }
                */
                //}

                                
                var newValue = "";
                var validLength = 0;
                var oldLiterals = (theObject.value.toString().length - theValue.length);
                var newLiterals = 0;
                
                var valuePosition = 0;
                var maskPosition = 0;
                var escapeChar = "\\";
                var maskChar = "";
                var theChar = "";
                var resolved = "";
                var isError  = "";
                
                var cursorPosition = theObject.getAttribute('maskcaret') - oldLiterals;
                
                if(theMask) {
                    //alert(theValue);
                    //document.getElementById('count').value = theValue;
                    for(valuePosition=0; valuePosition < theValue.length; valuePosition++) {
                        //document.getElementById('count').value=valuePosition + ", " + theValue.length;
                        theChar  = theValue.substr(valuePosition,1);
                        resolved = false;
                        isError  = false;
                        maskLoop: for(; maskPosition < theMask.length; maskPosition++) {
                            maskChar = theMask.substr(maskPosition,1);
                            //document.getElementById('count').value += "|" + maskPosition + "(" + maskChar + ")" + ", " + valuePosition + "(" + theChar + ")";
                            if (maskChar == escapeChar && maskPosition < (theMask.length - 1)) {
                                maskPosition++;
                                maskChar = theMask.substr(maskPosition,1);
                                if(theChar == maskChar) { // Literal Character
                                    //alert("Literal Match");
                                    resolved = true;
                                } else {
                                    // Not sure why I have this or if I need it
                                    //document.getElementById('count').value = "one";
                                    newValue += maskChar.toString();
                                    newLiterals++;
                                }
                            } else {
                                //document.getElementById('count').value += "|" + theChar + ", " + maskChar;
                                switch(maskChar)
                                {
                                    case '0':
                                        //alert("Optional Number");
                                        if(!isNaN(parseInt(theChar))) {
                                            resolved = true;
                                            validLength = valuePosition;
                                        }
                                        break;
                                    case '9':
                                        //alert("Required Number");
                                        if(!isNaN(parseInt(theChar))) {
                                            resolved = true;
                                            validLength = valuePosition;
                                        } else {
                                            isError = true;
                                        }
                                        break;
                                    case 'a':
                                        //alert("Optional Alpha");
                                        if(isNaN(theChar)) {
                                            resolved = true;
                                            validLength = valuePosition;
                                        }
                                        break;
                                    case 'A':
                                        //alert("Required Alpha");
                                        if(isNaN(theChar)) {
                                            resolved = true;
                                            validLength = valuePosition;
                                        } else {
                                            isError = true;
                                        }
                                        break;
                                    case 'c':
                                        //alert("Optional Character");
                                        resolved = true;
                                        validLength = valuePosition;
                                        break;
                                    case 'C':
                                        //alert("Required Character");
                                        resolved = true;
                                        validLength = valuePosition;
                                        break;
                                    default:
                                        if(theChar == maskChar) { // Literal Character
                                            //alert("Literal Match");
                                            resolved = true;
                                        } else {
                                            // Not sure why I have this or if I need it
                                            //document.getElementById('count').value = "two";
                                            newValue += maskChar.toString();
                                            newLiterals++;
                                            
                                        }
                                        break;
                                }
                            }
                            if(resolved || isError) {
                                //document.getElementById('count').value += "b";
                                maskPosition++
                                break maskLoop;
                            }
                        }
                        if(!resolved) {
                            isError = true;
                        }
                        if(isError) {
                            theObject.value = newValue;
                            break;
                        } else {
                            newValue += theChar.toString();
                        }
                        
                    }
                    
                    if(evt.type=='blur' || evt.type=='onblur') {
                        newValue = newValue.substr(0,validLength + 1);
                    }
                    
                    if(oldValue.length < newValue.length && newValue.length > 0 && theMask.substr(maskPosition).search(/[9AC]/g) >= 0 && theMask.substr(maskPosition,1).search(/[09aAcC]/) == -1) {
                        for(; maskPosition < theMask.length; maskPosition++) {
                            if (theMask.substr(maskPosition,1) == escapeChar) {
                                maskPosition++;
                                newValue += theMask.substr(maskPosition,1);
                                //document.getElementById('count').value = "three";
                                newLiterals++;                                        
                            } else if (theMask.substr(maskPosition,1).search(/[09aAcC]/) == -1) {
                                newValue += theMask.substr(maskPosition,1);
                                //document.getElementById('count').value = "four";
                                newLiterals++;
                            } else {
                                maskPosition++;
                                break;
                            }
                        }
                    }
                    
                    if(newValue.length > 0 && (evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste') && theMask.substr(maskPosition).search(/[9AC]/g) >= 0) {
                        theObject.style.backgroundColor="#E77471";
                        theObject.setAttribute('error',theObject.getAttribute('maskerror'));
                        
                    } else if((evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste') && (theObject.getAttribute('maskrequired') && (theValue.length < 1))) {
                        theObject.style.backgroundColor="#E77471";
                        theObject.setAttribute('error',"is required.");
                    } else {
                        //theObject.style.backgroundColor = "#111111";
                        var oldBackgroundColor = theObject.getAttribute('oldbackground');
                        //alert(oldBackgroundColor);
                        //if (oldBackgroundColor == "") {
                        //    oldBackgroundColor = "";
                        //}
                        theObject.style.backgroundColor = oldBackgroundColor;
                        //alert("xx1");
                        //theObject.setAttribute('oldbackground', '');
                        theObject.setAttribute('error','');
                    }
                    
                    theObject.value = newValue;
                    theObject.setAttribute('oldvalue',newValue);
                    if((evt.type != 'blur' && evt.type != 'onblur' && evt.type != 'paste' && evt.type != 'onpaste')) {
                        cursorPosition += newLiterals;
                        if (newLiterals < oldLiterals) {
                            cursorPosition += oldLiterals - newLiterals;
                        }
                        //document.getElementById('count').value=cursorPosition;
                        //RMIMsetCaretPosition(theObject, 2);
                        RMIMsetCaretPosition(theObject, cursorPosition);
                        //document.getElementById('count').value = cursorPosition + ", " + RMIMgetSelectionStart(theObject);
                    }
                    if (theObject.getAttribute('maskdate') == "true" && (evt.type == 'blur' || evt.type == 'onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                        theValue = theObject.value;
                    }
                }
                if (!theMask || (theObject.getAttribute('maskdate') == "true" && (evt.type == 'blur' || evt.type == 'onblur' || evt.type == 'paste' || evt.type == 'onpaste'))) {
                    //var errorMessage = "";
                    var theReturn = true;
                    theObject.style.backgroundColor = theObject.getAttribute('oldbackground');
                    //alert("xx2");
                        //theObject.setAttribute('oldbackground', '');
                        theObject.setAttribute('error','');
                    
                    if(evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste') {
                        if(theObject.getAttribute('maskrequired') && (theValue.replace(/^\s+|\s+$/g,"").length < 1)) {
                            //errorMessage += "    " + theObject.getAttribute('maskname') + " is required.\r\n\r\n";
                            theObject.setAttribute('error',"is required.");
                            
                        }
                    }
                    
                    if(theObject.getAttribute('masknumeric') == "true") {
                        if(isNaN(theValue)) {
                            if((theValue.length == 1 && theValue == "-" && !(evt.type=='blur' || evt.type=='onblur'))) {
                            } else {
                                theObject.setAttribute('error',"must be numeric.");
                            }
                        }
                        if(!isNaN(theValue) && theValue.length > 0) {
                            if(theObject.getAttribute('maskmin')) {
                                if(parseFloat(theValue) < parseFloat(theObject.getAttribute('maskmin')) && (evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error',"must greater than or equal to " + theObject.getAttribute('maskmin'));
                                }
                            }
                            if(theObject.getAttribute('maskmax')) {
                                if(parseFloat(theValue) > parseFloat(theObject.getAttribute('maskmax'))){// && (evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error',"must less than or equal to " + theObject.getAttribute('maskmax'));
                                }
                            }
                        }
                    }
                    
                    if(theObject.getAttribute('maskalphabetic') == "true") {
                        if(theValue.length > 0 && theValue.search(/[^a-zA-Z]/g) != -1 )
                        {
                            theObject.setAttribute('error',"must contain only letters (a-z).");
                        }
                        
                        if(theValue.length > 0 && theValue.search(/[^a-zA-Z]/g) == -1) {
                            if(theObject.getAttribute('maskminlength')) {
                                if(theValue.length < parseInt(theObject.getAttribute('maskminlength')) && (evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error',"must have at least " + theObject.getAttribute('maskminlength') + " letters.");
                                }
                            }
                            if(theObject.getAttribute('maskmaxlength')) {
                                if(theValue.length > parseInt(theObject.getAttribute('maskmaxlength'))){// && (evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error',"must have no more than " + theObject.getAttribute('maskmaxlength') + " letters.");
                                }
                            }
                        }
                    }
                    
                    if(theObject.getAttribute('maskalphanumeric') == "true") {
                        if(theValue.length > 0 && theValue.search(/[^a-zA-Z0-9]/g) != -1 )
                        {
                            theObject.setAttribute('error',"must contain only numbers or letters (a-z 0-9).");
                        }
                        
                        if(theValue.length > 0 && theValue.search(/[^a-zA-Z0-9]/g) == -1) {
                            if(theObject.getAttribute('maskminlength')) {
                                if(theValue.length < parseInt(theObject.getAttribute('maskminlength')) && (evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error',"must have at least " + theObject.getAttribute('maskminlength') + " characters.");
                                }
                            }
                            if(theObject.getAttribute('maskmaxlength')) {
                                if(theValue.length > parseInt(theObject.getAttribute('maskmaxlength'))){// && (evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error',"must have no more than " + theObject.getAttribute('maskmaxlength') + " characters.");
                                }
                            }
                        }
                    }
                    
                    if(theObject.getAttribute('maskword') == "true") {
                        if(theValue.length > 0 && theValue.search(/[^a-zA-Z0-9\s\-]/g) != -1 )
                        {
                            theObject.setAttribute('error',"must contain only numbers, letters, spaces and hyphens (a-z 0-9 -  ).");
                        }
                        
                        if(theValue.length > 0 && theValue.search(/[^a-zA-Z0-9\s\-]/g) == -1) {
                            if(theObject.getAttribute('maskminlength')) {
                                if(theValue.length < parseInt(theObject.getAttribute('maskminlength')) && (evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error',"must have at least " + theObject.getAttribute('maskminlength') + " characters.");
                                }
                            }
                            if(theObject.getAttribute('maskmaxlength')) {
                                if(theValue.length > parseInt(theObject.getAttribute('maskmaxlength'))){// && (evt.type=='blur' || evt.type=='onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error',"must have no more than " + theObject.getAttribute('maskmaxlength') + " characters.");
                                }
                            }
                        }
                    }

                    if (theObject.getAttribute('maskcharacter') == "true") {
                        if (theValue.length > 0) {
                            if (theObject.getAttribute('maskminlength')) {
                                if (theValue.length < parseInt(theObject.getAttribute('maskminlength')) && (evt.type == 'blur' || evt.type == 'onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error', "must have at least " + theObject.getAttribute('maskminlength') + " characters.");
                                }
                            }
                            if (theObject.getAttribute('maskmaxlength')) {
                                if (theValue.length > parseInt(theObject.getAttribute('maskmaxlength'))){// && (evt.type == 'blur' || evt.type == 'onblur' || evt.type == 'paste' || evt.type == 'onpaste')) {
                                    theObject.setAttribute('error', "must have no more than " + theObject.getAttribute('maskmaxlength') + " characters.");
                                }
                            }
                        }
                    }

                    if (theObject.getAttribute('maskdate') == "true") {
                        if (theValue.length > 0) {
                            var dateFormat = theObject.getAttribute('dateformat');
                            switch (dateFormat) {
                                case "yyyy-mm-dd":
                                case "yyyy/mm/dd":
                                    if (!theValue.match("^(19|20)\d\d([- /.])(0[1-9]|1[012])\2(0[1-9]|[12][0-9]|3[01])$")) {
                                        theObject.setAttribute('error', "must be a valid formatted date: " + dateFormat + ".");
                                    }
                                    break;
                                case "mm/dd/yyyy":
                                    if (!theValue.match(/^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/)) {
                                        theObject.setAttribute('error', "must be a valid formatted date: " + dateFormat + ".");
                                    }
                                    break;
                                case "dd-mm-yyyy":
                                case "dd/mm/yyyy":
                                    if (!theValue.match("^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])\2(19|20)\d\d$")) {
                                        theObject.setAttribute('error', "must be a valid formatted date: " + dateFormat + ".");
                                    }
                                    break;
                            }
                            
                            if (isNaN(Date.parse(theValue))) {
                                theObject.setAttribute('error', "must be a valid formatted date: " + dateFormat + ".");
                            }
                        }
                    }

                    if (theObject.getAttribute('error') != "") {
                        if (evt.type == 'blur' || evt.type == 'onblur' || evt.type == 'paste' || evt.type == 'onpaste') {
                            theObject.style.backgroundColor = "#E77471";
                        }
                        theReturn = false;
                    } else {
                        theObject.style.backgroundColor = theObject.getAttribute('oldbackground');
                        //theObject.setAttribute('oldbackground', '');
                    }
                    
                    try {
                        theObject.setAttribute('processing','FALSE');
                    } catch(e){}

                    if (theReturn) {
                        RMIMsetCalc(theObject.form);
                    }

                    return theReturn;
                }
            }
        }
    } catch(e){
        //alert(e.description);
    }
    
    try {
        theObject.setAttribute('processing','FALSE');
    } catch(e){}

    theObject.setAttribute('maskcaret', RMIMgetSelectionStart(theObject));
    RMIMsetCalc(theObject.form);
    return false;
}

function RMIMcheckForm(theForm) {
    var errorMessage = "";
    RMIMsetCalc(theForm);
    for (var i = 0; i < theForm.length; i++) {
        try {
            if (!(theForm[i].getAttribute('error') == '' || theForm[i].getAttribute('error') == null)) {
                errorMessage += "    " + theForm[i].getAttribute('maskname') + ": " + theForm[i].getAttribute('error') + "\r\n\r\n";
            } else if (theForm[i].getAttribute('maskrequired') && (!theForm[i].value.replace(/^\s+|\s+$/g, "").length > 0)) {
                errorMessage += "    " + theForm[i].getAttribute('maskname') + " is required.\r\n\r\n";
            }
        } catch (e) {
            //alert(e);
        }
    }
    if(errorMessage != "") {
        alert("Please correct the following fields:\r\n\r\n" + errorMessage + " ");
        return false;
    } else {
        return true;
    }
}


function RMIMsetMasks(theElement) {
    for (var i = 0; i < theElement.childNodes.length; i++) {
        RMIMsetMasks(theElement.childNodes[i]);
    }
    try {
        //if (theElement.getAttribute('mask') && theElement.type == 'text') {
        //if (theElement.getAttribute('mask')) {
        if (typeof theElement.value != "undefined") {
            theElement.setAttribute('maskset', 'y');
            theElement.setAttribute('oldbackground', RMIMgetStyle(theElement, "background-color"));
            theElement.onpaste = function() {return false};
            theElement.onblur = function(event) {RMIMOnPropModified(event)};
            theElement.onkeypress = function(event) {return RMIMOnPropModified(event)};
            theElement.onmouseup = function (event) {return RMIMfixAndroidCaretPosition(event);};
            theElement.setAttribute('oldvalue',theElement.value);
            if(!(theElement.getAttribute('maskname'))) theElement.setAttribute('maskname',theElement.name);
            if(!(theElement.getAttribute('maskname'))) theElement.setAttribute('maskname',theElement.id);
            if(theElement.getAttribute('mask').toUpperCase().indexOf("[REQUIRED]") > -1) {
                theElement.setAttribute('maskrequired','true');
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/\[required\]/i, ""));
                //theElement.style.border='solid 2px #000000';
            }

            if (theElement.getAttribute('mask').search(/.*\[default.*\]/i) > -1) {
                var parms = theElement.getAttribute('mask').match((/(.*)\[default\s+(.*)\](.*)/i));
                var theRest = "";
                if (parms) {
                    if (theElement.value.trim() == "") {
                        var defaultData = parms[2];
                        theElement.setAttribute("maskdefault", defaultData);
                    }
                    theRest = parms[1] + parms[3];
                }
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/.*\[default.*\].*/i, theRest));
            }

            if (theElement.getAttribute('mask').search(/.*\[calc.*\]/i) > -1) {
                var parms = theElement.getAttribute('mask').match((/(.*)\[calc\s+(.*)\](.*)/i));
                var theRest = "";
                if (parms) {
                    if (theElement.value.trim() == "") {
                        var calcData = parms[2];
                        theElement.setAttribute("maskcalc", calcData);
                    }
                    theRest = parms[1] + parms[3];
                }
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/.*\[calc.*\].*/i, theRest));
            }


            if (theElement.getAttribute('mask').search(/\[numeric.*\]/i) > -1) {
                theElement.setAttribute('masknumeric', 'true');

                var parms = theElement.getAttribute('mask').match((/.*\[numeric\s+(\d+)\s+(\d+).*\]/i));
                if (parms) {
                    var min = parms[1];
                    var max = parms[2];

                    if (min.length > 0 && max.length > 0) {
                        theElement.setAttribute('maskmin', min);
                        theElement.setAttribute('maskmax', max);
                    }
                }
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/\[numeric.*\]/i, ""));
            }

            if (theElement.getAttribute('mask').search(/\[html.*\]/i) > -1) {
                theElement.setAttribute('maskhtml', 'true');
                theElement.setAttribute('type', 'hidden');

                var parms = theElement.getAttribute('mask').match((/.*\[html\s+(\d+)\s+(\d+).*\]/i));
                if (parms) {
                    var min = parms[1];
                    var max = parms[2];

                    //if (height.length > 0 && width.length > 0) {
                        var htmlElement = document.createElement("span");
                        htmlElement.setAttribute('valuefieldid', theElement.id);
                        htmlElement.innerHTML = theElement.value;
                        htmlElement.onpaste = function () { return false };
                        htmlElement.onblur = function (event) {
                            var evt = window.event || event;
                            var theObject;
                            if (evt.propertyName === undefined) {
                                theObject = evt.currentTarget;
                            } else {
                                theObject = evt.srcElement;
                            }
                            var valueElement = document.getElementById(theObject.getAttribute("valuefieldid"));
                            valueElement.value = theObject.innerHTML;
                            valueElement.onblur();
                        };
                        htmlElement.onkeypress = htmlElement.onblur;
                        theElement.parentNode.insertBefore(htmlElement, theElement);
                    //}
                    if (min.length > 0 && max.length > 0) {
                        theElement.setAttribute('maskmin', min);
                        theElement.setAttribute('maskmax', max);
                    }
                }
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/\[html.*\]/i, ""));
            }

            if (theElement.getAttribute('mask').search(/\[alphabetic.*\]/i) > -1) {
                theElement.setAttribute('maskalphabetic','true');
                
                var parms = theElement.getAttribute('mask').match((/.*\[alphabetic\s+(\d*)\s*(\d*).*\]/i));
                if(parms) {
                    var min = parms[1];
                    var max = parms[2];
                    
                    if(min.length > 0) {
                        theElement.setAttribute('maskminlength',min);
                    }
                    if(max.length > 0) {
                        theElement.setAttribute('maskmaxlength',max);
                    }
                }
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/\[alphabetic.*\]/i, ""));
            }
            
            if(theElement.getAttribute('mask').search(/\[alphanumeric.*\]/i) > -1) {
                theElement.setAttribute('maskalphanumeric','true');
                
                var parms = theElement.getAttribute('mask').match((/.*\[alphanumeric\s+(\d*)\s*(\d*).*\]/i));
                if(parms) {
                    var min = parms[1];
                    var max = parms[2];
                    
                    if(min.length > 0) {
                        theElement.setAttribute('maskminlength',min);
                    }
                    if(max.length > 0) {
                        theElement.setAttribute('maskmaxlength',max);
                    }
                }
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/\[alphanumeric.*\]/i, ""));
            }
            
            if(theElement.getAttribute('mask').search(/\[word.*\]/i) > -1) {
                theElement.setAttribute('maskword','true');
                
                var parms = theElement.getAttribute('mask').match((/.*\[word\s+(\d*)\s*(\d*).*\]/i));
                if(parms) {
                    var min = parms[1];
                    var max = parms[2];
                    
                    if(min.length > 0) {
                        theElement.setAttribute('maskminlength',min);
                    }
                    if(max.length > 0) {
                        theElement.setAttribute('maskmaxlength',max);
                    }
                }
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/\[word.*\]/i, ""));
            }
            
            if(theElement.getAttribute('mask').search(/\[character.*\]/i) > -1) {
                theElement.setAttribute('maskcharacter','true');
                
                var parms = theElement.getAttribute('mask').match((/.*\[character\s+(\d*)\s*(\d*).*\]/i));
                if(parms) {
                    var min = parms[1];
                    var max = parms[2];
                    
                    if(min.length > 0) {
                        theElement.setAttribute('maskminlength',min);
                    }
                    if(max.length > 0) {
                        theElement.setAttribute('maskmaxlength',max);
                    }
                }
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/\[character.*\]/i, ""));
            }

            if (theElement.getAttribute('mask').search(/\[date.*\]/i) > -1) {
                theElement.setAttribute('maskdate', 'true');

                var parms = theElement.getAttribute('mask').match((/.*\[date\s+(.*)\]/i));
                if (parms) {
                    var dateformat = parms[1].trim();

                    theElement.setAttribute('dateformat', dateformat);
                }
                var replaceMask = dateformat.replace(/mm/ig, "90");
                replaceMask = replaceMask.replace(/dd/ig, "90");
                replaceMask = replaceMask.replace(/yyyy/ig, "9999");
                theElement.setAttribute('mask', theElement.getAttribute('mask').replace(/\[date.*\]/i, replaceMask));
                //var cal = new Epoch('epoch_popup', 'popup', theElement);
                theElement.onfocus = function () { show_calendar(this); }
                //theElement.onblur = function () { document.getElementById("IMCalendar").style.display = "none"; }
            }


            if ((!(theElement.getAttribute('maskerror')) && theElement.getAttribute('mask')) && !theElement.getAttribute('dateformat')) {
                theElement.setAttribute('maskerror', 'Please use the format: ' + theElement.getAttribute('mask') + ".");
            }
            
            //if (!theElement.getAttribute('size')) { // Doesn't work in IE so I took it out.
            if(theElement.getAttribute('mask')) {
                var tmpSize = (theElement.getAttribute('mask').length * .95);
                //alert(tmpSize);
                if (tmpSize <= 2) tmpSize = 2;
                theElement.size = tmpSize;
            }
            if(theElement.getAttribute('maskmax')) {
                theElement.size = (theElement.getAttribute('maskmax').length * .75) + 1;
            }
            if(theElement.getAttribute('maskmaxlength')) {
                theElement.size = (theElement.getAttribute('maskmaxlength') * .75) + 1;
            }
            
            var tmpSize = "";
            if(window.innerWidth) {
                tmpSize = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight);
            } else {
                tmpSize = (document.body.offsetWidth < document.body.offsetHeight ? document.body.offsetWidth : document.body.offsetHeight);
            }
            //alert(tmpSize);
            tmpSize = 480 < tmpSize ? 480 : tmpSize;
            
            //var tmpFontSize = parseInt(RMIMgetcssvalue(".field-text","font-size"));
            var tmpFontSize = parseInt(RMIMgetElementStyle(theElement, "font-size"));
            if(isNaN(tmpFontSize)) {
                tmpFontSize = parseInt(RMIMgetElementStyle("body","font-size"));
            }
            //alert(tmpFontSize);
            //alert("tmpFontSize " + parseInt(RMIMgetcssvalue(".field-text","font-size")));
            var sizeValue = tmpSize  / tmpFontSize * 1.5;
            //alert(sizeValue);
            if (isNaN(sizeValue)) {
                theElement.size = 38;
            } else if (theElement.size > sizeValue) {
                //theElement.size = 38;
                theElement.size = sizeValue;
            }
            //}
            
            if (!theElement.form.getAttribute('maskdone')) {
                theElement.form.setAttribute('maskdone','yes');
                var onsubmit = theElement.form.onsubmit;
                if (typeof theElement.form.onsubmit != 'function') {
                    theElement.form.onsubmit = function(){return RMIMcheckForm(theElement.form)};
                } else {
                    theElement.form.onsubmit = function() { 
                      var theReturn;
                      if (onsubmit) { 
                          theReturn = onsubmit();
                          if (theReturn === false) {
                              return false;
                          }
                      }
                      return RMIMcheckForm(theElement.form);
                    } 
                }
            }
      } 
      if (theElement.getAttribute('maskset')) {
          theElement.style.backgroundColor = theElement.getAttribute('oldbackground');
          //theElement.setAttribute('oldbackground', '');
          theElement.setAttribute('error', '');
          theElement.setAttribute('processing', 'FALSE');
          RMIMsetDefault(theElement);

      }
  } catch (e) {
        //alert(e.description);
    }
}

function RMIMsetDefault(theElement) {
    if (theElement.getAttribute('maskdefault')) {
        var defaultData = theElement.getAttribute('maskdefault');
        var defaultValue = "";
        if (defaultData.substr(0, 1) == "{") {
            defaultValue = eval(defaultData.match((/\{(.*)\}/i))[1]);
        } else {
            defaultValue = defaultData;
        }
        theElement.value = defaultValue;
    } else {
        theElement.value = "";
    }
}

function RMIMsetCalc(theElement) {
    for (var i = 0; i < theElement.childNodes.length; i++) {
        RMIMsetCalc(theElement.childNodes[i]);
    }
    try {
        if (theElement.getAttribute('maskcalc')) {
            var calcData = theElement.getAttribute('maskcalc');
            var calcValue = "";
            if (calcData.substr(0, 1) == "{") {
                calcValue = eval(calcData.match((/\{(.*)\}/i))[1]);
            } else {
                calcValue = calcData;
            }
            theElement.value = calcValue;
        }
    } catch (e) { }
}

function RMIMgetElementStyle(theElement, theStyle) {
    var y = "";
	if (theElement.currentStyle) {
	    var theNewStyle = "";
	    for(i=0; i < theStyle.length; i++) {
	        if (theStyle.substring(i,i+1) == "-") {
	            i++;
	            theNewStyle += theStyle.substring(i,i+1).toUpperCase();
	        } else {
	            theNewStyle += theStyle.substring(i,i+1);
	        }
	    }
	    //alert(theNewStyle);
		y = theElement.currentStyle[theNewStyle];
	} else if (window.getComputedStyle)
		y = document.defaultView.getComputedStyle(theElement,null).getPropertyValue(theStyle);
	
	//alert(y);
	return y;
}


try {
    if (Prototype.Browser.Gecko) {
      document.observe('dom:loaded', RMIMfirefoxOnPaste);
    }
} catch (e) {
}



function RMIMgetStyle(oElm, strCssRule) {
    var strValue = "";
    if (document.defaultView && document.defaultView.getComputedStyle) {
        strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
    }
    else if (oElm.currentStyle) {
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1) {
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
}

var IMDestroyCalendar = true;

function IMCreateCalendar() {
    var theBody = document.getElementsByTagName("body")[0];
    var theCalendar = document.createElement("div");
    theCalendar.id = "IMCalendar";
    theCalendar.style.display = "none";
    theCalendar.style.position = "absolute";
    theCalendar.style.width = "200px";
    theCalendar.style.height = "250px";
    theCalendar.onmouseover = function () { IMDestroyCalendar = false; };
    theCalendar.onmouseout = function () {
        var x = IMgetMouseX(event);
        var y = IMgetMouseY(event);

        if(!(x > parseInt(theCalendar.left) && x < parseInt(theCalendar.left) + parseInt(theCalendar.width) && y > parseInt(theCalendar.top) && y < parseInt(theCalendar.top) + parseInt(theCalendar.height)))
            IMDestroyCalendar = true;
    };
    theBody.appendChild(theCalendar);
}


function show_calendar(str_target, str_datetime) {

    var theCalendar = document.getElementById("IMCalendar");
    if ((str_datetime == null || str_datetime == "") && theCalendar.style.display != "none" && theCalendar.getAttribute("targetfield") == str_target.id) {
        return;
    }

    var arr_months = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];
    var week_days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    var n_weekstart = 1; // day week starts from (normally 0 or 1)

    //var str_datetime = str_target.value;

    var dt_datetime = new Date((str_datetime == null || str_datetime == "" ? str_target.value : str_datetime));
    
    if (dt_datetime == "Invalid Date" || typeof dt_datetime == "undefined" || isNaN(dt_datetime)) {
        dt_datetime = new Date();
    }

    var dt_prev_month = new Date(dt_datetime);
    dt_prev_month.setMonth(dt_datetime.getMonth() - 1);

    var dt_next_month = new Date(dt_datetime);
    dt_next_month.setMonth(dt_datetime.getMonth() + 1);

    var dt_firstday = new Date(dt_datetime);
    dt_firstday.setDate(1);
    dt_firstday.setDate(1 - (7 + dt_firstday.getDay() - n_weekstart) % 7);

    var dt_lastday = new Date(dt_next_month);
    dt_lastday.setDate(0);

    // Should do this by creating elements, not a string.

    var str_buffer = new String(
		"<table class=\"clsOTable\" cellspacing=\"0\" border=\"0\" width=\"100%\">\n" +
		"<tr><td bgcolor=\"#808080\">\n" +
		"<table cellspacing=\"1\" cellpadding=\"3\" border=\"0\" width=\"100%\">\n" +
		"<tr>\n	<td bgcolor=\"#808080\" onclick=\"show_calendar(document.getElementById('" +
		str_target.id + "'), '" + dt2dtstr(dt_prev_month) + "'); document.getElementById('" +
		str_target.id + "').focus();\">" +
		"&lt;</td>\n" +
		"	<td bgcolor=\"#808080\" colspan=\"5\" style='text-align: center; font-weight: bold;'>" +
		"<font color=\"white\" face=\"tahoma, verdana\" size=\"2\">"
		+ arr_months[dt_datetime.getMonth()] + " " + dt_datetime.getFullYear() + "</font></td>\n" +
		"	<td bgcolor=\"#808080\" align=\"right\" onclick=\"show_calendar(document.getElementById('" +
		str_target.id + "'), '" + dt2dtstr(dt_next_month) + "'); document.getElementById('" +
		str_target.id + "').focus();\">&gt;</td>\n</tr>\n"
	);

    var dt_current_day = new Date(dt_firstday);
    // print weekdays titles
    str_buffer += "<tr>\n";
    for (var n = 0; n < 7; n++)
        str_buffer += "	<td bgcolor=\"#A0A0A0\">" +
		"<font color=\"white\" face=\"tahoma, verdana\" size=\"2\">" +
		week_days[(n_weekstart + n) % 7] + "</font></td>\n";
    // print calendar table
    str_buffer += "</tr>\n";
    while (dt_current_day.getMonth() == dt_datetime.getMonth() ||
		dt_current_day.getMonth() == dt_firstday.getMonth()) {
        // print row heder
        str_buffer += "<tr>\n";
        for (var n_current_wday = 0; n_current_wday < 7; n_current_wday++) {
            if (dt_current_day.getDate() == dt_datetime.getDate() &&
					dt_current_day.getMonth() == dt_datetime.getMonth())
            // print current date
                str_buffer += "	<td bgcolor=\"yellow\" align=\"right\" ";
            else if (dt_current_day.getDay() == 0 || dt_current_day.getDay() == 6)
            // weekend days
                str_buffer += "	<td bgcolor=\"#D0D0D0\" align=\"right\" ";
            else
            // print working days of current month
                str_buffer += "	<td bgcolor=\"white\" align=\"right\" ";
            //alert(IMDateToString(dt_current_day, str_target.getAttribute('dateformat')));
            str_buffer += "onclick=\"document.getElementById('" + str_target.id + "').value='" + IMDateToString(dt_current_day, str_target.getAttribute('dateformat')) + "'; document.getElementById('" + str_target.id + "').focus(); document.getElementById('IMCalendar').style.display='none';\"";

            if (dt_current_day.getMonth() == dt_datetime.getMonth())
            // print days of current month
                
                str_buffer += "<font color=\"black\" face=\"tahoma, verdana\" size=\"2\">";
            else
            // print days of other months
                str_buffer += "<font color=\"gray\" face=\"tahoma, verdana\" size=\"2\">";

            str_buffer += dt_current_day.getDate() + "</font></a></td>\n";
            dt_current_day.setDate(dt_current_day.getDate() + 1);
        }
        // print row footer
        str_buffer += "</tr>\n";
    }
    // print calendar footer
    str_buffer +=
		"</table>\n" +
		"</tr>\n</td>\n</table>\n";

    var myPosition = RMBLfindPos(str_target);
    theCalendar.style.top = myPosition.top + 25 + "px"; // Shouldn't be hard coded, but can't always get the height.
    theCalendar.style.left = myPosition.left + "px";
    theCalendar.innerHTML = str_buffer;
    theCalendar.setAttribute("targetfield", str_target.id);
    theCalendar.style.display = "block";
    

    /*

    var vWinCal = window.open("", "Calendar",
		"width=200,height=250,status=no,resizable=yes,top=200,left=200");
    vWinCal.opener = self;
    var calc_doc = vWinCal.document;
    calc_doc.write(str_buffer);
    calc_doc.close();

    */
}
// datetime parsing and formatting routimes. modify them if you wish other datetime format
function IMDateToString(date, format) {
    return format.replace("mm", IMLeftString("0" + (date.getMonth() + 1), 2)).replace("dd", IMLeftString("0" + (date.getDate()), 2)).replace("yyyy", ((date.getFullYear())));

}

function IMLeftString(theString, theLength) {
    return theString.substr(theString.length - theLength);
}

function str2dt(str_datetime) {
    if (isNaN(Date.parse(str_datetime))) {
        return new Date;
    } else {
        return new Date(str_datetime);
    }
}
function dt2dtstr(dt_datetime) {
    return (new String(
			(dt_datetime.getMonth() + 1) + "/" + dt_datetime.getDate() + "/" + dt_datetime.getFullYear()));
}
function dt2tmstr(dt_datetime) {
    return (new String(
			dt_datetime.getHours() + ":" + dt_datetime.getMinutes() + ":" + dt_datetime.getSeconds()));
}


function IMgetMouseX(evt) {
    if (evt.pageX) return evt.pageX;
    else if (evt.clientX)
        return evt.clientX + (document.documentElement.scrollLeft ?
       document.documentElement.scrollLeft :
       document.body.scrollLeft);
    else return null;
}
function IMgetMouseY(evt) {
    if (evt.pageY) return evt.pageY;
    else if (evt.clientY)
        return evt.clientY + (document.documentElement.scrollTop ?
       document.documentElement.scrollTop :
       document.body.scrollTop);
    else return null;
}






RMIMaddLoadEvent(function () { IMCreateCalendar() });
RMIMaddLoadEvent(function () { RMIMsetMasks(document.body) });
