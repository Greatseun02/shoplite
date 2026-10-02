import { configureStore } from "@reduxjs/toolkit";
import student from "./studentSlice";
import cart from "./cartSlice";
import product from "./productSlice";
import { rtkApi } from "../api/client";
import { useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: { student, cart, product, [rtkApi.reducerPath]: rtkApi.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rtkApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

//do not cram!!!!!!!! you do not need to fully understand !!!! just know what it does, and how it makes your life easier!!!!!
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
