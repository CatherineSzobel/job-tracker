import { useState, useEffect } from "react";
import API from "../api/axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addMonths,
  subMonths
} from "date-fns";

export default function Calendar() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    API.get("/job-applications")
      .then(res => {
        const all = res.data.flatMap(job =>
          (job.interviews || []).map(i => ({
            ...i,
            job_position: job.position,
            job_company: job.company_name,
          }))
        );
        setInterviews(all);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getInterviewsForDay = (day) =>
    interviews.filter(i => isSameDay(parseISO(i.interview_date), day));

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
        <p className="ml-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 rounded-2xl shadow-lg bg-light dark:bg-dark transition-colors">
      <h1 className="text-3xl font-bold mb-6 bg-accent text-surface rounded-lg p-2">
        Interview Calendar
      </h1>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="px-4 py-2 bg-accent-soft text-surface rounded-lg hover:bg-accent transition"
        >
          Previous
        </button>

        <h2 className="text-xl font-semibold text-primary-text dark:text-light-text">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-accent-soft text-surface rounded-lg hover:bg-accent transition"
        >
          Next
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {days.map(day => {
          const dayInterviews = getInterviewsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`border rounded-lg p-3 h-28 cursor-pointer flex flex-col justify-between transition 
                ${isToday ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-soft"}`
              }
            >
              <div className={`font-semibold ${isToday ? "text-secondary" : "text-primary-text"}`}>
                {format(day, "d")}
              </div>

              {dayInterviews.length > 0 && (
                <div className={`mt-2 text-sm font-medium ${isToday ? "text-secondary" : "text-primary-text"}`}>
                  {dayInterviews.length} interview{dayInterviews.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && selectedDay && (
        <div className="fixed inset-0 bg-primary/60 bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-light dark:bg-dark p-6 rounded-2xl shadow-xl w-full max-w-md transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">
              Interviews on {format(selectedDay, "MMMM d, yyyy")}
            </h2>

            {getInterviewsForDay(selectedDay).length === 0 ? (
              <p className="text-secondary-text dark:text-dark-muted">No interviews scheduled.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {getInterviewsForDay(selectedDay).map(i => (
                  <div
                    key={i.id}
                    className="border border-border dark:border-dark-subtle rounded-lg p-3 bg-surface dark:bg-dark-subtle shadow-sm hover:shadow-md transition"
                  >
                    <p className="font-semibold text-accent">{i.job_position}</p>
                    <p className="text-sm text-dark-soft dark:text-dark-muted">{i.job_company}</p>
                    <p className="text-sm text-dark dark:text-light">Type: {i.type}</p>
                    <p className="text-sm text-dark dark:text-light">Location: {i.location}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-accent-soft text-surface rounded-lg hover:bg-accent transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
