"use client";

import { useState , useRef, useEffect } from "react";
import { searchMovies } from "../api/movieApi";
import ReviewForm from "./ReviewForm";


export default function MovieSearch() {
 const [keyword, setKeyword] = useState("");
 const [movies, setMovies] = useState([]);
 const [selectedMovie, setSelectedMovie] = useState(null);
 const reviewFormRef = useRef(null);


 const handleSearch = async () => {
   if (!keyword.trim()) return;

   const searchKeyword = keyword.trim();

   try {
     const result = await searchMovies(searchKeyword);

     if (result.length ===0) {
        alert("검색 결과가 없습니다.");
        setKeyword("");
        setMovies([]);
        setSelectedMovie(null);
        return;
     } else {
        setMovies(result);
        setKeyword("");
    }
   } catch (error) {
     console.error(error);
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
   setMovies([]);
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
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="영화 제목을 입력하세요"
        />

        <button type="submit">
        검색
        </button>
        </div>
     </form>

     <div className = "movie-list">
       {movies.map((movie) => (
         <div className = "movie-card" key={movie.movieCd}>
           <h3>{movie.movieNm}</h3>
           <p>영문명: {movie.movieNmEn}</p>
           <p>제작연도: {movie.prdtYear}</p>
           <p>
             감독: {(movie.directors ?? []).map((director) => director.peopleNm).join(", ") || "정보 없음"}
           </p>
           <p>장르 : {movie.repGenreNm}</p>

           <button onClick={() => handleSelect(movie)}>
             기록하기
           </button>
         </div>
       ))}
     </div>


     {selectedMovie && (
        <div className="review-anchor" ref = {reviewFormRef}>
            <ReviewForm 
                movie={selectedMovie}
                onSaveSuccess={handleSaveSuccess}
                onCancel = {handleReviewCancel}
            />
        </div>
     )}
   </div>
 );
}
