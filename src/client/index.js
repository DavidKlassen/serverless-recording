class Recorder {
    constructor(stream, {
        api,
        interval
    } = {}) {
        this.api = api;
        this.interval = interval;
        this.recorder = new MediaRecorder(stream);
    }

    start() {
        this.chunks = [];

        fetch(`${api}/recordings`, { method: 'post' })
            .then((res) => res.json())
            .then((uuid) => {
                this.id = uuid;
                this.startTime = this.currentChunkStartTime = Date.now();
                this.recorder.ondataavailable = (e) => {
                    this.chunks.push(new Promise((resolve, reject) => {
                        fetch(`${api}/recordings/${this.id}/chunks/${this.currentChunkStartTime}`, {
                            method: 'put',
                            body: e.data
                        });
                    }));
                };
            });



    }

    stop() {

    }
}
