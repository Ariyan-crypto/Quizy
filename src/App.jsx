import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
export default function App() {
  const [quizdata, setQuizdata] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedcategory, setSelectedCategory] = useState();
  const [categoriesdata, setCategoriesData] = useState(false);
  const [quizstarted, setQuizstarted] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [increased, setIncreased] = useState(false);
  const [deducted, setDeducted] = useState(false);
  const [currentquestionindex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [incorrectAnswerCount, setIncorrectAnswerCount] = useState(0);
  const [unAnswered, setUnaswered] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  //Quizdata fetch Function
  const fetchData = async () => {
    if (selectedcategory) {
      try {
        const fetchedData = await fetch(
          `https://opentdb.com/api.php?amount=10&category=${selectedcategory}&type=multiple`
        );

        if (!fetchedData.ok) {
          throw new Error(`HTTP error! status: ${fetchedData.status}`);
        }

        const data = await fetchedData.json();
        // Transform each question to include shuffled options
        const formattedQuestions = data.results.map((question) => {
          const options = [
            ...question.incorrect_answers,
            question.correct_answer,
          ];
          const shuffledOptions = options.sort(() => Math.random() - 0.5); // Shuffle
          return {
            ...question,
            options: shuffledOptions,
          };
        });

        setQuizdata(formattedQuestions);
      } catch (error) {
        console.error("Error fetching quiz data:", error.message);
      }
    } else {
      console.warn("No category selected");
    }
  };
  //Categories Function
  const categoriesData = async () => {
    const response = await fetch("https://opentdb.com/api_category.php");
    const data = await response.json();
    setCategories(data.trivia_categories);
  };
  // Set Categories Data:
  useEffect(() => {
    categoriesData();
    setCategoriesData(true);
  }, []);
  //Set Quiz Data
  useEffect(() => {
    setQuizstarted(false);
    fetchData();
  }, [selectedcategory]);

  //Countdown logic
  useEffect(() => {
    if (quizstarted && timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (timer === 0) {
      nextquestion();
    }
  }, [quizstarted, timer]);
  const startingquiz = () => {
    setQuizstarted(true);
    setTimer(60);
  };
  //Next Question Logic
  const nextquestion = () => {
    if (!selectedOption) {
      setUnaswered((prev) => prev + 1);
    }
    setIsAnimating(true);
    setTimeout(() => {
      if (currentquestionindex < quizdata.length - 1) {
        setCurrentQuestionIndex(currentquestionindex + 1);
        setDeducted(false);
        setSelectedOption(null);
        setIncreased(false);
        setTimer(60);
      } else {
        setGameOver(true);
      }
      setIsAnimating(false);
    }, 500);
  };

  const handlechange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);

    let isCorrect =
      quizdata[currentquestionindex].correct_answer === selectedValue;

    if (isCorrect && !increased) {
      if (deducted) {
        setIncorrectAnswerCount((prev) => prev - 1);
      }
      setScore((prev) => prev + 1);
      setCorrectAnswerCount((prev) => prev + 1);
      setIncreased(true);
      setDeducted(false);
    } else if (!isCorrect && !deducted) {
      if (increased) {
        setCorrectAnswerCount((prev) => prev - 1);
      }
      setIncorrectAnswerCount((prev) => prev + 1);
      setDeducted(true);
      setIncreased(false);
    }
  };
  return (
    <>
      {categoriesdata ? (
        <>
          <div className="quiz-welcome">
            <h3 className="quiz-title">
              {" "}
              <span className="text">Get Ready to Test Your Knowledge</span>
            </h3>
            <div className="dropdown">
              <select
                value={selectedcategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={quizstarted}
              >
                <option value="">Select a category</option>
                {categories.map((val) => (
                  <option key={val.id} value={val.id}>
                    {val.name}
                  </option>
                ))}
              </select>
            </div>
            {!quizstarted ? (
              <button
                className="start-button"
                onClick={startingquiz}
                disabled={!selectedcategory}
              >
                {" "}
                <span className="symbol">🚀</span>Start Quiz
              </button>
            ) : gameOver ? (
              <div className="quiz-completed">
                <h2 className="quizcompletedtext">
                  {" "}
                  <span className="symbol">🎉</span>Quiz Completed!
                </h2>
                <h3 className="finalscore">
                  Your Final Score: {score}/{quizdata.length}
                </h3>
                <p className="correctanswer">
                  ✅ Correct Answers: {correctAnswerCount}
                </p>
                <p className="incorrectanswer">
                  ❌ Incorrect Answers: {incorrectAnswerCount}
                </p>
                <p className="incorrectanswer">❓ Unaswered: {unAnswered}</p>
                {(() => {
                  const totalQuestions = quizdata.length;
                  const percentage = (
                    (correctAnswerCount / totalQuestions) *
                    100
                  ).toFixed(2);

                  let performanceSymbol = "🤔";

                  if (percentage === 100) {
                    performanceSymbol = "🏆";
                  } else if (percentage >= 80) {
                    performanceSymbol = "🎯";
                  } else if (percentage >= 50) {
                    performanceSymbol = "👍";
                  } else if (percentage > 0) {
                    performanceSymbol = "😟";
                  } else {
                    performanceSymbol = "💀";
                  }
                  return (
                    <h3 className="performance">
                      Performance: {percentage}% {performanceSymbol}
                    </h3>
                  );
                })()}
                <button onClick={() => window.location.reload()}>
                  🔄 Restart Quiz
                </button>
              </div>
            ) : quizdata.length === 0 ? (
              <div className="loading-text">Loading questions...</div>
            ) : (
              <div className={`card ${isAnimating ? "slide-out" : "slide-in"}`}>
                <div className="timer-container">
                  {" "}
                  <h4>
                    <span className="timer-symbol">⏳</span> Time Left:{" "}
                    <span className="timer">{timer}s</span>
                  </h4>
                </div>
                <h4>
                  Q.{currentquestionindex + 1}){" "}
                  {quizdata[currentquestionindex].question}
                </h4>

                {quizdata[currentquestionindex].options.map((val, index) => (
                  <div key={index}>
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name="option"
                      value={val}
                      checked={selectedOption === val}
                      onChange={handlechange}
                    />
                    <label htmlFor={`option-${index}`}>{val}</label>
                  </div>
                ))}

                <button onClick={nextquestion}>Next ➡️</button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="loading-text">Loading...</div>
      )}
    </>
  );
}
