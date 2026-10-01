"use client";


import { useState } from "react";
import MoviePoster from "./MoviePoster";
import { reviewApi } from "@/app/api/reviewApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export default function ReviewForm({ movie, onSaveSuccess, onCancel }) {

 const [rating, setRating] = useState("");
 const [review, setReview] = useState("");

 const queryClient = useQueryClient();

 const createMutation = useMutation ({
    mutationFn : async (newReview) => {
        const savedReviews = await reviewApi.getReviews();
        const alreadyRecorded = savedReviews.some((record) => record.docId === movie.DOCID);

        if (alreadyRecorded) {
        const error = new Error("이미 기록한 영화 입니다. 나의 기록에서 수정해주세요.");
       
        error.code = "DUPLICATE_REVIEW";
        throw error;
        }

     return reviewApi.createReview(newReview);
    },

    onSuccess: async () => {
        await queryClient.invalidateQueries({
            queryKey : ["reviews"],
        });

        alert ("감상 기록이 저장 되었습니다.");

        setRating("");
        setReview("");
        onSaveSuccess();
    },

    onError : (error) =>{
        if(error.code === "DUPLICATE_REVIEW") {
            alert(error.message);
            onCancel();
            return;
        }

        alert ("저장에 실패 했습니다.");
    },
});

 const isSaving = createMutation.isPending;

 const title = (movie.title || "").replace(/!HS|!HE/g, "").replace(/\s+/g, " ").trim();
 const directorNm = (movie.directors?.director ?? []).map((director) => director.directorNm).join(", ");
 const actorNames = (movie.actors?.actor ?? []).map((actor) => actor.actorNm);
 const posterUrl = (movie.posters || "").split("|")[0].trim();

 const handleSubmit = (e) => {
   e.preventDefault();

   if (isSaving) return;

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
    source: "KMDB",
    docId: movie.DOCID,
    movieId: movie.movieId,
    movieSeq: movie.movieSeq,
    title,
    titleEng: movie.titleEng,
    prodYear: movie.prodYear,
    directorNm,
    actorNames,
    posterUrl,
    repRlsDate: movie.repRlsDate,
    genre: movie.genre,
    nation: movie.nation,
    rating: Number(rating),
    review: review.trim(),
    createdAt: new Date().toISOString(),
    };

   createMutation.mutate(newReview);
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
       <MoviePoster src={posterUrl} title={title} />
       <span>선택한 영화</span>
       <h3>{title}</h3>
       <p>{movie.prodYear || "제작연도 정보 없음"}</p>
       <p>감독: {directorNm || "정보 없음"}</p>
       <p>배우: {actorNames.slice(0, 5).join(", ") || "정보 없음"}</p>
     </div>


     <form className="review-fields" onSubmit={handleSubmit}>
       <div className="review-field">
         <label htmlFor="review-rating">나의 평점</label>


         <select
           id="review-rating"
           disabled={isSaving}
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
           disabled={isSaving}
           rows={4}
           value={review}
           onChange={(e) => setReview(e.target.value)}
           placeholder="영화에 대한 한줄평을 작성해보세요"
         />
       </div>


       <button className="review-save" type="submit" disabled={isSaving}>{isSaving ? "저장 중..." : "감상 기록 저장"}</button>
       <button className="review-cancel" type="button" disabled={isSaving} onClick={onCancel}>취소</button>
     </form>
    </div>
   </section>
 );
}
