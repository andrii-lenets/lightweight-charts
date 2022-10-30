import {ScaledRenderer} from "./scaled-renderer";
import {Coordinate} from "../model/coordinate";
import {HoveredObject} from "../model/chart-model";
import {SeriesItemsIndexesRange} from "../model/time-data";
import {LineStyle, setLineStyle} from "./draw-line";
import {SeriesLineTip} from "../model/series-lines";
import {TextWidthCache} from "../model/text-width-cache";
import {makeFont} from "../helpers/make-font";

export interface SeriesLineRendererDataItem {
    x1: Coordinate;
    y1: Coordinate;
    x2: Coordinate;
    y2: Coordinate;
    color: string;
    width?: number;
    style?: LineStyle;
    leftTip?: SeriesLineTip;
    rightTip?: SeriesLineTip;
    internalId: number;
    externalId?: string;
    text?: string;
}

export interface SeriesLineRendererData {
    items: SeriesLineRendererDataItem[];
    visibleRange: SeriesItemsIndexesRange | null;
}

export class SeriesLinesRenderer extends ScaledRenderer {
    private _data: SeriesLineRendererData | null = null;
    private _textWidthCache: TextWidthCache = new TextWidthCache();
    private _fontSize: number = -1;
    private _fontFamily: string = '';
    private readonly _arrowAngle: number = 10;
    private readonly _arrowLength: number = 10;
    private _font: string = '';

    protected _drawImpl(ctx: CanvasRenderingContext2D, isHovered: boolean, hitTestData?: unknown): void {
        // const l = this._data?.items[0]
        // console.log(l?.x1 + ' ' + l?.y1 + '; ' + l?.x2 + ' ' + l?.y2);
        ctx.textBaseline = 'middle';
        ctx.font = this._font;

        this._data?.items.forEach(line => {
            this.drawLine(ctx, line)
            if (line.text !== undefined) {
                this.drawText(ctx, line.text, line);
            }
        });
    }

    hitTest(x: Coordinate, y: Coordinate): HoveredObject | null {
        if (this._data === null) {
            return null;
        }

        for (let item of this._data.items) {
            if (this.hitLineOrText(x, y, item)) {
                return {
                    hitTestData: item.internalId,
                    externalId: item.externalId,
                };
            }
        }
        return null;
    }

    public setData(data: SeriesLineRendererData): void {
        this._data = data;
    }

    public setParams(fontSize: number, fontFamily: string): void {
        if (this._fontSize !== fontSize || this._fontFamily !== fontFamily) {
            this._fontSize = fontSize;
            this._fontFamily = fontFamily;
            this._font = makeFont(fontSize, fontFamily);
            this._textWidthCache.reset();
        }
    }

    private drawLine(ctx: CanvasRenderingContext2D, line: SeriesLineRendererDataItem): void {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.lineWidth = line.width ?? 1;
        ctx.strokeStyle = line.color;
        setLineStyle(ctx, line.style ?? LineStyle.Solid)

        if (line.rightTip == 'arrow') {
            this.drawArrow(ctx, line.x1, line.y1, line.x2, line.y2);
        }

        if (line.leftTip == 'arrow') {
            this.drawArrow(ctx, line.x2, line.y2, line.x1, line.y1);
        }

        ctx.stroke();
    }

    private drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
        this.drawAngle(ctx, x1, y1, x2, y2, this._arrowAngle);
        this.drawAngle(ctx, x1, y1, x2, y2, -this._arrowAngle);
    }

    private drawAngle(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, a: number): void {
        const _sinA = Math.sin(a)
        const _cosA = Math.cos(a)

        const x = x1 - x2
        const y = y1 - y2

        const v = Math.sqrt(x * x + y * y)

        const rx = _cosA * x - _sinA * y
        const ry = _sinA * x + _cosA * y

        const lx = rx / v * this._arrowLength
        const ly = ry / v * this._arrowLength

        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - lx, y2 - ly);
    }

    private drawText(ctx: CanvasRenderingContext2D, text: string, line: SeriesLineRendererDataItem): void {
        const x = line.x2 - line.x1;
        const y = line.y2 - line.y1;
        const a = Math.atan(y / x)
        const l = Math.sqrt(x * x + y * y)

        ctx.save();
        ctx.translate(line.x1 + x / 2, line.y1 + y / 2);
        ctx.rotate(a);
        ctx.fillStyle = line.color;
        ctx.textAlign = 'center';
        ctx.fillText(text, 0, -this._fontSize, l);
        ctx.restore();
    }

    private hitLineOrText(x: Coordinate, y: Coordinate, line: SeriesLineRendererDataItem): Boolean {
        const vx = line.x2 - line.x1;
        const vy = line.y2 - line.y1;
        const vl = Math.sqrt(vx * vx + vy * vy)

        const cvx = x - line.x1;
        const cvy = y - line.y1;

        const a = Math.atan(vy / vx);

        const rvx = this.rotate(vx, vy, -a)[0];
        const [rcvx, rcvy] = this.rotate(cvx, cvy, -a);
        const lw = line.width ? line.width : 1;

        const hitLine = rcvx >= 0 && rcvx <= rvx && rcvy >= -lw && rcvy <= lw;
        if (line.text) {
            const tw = Math.min(vl, line.text.length * this._fontSize)

            const hitText = rcvx >= (rvx - tw) / 2 && rcvx <= (rvx + tw) / 2 && rcvy >= 1.5 * -this._fontSize && rcvy <= 0;

            return hitLine || hitText;
        }
        return hitLine;
    }

    private rotate(x: number, y: number, a: number): Array<number> {
        const sina = Math.sin(a)
        const cosa = Math.cos(a)

        return [
            cosa * x - sina * y,
            sina * x + cosa * y
        ];
    }
}