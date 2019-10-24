class SplitterTransformer {
    constructor(separator) {
        this.separator = separator;
        this.data = "";
    }

    start(controller) {}

    async transform(chunk, controller) {
        const data = this.data + chunk;
        const chunks = data.split(this.separator);
        this.data = chunks.pop();
        for (let out_chunk of chunks)
            controller.enqueue(out_chunk);
    }

    flush(controller) {}
};

export class LineSplitterStream extends TransformStream {
    constructor(separator = "\r\n") {
        super(new SplitterTransformer(separator));
    }
}
