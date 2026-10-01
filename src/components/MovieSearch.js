"use client";

import { useState , useRef, useEffect } from "react";

import ReviewForm from "./ReviewForm";
import MoviePoster from "./MoviePoster";
import { searchMovies } from "@/app/api/movieApi";
import { useQuery,useQueryClient } from "@tanstack/react-query";

export default function MovieSearch() {
 const [keyword, setKeyword] = useState("");
 const [searchKeyword, setSearchKeyword] = useState("");
 const [selectedMovie, setSelectedMovie] = useState(null);

 const reviewFormRef = useRef(null);
 const queryClient = useQueryClient();

 const {
    data = [],
    isFetching: isSearching,
    error,
    } = useQuery({
        queryKey: ["movies", searchKeyword],
        queryFn: () => searchMovies(searchKeyword),
        enabled: false,
        retry: false,
 });

 const movies = searchKeyword ? data : [];
 const searchError = error?.message ?? "";

 const handleSearch = async () => {
    const submittedKeyword = keyword.trim();

    if (!submittedKeyword || isSearching) return;

    setSearchKeyword(submittedKeyword);
    setSelectedMovie(null);

    try {
        const result = await queryClient.fetchQuery({
        queryKey: ["movies", submittedKeyword],
        queryFn: () => searchMovies(submittedKeyword),
        staleTime: 0,
        retry: false,
        });

        setKeyword("");

        if (result.length === 0) {
        alert("검색 결과가 없습니다.");

        setSearchKeyword("");
        setSelectedMovie(null);
        }
    } catch (error) {
        console.error("영화 검색 실패:", error);
    }
    };


 const handleSelect = (movie) => {
   setSelectedMovie(movie);
   // console.log(movie);
 };

 useEffect(() => {
    if (selectedMovie) {
        reviewFormRef.current?.scrollIntoView({
            behavior : "smooth",
            // block : "start",
        });
    }
 },[selectedMovie]);


 const handleSaveSuccess = () => {
    setKeyword("");
    setSearchKeyword("");
    setSelectedMovie(null);
 };

 const handleReviewCancel = () => {
    setSelectedMovie(null);
    window.scrollTo({top:0, behavior: "smooth"});
 };


 return (
   <div>
      <form className="movie-search" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <label htmlFor="movie-keyword">어떤 영화를 보셨나요?</label>
        <div className="search-controls">
        <input
        id="movie-keyword"
        disabled={isSearching}
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="영화 제목을 입력하세요"
        />

        <button type="submit" disabled={isSearching}>
        {isSearching ? "검색 중..." : "검색"}
        </button>
        </div>
     </form>
     <p className="search-source">KMDb 영화 정보 · 검색 결과 최대 30편</p>
     {searchError && <p className="records-state" role="alert">{searchError}</p>}

     <div className = "movie-list">
       {movies.map((movie) => (
         <div className = "movie-card" key={movie.DOCID}>
           <MoviePoster src={(movie.posters || "").split("|")[0].trim()} title={(movie.title || "").replace(/!HS|!HE/g, "").trim()} />
           <h3>{(movie.title || "").replace(/!HS|!HE/g, "").trim()}</h3>
           <p>영문명: {movie.titleEng}</p>
           <p>제작연도: {movie.prodYear}</p>
           <p>
             감독: {(movie.directors?.director ?? []).map((director) => director.directorNm).join(", ") || "정보 없음"}
           </p>
           <p>장르 : {movie.genre}</p>
           <p>배우: {(movie.actors?.actor ?? []).slice(0, 5).map((actor) => actor.actorNm).join(", ") || "정보 없음"}</p>

           <button disabled={isSearching} onClick={() => handleSelect(movie)}>
             기록하기
           </button>
         </div>
       ))}
     </div>


     {selectedMovie && (
        <div className="review-anchor" ref = {reviewFormRef}>
            <ReviewForm
                key={selectedMovie.DOCID}
                movie={selectedMovie}
                onSaveSuccess={handleSaveSuccess}
                onCancel = {handleReviewCancel}
            />
        </div>
     )}
   </div>
 );
}
