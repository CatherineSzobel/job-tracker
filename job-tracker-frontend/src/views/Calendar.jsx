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

  const getInterviewsForDay = (day) => {
    return interviews.filter(i =>
      isSameDay(parseISO(i.interview_date), day)
    );
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  if (loading) {
    return <p className="text-center mt-10">Loading calendar...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Calendar</h1>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Previous
        </button>

        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={nextMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayInterviews = getInterviewsForDay(day);

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className="border rounded p-2 h-24 cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="font-semibold">
                {format(day, "d")}
              </div>

              {dayInterviews.length > 0 && (
                <div className="mt-1 text-xs text-blue-600">
                  {dayInterviews.length} interview(s)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && selectedDay && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-300 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Interviews on {format(selectedDay, "MMMM d, yyyy")}
            </h2>

            {getInterviewsForDay(selectedDay).length === 0 ? (
              <p>No interviews scheduled.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {getInterviewsForDay(selectedDay).map(i => (
                  <div
                    key={i.id}
                    className="border p-3 rounded bg-gray-50"
                  >
                    <p className="font-semibold">
                      {i.job_position}
                    </p>
                    <p className="text-sm text-gray-600">
                      {i.job_company}
                    </p>
                    <p className="text-sm">
                      Type: {i.type}
                    </p>
                    <p className="text-sm">
                      Location: {i.location}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
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
