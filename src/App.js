import { useEffect, useRef, useState } from "react";
import StarRating from './StarRating'
import { useMovies } from "./useMovies";
import { useLocalStorageState } from './useLocalStorageState'
import { useKey } from "./useKey";

// API_KEY 
const KEY = '348d1b3a'

// Calc AVG Formulla
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);


// App COMPONENT
export default function App() {

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null)

  // Custom Hook 
  const { movies, isLoading, error } = useMovies(query)

  const [watched, setWatched] = useLocalStorageState([], 'watched ')


  // const [watched, setWatched] = useState([]);
  // const [watched, setWatched] = useState(function () {
  //   const storedValue = localStorage.getItem('watched')
  //   return JSON.parse(storedValue)
  // });


  function handleSelectedMovie(id) {
    setSelectedId(selectedId => (id === selectedId ? null : id))
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie])



  }

  function handleDeleteMovie(id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }


  // useEffect(function () {
  //   localStorage.setItem('watched', JSON.stringify(watched))
  // }, [watched])





  return (
    <>
      <Navbar >
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <Box >
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}

          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList onSelectMovie={handleSelectedMovie} movies={movies} />}
          {error && <ErrorMessage message={error} />}

        </Box>
        <Box>
          {selectedId ? <MovieDetails watched={watched} onAddWatch={handleAddWatched} onCloseMovie={handleCloseMovie} selectedId={selectedId} /> :
            <> <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteMovie} />
            </>
          }
        </Box>
      </Main>
    </>
  );
}

// Loader COMPONENT
function Loader() {
  return <p className="loader">Loading ...</p>
}

// Error COMPONENT
function ErrorMessage({ message }) {
  return <p className="error"><span>⛔</span>{message}</p>
}



// ========= NAVBAR ======== \\
// NavBar COMPONENT
function Navbar({ children }) {
  return <nav className="nav-bar">
    <Logo />
    {children}
  </nav>
}


function Logo() {
  return <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>
}

function Search({ query, setQuery }) {

  const inputEl = useRef(null)


  useEffect(function () {
    function callback(e) {
      if (document.activeElement === inputEl.current) return

      if (e.code === 'Enter') {
        inputEl.current.focus()
        setQuery('')
      }
    }

    document.addEventListener('keydown', callback)

    return () => document.addEventListener('keydown', callback)

  }, [setQuery])

  return <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    ref={inputEl}
  />
}

function NumResults({ movies }) {
  return <p className="num-results">
    Found <strong>{movies.length}</strong> results
  </p>
}




// ========== MAIN ===========\\
// Main COMPONENT
function Main({ children }) {
  return <main className="main">
    {children}
  </main>
}



// Box COMPONENT
function Box({ children }) {

  //===== STATES =====\\
  const [isOpen, setIsOpen] = useState(true);

  return <div className="box">

    <button
      className="btn-toggle"
      onClick={() => setIsOpen((open) => !open)}
    >
      {isOpen ? "➖" : "➕"}
    </button>

    {isOpen && (children)}

  </div>
}




//========== API SIDE ==========\\
// Movie Lise COMPONENT
function MovieList({ movies, onSelectMovie }) {
  return <ul className="list list-movies">
    {movies?.map((movie) => (
      <Movie onSelectMovie={onSelectMovie} key={movie.imdbID} movie={movie} />
    ))}
  </ul>
}


// movie COMPONENT
function Movie({ movie, onSelectMovie }) {
  return <li onClick={() => onSelectMovie(movie.imdbID)}>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>
}



//========== WATCHED SIDE ==========\\

function MovieDetails({ selectedId, onCloseMovie, onAddWatch, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState('')


  const countRef = useRef(0)
  useEffect(function () {
    if (userRating) {
      countRef.current += 1
    }
  }, [userRating])

  const isWatched = watched.map(movie => movie.imdbId).includes(selectedId)

  const watchedUserRating = watched.find(movie => movie.imdbId === selectedId)?.userRating

  const { Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    Plot: plot,
    Released: released,
    imdbRating,
    Actors: actors,
    Director: director,
    Genre: genre } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbId: selectedId,
      title,
      year,
      poster,
      imdbRating: +imdbRating,
      runtime: +(runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions: countRef.current

    }

    onAddWatch(newWatchedMovie)
    onCloseMovie()
  }

  useKey('escape', onCloseMovie)


  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true)

      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)

      const data = await res.json()

      setMovie(data)
      setIsLoading(false)
    }

    getMovieDetails()
  }, [selectedId])


  useEffect(function () {
    if (!title) return;

    document.title = `Movie | ${title}`

    return function () {
      document.title = 'Use Popcorn'
    }
  }, [title])


  return (
    <div className="details">
      {isLoading ? <Loader /> :
        <>
          <header>

            <button className="btn-back" onClick={onCloseMovie} >❌</button>

            <img src={poster} alt={`Poster of ${movie} movie`}></img>

            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull; {runtime}</p>

              <p>{genre}</p>
              <p><span>⭐</span>{imdbRating} IMDB Rating</p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating maxRating={10} size={24} onSetRating={setUserRating} />
                  {userRating > 0 &&
                    <button className="btn-add" onClick={handleAdd}>+ Add to list</ button>
                  }
                </>)
                : <p>You already watched this movie <span>⭐{watchedUserRating}</span></p>
              }
            </div>

            <p><em>{plot}</em></p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>

          </section>
        </>
      }
    </div >)
}


// Summary COMPONENT
function WatchedSummary({ watched }) {
  // Drived state
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));


  return <div className="summary">
    <h2>Movies you watched</h2>
    <div>
      <p>
        <span>#️⃣</span>
        <span>{watched.length} movies</span>
      </p>
      <p>
        <span>⭐️</span>
        <span>{avgImdbRating.toFixed(2)}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{avgUserRating.toFixed(2)}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{avgRuntime} min</span>
      </p>
    </div>
  </div>
}


// Watched List COMPONENT
function WatchedMovieList({ watched, onDeleteWatched }) {
  return <ul className="list">
    {watched.map((movie) => (
      <WatchedMovie key={movie.imdbId} movie={movie} onDeleteWatched={onDeleteWatched} />
    ))}
  </ul>
}


// Watched movie COMPONENT 
function WatchedMovie({ movie, onDeleteWatched }) {
  return <li >
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

      <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>❌</button>
    </div>
  </li>
}