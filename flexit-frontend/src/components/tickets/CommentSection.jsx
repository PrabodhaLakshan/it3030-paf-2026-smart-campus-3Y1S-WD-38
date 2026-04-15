import { useEffect, useState } from "react";
import { addComment, deleteComment, getTicketById, updateComment } from "../../api/ticketApi";
import { getSessionUser } from "../../utils/sessionUser";

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
  const sessionUser = getSessionUser();
  const [formData, setFormData] = useState({ userId: "", userName: "", text: "" });
  const [ticketComments, setTicketComments] = useState(Array.isArray(comments) ? comments : []);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingText, setEditingText] = useState("");

  const currentUserId = sessionUser.userId || formData.userId.trim();
  const currentUserName = sessionUser.userName || formData.userName.trim();
  const canCreateComment = sessionUser.role === "USER";
  const canUseSessionIdentity = Boolean(sessionUser.userId);

  const loadComments = async () => {
    setCommentsLoading(true);

    try {
      const ticket = await getTicketById(ticketId);
      setTicketComments(Array.isArray(ticket?.comments) ? ticket.comments : []);
    } catch {
      setTicketComments(Array.isArray(comments) ? comments : []);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    setTicketComments(Array.isArray(comments) ? comments : []);
  }, [comments]);

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!currentUserId) {
      setError("Enter your user ID before adding a comment.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addComment(ticketId, {
        userId: currentUserId,
        userName: currentUserName,
        text: formData.text.trim(),
      });

      setFormData((previous) => ({
        ...previous,
        text: "",
      }));

      await loadComments();

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
    if (!currentUserId) {
      setError("Enter your user ID before deleting a comment.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await deleteComment(ticketId, commentId, currentUserId);

      await loadComments();

      if (onRefresh) {
        await onRefresh();
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to delete the comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (comment) => {
    setError("");
    setEditingCommentId(comment.id);
    setEditingText(comment.text || "");
  };

  const handleCancelEdit = () => {
    setEditingCommentId("");
    setEditingText("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!currentUserId) {
      setError("Enter your user ID before editing a comment.");
      return;
    }

    if (!editingText.trim()) {
      setError("Comment text is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateComment(
        ticketId,
        commentId,
        {
          userId: currentUserId,
          userName: currentUserName,
          text: editingText.trim(),
        },
        currentUserId
      );

      handleCancelEdit();

      await loadComments();

      if (onRefresh) {
        await onRefresh();
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to update the comment.");
    } finally {
      setLoading(false);
    }
  };

  const canModifyComment = (comment) => currentUserId && comment.userId === currentUserId;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Comments</h3>
          <p className="mt-1 text-sm text-slate-600">Add internal notes or report progress on the ticket.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {ticketComments.length} total
        </span>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      {canCreateComment ? (
        <form onSubmit={handleAddComment} className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          {canUseSessionIdentity ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Commenting as <span className="font-semibold text-slate-900">{currentUserName || "User"}</span>
              <span className="ml-2 text-xs text-slate-500">({currentUserId})</span>
            </div>
          ) : (
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
          )}

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
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Comments can be viewed here. Only the user who raised the ticket can add a new comment.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {commentsLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            Loading comments...
          </div>
        ) : ticketComments.length ? (
          ticketComments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{comment.userName || comment.userId || "Anonymous"}</p>
                  <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                </div>

                {canModifyComment(comment) ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(comment)}
                      disabled={loading}
                      className="text-sm font-medium text-[#0a192f] transition hover:text-[#61CE70] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={loading}
                      className="text-sm font-medium text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{comment.text}</p>

              {editingCommentId === comment.id ? (
                <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <textarea
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#61CE70] focus:ring-4 focus:ring-[#61CE70]/15"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#61CE70] hover:text-[#0a192f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={loading}
                      className="rounded-2xl bg-[#0a192f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#61CE70] hover:text-[#0a192f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : null}
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