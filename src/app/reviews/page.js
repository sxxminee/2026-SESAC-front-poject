'use client'


import { useEffect, useState } from "react";
import MoviePoster from "@/components/MoviePoster";
import { reviewApi } from "../api/reviewApi";

export default function ReviewsPage () {
    const [reviews, setReviews] = useState([]);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        const fetchReviews = async () => {
            try {
                const data = await reviewApi.getReviews();
                if (!ignore) {
                    setReviews(data);
                }
            } catch (error) {
                if (!ignore) {
                    setError(error);
                }
            } finally {
                if (!ignore) {
                    setIsPending(false);
                }
            }
        };

        fetchReviews();

        return () => {
            ignore = true;
        };
    }, []);
    const [deletingId, setDeleteId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editRating, setEditRating] = useState("");
    const [editReview, setEditReview] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = (record) => {
        setEditingId(record.id);
        setEditRating(String(record.rating));
        setEditReview(record.review);
    };

    const handleUpdate = async (e, id) => {
        e.preventDefault();
        if (isSaving) return;

        const rating = Number(editRating);
        if (!Number.isInteger(rating*2) ||
            rating < 0.5 || rating > 5 ||
            !editReview.trim()) {
            alert("평점과 한줄평을 입력해주세요.");
            return;
        }

        setIsSaving(true);
        try {
            const updatedReview = await reviewApi.updateReview(id, {
                rating,
                review: editReview.trim(),
            });
            setReviews((prev) =>
                prev.map((record) => record.id === id ? updatedReview : record)
            );
            setEditingId(null);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm (" 이 기록을 삭제 할까요? ")) return ;

        setDeleteId(id);

        try {
            await reviewApi.deleteReview(id);

            setReviews((prev) => prev.filter((record) => record.id !== id));
        } catch (error) {
            alert(error.message);
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <main className="home-page records-page">
            <header className="home-header">
                <div>
                    <p className="home-eyebrow">MY MOVIE LOG</p>
                    <h1>나의 영화 <span>기록</span></h1>
                    <p className="home-subtitle"></p>
                </div>

                <a className="records-link" href="/" target="_blank">영화 검색하러 가기 <span aria-hidden="true">↗</span></a>
            </header>
            {isPending ? (
                <p className="records-state" role="status">기록을 불러오는 중입니다...</p>
            ) : error ? (
                <p className="records-state" role="alert">{error.message}</p>
            ) : reviews.length === 0 ? (
                <p className="records-state">아직 저장한 감상 기록이 없습니다.</p>
            ) : (
                <ul className="records-list">
                    {reviews.map((record) => (
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
