const normalizeNumber = (value) => Number(value || 0);

export function StarRatingPanel({
  stats,
  canInteract,
  onRate,
  loading,
  message,
  compact = false,
  tone = "dark",
}) {
  const userRating = normalizeNumber(stats?.user_rating?.rating);
  const average = normalizeNumber(stats?.average_rating);
  const count = normalizeNumber(stats?.rating_count);
  const percentage = normalizeNumber(stats?.rating_percentage);
  const shellClass =
    tone === "light"
      ? "border-slate-200 bg-white text-slate-900"
      : "border-white/10 bg-white/[0.04] text-white";
  const mutedClass = tone === "light" ? "text-slate-500" : "text-white/50";
  const activeClass =
    tone === "light"
      ? "bg-[#1a1200] text-[#fff8df]"
      : "bg-[#f5d367] text-[#120c00]";
  const idleClass =
    tone === "light"
      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
      : "bg-white/5 text-white/70 hover:bg-white/10";

  return (
    <section className={`rounded-lg border p-4 ${shellClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">Calificación</p>
          <p className={`text-xs ${mutedClass}`}>
            {average.toFixed(1)} de 5 · {percentage.toFixed(0)}% · {count} votos
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black tracking-tight">
            {"★".repeat(Math.round(average)).padEnd(5, "☆")}
          </p>
          {userRating > 0 || canInteract ? (
            <p className={`text-xs ${mutedClass}`}>
              Tu calificación: {userRating || "sin calificar"}
            </p>
          ) : null}
        </div>
      </div>

      {canInteract ? (
        <div className={`mt-4 flex flex-wrap gap-2 ${compact ? "" : "pt-2"}`}>
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={loading}
              onClick={() => onRate(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                userRating === value ? activeClass : idleClass
              } disabled:opacity-60`}
            >
              {value}
            </button>
          ))}
        </div>
      ) : (
        <p className={`mt-3 text-xs ${mutedClass}`}>
          Solo usuarios compradores pueden calificar.
        </p>
      )}

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
  stats,
  canInteract,
  onVote,
  onClearVote,
  loading,
  message,
}) {
  const userVote = Number(stats?.user_vote?.vote || 0);
  const likes = normalizeNumber(stats?.like_count);
  const dislikes = normalizeNumber(stats?.dislike_count);
  const score = normalizeNumber(stats?.vote_score);

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-slate-900">Votos del producto</p>
          <p className="text-xs text-slate-500">
            Score {score} · {likes} like · {dislikes} dislike
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canInteract || loading}
            onClick={() => onVote(1)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
              userVote === 1
                ? "bg-green-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-green-50"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            +1
          </button>
          <button
            type="button"
            disabled={!canInteract || loading}
            onClick={() => onVote(-1)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
              userVote === -1
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-red-50"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            -1
          </button>
        </div>
      </div>

      {canInteract && userVote !== 0 ? (
        <button
          type="button"
          disabled={loading}
          onClick={onClearVote}
          className="mt-3 text-xs font-bold text-slate-500 underline underline-offset-4 hover:text-slate-900 disabled:opacity-60"
        >
          Quitar voto
        </button>
      ) : null}

      {!canInteract ? (
        <p className="mt-3 text-xs text-slate-500">
          Solo usuarios compradores pueden votar.
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
  stats,
  canInteract,
  onVote,
  onClearVote,
  loading,
  tone = "light",
}) {
  const userVote = Number(stats?.user_vote?.vote || 0);
  const likes = normalizeNumber(stats?.like_count);
  const dislikes = normalizeNumber(stats?.dislike_count);
  const isDark = tone === "dark";
  const idleClass = isDark
    ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

  const handleVote = (event, vote) => {
    event.stopPropagation();
    if (userVote === vote && onClearVote) {
      onClearVote();
      return;
    }
    onVote(vote);
  };

  return (
    <div className="space-y-2">
      <p className={`text-[0.68rem] font-semibold ${isDark ? "text-white/45" : "text-slate-500"}`}>
        Tiene {likes} {likes === 1 ? "like" : "likes"}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canInteract || loading}
          onClick={(event) => handleVote(event, 1)}
          className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
            userVote === 1 ? "border-green-500 bg-green-600 text-white" : idleClass
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          +1 {likes}
        </button>
        <button
          type="button"
          disabled={!canInteract || loading}
          onClick={(event) => handleVote(event, -1)}
          className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
            userVote === -1 ? "border-red-500 bg-red-600 text-white" : idleClass
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          -1 {dislikes}
        </button>
      </div>
    </div>
  );
}
