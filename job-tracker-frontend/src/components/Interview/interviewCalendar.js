import API from "../../api/axios";
import { showToast } from "../../stores/useToastStore";
import { saveBlob } from "../../utils/saveBlob";

// "Add to calendar": GET /interviews/{id}/calendar, saved as the .ics file the server names
// (interview-acme-2026-10-20.ics). Calendar apps open it; on phones it goes straight to the calendar.
// A failure shows a toast.
export async function addInterviewToCalendar(interview) {
  try {
    const res = await API.get(`/interviews/${interview.id}/calendar`, { responseType: "blob" });
    const filename = /filename="([^"]+)"/.exec(res.headers["content-disposition"] ?? "")?.[1] ?? "interview.ics";
    saveBlob(res, filename);
  } catch (err) {
    console.error(err);
    showToast("Couldn't download the calendar file");
  }
}
