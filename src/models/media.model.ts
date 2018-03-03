export class MediaModel{
    title: string;
    path: string;
    type: string;
    extension: string;
    link: string;

    constructor(title: string, path: string, type: string, extension: string) {
        this.title = title;
        this.path = path;
        this.type = type;
        this.extension = extension;
    }
}