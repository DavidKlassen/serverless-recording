import EventEmitter from 'events';


class Recorder extends EventEmitter {
    constructor(stream, {
        api = 'https://4xyvrr16b0.execute-api.eu-west-1.amazonaws.com/test'
    }) {
        super();
        this.api = api;
        this.recording = {
            id: null,
            startTime: null,
            currentChunkTime: null,
            chunksUploaded: []
        };
        this.recorder = new MediaRecorder(stream);
        this.recorder.onstart = () => {
            this.recording.startTime = Date.now();
            this.recording.currentChunkTime = this.recording.startTime;
            this.recording.chunksUploaded = [];
            this.emit('start', this.recording);
        };
        this.recorder.onstop = () => {
            Promise.all(this.recording.chunksUploaded)
                .then(() => fetch(`${this.api}/recordings/${this.recording.id}`, {
                    method: 'PATCH',
                    headers: new Headers({'content-type': 'application/json'}),
                    body: JSON.stringify({
                        status: 'stopped'
                    })
                }).then((r) => r.json()).then((json) => this.emit('stop', json)));
        };
        this.recorder.ondataavailable = (e) => {
            const url = `${this.api}/recordings/${this.recording.id}/chunks/${this.recording.currentChunkTime}`;
            this.recording.chunksUploaded.push(fetch(url, {
                method: 'PUT',
                body: e.data
            }).then((r) => r.json()).then((json) => this.emit('chunk', json)));
            this.recording.currentChunkTime = Date.now();
        };
    }

    start(interval) {
        return fetch(`${this.api}/recordings`, { method: 'POST' })
            .then((res) => res.json())
            .then((uuid) => this.recording.id = uuid)
            .then(() => this.recorder.start(interval));
    }

    stop() {
        return this.recorder.stop();
    }
}

export default Recorder;
