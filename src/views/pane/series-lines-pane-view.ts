import {IUpdatablePaneView, UpdateType} from "./iupdatable-pane-view";
import {IPaneRenderer} from '../../renderers/ipane-renderer';
import {Series} from "../../model/series";
import {ChartModel} from "../../model/chart-model";
import {
    SeriesLineRendererData,
    SeriesLineRendererDataItem,
    SeriesLinesRenderer
} from "../../renderers/series-lines-renderer";
import {Coordinate} from "../../model/coordinate";
import {TimePoint, TimePointsRange} from "../../model/time-data";
import {SeriesLine} from "../../model/series-lines";


export class SeriesLinesPaneView implements IUpdatablePaneView {
    protected readonly _series: Series;
    protected readonly _model: ChartModel;
    private readonly _data: SeriesLineRendererData;
    private _renderer: SeriesLinesRenderer = new SeriesLinesRenderer();
    private _invalidated: boolean = true;

    public constructor(series: Series) {
        this._series = series;
        this._model = series.model();
        this._data = {
            items: [],
            visibleRange: null,
        };
    }

    update(updateType?: UpdateType): void {
        this._invalidated = true;
    }

    renderer(height: number, width: number, addAnchors?: boolean): IPaneRenderer | null {
        if (!this._series.visible()) {
            return null;
        }

        if (this._invalidated) {
            this.makeValid()
            this._invalidated = false;
        }


        const layout = this._model.options().layout;
        this._renderer.setParams(layout.fontSize, layout.fontFamily);
        this._renderer.setData(this._data);

        return this._renderer;
    }

    private makeValid(): void {
        const visibleTimeRange = this._model.timeScale().visibleTimeRange();

        this._data.items = this._series.lines()
            .filter(line => this.isVisible(line, visibleTimeRange))
            .map<SeriesLineRendererDataItem>((line: SeriesLine<TimePoint>) => {
                const item = {
                    x1: this.timeToCoordinate(line.from.time),
                    y1: this.priceToCoordinate(line.from.price),
                    x2: this.timeToCoordinate(line.to.time),
                    y2: this.priceToCoordinate(line.to.price),
                    color: line.color,
                    width: line.width,
                    style: line.style,
                    leftTip: line.leftTip,
                    rightTip: line.rightTip,
                    internalId: -123,
                    externalId: line.id
                } as SeriesLineRendererDataItem;

                if (line.text) item.text = {content: line.text, width: 0}

                return item;
            });
    }

    private isVisible(line: SeriesLine<TimePoint>, timeRange: TimePointsRange | null): boolean {
        return timeRange !== null &&
            line.from.time.timestamp <= timeRange.to.timestamp &&
            line.to.time.timestamp >= timeRange.from.timestamp;
    }

    private timeToCoordinate(time: TimePoint): Coordinate {
        const timeScale = this._model.timeScale();
        const index = timeScale.timeToIndex(time, true)

        if (index === null) {
            return 0 as Coordinate;
        }

        return timeScale.indexToCoordinate(index)
    }

    private priceToCoordinate(price: number): Coordinate {
        const series = this._series;
        const priceScale = this._series.priceScale();

        const firstValue = series.firstValue();
        if (firstValue === null) {
            return 0 as Coordinate;
        }

        return priceScale.priceToCoordinate(price, firstValue.value)
    }
}