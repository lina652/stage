import React, { useState, useEffect } from 'react';

const TaskDetailsModal = ({ task, onClose, onCommentSubmit }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(task?.comments || []);

  useEffect(() => {
    console.log("////////////////////");
    console.log(comments)
    console.log("////////////////////");
    console.log(task);
    setComments(task?.comments || []);
  }, [task]);

  if (!task) return null;

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    try {
      if (onCommentSubmit) {
        const updatedComments = await onCommentSubmit(comment);
        setComments(updatedComments);
      }
      setComment("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-5xl w-full shadow-2xl border border-gray-200 max-h-[95vh] flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">📝 Task Details</h3>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow pr-2 space-y-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
            <p><span className="font-medium text-gray-600">Title:</span> {task.title}</p>
            <p><span className="font-medium text-gray-600">Status:</span> {task.status}</p>
            <p><span className="font-medium text-gray-600">Created At:</span> {new Date(task.createdAt).toLocaleString()}</p>
            
            <p><span className="font-medium text-gray-600">Due Date:</span> {task.dueDate?.split("T")[0]}</p>
            <p><span className="font-medium text-gray-600">Type:</span> {task.type}</p>
            <p><span className="font-medium text-gray-600">Assigned Users:</span> {task.users?.map(u => u.name).join(", ") || "N/A"}</p>
            <p className="col-span-2">
              <span className="font-medium text-gray-600">Description:</span>{" "}
              {task.description?.trim() ? task.description : "\"No description\""}
            </p>
            <p className="col-span-2">
                  <span className="font-medium text-gray-600">Completed Dates: </span>
                  {task.completedDates?.length > 0
                    ? task.completedDates.map(d => d.split("T")[0]).join(", ")
                    : " \"The task is not yet completed\""}
                </p>
          </div>

          {task.isRecurring && (
            <div className="pt-4 border-t">
              <h4 className="text-md font-semibold mb-2 text-gray-800">🔁 Recurrence</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <p><span className="font-medium text-gray-600">Recurring:</span> ✅</p>
                <p><span className="font-medium text-gray-600">Frequency:</span> {task.recurrence?.frequency}</p>
                <p><span className="font-medium text-gray-600">Interval:</span> {task.recurrence?.interval}</p>
                <p><span className="font-medium text-gray-600">End Date:</span> {task.recurrence?.endDate?.split("T")[0]}</p>
                
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <h4 className="text-md font-semibold mb-2 text-gray-800">📁 Project Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <p><span className="font-medium text-gray-600">Name:</span> {task.project?.name || "N/A"}</p>
              <p><span className="font-medium text-gray-600">Client:</span> {task.project?.client || "N/A"}</p>
              <p><span className="font-medium text-gray-600">Created At:</span>
                {task.project?.createdAt ? new Date(task.project.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-4 border-t">
            <h4 className="text-md font-semibold mb-3 text-gray-800">💬 Comments</h4>
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              <ul className="space-y-3 max-h-[25vh] overflow-y-auto pr-2">
                {comments.map((c, i) => (
                  <li key={i} className="border rounded-md p-2 bg-gray-50">
                    <p className="text-sm text-gray-700">{c.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      — {c.name || 'Unknown'}, {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-grow p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-5 py-2 text-sm font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 text-sm font-semibold rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
