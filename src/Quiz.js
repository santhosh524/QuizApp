import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Quiz({ course, handleHome }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  console.log(course);

  const quizProperties = {
    category: course.c_name,
    difficulty: course.c_difficulty,
    noOfQuestions: course.c_no_of_questions,
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found, redirect to login if needed");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch("http://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com/getQuestions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quizProperties),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();
        setQuestions(data);
        setAnswers(new Array(data.length).fill(null)); // ✅ initialize answers array
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAnswerChange = (qIndex, optionIndex) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[qIndex] = optionIndex; // store 1-based index
      return updated;
    });
  };

  const handleSubmit = async () => {
    console.log("Selected answers:", answers);

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, redirect to login if needed");
      return;
    }

    try {
      const response = await fetch("http://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com/results", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.course_id,
          answers: answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answers");
      }

     
      alert(await response.text());
      handleHome(false);
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {loading ? (
        <h1>Loading the Page...</h1>
      ) : (
        <div>
          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              style={{
                marginBottom: "20px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h5>{question.question}</h5>
              {[
                question.option1,
                question.option2,
                question.option3,
                question.option4,
              ].map((option, index) => (
                <label
                  key={index}
                  style={{ display: "block", margin: "5px 0" }}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`} // ✅ unique per question
                    value={index + 1}
                    checked={answers[qIndex] === index + 1} // ✅ compare with number
                    onChange={() => handleAnswerChange(qIndex, index + 1)}
                    style={{ marginRight: "8px" }}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}

          {/* ✅ Submit button */}
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Submit Quiz
          </button>
        </div>
      )}
    </>
  );
}
