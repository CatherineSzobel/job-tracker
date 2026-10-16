import API from "../../api/axios";

// "Add to calendar": GET /interviews/{id}/calendar, saved as the .ics file the server names
// (interview-acme-2026-10-20.ics). Calendar apps open it; on phones it goes straight to the calendar.
export async function downloadInterviewCalendar(interview) {
  const res = await API.get(`/interviews/${interview.id}/calendar`, { responseType: "blob" });
  const filename = /filename="([^"]+)"/.exec(res.headers["content-disposition"] ?? "")?.[1] ?? "interview.ics";
  const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
