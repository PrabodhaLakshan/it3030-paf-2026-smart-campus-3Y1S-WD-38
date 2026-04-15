import { useState } from "react";
import { addComment, deleteComment } from "../../api/ticketApi";

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function CommentSection({ ticketId, comments = [], onRefresh }) {
  const [formData, setFormData] = useState({ userId: "", userName: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await addComment(ticketId, {
        userId: formData.userId.trim(),
        userName: formData.userName.trim(),
        text: formData.text.trim(),
      });

      setFormData({ userId: formData.userId, userName: formData.userName, text: "" });

      if (onRefresh) {
        await onRefresh();
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to add the comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!formData.userId.trim()) {
      setError("Enter your user ID before deleting a comment.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await deleteComment(ticketId, commentId, formData.userId.trim());

      if (onRefresh) {
        await onRefresh();
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to delete the comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Comments</h3>
          <p className="mt-1 text-sm text-slate-600">Add internal notes or report progress on the ticket.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {comments.length} total
        </span>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleAddComment} className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            placeholder="Your user ID"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/15"
          />
          <input
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/15"
          />
        </div>

        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          rows={4}
          required
          placeholder="Add a note, progress update, or a follow-up question"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/15"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#0a192f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Comment"}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {comments.length ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{comment.userName || comment.userId || "Anonymous"}</p>
                  <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={loading}
                  className="text-sm font-medium text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{comment.text}</p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No comments yet.
          </div>
        )}
      </div>
    </section>
  );
}

export default CommentSection;