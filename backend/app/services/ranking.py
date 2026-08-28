"""
Recommendation / Ranking. Weights are tunable heuristics, not claims of optimality.
"""

DEFAULT_WEIGHTS = {
    "semantic_relevance": 0.25,
    "skill_gap_priority": 0.25,
    "career_relevance": 0.15,
    "prerequisite_readiness": 0.15,
    "difficulty_fit": 0.10,
    "time_fit": 0.05,
    "resource_quality": 0.05,
}


def rank_candidates(candidates: list[dict], weights: dict | None = None) -> list[dict]:
    w = weights or DEFAULT_WEIGHTS
    for c in candidates:
        c["score"] = sum(w.get(k, 0) * c.get(k, 0) for k in w)
    return sorted(candidates, key=lambda c: c["score"], reverse=True)
