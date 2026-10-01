import MovieSearch from "@/components/MovieSearch";
import Image from "next/image";


export default function Home() {
 return (
   <main className="home-page">
     <header className="home-header">
       <div className="page-brand">
         <Image className="page-logo" src="/img/page-logo.png" alt="" width={112} height={84} priority />
         <div className="page-brand-text">
         <p className="home-eyebrow">영화 많이 보는게 숨긴다고 숨겨지는 것도 아니고 ... </p>
         {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
         <h1><a href = "/">Movie <span>Log</span></a></h1>
         <p className="home-subtitle">나만의 영화 감상 기록</p>
         </div>
       </div>
       <nav className="home-actions" aria-label="영화 기록 및 검색">
         <a className="records-link" href="/reviews" >나의 기록 보기 <span aria-hidden="true">↗</span></a>
         <a className="records-link movie-finder-link" href="https://pedia.watcha.com/ko?domain=movie" target="_blank">영화 제목 찾아보기 <span aria-hidden="true">↗</span></a>
       </nav>
     </header>
     <MovieSearch/>
   </main>
 );
}
