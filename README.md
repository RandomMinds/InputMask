
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
            
            

