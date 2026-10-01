"use client";

import { useState } from "react";

export default function MoviePoster({ src, title }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const valid = /^https?:\/\//i.test(src ?? "");
  return (
    <div className="movie-poster">
      {valid && failedSrc !== src ? (
        // 외부 API 포스터 URL을 그대로 표시하고 실패 시 대체 화면을 제공합니다.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${title} 포스터`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} />
      ) : <span>포스터 정보 없음</span>}
    </div>
  );
}
