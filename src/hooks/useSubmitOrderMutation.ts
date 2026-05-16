import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, isAxiosError } from "axios";

import { orderApi } from "../services/api";
import { apiSlice } from "../services/apiSlice";
import { useAppDispatch } from "../store";

export type OrderErrorType =
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "TIMEOUT_ERROR"
  | "NETWORK_ERROR"
  | "CONFLICT_ERROR"
  | "UNKNOWN_ERROR";

export interface OrderMutationError {
  type: OrderErrorType;
  message: string;
  status?: number;
  details?: Record<string, string[]>;
}

export function classifyOrderError(error: unknown): OrderMutationError {
  if (!isAxiosError(error)) {
    return {
      type: "UNKNOWN_ERROR",
      message:
        "Ocorreu um erro inesperado. O pedido será registado localmente e sincronizado depois.",
    };
  }

  const axiosError = error as AxiosError<{ message?: string }>;

  if (axiosError.code === "ECONNABORTED") {
    return {
      type: "TIMEOUT_ERROR",
      message:
        "O servidor demorou muito a responder. O pedido será registado localmente e sincronizado depois.",
    };
  }

  if (!axiosError.response) {
    return {
      type: "NETWORK_ERROR",
      message:
        "Sem conexão ao servidor. O pedido será registado localmente e sincronizado depois.",
    };
  }

  const status = axiosError.response.status;
  const body = axiosError.response.data;

  if (status === 409) {
    return {
      type: "CONFLICT_ERROR",
      message: "Este pedido já foi registado (idempotência).",
      status,
    };
  }

  if (status >= 400 && status < 500) {
    return {
      type: "VALIDATION_ERROR",
      message: body?.message ?? "Dados inválidos. Verifique as informações do pedido.",
      status,
      details: body as Record<string, string[]> | undefined,
    };
  }

  if (status >= 500) {
    return {
      type: "SERVER_ERROR",
      message:
        "O servidor encontrou um erro. O pedido será registado localmente e sincronizado depois.",
      status,
    };
  }

  return {
    type: "UNKNOWN_ERROR",
    message:
      "Ocorreu um erro inesperado. O pedido será registado localmente e sincronizado depois.",
  };
}

export function useSubmitOrderMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      body,
      idempotencyKey,
    }: {
      body: Record<string, unknown>;
      idempotencyKey: string;
    }) => {
      const { data } = await orderApi.create(body, idempotencyKey);
      return data;
    },
    onSuccess: () => {
      dispatch(apiSlice.util.invalidateTags([{ type: "Order", id: "LIST" }]));
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
