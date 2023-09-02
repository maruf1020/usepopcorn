import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const APIKey = "f934c8b3";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null);


  function handleSelectedMovie(id) {
    setSelectedID((prev) => prev === id ? null : id);
  }

  function handleCloseMovie() {
    setSelectedID(null);
  }

  function handleAddWatchedMovie(movie) {
    if (watched.some((watchedMovie) => watchedMovie.imdbID === movie.imdbID)) {
      setWatched((prev) => prev.filter((watchedMovie) => watchedMovie.imdbID !== movie.imdbID));
    }
    setWatched((prev) => [...prev, movie]);
  }

  function handleDeleteWatchedMovie(id, e) {
    e.stopPropagation();
    setWatched((prev) => prev.filter((movie) => movie.imdbID !== id));
    setSelectedID(null);
  }

  useEffect(() => {
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    const abortController = new AbortController();
    (async function getMovies() {
      handleCloseMovie();
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${APIKey}&s=${query}`, { signal: abortController.signal });

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
      abortController.abort();
    }
  }, [query]);

  // useEffect(() => {
  //   document.title = "usePopcorn";
  // }, [selectedID]);

  return (
    <>
      <Nav >
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Nav>
      <Main>
        <Box>
          {/* {loading ? <Loader /> : <MovieList movies={movies} />} */}
          {loading && <Loader />}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {!loading && !error && <MovieList movies={movies} onSelectedMovie={handleSelectedMovie} />}
        </Box>
        <Box>
          {selectedID ?
            <MovieDetails
              selectedID={selectedID}
              onCLoseMovie={handleCloseMovie}
              onAddWatchMovie={handleAddWatchedMovie}
              watched={watched} /> :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onSelectedMovie={handleSelectedMovie}
                onDeleteWatchedMovie={handleDeleteWatchedMovie} />
            </>}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return (
    <p className="loader">Loading...</p>
  )
}

function ErrorMessage({ children }) {
  return (
    <p className="error">
      <span role="img" aria-label="error">⚠️</span>
      {children}
    </p>
  )
}

function Nav({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span alt="popcorn" role="img" aria-label="popcorn">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main>
  )
}


function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  )
}

function MovieList({ movies, onSelectedMovie }) {

  if (movies?.length < 1) {
    return <div className="search-instruction"><h2>Search a movie name to get started</h2></div>
  }

  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectedMovie={onSelectedMovie} />
      ))}
    </ul>
  )
}

function Movie({ movie, onSelectedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails({ selectedID, onCLoseMovie, onAddWatchMovie, watched }) {
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const watchedMovieIDs = watched.map((movie) => movie.imdbID);
  const isRated = watchedMovieIDs.includes(selectedID);
  const prevRating = watched.find((movie) => movie.imdbID === selectedID)?.userRating;

  const { Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating: imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetails;

  useEffect(() => {

    function handleEscape(e) {
      if (e.code === "Escape") {
        onCLoseMovie();
      }
    }

    document.addEventListener("keydown", handleEscape, {
      once: true
    });

    return () => {
      document.removeEventListener("keydown", handleEscape);
    }

  }, [onCLoseMovie]);

  useEffect(() => {
    (async function getMovieDetails() {
      setLoading(true);
      try {
        const res = await fetch(`http://www.omdbapi.com/?apikey=${APIKey}&i=${selectedID}`);
        if (!res.ok) {
          throw new Error("Something went wrong with getting movie details");
        }
        const data = await res.json();
        setMovieDetails(data);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedID]);

  function handleAddWatchedMovie() {
    const watchedMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatchMovie(watchedMovie);
    onCLoseMovie();
  }

  useEffect(() => {
    if (!title) return;
    document.title = `Title | ${title}`;

    return () => {
      document.title = "usePopcorn";
    }
  }, [title]);

  return (
    <div className="details" key={selectedID}>
      {loading ? <Loader /> :
        <>
          <header>
            <button className="btn-back" onClick={onCLoseMovie}>&larr;</button>
            <img src={poster} alt={`${title} poster`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p><span>⭐</span>{imdbRating} IMDb Rating</p>
            </div>
          </header>
          <section>
            <div className="rating">
              {isRated && <span style={{ textAlign: "center" }} className="user-rating">Previous user rating: {prevRating} ⭐ But it's changeable</span>}
              <StarRating maxRating={10} size={24} defaultRating={isRated ? prevRating : Number(imdbRating)} onSetRating={setUserRating} />
              {userRating > 0 && isRated && <button className="btn-add" onClick={handleAddWatchedMovie}>📈 update Rating </button>}
              {userRating > 0 && !isRated && <button className="btn-add" onClick={handleAddWatchedMovie}> 📝 Add to watched</button>}
            </div>
            <p><em>{plot}</em></p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      }

    </div>
  )
}

function WatchedSummary({ watched }) {
  const avgIMDbRating = average(watched.map((movie) => movie.imdbRating)).toFixed(1);
  // 2 digit decimal
  const avgUserRating = average(watched.map((movie) => movie.userRating)).toFixed(1);
  const avgRuntime = average(watched.map((movie) => movie.runtime)).toFixed(0);
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgIMDbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovieList({ watched, onSelectedMovie, onDeleteWatchedMovie }) {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onSelectedMovie={onSelectedMovie}
          onDeleteWatchedMovie={onDeleteWatchedMovie} />
      ))}
    </ul>
  )
}

function WatchedMovie({ movie, onSelectedMovie, onDeleteWatchedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={(e) => onDeleteWatchedMovie(movie.imdbID, e)}>&times;</button>
      </div>
    </li>
  )
}