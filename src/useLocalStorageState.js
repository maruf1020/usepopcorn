import { useState, useEffect } from "react";

export function useLocalStorageState(key, defaultValue) {
    const [value, setValue] = useState(() => {
        const savedWatchedMovie = localStorage.getItem(key);
        const storedValue = JSON.parse(savedWatchedMovie);
        return storedValue ? storedValue : defaultValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}