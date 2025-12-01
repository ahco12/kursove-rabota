import { useEffect, useState } from "react";
import { getAllQuestions } from "./services/questions";
import type { Question } from "./services/questions";
import "./index.css";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./auth";
import { incrementUserStats } from "./services/users";

type RouteType = "home" | "auth" | "profile";

function TopNav({ route, setRoute }: { route: RouteType; setRoute: (r: RouteType) => void }) {
  const { user } = useAuth();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Потребител";
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="app-header">
      <div className="nav-left">
        <div className="logo">Стани богат</div>
      </div>

      <nav className="nav-right">
        <button className={`nav-link ${route === "home" ? "active" : ""}`} onClick={() => setRoute("home")}>
          Игра
        </button>
        <button className={`nav-link ${route === "profile" ? "active" : ""}`} onClick={() => setRoute("profile")}>
          Профил
        </button>

        {user ? (
          <div className="nav-user">
            <div className="nav-avatar">{initials || "П"}</div>
            <div className="nav-username">{displayName}</div>
          </div>
        ) : (
          <button className={`nav-link ${route === "auth" ? "active" : ""}`} onClick={() => setRoute("auth")}>
            Вход/Регистрация
          </button>
        )}
      </nav>
    </header>
  );
}

function pickRandomQuestionsByLevel(all: Question[]): Question[] {
  const levels = new Map<number, Question[]>();

  // групиране по level
  all.forEach(q => {
    if (!levels.has(q.level)) {
      levels.set(q.level, []);
    }
    levels.get(q.level)!.push(q);
  });

  // за всяко ниво — 1 случаен въпрос
  const selected: Question[] = [];

  Array.from(levels.keys())
    .sort((a, b) => a - b)
    .forEach(level => {
      const group = levels.get(level)!;
      const randomQuestion = group[Math.floor(Math.random() * group.length)];
      selected.push(randomQuestion);
    });

  return selected;
}


export default function App() {
  const { user } = useAuth();
  const [route, setRoute] = useState<"home" | "auth" | "profile">("home");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionMoney, setSessionMoney] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameFinished, setGameFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
  (async () => {
    const all = await getAllQuestions();
    const randomized = pickRandomQuestionsByLevel(all);
    setQuestions(randomized);
    })();
  }, []);

  // If user logs in/registers, go to home (game)
  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => setRoute("home"), 0);
    return () => clearTimeout(t);
  }, [user]);


  const handleAnswer = (answerId: string, correct: boolean) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answerId);
    setIsCorrect(correct);

    setTimeout(() => {
      // compute new correct count for this session (only correct answers count)
      const newCorrectCount = correct ? correctCount + 1 : correctCount;

      // compute last-correct-money: if correct -> this question's money; if wrong -> previous question's money (or 0)
      const lastCorrectMoney = correct
        ? (questions[currentIndex]?.money ?? 0)
        : (currentIndex > 0 ? (questions[currentIndex - 1]?.money ?? 0) : 0);

      // update session money locally
      setSessionMoney(lastCorrectMoney);

      const sessionEnds = !correct || (correct && currentIndex === questions.length - 1);

      // Only persist stats when the session ends (user finished or answered incorrectly).
      if (sessionEnds && user) {
        incrementUserStats(user.uid, newCorrectCount, lastCorrectMoney).catch((e) => console.error("Failed to update user stats", e));
      }

      // update local correct count for continued play (if continuing)
      if (correct) setCorrectCount(newCorrectCount);

      if (sessionEnds) {
        setGameFinished(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }

      setSelectedAnswer(null);
      setIsCorrect(null);
    }, 1000);
  };

  if (questions.length === 0)
    return <div className="app-container">Зареждане...</div>;

  if (route === "auth") return (
    <div className="app-container">
      <TopNav route={route} setRoute={setRoute} />
      <div className="page-wrap">
        <AuthPage />
      </div>
    </div>
  );

  if (route === "profile") return (
    <div className="app-container">
      <TopNav route={route} setRoute={setRoute} />
      <div className="page-wrap">
        <ProfilePage />
      </div>
    </div>
  );

  if (gameFinished) {
    // User finished all questions correctly
    const allCorrect = correctCount === questions.length && questions.length > 0;
    if (allCorrect) {
      return (
        <div className="app-container game-over-container congratulation">
          <h1 className="game-over-title" style={{ color: '#ffd700', textShadow: '0 0 16px #ffecb3' }}>Поздравления!</h1>
          <p className="game-over-text" style={{ fontSize: 28, color: '#fffde7' }}>Ти отговори правилно на всички въпроси!</p>
          <div style={{ fontSize: 32, color: '#ffcc00', fontWeight: 700, margin: '18px 0' }}>
            Печалба: {sessionMoney} лв.
          </div>
          <div style={{ fontSize: 22, color: '#b2ff59', marginBottom: 18 }}>Ти си истински милионер!</div>
          <button className="restart-btn" onClick={() => window.location.reload()}>
            Играй отново
          </button>
        </div>
      );
    }
    // Otherwise, normal game over
    return (
      <div className="app-container game-over-container">
        <h1 className="game-over-title">Играта приключи</h1>
        <p className="game-over-text">Печалба: {sessionMoney} лв.</p>
        <button className="restart-btn" onClick={() => window.location.reload()}>
          Играй отново
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <TopNav route={route} setRoute={setRoute} />
      <h1 className="main-title">Стани богат</h1>

      <div className="game-area">
        <div className="question-card">
        <p className="question-text">
          {currentIndex + 1}. {currentQuestion.text}
        </p>

        <div className="answers-grid">
          {currentQuestion.answers.map((ans) => {
            const isSelected = selectedAnswer === ans.id;

            const btnClass =
              isSelected && isCorrect === true
                ? "answer-btn answer-correct"
                : isSelected && isCorrect === false
                ? "answer-btn answer-wrong"
                : "answer-btn";

            return (
              <button
                key={ans.id}
                className={btnClass}
                onClick={() => handleAnswer(ans.id, ans.isCorrect)}
              >
                <strong>{ans.id}.</strong> {ans.text}
              </button>
            );
          })}
        </div>
        </div>

        <aside className="money-ladder">
          <h2 className="money-ladder-title">Награди</h2>
          <div className="money-list">
            {questions.map((q, idx) => {
              const status = idx < currentIndex ? "completed" : idx === currentIndex ? "current" : "locked";
              return (
                <div key={q.id} className={`money-item money-item-${status}`}>
                  <div className="level">{q.level}</div>
                  <div className="amount">{q.money} лв.</div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
