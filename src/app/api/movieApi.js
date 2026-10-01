export const searchMovies = async (title) => {
//   const response = await fetch(`/api/movies?title=${encodeURIComponent(title)}`);
  const response = await fetch(`/api?title=${encodeURIComponent(title)}`);
  
const data = await response.json();
  if (!response.ok) throw new Error(data.error || '영화 검색에 실패했습니다.');
  // route.js는 KMDb 원본 응답을 전달하므로 그 안의 영화 배열을 꺼냅니다.
  const collection = data.Data?.[0];
  if (Number(data.TotalCount) === 0 || Number(collection?.TotalCount) === 0) {
    return [];
  }
  if (!Array.isArray(collection?.Result)) {
    throw new Error('KMDb 영화 목록을 읽을 수 없습니다.');
  }
  return collection.Result;
};
