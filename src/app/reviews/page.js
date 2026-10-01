'use client'

import { useState } from "react";
import Image from "next/image";
import MoviePoster from "@/components/MoviePoster";
import { reviewApi } from "../api/reviewApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export default function ReviewsPage () {

    const queryClient = useQueryClient();
    const {data : reviews = [], isPending, error} = useQuery({
        queryKey : ['reviews'],
        queryFn : reviewApi.getReviews
    });

    const [editingId, setEditingId] = useState(null);
    const [editRating, setEditRating] = useState("");
    const [editReview, setEditReview] = useState("");
    const [sortBy, setSortBy] = useState("latest");

    const handleEdit = (record) => {
        setEditingId(record.id);
        setEditRating(String(record.rating));
        setEditReview(record.review);
    };

    const updateMutation = useMutation ({
        mutationFn : ({id, values}) => {
            return reviewApi.updateReview(id, values);
        },

        onSuccess : async() => {
            await queryClient.invalidateQueries({queryKey:["reviews"]});

            setEditingId(null);
        },

        onError : (error) => {
            alert(error.message);
        },
    });
    const isSaving = updateMutation.isPending;

    const handleUpdate = (e, id) => {
        e.preventDefault();

        if (isSaving) return;

        const rating = Number(editRating);

        if (
            !Number.isInteger(rating * 2) ||
            rating < 0.5 ||
            rating > 5 ||
            !editReview.trim()
        ) {
            alert("평점과 한줄평을 입력해주세요.");
            return;
        }

        updateMutation.mutate({
            id,
            values: {
            rating,
            review: editReview.trim(),
            },
        });
    };


    const deleteMutation = useMutation({
        mutationFn : (id) => {
            return reviewApi.deleteReview(id);
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey:["reviews"],
            });
        },

        onError : (error) => {
            alert(error.message);
        },
    });

    const deletingId = deleteMutation.isPending ? deleteMutation.variables : null;

    const handleDelete = (id) => {
        if (deleteMutation.isPending) return;

        if (!window.confirm("이 기록을 삭제할까요?")) return;

        deleteMutation.mutate(id);
    };

    const sortedReviews = [...reviews].sort((a,b) => {
        if (sortBy === "ratingHigh") {
            return b.rating - a.rating;
        } else if (sortBy === "ratingLow") {
            return a.rating - b.rating;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    }); 


    return (
        <main className="home-page records-page">
            <header className="home-header">
                <div className="page-brand">
                    <Image className="page-logo" src="/img/page-logo.png" alt="" width={112} height={84} priority />
                    <div className="page-brand-text">
                    <p className="home-eyebrow">나의 영화 기록</p>
                    <h1>MY MOVIE <span>LOG</span></h1>
                    <p className="home-subtitle"></p>
                    </div>
                </div>

                <a className="records-link" href="/">영화 검색하러 가기 <span aria-hidden="true">↗</span></a>
            </header>
                <div className="sort-controls">
                    <label htmlFor="review-sort"> 정렬하기 </label>

                    <select
                        id="review-sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="latest">최신순</option>
                        <option value="ratingHigh">평점 높은 순</option>
                        <option value="ratingLow">평점 낮은 순</option>
                    </select>
                </div>
            {isPending ? (
                <p className="records-state" role="status">기록을 불러오는 중입니다...</p>
            ) : error ? (
                <p className="records-state" role="alert">{error.message}</p>
            ) : reviews.length === 0 ? (
                <p className="records-state">아직 저장한 감상 기록이 없습니다.</p>
            ) : (
                <ul className="records-list">
                    {sortedReviews.map((record) => (
                        <li className="record-card" key = {record.id}>
                            <MoviePoster src={record.posterUrl} title={record.title} />
                            <h2>
                                <a
                                    className="record-title-link"
                                    href={`https://pedia.watcha.com/ko/search?query=${encodeURIComponent(record.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${record.title} — 왓챠피디아 검색 (새 탭)`}
                                >
                                    {record.title} <span aria-hidden="true">↗</span>
                                </a>
                            </h2>
                            <p className="record-director">감독 : {record.directorNm || "정보 없음"}</p>
                            <p className="record-director">배우: {record.actorNames?.slice(0, 5).join(", ") || "정보 없음"}</p>
                            <p className = "record-genre">장르 : {record.genre}</p>
                            <p className = "record-openDt">개봉일 : {record.repRlsDate}</p>
                            {editingId === record.id ? (
                                <form className="record-edit" onSubmit={(e) => handleUpdate(e, record.id)}>
                                    <label className="review-field">
                                        평점
                                        <select
                                            value={editRating}
                                            onChange={(e) => setEditRating(e.target.value)}
                                            disabled={isSaving}
                                        >

                                            {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => (
                                                <option key={rating} value={rating}>{rating}점</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="review-field">
                                        한줄평
                                        <textarea
                                            rows={4}
                                            value={editReview}
                                            onChange={(e) => setEditReview(e.target.value)}
                                            disabled={isSaving}
                                            required
                                        />
                                    </label>
                                    <div className="record-actions">
                                    <button className="record-primary" type="submit" disabled={isSaving}>
                                        {isSaving ? "저장 중..." : "저장"}
                                    </button>
                                    <button type="button" onClick={() => setEditingId(null)} disabled={isSaving}>
                                        취소
                                    </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <p className="record-rating"><span aria-hidden="true">★ </span>평점 {record.rating} / 5</p>
                                    <p className="record-text">{record.review}</p>
                                </>
                            )}
                            {record.createdAt && (
                                <p className="record-date">
                                    작성일 : {" "}
                                    {new Date(record.createdAt).toLocaleDateString("ko-KR")}
                                </p>
                            )}
                            <div className="record-actions record-footer">
                            <button
                                className="record-primary"
                                type="button"
                                onClick={() => handleEdit(record)}
                                disabled={editingId !== null || deletingId !== null}
                            >
                                수정
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(record.id)}
                                disabled={deletingId !== null || editingId !== null}
                            >
                                {deletingId === record.id ? " 삭제중... " : " 삭제 "}
                            </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )
            }
        </main>
    )
}
