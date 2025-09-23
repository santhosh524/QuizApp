import styles from "./css/User.module.css";
import { useEffect, useState } from "react";
import Quiz from "./Quiz";

export default function User({handleHome}) {
  const [courses, setCourses] = useState([]);
  const [popup, setPopup] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    category: "",
    difficulty: "",
    noOfQuestions: "",
  });

  const [isQuizActive, setIsQuizActive] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      if (!token) {
        console.warn("No token found, redirect to login if needed");
        return;
      }

      try {
        const response = await fetch(
          "http://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com/usercoursedetails",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user course details");
        }
        setCourses(await response.json());
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleAddNew = () => setPopup(true);

  const handleExit = () => {
    setCourseFormData({
      category: "",
      difficulty: "",
      noOfQuestions: "",
    });
    setPopup(false);
  };

  const handlepopFormData = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const newCourse = {
      c_name: courseFormData.category,
      c_difficulty: courseFormData.difficulty,
      c_marks: "",
      c_status: "Request Raised",
      c_no_of_questions: parseInt(courseFormData.noOfQuestions, 10),
    };

    console.log(newCourse);

    try {
      const response = await fetch("http://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com/requestCourse", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCourse),
      });

      if (!response.ok) {
        throw new Error("Failed to save course details");
      }

      setCourses([...courses, await response.json()]);
      handleExit();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTakeQuiz = (course) => {
    setActiveCourse(course);
    setIsQuizActive(true);
  };

  return (
    <>
      {isQuizActive ? (
        <Quiz course={activeCourse} handleHome={handleHome} />
      ) : (
        <div className={styles.main}>
          <div className={styles.addbtn}>
            <button onClick={handleAddNew}>+ New Quiz</button>
          </div>

          {popup && (
            <div className={styles.popup}>
              <form onSubmit={handlepopFormData}>
                <p className={styles.exit} onClick={handleExit}>
                  X
                </p>
                <h5>Quiz Details</h5>

                <select
                  value={courseFormData.category}
                  onChange={(e) =>
                    setCourseFormData({
                      ...courseFormData,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  <option value="Linux">Linux</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Networking">Networking</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Docker">Docker</option>
                </select>

                <select
                  value={courseFormData.difficulty}
                  onChange={(e) =>
                    setCourseFormData({
                      ...courseFormData,
                      difficulty: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select Difficulty
                  </option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <select
                  value={courseFormData.noOfQuestions}
                  onChange={(e) =>
                    setCourseFormData({
                      ...courseFormData,
                      noOfQuestions: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select NoOfQuestions
                  </option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                </select>

                <button type="submit">Save</button>
              </form>
            </div>
          )}

          <div className={styles.cards}>
            {courses.length === 0 ? (
              <h2>No courses found</h2>
            ) : (
              courses.map((C) => (
                <div key={C.course_id} className={styles.coursecard}>
                  <h2>Course Name : {C.c_name}</h2>
                  <p className={styles.difficulty}>
                    Difficulty : {C.c_difficulty}
                  </p>
                  <p className={styles.status}>Status : {C.c_status}</p>
                  {localStorage.getItem("role") === "USER" &&
                  C.c_status === "Assigned" ? (
                    <button onClick={() => handleTakeQuiz(C)}>Take Quiz</button>
                  ) : null}
                  {C.c_status === "Completed" ? (
                    <p>
                      Marks: {C.c_marks} / {C.c_no_of_questions}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
