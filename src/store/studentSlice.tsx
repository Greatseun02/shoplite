import { createSlice } from "@reduxjs/toolkit";
import type { Student } from "../types";

const studentInitialState: Student[] = [];

const studentSlice = createSlice({
  name: "student",
  initialState: studentInitialState,
  reducers: {
    registerStudent: (state, action: { type: string; payload: Student }) => {
      state.push(action.payload);
    },
  },
});

export const { registerStudent } = studentSlice.actions;

export default studentSlice.reducer;
