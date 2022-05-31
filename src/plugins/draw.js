import * as PIXI from "pixi.js";
import { DropShadowFilter, TiltShiftAxisFilter } from "pixi-filters";
import * as Time from "./time.js";
import palette from "google-palette";
// import { magma, seismic, jet } from "./palette.js";

var colors = palette("tol-dv", 101);
console.log(PIXI.utils.hex2string(scalarToHex(1.0, false)));

export function hex2luminance(string) {
  const rgb = PIXI.utils.hex2rgb(string);
  return Math.sqrt(
    0.299 * Math.pow(rgb[0], 2) +
      0.587 * Math.pow(rgb[1], 2) +
      0.114 * Math.pow(rgb[2], 2)
  );
}

export function linspace(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

export function rgbToHex(c) {
  const r = Math.floor(c[0] * 255);
  const g = Math.floor(c[1] * 255);
  const b = Math.floor(c[2] * 255);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function scalarToHex(s, invert = false) {
  // maps a scalar [0, 1] to a color value
  if (invert) {
    s = 1 - s;
  }
  return PIXI.utils.string2hex(colors[Math.round(s * 100)]);
}

export class AnnotationBadge extends PIXI.Container {
  constructor(x, y, text, padding = 2, color = 0xffffff) {
    super();

    const textColor = hex2luminance(color) > 0.5 ? 0x000000 : 0xffffff;

    this.pText = new PIXI.Text(text, {
      fill: textColor,
      fontSize: 14,
      // fontWeight: 'bold',
    });

    const textRect = new PIXI.Graphics();
    textRect.beginFill(color);
    textRect.drawRoundedRect(
      0,
      0,
      this.pText.width + 2 * padding,
      this.pText.height + 2 * padding,
      2
    );

    // let shadow = new DropShadowFilter();
    // shadow.color = 0x0000;
    // shadow.distance = 2;
    // shadow.alpha = 0.4;
    // shadow.rotation = 90;
    // shadow.blur = 1;
    // textRect.filters = [shadow];

    this.addChild(textRect);
    textRect.addChild(this.pText);
    this.pText.x = padding;
    this.pText.y = padding;
    this.x = x;
    this.y = y;
  }
}

export class AnnotationSegment extends PIXI.Container {
  constructor(
    segment,
    x,
    y,
    width,
    height,
    color = 0xdddddd,
    selectedColor = 0xd99090,
    padding = 2,
    gap = 2
  ) {
    super();
    this.pPadding = padding;
    this.pGap = gap;
    this.pSegment = segment;
    this.x = x;
    this.y = y;
    this.pSelected = false;
    this.pSelectedColor = selectedColor;
    this.pColor = color;

    this.pWidth = width;
    this.pHeight = height;

    this.pRect = new PIXI.Graphics();
    this.drawBox();

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 1);
    this.pRect.mask = this.pMask;
    this.pRect.addChild(this.pMask);

    this.addChild(this.pRect);
    this.badges = [];
    if (this.pSegment.annotations) {
      var badgeX = this.pGap;
      var badgeY = this.pGap;
      var badgeXIndex = 0;
      this.pSegment.annotations.forEach((a) => {
        const text = new AnnotationBadge(
          badgeX,
          badgeY,
          a.annotation.name,
          padding,
          PIXI.utils.string2hex(a.annotation.color)
        );
        badgeX += text.width + this.pGap;
        if (badgeX > this.pRect.width && badgeXIndex > 0) {
          badgeY += text.height + this.pGap;
          badgeX = text.width + 2 * this.pGap;
          text.x = this.pGap;
          text.y = badgeY;
          badgeXIndex = 1;
        } else {
          badgeXIndex += 1;
        }
        text.mask = this.pMask;
        this.addChild(text);
        this.badges.push(text);
      });
    }
  }
  drawBox() {
    if (this.pSelected) {
      this.pRect.lineStyle(2, this.pSelectedColor, 1);
    }
    this.pRect.beginFill(this.pColor);
    this.pRect.drawRoundedRect(0, 0, this.pWidth, this.pHeight, 1);
  }
  set width(value) {
    this.pRect.width = value;

    var badgeX = this.pGap;
    var badgeY = this.pGap;
    var badgeXIndex = 0;
    this.badges.forEach((e) => {
      e.x = badgeX;
      e.y = badgeY;
      badgeX += e.width + this.pGap;
      if (badgeX > this.pRect.width && badgeXIndex > 0) {
        badgeY += e.height + this.pGap;
        badgeX = e.width + 2 * this.pGap;
        e.x = this.pGap;
        e.y = badgeY;
        badgeXIndex = 1;
      } else {
        badgeXIndex += 1;
      }
    });
  }
  get segment() {
    return this.pSegment;
  }
  set selected(value) {
    this.pSelected = value;
    this.pRect.clear();
    this.drawBox();
  }
}

export class ScalaraColorTimeline extends PIXI.Container {
  constructor(
    timeline,
    x,
    y,
    width,
    height,
    startTime = 0,
    endTime = 10,
    data = null,
    fill = 0xffffff
  ) {
    super();
    this.pTimeline = timeline;
    this.pSegmentList = [];
    this.pX = x;
    this.pY = y;
    this.pWidth = width;
    this.pHeight = height;
    this.pStartTime = startTime;
    this.pEndTime = endTime;
    this.pData = data;

    // draw canvas
    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(fill);
    this.pRect.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.x = x;
    this.pRect.y = y;

    // set mask to visible area
    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.mask = this.pMask;
    this.pRect.addChild(this.pMask);

    // let shadow = new DropShadowFilter();
    // shadow.color = 0x0000;
    // shadow.distance = 2;
    // shadow.alpha = 0.4;
    // shadow.rotation = 90;
    // shadow.blur = 1;
    // this.pRect.filters = [shadow];

    // draw colored rectangles
    this.addChild(this.pRect);
    this.cRects = new PIXI.Graphics();
    var prevX = 0;
    this.pData.time.forEach((t, i) => {
      let color = scalarToHex(this.pData.y[i]);
      this.cRects.beginFill(color);
      this.cRects.drawRect(prevX, 0, this._timeToX(t), this.pHeight);
      prevX = this._timeToX(t);
    });

    this.addChild(this.cRects);
  }
  get timeScale() {
    return this.pWidth / (this.pEndTime - this.pStartTime);
  }
  _timeToX(time) {
    return this.timeScale * (time - this.pStartTime);
  }
  scalePath() {
    if (this.path) {
      const width =
        this._timeToX(this.pData.time[this.pData.time.length - 1]) -
        this._timeToX(this.pData.time[0]);
      const x = this._timeToX(this.pData.time[0]);
      this.path.x = x;
      this.path.width = width;
    }
  }
  set startTime(time) {
    this.pStartTime = time;
    this.scalePath();
  }
  set endTime(time) {
    this.pEndTime = time;
    this.scalePath();
  }
  set selected(value) {
    this.pSelected = value;
  }
  get segments() {
    return this.pSegmentList;
  }
}

export class ScalarTimeline extends PIXI.Container {
  constructor(
    timeline,
    x,
    y,
    width,
    height,
    startTime = 0,
    endTime = 10,
    data = null,
    fill = 0xffffff
  ) {
    super();
    this.pTimeline = timeline;
    this.pSegmentList = [];
    this.pX = x;
    this.pY = y;
    this.pWidth = width;
    this.pHeight = height;
    this.pStartTime = startTime;
    this.pEndTime = endTime;
    this.pData = data;

    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(fill);
    this.pRect.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.x = x;
    this.pRect.y = y;

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.mask = this.pMask;
    this.pRect.addChild(this.pMask);

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];

    this.addChild(this.pRect);

    this.path = new PIXI.Graphics().lineStyle(1, 0xae1313, 1).moveTo(0, 0);
    this.pData.time.forEach((t, i) => {
      this.path.lineTo(this._timeToX(t), (this.pData.y[i] * this.pHeight) / 2);
    });
    this.path.closePath();

    this.path.y = this.pHeight / 2;
    this.pRect.addChild(this.path);
  }
  get timeScale() {
    return this.pWidth / (this.pEndTime - this.pStartTime);
  }
  _timeToX(time) {
    return this.timeScale * (time - this.pStartTime);
  }
  scalePath() {
    if (this.path) {
      const width =
        this._timeToX(this.pData.time[this.pData.time.length - 1]) -
        this._timeToX(this.pData.time[0]);
      const x = this._timeToX(this.pData.time[0]);
      this.path.x = x;
      this.path.width = width;
    }
  }
  set startTime(time) {
    this.pStartTime = time;
    this.scalePath();
  }
  set endTime(time) {
    this.pEndTime = time;
    this.scalePath();
  }
  set selected(value) {
    this.pSelected = value;
  }
  get segments() {
    return this.pSegmentList;
  }
}

