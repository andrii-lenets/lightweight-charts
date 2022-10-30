import {TimePriceCoordinate} from "../helpers/time-price-coordinate";
import {LineStyle, LineWidth} from "../renderers/draw-line";
import {SeriesMarker} from "./series-markers";

export type SeriesLineTip = 'normal' | 'arrow';

export interface SeriesLine<TimeType> {
    coordinate1: TimePriceCoordinate<TimeType>;
    coordinate2: TimePriceCoordinate<TimeType>;
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