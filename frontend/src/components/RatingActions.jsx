import { useState } from "react";
import Icon from "@/components/ui/Icon";

const normalizeNumber = (value) => Number(value || 0);

export function StarRatingPanel({
  stats,
  userId,
  canInteract,
  onRate,
  loading,
  message,
  compact = false,
  tone = "dark",
}) {
  const average = normalizeNumber(stats?.average);
  const count = normalizeNumber(stats?.count);
  const userRating = normalizeNumber(stats?.userVote || (userId ? stats?.userVotes?.[userId] : 0));
  const [hoverRating, setHoverRating] = useState(0);

  const shellClass =
    tone === "light"
      ? "border-slate-200 bg-white text-slate-900"
      : "border-white/10 bg-white/[0.04] text-white";
  const mutedClass = tone === "light" ? "text-slate-500" : "text-white/50";

  return (
    <section className={`rounded-none border p-4 ${shellClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">Calificación</p>
          <p className={`text-xs ${mutedClass}`}>
            {average.toFixed(1)} · {count} {count === 1 ? "voto" : "votos"}
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating ? star <= hoverRating : star <= (userRating || Math.round(average));
              return (
                <button
                  key={star}
                  type="button"
                  disabled={!canInteract || loading}
                  onMouseEnter={() => canInteract && setHoverRating(star)}
                  onMouseLeave={() => canInteract && setHoverRating(0)}
                  onClick={() => canInteract && onRate(star)}
                  className={`p-0.5 transition-colors focus:outline-none ${
                    !canInteract ? 'cursor-default' : 'cursor-pointer'
                  }`}
                  title={canInteract ? `Calificar con ${star} estrellas` : `Calificación promedio: ${average}`}
                >
                  <Icon
                    key={star}
                    name="star"
                    className={`h-5 w-5 shrink-0 ${
                      active
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-350 hover:text-[#c8960c]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {userRating > 0 ? (
            <p className={`text-xs ${mutedClass} mt-1`}>
              Tu calificación: {userRating} ★
            </p>
          ) : null}
        </div>
      </div>

      {message ? (
        <p
          className={`mt-3 text-xs font-semibold ${
            message.type === "error" ? "text-red-500" : "text-green-500"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}

export function ProductVotePanel({
  likes = 0,
  dislikes = 0,
  userVote = 0, // 1 = like, -1 = dislike, 0 = none
  canInteract,
  onVote,
  loading,
  message,
}) {
  const score = likes - dislikes;
  const idleClass = "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";

  const handleVoteClick = (voteVal) => {
    if (!canInteract || loading) return;
    onVote(voteVal);
  };

  return (
    <section className="rounded-none border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-slate-900">Opiniones del catálogo</p>
          <p className="text-xs text-slate-500">
            {likes} {likes === 1 ? "recomienda" : "recomiendan"} · {dislikes} {dislikes === 1 ? "no recomienda" : "no recomiendan"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canInteract || loading}
            onClick={() => handleVoteClick(1)}
            className={`flex items-center gap-1.5 rounded-none border px-4 py-2 text-sm font-bold transition-all ${
              userVote === 1
                ? "border-green-600 bg-green-600 text-white"
                : idleClass
            } ${!canInteract ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill={userVote === 1 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span>Me gusta</span>
          </button>
          
          <button
            type="button"
            disabled={!canInteract || loading}
            onClick={() => handleVoteClick(-1)}
            className={`flex items-center gap-1.5 rounded-none border px-4 py-2 text-sm font-bold transition-all ${
              userVote === -1
                ? "border-red-600 bg-red-600 text-white"
                : idleClass
            } ${!canInteract ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill={userVote === -1 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm11-9h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
            </svg>
            <span>No me gusta</span>
          </button>
        </div>
      </div>

      {!canInteract ? (
        <p className="mt-3 text-xs text-slate-550">
          Inicia sesión para votar.
        </p>
      ) : null}

      {message ? (
        <p
          className={`mt-3 text-xs font-semibold ${
            message.type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}

export function ProductVoteButtons({
  likes = 0,
  dislikes = 0,
  userVote = 0, // 1 = like, -1 = dislike, 0 = none
  canInteract,
  onVote,
  loading,
  tone = "light",
}) {
  const isDark = tone === "dark";
  const idleClass = isDark
    ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

  const handleVoteClick = (event, voteVal) => {
    event.stopPropagation();
    if (!canInteract || loading) return;
    onVote(voteVal);
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={!canInteract || loading}
        onClick={(event) => handleVoteClick(event, 1)}
        className={`flex items-center gap-1 rounded-none border px-2.5 py-1 text-xs font-bold transition-all ${
          userVote === 1
            ? "border-green-650 bg-green-600 text-white"
            : idleClass
        } hover:opacity-90`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill={userVote === 1 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        <span>{likes}</span>
      </button>

      <button
        type="button"
        disabled={!canInteract || loading}
        onClick={(event) => handleVoteClick(event, -1)}
        className={`flex items-center gap-1 rounded-none border px-2.5 py-1 text-xs font-bold transition-all ${
          userVote === -1
            ? "border-red-650 bg-red-600 text-white"
            : idleClass
        } hover:opacity-90`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill={userVote === -1 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm11-9h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
        </svg>
        <span>{dislikes}</span>
      </button>
    </div>
  );
}
