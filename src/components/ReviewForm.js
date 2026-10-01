"use client";


import { useState } from "react";
import { reviewApi } from "../api/reviewApi";


export default function ReviewForm({ movie, onSaveSuccess, onCancel }) {
 const [rating, setRating] = useState("");
 const [review, setReview] = useState("");

 const handleSubmit = async (e) => {
   e.preventDefault();


   const numericRating = Number(rating);
   if ( !rating || 
        !review.trim() ||
        numericRating < 0.5 ||
        numericRating > 5 ||
        !Number.isInteger(numericRating*2)
    ) {
     alert("별점과 한줄평을 모두 입력해주세요.");
     return;
   } 


    const newReview = {
    movieCd: movie.movieCd,
    movieNm: movie.movieNm,
    movieNmEn: movie.movieNmEn ?? "",
    director: (movie.directors ?? [])
        .map((director) => director.peopleNm)
        .join(", "),
    openDt: movie.openDt ?? "",
    genre: movie.genreAlt ?? "",
    nation: movie.nationAlt ?? "",
    rating: Number(rating),
    review: review.trim(),
    createdAt: new Date().toISOString(),
    };


   try {
     const result = await reviewApi.createReview(newReview);

     console.log("저장 완료:", result);
          
        
     alert("감상 기록이 저장되었습니다.");
     setRating("");
     setReview("");
     onSaveSuccess();
   } catch (error) {
     console.error(error);
     alert("저장에 실패했습니다.");
   }
 };


 return (
   <section className="review-panel" aria-labelledby="review-heading">
    <div className="review-card">
     <header className="review-card-header">
       <p className="review-eyebrow">MY MOVIE LOG</p>
       <h2 id="review-heading">이 영화, 어떠셨나요?</h2>
       <p>평점과 감상을 자유롭게 남겨보세요.</p>
     </header>


     <div className="review-movie-info">
       <span>선택한 영화</span>
       <h3>{movie.movieNm}</h3>
       <p>{movie.prdtYear || "제작연도 정보 없음"}</p>
       <p>{(movie.directors ?? []).map((director) => director.peopleNm).join(", ") || "정보 없음"}</p>
     </div>


     <form className="review-fields" onSubmit={handleSubmit}>
       <div className="review-field">
         <label htmlFor="review-rating">나의 평점</label>


         <select
           id="review-rating"
           value={rating}
           onChange={(e) => setRating(e.target.value)}
         >
           <option value="">평점 선택</option>
           <option value="0.5">0.5점</option>
           <option value="1">1점</option>
           <option value="1.5">1.5점</option>
           <option value="2">2점</option>
           <option value="2.5">2.5점</option>
           <option value="3">3점</option>
           <option value="3.5">3.5점</option>
           <option value="4">4점</option>
           <option value="4.5">4.5점</option>
           <option value="5">5점</option>
         </select>
       </div>


       <div className="review-field">
         <label htmlFor="review-text">한줄평</label>


         <textarea
           id="review-text"
           rows={4}
           value={review}
           onChange={(e) => setReview(e.target.value)}
           placeholder="영화에 대한 한줄평을 작성해보세요"
         />
       </div>


       <button className="review-save" type="submit">감상 기록 저장</button>
       <button className="review-cancel" type="button" onClick={onCancel}>취소</button>
     </form>
    </div>
   </section>
 );
}
