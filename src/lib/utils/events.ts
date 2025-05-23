import { DependencyList, useEffect } from "react";

let idCounter = 0;
export class EventEmitter<T> {
    private subscribers: Map<string, (value: T) => void> = new Map();

    public subscribe(listener: (value: T) => void) {
        const key = `sub-${idCounter++}`;
        this.subscribers.set(key, listener);
        return () => void this.subscribers.delete(key);
    }

    public send(value: T) {
        this.subscribers.forEach((listener) => listener(value));
    }

    public use(listener: (value: T) => void, deps: DependencyList) {
        return useEffect(() => {
            return this.subscribe(listener);
        }, deps);
    }
}
