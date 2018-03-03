export class ChannelModel{
    number: number;
    name: string;
    quality: string;
    url: string;

    constructor(number: number, name: string, quality: string, url: string) {
        this.number = number;
        this.name = name;
        this.quality = quality;
        this.url = url;
    }
}