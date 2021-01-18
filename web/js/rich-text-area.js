/* 

X if isindentedline
X  if newline
X    prepend with line at the same indentation and with bullet if needed
X  if tab
X    increase indentation
X  if shift tab
X    decrease indentation (if possible)
  if backspace and on first char
    remove indentation
  if mouseclicked && cursorplaced before indentation
    move cursor to right after bullet, space
  if leftkey
    TODO
else
  if firstcharafterspacesisasterisk && cursorisafterasterisk && press(space)
    convert to indented line
  
if nextlineisindentedline
  if delete
    TODO
  if rightkey
    TODO
  
if pasting 
  TODO
  
if selecting text
  ensure selection doesn't begin or end to the left of a bullet point+tab

TODO handle all these scenarios if the user has any text selected
  For example: if multiple lines selected and indented / outdented

*/
class RichTextArea {
    constructor(textArea) {
      this._ta = textArea;
      this._contentChangedListeners = [];
      const _this = this;
      
      this._ta.addEventListener("keydown", function(event) {
        if (event.key === "Tab") {
          event.preventDefault();
          if (event.shiftKey) {
            _this.outdentCurLine();
          } else {
            _this.indentCurLine();
          }
        }
      });
  
      this._ta.addEventListener("beforeinput", function(event) {
        _this.pendingOp = null;
  
        console.log(_this.value);
        console.log(_this.curLineAndCol);
        console.log(_this.curLineIndentation);
        console.log(`Event: ${event.inputType}, Data: ${event.data}`);
  
        if (_this.curLineIndentation > 0) {
          const indentLevels = _this.curLineIndentation;
          const isBulleted = _this.isCurLineBulleted;
  
          if (event.inputType === "insertLineBreak") {
            _this.pendingOp = () => _this.indentCurLine(indentLevels, isBulleted);
          } else if (
            event.inputType === "deleteContentBackward" &&
            _this.isCursorOnBullet
          ) {
            event.preventDefault();
            _this.removeBulletFromCurLine();
          }
        }
  
        // switch (event.inputType) {
        //   case "insertLineBreak":
        //     console.log("pressed enter");
        //     break;
        //   case "deleteContentForward":
        //     console.log("pressed delete");
        //     break;
        //   case "deleteContentBackward":
        //     console.log("pressed backspace");
        //     break;
        //   default:
        //
        // }
      });
  
      this._ta.addEventListener("input", function(event) {
        console.log(_this.value);
        console.log(_this.curLineAndCol);
        console.log(_this.curLineIndentation);
        console.log(`Event: ${event.inputType}, Data: ${event.data}`);
  
        _this.pendingOp?.();
  
        // switch (event.inputType) {
        //   case "insertLineBreak":
        //     console.log("pressed enter");
        //     break;
        //   case "deleteContentForward":
        //     console.log("pressed delete");
        //     break;
        //   case "deleteContentBackward":
        //     console.log("pressed backspace");
        //     break;
        //   default:
        //
        // }

        _this._contentChangedListeners.forEach(fn => fn(event));
      });

      this._ta.addEventListener("keyup", function(event) {
        console.log("keyup");

        _this._contentChangedListeners.forEach(fn => fn(event));
      });
    }
  
    get value() {
      return this._ta.value;
    }

    set value(newValue) {
      this._ta.value = newValue;
    }
  
    get curLineAndCol() {
      let returnObj = {};
      let textLines = this.value.substr(0, this._ta.selectionStart).split("\n");
      returnObj.line = textLines.length - 1;
      returnObj.col = textLines[textLines.length - 1].length;
      return returnObj;
    }
  
    get curLineText() {
      let curLineNumber = this.curLineAndCol.line;
      return this.value.split("\n")[curLineNumber];
    }
  
    get curLineIndentation() {
      let splitByBulletPoint = this.curLineText.split(/(^\t+)•\t/);
      if (splitByBulletPoint.length > 1)
        return (splitByBulletPoint[1].match(/\t/g) || []).length;
      else {
        let splitByLeadingTabs = this.curLineText.split(/(^\t+)/);
        if (splitByLeadingTabs.length > 1)
          return (splitByLeadingTabs[1].match(/\t/g) || []).length;
        else return 0;
      }
    }
  
    get isCurLineBulleted() {
      let splitByBulletPoint = this.curLineText.split(/(^\t+)•\t/);
      return splitByBulletPoint.length > 1;
    }
  
    // Returns the column number for the cursor position right after the tab after the bullet point
    get _bulletCursorCol() {
      return this.curLineText.split(/(^\t+•\t)/)[1]?.length;
    }
  
    get isCursorOnBullet() {
      return this.curLineAndCol.col === this._bulletCursorCol;
    }
  
    indentCurLineWithBullet() {
      this.indentCurLine(true);
    }
  
    indentCurLine(levels = 1, addBullet = false) {
      let prefix = "\t".repeat(levels) + (addBullet ? "•\t" : "");
      let beginningOfLineCursor =
        this._ta.selectionStart - this.curLineAndCol.col;
      let selectMode = addBullet
        ? "end"
        : this.curLineText.length > 0
        ? "preserve"
        : "end";
      this._ta.setRangeText(
        prefix,
        beginningOfLineCursor,
        beginningOfLineCursor,
        selectMode
      );
    }
  
    outdentCurLine() {
      // If line starts with a tab, not followed by a bullet point
      if (
        (this.isCurLineBulleted && this.curLineIndentation > 1) ||
        (!this.isCurLineBulleted && this.curLineIndentation >= 1)
      ) {
        const beginningOfLineCursor =
          this._ta.selectionStart - this.curLineAndCol.col;
        this._ta.setRangeText(
          "",
          beginningOfLineCursor,
          beginningOfLineCursor + 1,
          "preserve"
        );
      }
    }
  
    removeBulletFromCurLine() {
      if (!this.isCurLineBulleted) {
        return;
      }
  
      const beginningOfLineCursor =
        this._ta.selectionStart - this.curLineAndCol.col;
      this._ta.setRangeText(
        "\t".repeat(this.curLineIndentation),
        beginningOfLineCursor,
        beginningOfLineCursor + this.curLineIndentation + 1,
        "preserve"
      );
    }

    focus() {
      this._ta.focus();
    }

    addContentChangedListener(fn) {
      this._contentChangedListeners.push(fn);
    }
  }
  