export class AnnotationTimeline extends PIXI.Container {
  constructor(
    timeline,
    x,
    y,
    width,
    height,
    startTime = 0,
    endTime = 10,
    fill = 0xffffff
  ) {
    super();
    this.pTimeline = timeline;
    this.pSegmentList = [];
    this.pX = x;
    this.pY = y;
    this.pWidth = width;
    this.pHeight = height;
    this.pStartTime = startTime;
    this.pEndTime = endTime;

    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(fill);
    this.pRect.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.x = x;
    this.pRect.y = y;

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.mask = this.pMask;
    this.pRect.addChild(this.pMask);

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];

    this.addChild(this.pRect);

    this.pSegments = new PIXI.Container();
    if (this.pTimeline.segments) {
      this.pTimeline.segments.forEach((s, i) => {
        const x = this._timeToX(s.start);
        const y = this.pY;
        const width = this._timeToX(s.end) - this._timeToX(s.start);
        const height = this.pHeight;

        let segmentE = new AnnotationSegment(s, x, y, width, height);

        segmentE.interactive = true;
        segmentE.buttonMode = true;
        segmentE.on("rightdown", (ev) => {
          this.emit("segmentRightDown", {
            event: ev,
            segment: segmentE,
          });
          ev.stopPropagation();
        });

        segmentE.on("click", (ev) => {
          this.emit("segmentClick", {
            event: ev,
            segment: segmentE,
          });
          ev.stopPropagation();
        });

        segmentE.on("pointerover", (ev) => {
          this.emit("segmentOver", {
            event: ev,
            segment: segmentE,
          });
          ev.stopPropagation();
        });

        segmentE.on("pointerout", (ev) => {
          this.emit("segmentOut", {
            event: ev,
            segment: segmentE,
          });
          ev.stopPropagation();
        });

        segmentE.mask = this.pMask;

        this.pSegments.addChild(segmentE);
        this.pSegmentList.push(segmentE);
      });
      this.addChild(this.pSegments);
    }
  }
  get timeScale() {
    return this.pWidth / (this.pEndTime - this.pStartTime);
  }
  _timeToX(time) {
    return this.pX + this.timeScale * (time - this.pStartTime);
  }
  scaleSegment() {
    if (this.pTimeline.segments) {
      this.pTimeline.segments.forEach((s, i) => {
        const width = this._timeToX(s.end) - this._timeToX(s.start);
        const x = this._timeToX(s.start);
        this.pSegments.getChildAt(i).x = x;
        this.pSegments.getChildAt(i).width = width;
      });
    }
  }
  set startTime(time) {
    this.pStartTime = time;
    this.scaleSegment();
  }
  set endTime(time) {
    this.pEndTime = time;
    this.scaleSegment();
  }
  set selected(value) {
    this.pSelected = value;
  }
  get segments() {
    return this.pSegmentList;
  }
}

