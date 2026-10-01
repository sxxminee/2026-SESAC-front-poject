# KMDb 전환 안내

## 실행

1. `npm install`
2. 프로젝트 루트의 `.env.local`에 `KMDB_API_KEY=발급받은키`를 설정합니다. 현재 로컬에는 설정되어 있습니다.
3. 터미널 하나에서 `npm run dev`, 다른 터미널에서 `npm run server`를 실행합니다.
4. 환경변수를 변경했다면 Next.js 개발 서버를 재시작합니다.

## 현재 흐름

브라우저 → `src/api/movieApi.js` → `/api/movies` → KMDb JSON API.
인증키는 서버에서만 읽고, KOBIS 검색으로 자동 전환하지 않습니다.
검색 실패는 화면에 표시하며 입력값을 유지합니다.

별도 데이터 변환 파일 없이 처음 KOBIS 버전과 비슷한 구조를 사용합니다.
서버 route.js는 인증키와 요청 오류를 처리하고 KMDb 응답을 그대로 전달합니다.
movieApi.js는 Data[0].Result 영화 목록만 반환합니다.
MovieSearch는 DOCID, directors.director, actors.actor, posters를 직접 읽습니다.
ReviewForm에서 표시할 값과 저장할 newReview 객체를 만듭니다.
reviewApi.js는 json-server 응답을 그대로 반환합니다.
저장 기록 필드: source, docId, movieId, movieSeq, title, titleEng,
prodYear, directorNm, actorNames, repRlsDate, genre, nation, posterUrl.
기록에는 rating, review, createdAt과 json-server의 id도 저장합니다.

KMDb의 DOCID로 작품을 구분합니다.
포스터는 응답의 posters에서 첫 이미지 주소를 사용합니다.
배우는 저장 시 전체 목록을 유지하고 화면에서는 처음 5명을 표시합니다.
정보가 없거나 이미지가 로드되지 않으면 대체 문구가 표시됩니다.

## 저장 기록

현재 기록은 모두 KMDb 형식입니다. 이전 KOBIS 형식의 변환 코드와 안내는 제거했습니다.
기록 페이지는 저장된 필드를 직접 읽으며, 배우나 포스터가 없으면 대체 문구를 표시합니다.
KMDb 기록은 docId로 중복 등록을 막습니다.
정리 과정에서 db.json의 기록은 변경하지 않았습니다.
이전 형식의 db.json만 복원하면 현재 화면과 호환되지 않으므로,
이전 버전으로 돌아갈 때는 해당 시점의 코드와 데이터를 함께 복원하세요.

## 백업과 복원

데이터 변환 파일 제거 전의 코드와 기록 백업:
`backups/before-simple-structure-20260930-172133.zip`
이 백업의 src, db.json, 전환 안내 문서를 함께 복원하면 단순화 이전 상태로 돌아갑니다.
db.json 교체 전에는 이후 추가한 기록을 별도로 보관하세요.

전환 직전 코드 및 기록 백업:
`backups/before-kmdb-20260930-170016.zip`

압축 파일에는 src, public, db.json, package.json, package-lock.json,
Next.js/ESLint 설정, README, .gitignore가 들어 있습니다.
node_modules, .next, Git 이력, 인증키 환경변수 파일은 포함하지 않습니다.

복원하려면 먼저 개발 서버와 json-server를 종료하고, 현재 작업도 별도로 백업하세요.
압축을 별도 폴더에 풀어 백업의 src와 설정 파일을 복사하면 됩니다.
이번에 새로 추가한 src/app/api/movies,
src/components/MoviePoster.js는 이전 버전에는 없으므로 복원 시 별도로 정리합니다.
백업 시점의 movieApi.js는 KMDb 시도 후 KOBIS로 복구하는 중간 버전입니다.
원래 KOBIS 전용으로 돌아가려면 src/api/movieApi.kobis-backup.txt의 내용을
src/api/movieApi.js에 복사하세요.

db.json을 백업본으로 교체하면 백업 이후의 기록이 사라집니다.
기존 코드로 완전히 복원하기 전에 새 KMDb 기록을 별도 보관하세요.

## 검증

- 실제 KMDb 기생충 검색, 감독/배우/포스터 응답 확인
- 브라우저의 검색 카드 및 기록 작성 카드 표시 확인
- 임시 기록으로 등록/수정/조회/삭제 확인 후 임시 기록 제거
- 기존 기록 내용 보존 확인
- 빈 검색어, 빈 응답, 인증 오류 응답 처리 검사
- 전체 ESLint 통과
