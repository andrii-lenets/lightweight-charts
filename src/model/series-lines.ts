import {TimePriceCoordinate} from "../helpers/time-price-coordinate";
import {LineStyle, LineWidth} from "../renderers/draw-line";
import {SeriesMarker} from "./series-markers";

export type SeriesLineTip = 'normal' | 'arrow';

export interface SeriesLine<TimeType> {
    from: TimePriceCoordinate<TimeType>;
    to: TimePriceCoordinate<TimeType>;
    color: string;
    id?: string;
    text?: string;
    width?: LineWidth;
    style?: LineStyle;
    leftTip?: SeriesLineTip;
    rightTip?: SeriesLineTip;
}

export interface InternalSeriesMarker<TimeType> extends Omit<SeriesMarker<TimeType>, 'originalTime'> {
    internalId: number;
}