export class TimelineHeader extends PIXI.Container {
  constructor(timeline, x, y, width, height, fill = 0xffffff) {
    super();
    this.pTimeline = timeline;
    this.pX = x;
    this.pY = y;
    this.pWidth = width;
    this.pHeight = height;

    const padding = 2;
    const gap = 4;

    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(fill);
    this.pRect.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.x = x;
    this.pRect.y = y;

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.mask = this.pMask;
    this.pRect.addChild(this.pMask);

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];

    this.addChild(this.pRect);
    this.pText = new PIXI.Text(timeline.name, {
      fill: 0x000000,
      fontSize: 16,
      // fontWeight: 'bold',
    });
    this.pText.x = gap;
    this.pText.y = gap;
    this.pText.mask = this.pMask;

    this.pRect.addChild(this.pText);

    this.interactive = true;
    this.buttonMode = true;
    this.on("rightdown", (ev) => {
      this.emit("timelineRightDown", {
        event: ev,
        timeline: this,
      });
      ev.stopPropagation();
    });

    this.on("click", (ev) => {
      this.emit("timelineClick", {
        event: ev,
        timeline: this,
      });
      ev.stopPropagation();
    });
  }

  set width(value) {
    this.pRect.width = value;
  }
  get timeline() {
    return this.pTimeline;
  }
}

