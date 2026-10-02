import { useFormik } from "formik";
import type { Student } from "./types";
import { useAppDispatch } from "./store/store";
import { registerStudent } from "./store/studentSlice";
import DisplayStudents from "./DisplayStudents";

function App() {
  //create a simple form

  const initialValues: Student = {
    age: "",
    gender: "M",
    id: "",
    name: "",
    specialization: "",
  };

  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: (values) => {
      dispatch(registerStudent(values));
    },
  });

  return (
    <div>
      <label>ID</label>
      <input
        value={formik.values.id}
        onChange={(e) => formik.setFieldValue("id", e.target.value)}
      />
      <label>Name</label>
      <input
        value={formik.values.name}
        onChange={(e) => formik.setFieldValue("name", e.target.value)}
      />
      <label>Age</label>
      <input
        value={formik.values.age}
        onChange={(e) => formik.setFieldValue("age", e.target.value)}
      />
      <label>Gender</label>
      <input
        value={formik.values.gender}
        onChange={(e) => formik.setFieldValue("gender", e.target.value)}
      />
      <label>Specialization</label>
      <input
        value={formik.values.specialization}
        onChange={(e) => formik.setFieldValue("specialization", e.target.value)}
      />
      <button onClick={() => formik.submitForm()}>Submit</button>
      <div>
        {Object.values(formik.errors).map((error) => (
          <p>{error}</p>
        ))}
      </div>

      <DisplayStudents />
    </div>
  );
}

export default App;
