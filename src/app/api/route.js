export async function GET(request) {
  const title = new URL(request.url).searchParams.get("title")?.trim();
  if (!title) return Response.json({ error: "영화 제목을 입력해주세요." }, { status: 400 });
  const key = process.env.KMDB_API_KEY;
  if (!key) return Response.json({ error: "KMDB_API_KEY 설정이 필요합니다." }, { status: 503 });
  const params = new URLSearchParams({ collection: "kmdb_new2", detail: "Y", title, listCount: "30", ServiceKey: key });
  try {
    const response = await fetch(`https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp?${params}`, {
      cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("KMDb 서버가 정상 응답하지 않습니다. 잠시 후 다시 검색해주세요.");
    let data;
    try {
      data = JSON.parse(await response.text());
    } catch {
      throw new Error("KMDb 응답을 읽을 수 없습니다. 인증키 승인 상태를 확인해주세요.");
    }
    if (!data || data.Error || data.error || data.errorCode) {
      throw new Error("KMDb 인증 또는 요청 오류입니다. 인증키 승인 상태를 확인해주세요.");
    }
    return Response.json(data);
  } catch (error) {
    const message = error.name === "TimeoutError" ? "검색 시간이 초과되었습니다. 다시 검색해주세요." :
      error instanceof TypeError ? "KMDb에 연결할 수 없습니다. 네트워크 상태를 확인해주세요." : error.message;
    return Response.json({ error: message }, { status: 502 });
  }
}