export class TimeScale extends PIXI.Container {
  constructor(x, y, width, height, startTime = 0, endTime = 10) {
    super();
    this.pX = x;
    this.pY = y;
    this.pWidth = width;
    this.pHeight = height;
    this.pStartTime = startTime;
    this.pEndTime = endTime;

    PIXI.BitmapFont.from(
      "scale_font",
      {
        fill: "#333333",
        fontSize: 10,
      },
      {
        chars: [["a", "z"], ["0", "9"], ["A", "Z"], " \\|/:.-^%$&*()!?"],
        // fontWeight: 'bold',
      }
    );

    this.pRect = null;
    this._drawBox();

    this.pBars_graphics = null;
    this._drawBars();
  }
  _drawBox() {
    if (this.pRect) {
      this.pRect.destroy();
    }
    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(0xffffff);
    this.pRect.drawRoundedRect(0, 0, this.pWidth, this.pHeight, 5);
    this.pRect.x = this.pX;
    this.pRect.y = this.pY;

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, this.pWidth, this.pHeight, 5);
    this.pRect.mask = this.pMask;
    this.pRect.addChild(this.pMask);

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];

    this.addChild(this.pRect);
  }
  _drawBars() {
    if (this.pBars_graphics) {
      this.pBars_graphics.destroy();
    }
    this.pBars_graphics = new PIXI.Container();
    this.pBars = [];

    const visibleDuration = Math.round(
      1000 * (this.pEndTime - this.pStartTime)
    );
    const visibleDurationDigits = Math.floor(
      Math.log(visibleDuration) * Math.LOG10E
    );

    const majorStroke = Math.pow(10, visibleDurationDigits);
    const minorStroke = Math.pow(10, visibleDurationDigits - 1);

    const timestemps = Array(Math.ceil(this.pEndTime * 10))
      .fill(0)
      .map((_, i) => i);

    timestemps.forEach((time100, index) => {
      const timeFraction = Math.round(time100);
      const time = timeFraction / 10;
      const timeCode = Time.get_timecode(time);
      let bar = {
        timeCode: timeCode,
        time: time,
        stroke: null,
        text: null,
      };
      if (this.pStartTime <= time && time <= this.pEndTime) {
        if ((time * 1000) % majorStroke == 0) {
          bar.stroke = this._drawStroke(time);
          bar.text = this._drawTime(time, timeCode);
          bar.stroke.height = this.pHeight - 25;

          bar.stroke.mask = this.pMask;
          bar.text.mask = this.pMask;

          this.pBars_graphics.addChild(bar.stroke);
          this.pBars_graphics.addChild(bar.text);
        } else if ((time * 1000) % minorStroke == 0) {
          bar.stroke = this._drawStroke(time);
          bar.stroke.height = this.pHeight - 35;

          bar.stroke.mask = this.pMask;

          this.pBars_graphics.addChild(bar.stroke);
        }
      }

      this.pBars.push(bar);
    });

    this.addChild(this.pBars_graphics);
  }
  _drawTime(time, timeCode) {
    const x = this._timeToX(time);
    const text = new PIXI.BitmapText(timeCode, { fontName: "scale_font" });
    text.x = x;
    text.y = 5;
    return text;
  }
  _drawStroke(time) {
    const x = this._timeToX(time);
    const path = new PIXI.Graphics()
      .lineStyle(1, 0x000000, 1)
      .lineTo(0, 25)
      .closePath();
    path.x = x;
    path.y = 25;
    return path;
  }
  _timeToX(time) {
    return this.pX + this.timeScale * (time - this.pStartTime);
  }
  get timeScale() {
    return this.pWidth / (this.pEndTime - this.pStartTime);
  }
  _scale() {
    const visibleDuration = Math.round(
      1000 * (this.pEndTime - this.pStartTime)
    );

    const visibleDurationDigits = Math.floor(
      Math.log(visibleDuration) * Math.LOG10E
    );

    const majorStroke = Math.pow(10, visibleDurationDigits);
    const minorStroke = Math.pow(10, visibleDurationDigits - 1);

    var largestX = 0;
    this.pBars.forEach((e, i) => {
      const time = e.time;

      if (this.pStartTime <= time && time <= this.pEndTime) {
        const x = this._timeToX(time);
        if ((time * 1000) % majorStroke == 0) {
          if (!e.text) {
            e.text = this._drawTime(time, e.timeCode);
            e.text.mask = this.pMask;

            this.pBars_graphics.addChild(e.text);
          }
          e.text.x = x;

          if (!e.stroke) {
            e.stroke = this._drawStroke(time);
            e.stroke.mask = this.pMask;
            this.pBars_graphics.addChild(e.stroke);
          }
          e.stroke.x = x;
          e.stroke.height = this.pHeight - 25;
        } else if ((time * 1000) % minorStroke == 0) {
          if (e.text) {
            e.text.destroy();
            e.text = null;
          }

          if (!e.stroke) {
            e.stroke = this._drawStroke(time);
            e.stroke.mask = this.pMask;
            this.pBars_graphics.addChild(e.stroke);
          }
          e.stroke.x = x;
          e.stroke.height = this.pHeight - 35;
        } else {
          if (e.stroke) {
            e.stroke.destroy();
            e.stroke = null;
          }
          if (e.text) {
            e.text.destroy();
            e.text = null;
          }
        }
        if (e.text && e.text.x <= largestX) {
          e.text.destroy();
          e.text = null;
        }

        if (e.text) {
          largestX = e.text.x + e.text.width;
        }
      } else {
        if (e.stroke) {
          e.stroke.destroy();
          e.stroke = null;
        }
        if (e.text) {
          e.text.destroy();
          e.text = null;
        }
      }
    });
  }
  set startTime(time) {
    this.pStartTime = time;
    this._scale();
  }
  set endTime(time) {
    this.pEndTime = time;
    this._scale();
  }
}

