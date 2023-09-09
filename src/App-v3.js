import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";


const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const APIKey = "f934c8b3";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const { movies, loading, error } = useMovies(query, handleCloseMovie);
  const [watched, setWatched] = useLocalStorageState("watchedMovies", []);

  // const [watched, setWatched] = useState([]);
  // const [watched, setWatched] = useState(() => {
  //   const savedWatchedMovie = localStorage.getItem("watchedMovies");
  //   const initialValue = JSON.parse(savedWatchedMovie);
  //   return initialValue || [];
  // });

  //We should do like this:
  // const [watched, setWatched] = useState(btn-deletelocalStorage.getItem("watchedMovies")));
  //Because, if we do like this, react will call the function every time the component renders. So, we should use the function as a parameter to useState hook. So, it will be called only once when the component renders for the first time.

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
    setWatched((prev) => {
      // localStorage.setItem("watchedMovies", JSON.stringify([...prev, movie]));
      return [...prev, movie]
    });
  }

  // useEffect(() => {
  //   localStorage.setItem("watchedMovies", JSON.stringify(watched));
  // }, [watched]);
  //the benefit of using useEffect here in this scenario is that we can use always updated with watch movies. Either the movies are added or deleted, we can always get the updated watched movies. If we don't use useEffect and use inside of handleAddWatchedMovie function, we can only get the updated watched movies when we add a new movie. But, if we delete a movie, we cannot get the updated watched movies. So, we should use useEffect here.

  function handleDeleteWatchedMovie(id, e) {
    e.stopPropagation();
    setWatched((prev) => prev.filter((movie) => movie.imdbID !== id));
    setSelectedID(null);
  }

  return (
    <>
      <Nav >
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Nav>
      <Main>
        <Box>
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
  //this is not ideal way get a element using useEffect. Because, if we use useEffect without  of useRef, there will be some problems. If we use useEffect, the document.querySelector(".search") will call every time the component renders. So, it will be called every time the component renders. But, if we use useRef, it will be called only once when the component renders for the first time.
  // useEffect(() => {
  //   document.querySelector(".search").focus();
  // }, []);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);



  useKey("Enter", () => {
    if (document.activeElement === inputRef.current) return;
    inputRef.current.focus();
    setQuery("");
  });

  // useEffect(() => {
  //   console.log(inputRef)

  //   function callback(e) {

  //     // if (document.activeElement === inputRef.current) return;

  //     if (e.code === "Enter") {
  //       if (document.activeElement === inputRef.current) return;
  //       inputRef.current.focus();
  //       setQuery("");
  //     }
  //   }

  //   document.addEventListener("keydown", callback);
  //   return () => {
  //     document.removeEventListener("keydown", callback);
  //   }

  // }, [setQuery]);


  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputRef}
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

  const countRef = useRef(0);
  //this is a good practice. Because, if we use this, the count will not be reset every time the component renders. So, we should use useRef to keep the count value. So, it will not be reset every time the component renders. If this value is need only for current render, we can use just a let or a const variable. But if we need this value for future renders, we should use useRef. 
  let count = 0;
  //this is not a good practice. Because, if we use this, the count will be reset every time the component renders. So, we should use useRef to keep the count value. So, it will not be reset every time the component renders. If this value is need only for current render, we can use this. But, if we need this value for future renders, we should use useRef.
  //SO, In the conclusion, 
  //1. use let or const:: if the value is need only for current render and the value change don't make any re-render.
  //2. use useEffect:: if the value is need for each render and the value change will make a re-render.
  //3. use useRef:: if the value is need for each render and the value change don't make any re-render.

  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating])

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

  // /* eslint-disable */
  // if (imdbRating > 7) [isHigh, setIsHigh] = useState(true);
  // we cannot use hooks conditionally

  //even though we can use hooks after conditional statements, we cannot use them inside loops. finally, hooks should be same number and order in every render
  // if (imdbRating > 7) return <p>High rating</p>


  //const [isHigh, setIsHigh] = useState(imdbRating > 7);
  // console.log(isHigh)
  //This is a bad practice because we are setting the state based on the props. Instead, we should use useEffect to set the state based on the props. Otherwise, the state will not be updated when the props change. SO, we should use the useState hook's parameter value always as a static value which will not change in the future. If it changes, we should use useEffect to update the state.Like this:
  //const [isHigh, setIsHigh] = useState(false);
  // useEffect(() => {
  //   setIsHigh(imdbRating > 7);
  // }, [imdbRating]); 

  useKey("Escape", onCLoseMovie);

  // useEffect(() => {

  //   function handleEscape(e) {
  //     if (e.code === "Escape") {
  //       onCLoseMovie();
  //     }
  //   }

  //   document.addEventListener("keydown", handleEscape, {
  //     once: true
  //   });

  //   return () => {
  //     document.removeEventListener("keydown", handleEscape);
  //   }

  // }, [onCLoseMovie]);

  useEffect(() => {
    const controller = new AbortController();
    (async function getMovieDetails() {
      setLoading(true);
      try {
        const res = await fetch(`http://www.omdbapi.com/?apikey=${APIKey}&i=${selectedID}`, { signal: controller.signal });
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

    return () => {
      controller.abort();
    }

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
      userRatingCount: countRef.current,
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