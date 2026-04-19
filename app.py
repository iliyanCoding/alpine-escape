from flask import Flask, render_template, request
from database import get_db, close_db

app = Flask(__name__)

app.teardown_appcontext(close_db)


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/play")
def play():
    return render_template("play.html")


@app.route("/api/scores")
def get_scores():
    db = get_db()
    rows = db.execute(
        "SELECT username, score FROM scores ORDER BY score DESC LIMIT 10"
    ).fetchall()
    scores = [{"username": r["username"], "score": r["score"]} for r in rows]
    return scores


@app.route("/api/scores", methods=["POST"])
def post_score():
    username = request.form.get("username", "").strip()
    score_val = request.form.get("score", "")

    if not username or not score_val.isdigit():
        return "error", 400

    score_val = int(score_val)
    db = get_db()
    db.execute(
        """INSERT INTO scores (username, score) VALUES (?, ?)
           ON CONFLICT(username) DO UPDATE SET score = ?
           WHERE ? > scores.score""",
        (username, score_val, score_val, score_val)
    )
    db.commit()
    return "success"
