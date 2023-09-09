import { useState, useEffect } from "react";

const APIKey = "f934c8b3";

export function useMovies(query, callback) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (query.length < 3) {
            setMovies([]);
            setError("");
            return;
        }

        const controller = new AbortController();
        (async function getMovies() {
            // handleCloseMovie();
            // callback?.();
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${APIKey}&s=${query}`, { signal: controller.signal });

                if (!res.ok) {
                    throw new Error("Something went wrong with getting movies");
                }

                const data = await res.json();
                if (data.Response === "False" || data.Search === undefined) {
                    throw new Error("Movie not found!");
                } else if (data.Response === "True") {
                    setMovies(data.Search);
                }

            } catch (err) {
                console.log(err.message);

                if (err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            controller.abort();
        }
    }, [query]);

    return { movies, loading, error };
}