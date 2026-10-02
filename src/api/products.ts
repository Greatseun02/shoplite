// src/api/products.ts
import type {
  CreateProductRequest,
  GetProductsRequest,
} from "../model/request/ProductRequest";
import type {
  CreateProductResponse,
  GetProductsResponse,
} from "../model/response/ProductResponse";
import { baseApi, rtkApi } from "./client";

const controller = "product";

export async function getProducts() {
  const response = await baseApi.get(`/${controller}`);

  return response?.data;
}

export async function getCategories() {
  const response = await baseApi.get(`/${controller}/categories`);

  return response?.data;
}

export async function createProduct() {
  const product = { id: 1, name: "Books" };

  const response = await baseApi.post(`/${controller}`, product);

  return response?.data;
}

//example of how we can define our endpoints in rtk query.
//1. Make use of inject endpoints to  define your endpoints using the baseApi created.
export const productService = rtkApi.injectEndpoints({
  //2. Your endpoints are defined here, and it is a callback function that takes a builder as an argument, and the builder is used to define your endpoints.
  endpoints: (builder) => ({
    //3. You define your endpoints here... and it can either be a query or a mutation.
    getProducts: builder.query<GetProductsResponse, GetProductsRequest>({
      query: () => "/products",
      providesTags: ["Products"],
      keepUnusedDataFor: 1000000,
    }),
    createProduct: builder.mutation<
      CreateProductResponse,
      CreateProductRequest
    >({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useLazyGetProductsQuery,
} = productService;
