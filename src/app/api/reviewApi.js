const BASE_URL = "http://localhost:4000/reviews";


export const reviewApi = {
 getReviews: async () => {
   const response = await fetch(BASE_URL);

   if (!response.ok) {
     throw new Error("감상 기록을 불러오지 못했습니다.");
   }

   return response.json();
 },

 createReview: async (newReview) => {
   const response = await fetch(BASE_URL, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify(newReview),
   });


   if (!response.ok) {
     throw new Error("감상 기록 저장에 실패했습니다.");
   }
    return response.json();
 },

 updateReview: async (id, changes) => {
   const response = await fetch(`${BASE_URL}/${id}`, {
     method: "PATCH",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(changes),
   });

   if (!response.ok) {
     throw new Error("감상 기록 수정에 실패했습니다.");
   }

   return response.json();
 },

 deleteReview: async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("감상 기록 삭제에 실패했습니다.");
  }
 },
};
