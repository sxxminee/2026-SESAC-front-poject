const API_KEY = "1d3bf4fad446a12663e837e90d49ebcf";


const BASE_URL =
 "http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json";


export const searchMovies = async (movieName) => {
 const response = await fetch(
   `${BASE_URL}?key=${API_KEY}&movieNm=${encodeURIComponent(movieName)}`
 );


 if (!response.ok) {
   throw new Error("영화 검색에 실패했습니다.");
 }


 const data = await response.json();


 console.log(data);


 return data.movieListResult.movieList;
};
