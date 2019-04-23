# Replace Selection Extension

This extension replaces your current selections with either the corresponding line number or the corresponding cursor number.

## Installation

In VSCode extensions search for `publisher:"nexusoft" Replace Selection` the only result should be this extension

## Use

Open your command window _(default shift + command + p on osx, ctrl + shift + p on windows)_ and use one of this extensions commands:

`Replace With Current Cursor Index`
 * Replace the current selection with the current cursor number. Meaning if you have multiple cursors the first selection will be replaced with 0, the second with 1, etc

`Replace With Line Number`
 * Replace the current selection with the current line number, 1 indexed, because line numbers follow false gods

![Selection Line Number Replacement](resources/showcase_lines.gif)

`Replace With Evaluated Javascript Result`
 * Replace the current selection with the evaluated javascript result, eg 1 + 1 becomes 2

![Selection Javascript Evaluation Replacement](resources/showcase_eval.gif)

`Rotate Right Content of Selections`: 
 * When multiple selections are active, copies the first into the second, the second into the third, the fourth into the fifth, and so on, the final selection is placed into the first selection

`Rotate Left Content of Selections`: 
 * When multiple selections are active, does the opposite of rotate right, the last moves left, the first moves to the last

`Swap Content of Selections`: 
 * Swaps two or more selections, if you have selected two strings 'sally' and 'bob' the content 'bob' becomes 'sally', and 'sally' becomes 'bob'

`String to Hex`: 
 * Replace each character with the equivalent hex value

`Hex to String`: 
 * Replace a string that is already in hex with the normal string value of it

## Release Notes

### 0.0.1

Initial release, working line and cursor replacements

### 0.0.4

Added `Replace With Evaluated Javascript Result` as a command, simply replaces the current selection with its evaluated results

### 0.0.6

Added:
 * `Rotate Right Content of Selections`
 * `Rotate Left Content of Selections`
 * `Swap Content of Selections`
 * `String to Hex`
 * `Hex to String`