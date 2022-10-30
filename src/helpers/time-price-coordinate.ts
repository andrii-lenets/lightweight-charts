export class TimePriceCoordinate<TimeType> {
    public readonly time: TimeType;
    public readonly price: number;

    public constructor(_time: TimeType, _price: number) {
        this.time = _time;
        this.price = _price;
    }
}