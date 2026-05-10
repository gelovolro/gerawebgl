import { Engine } from '../../core/engine/engine.js';

export class EngineTestFactory {
    static createCanvas() {
        return new HTMLCanvasElement();
    }

    static createEngine(options) {
        return new Engine(EngineTestFactory.createCanvas(), options);
    }
}