export class TimeBar extends PIXI.Container {
  constructor(x, y, width, height, time = 0, startTime = 0, endTime = 10) {
    super();
    this.pX = x;
    this.pY = y;
    this.pWidth = width;
    this.pHeight = height;
    this.pTime = time;
    this.pStartTime = startTime;
    this.pEndTime = endTime;

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 5);

    this.pMask.x = x;
    this.pMask.y = y;
    this.mask = this.pMask;
    this.addChild(this.pMask);

    const handleWidth = 10;
    const handleHeight = 10;

    const timeX = this._timeToX(time);
    this.pCursor = new PIXI.Graphics()
      .lineStyle(1, 0xae1313, 1)
      .beginFill(0xae1313)
      .moveTo(0, height)
      .lineTo(0, handleHeight)
      .lineTo(handleWidth, 0)
      .lineTo(-handleWidth, 0)
      .lineTo(0, handleHeight)
      .closePath()
      .endFill();
    this.pCursor.x = timeX;
    this.pCursor.y = 25;
    this.addChild(this.pCursor);

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pCursor.filters = [shadow];
  }
  get timeScale() {
    return this.pWidth / (this.pEndTime - this.pStartTime);
  }
  _timeToX(time) {
    return this.pX + this.timeScale * (time - this.pStartTime);
  }
  scaleSegment() {
    this.pCursor.x = this._timeToX(this.pTime);
  }
  set startTime(time) {
    this.pStartTime = time;
    this.scaleSegment();
  }
  set endTime(time) {
    this.pEndTime = time;
    this.scaleSegment();
  }
  set time(time) {
    this.pTime = time;
    this.scaleSegment();
  }
}

export class Button extends PIXI.Container {
  constructor(x, y, width, height, icon) {
    super();
    this.pX = x;
    this.pY = y;
    this.pMargin = 2;
    this.pWidth = width;
    this.pHeight = height;
    this.pSprite = PIXI.Sprite.from(icon);
    this.pSprite.x = this.pMargin;
    this.pSprite.y = this.pMargin;

    this.pBoxWidth = this.pSprite.width + 2 * this.pMargin;
    this.pBoxHeight = this.pSprite.height + 2 * this.pMargin;

    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(0xffffff);
    this.pRect.drawRoundedRect(0, 0, this.pBoxWidth, this.pBoxHeight, 5);
    this.pRect.x = x;
    this.pRect.y = y;

    this.pRect.addChild(this.pSprite);
    // this.pMask = new PIXI.Graphics();
    // this.pMask.beginFill(0xffffff);
    // this.pMask.drawRoundedRect(0, 0, this.pBoxWidth, this.pBoxHeight, 5);

    // this.pRect.mask = this.pMask;

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];

    this.addChild(this.pRect);
    this.pRect.interactive = true;
    this.pRect.buttonMode = true;
    this.pRect.on("pointerover", this.onButtonOver);
    this.pRect.on("pointerout", this.onButtonOut);

    this.pRect.on("pointerdown", this.onButtonDown);
    this.pRect.on("pointerup", this.onButtonUp);
    this.pRect.on("pointerupoutside", this.onButtonUp);
    this.pRect.on("click", this.onClick);
  }
  onButtonOver = () => {
    this.pIsOver = true;
    if (this.pIsDown) {
      return;
    }
    this.pRect.clear();
    this.pRect.beginFill(0xeeeeee);
    this.pRect.drawRoundedRect(0, 0, this.pBoxWidth, this.pBoxHeight, 5);
  };
  onButtonOut = () => {
    this.pIsOver = false;
    if (this.pIsDown) {
      return;
    }
    this.pRect.clear();
    this.pRect.beginFill(0xffffff);
    this.pRect.drawRoundedRect(0, 0, this.pBoxWidth, this.pBoxHeight, 5);
  };
  onButtonUp = () => {
    this.pIsDown = false;

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];
  };
  onButtonDown = (event) => {
    this.pIsDown = true;

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 0;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];
  };
  onClick = (event) => {
    this.emit("click", event);
  };
}
