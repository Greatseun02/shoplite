import { useAppSelector } from "./store/store";

export default function DisplayStudents() {
  const students = useAppSelector((state) => state.student);

  return (
    <div>
      {students.map((student) => (
        <div key={student.id}>
          <p>{student.name}</p>
          <p>{student.age}</p>
          <p>{student.gender}</p>
          <p>{student.specialization}</p>
        </div>
      ))}
    </div>
  );
}
