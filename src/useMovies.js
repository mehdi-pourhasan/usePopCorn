import { useState, useEffect } from "react";

// API_KEY 
const KEY = '348d1b3a'


export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(function () {

        // callback?.()


        const controller = new AbortController();

        async function fetchMovies() {

            try {
                // Reset error before fetching data
                setError('')


                // Loading before get data 
                setIsLoading(true)

                // Get data from API
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal })

                // Convert data
                const data = await res.json()

                // failed fetch
                if (!res.ok) throw new Error('Something went wrong with fetching movies')

                // Wrong search query
                if (data.Response === 'False') throw new Error('Movie Not Found :(')

                // Store data to movie
                setMovies(data.Search)
                setError('')

            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.log(err.message)
                    setError(err.message)
                }

            } finally {
                // Get rid of loader
                setIsLoading(false)
            }
        }

        // Provide from get "NOT FOUND" error at the begining
        if (query.length < 3) {
            setMovies([])
            setError('')
            return
        }


        fetchMovies()


        return function () {
            controller.abort()
        }
    }, [query])


    return { movies, isLoading, error }
}