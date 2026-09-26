import { useCallback } from 'react';
import { isAxiosError, AxiosError } from 'axios';

import { apiSlice } from '../services/apiSlice';
import type { Order } from '../types';

export type OrderErrorType =
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'TIMEOUT_ERROR'
  | 'NETWORK_ERROR'
  | 'CONFLICT_ERROR'
  | 'UNKNOWN_ERROR';

export interface OrderMutationError {
  type: OrderErrorType;
  message: string;
  status?: number;
  details?: Record<string, string[]>;
}

type NormalizedErrorData = {
  message?: string;
  code?: string;
};

type NormalizedError = {
  status: number | 'FETCH_ERROR' | 'TIMEOUT_ERROR' | 'PARSING_ERROR' | 'CUSTOM_ERROR';
  data?: NormalizedErrorData;
};

function isNormalizedError(error: unknown): error is NormalizedError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'data' in error &&
    !isAxiosError(error)
  );
}

export function classifyOrderError(error: unknown): OrderMutationError {
  // Erros normalizados pelo baseQuery do RTK Query (camada única de fetching).
  if (isNormalizedError(error)) {
    if (error.status === 'TIMEOUT_ERROR' || error.data?.code === 'ECONNABORTED') {
      return {
        type: 'TIMEOUT_ERROR',
        message: 'O servidor demorou muito a responder. Tente novamente.',
      };
    }

    if (error.status === 'FETCH_ERROR') {
      return {
        type: 'NETWORK_ERROR',
        message: 'Sem conexão ao servidor. Verifique a sua internet e tente novamente.',
      };
    }

    if (error.status === 409) {
      return {
        type: 'CONFLICT_ERROR',
        message: 'Este pedido já foi registado (idempotência).',
        status: 409,
      };
    }

    if (typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
      return {
        type: 'VALIDATION_ERROR',
        message: error.data?.message ?? 'Dados inválidos. Verifique as informações do pedido.',
        status: error.status,
        details: error.data as Record<string, string[]> | undefined,
      };
    }

    if (typeof error.status === 'number' && error.status >= 500) {
      return {
        type: 'SERVER_ERROR',
        message: 'O servidor encontrou um erro. Tente novamente em instantes.',
        status: error.status,
      };
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: error.data?.message ?? 'Ocorreu um erro inesperado. Tente novamente.',
    };
  }

  // Compatibilidade com erros axios "cruos" (casos fora do baseQuery).
  if (!isAxiosError(error)) {
    return {
      type: 'UNKNOWN_ERROR',
      message: 'Ocorreu um erro inesperado. Tente novamente.',
    };
  }

  const axiosError = error as AxiosError<{ message?: string }>;

  if (axiosError.code === 'ECONNABORTED') {
    return {
      type: 'TIMEOUT_ERROR',
      message: 'O servidor demorou muito a responder. Tente novamente.',
    };
  }

  if (!axiosError.response) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Sem conexão ao servidor. Verifique a sua internet e tente novamente.',
    };
  }

  const status = axiosError.response.status;
  const body = axiosError.response.data;

  if (status === 409) {
    return {
      type: 'CONFLICT_ERROR',
      message: 'Este pedido já foi registado (idempotência).',
      status,
    };
  }

  if (status >= 400 && status < 500) {
    return {
      type: 'VALIDATION_ERROR',
      message: body?.message ?? 'Dados inválidos. Verifique as informações do pedido.',
      status,
      details: body as Record<string, string[]> | undefined,
    };
  }

  if (status >= 500) {
    return {
      type: 'SERVER_ERROR',
      message: 'O servidor encontrou um erro. Tente novamente em instantes.',
      status,
    };
  }

  return {
    type: 'UNKNOWN_ERROR',
    message: 'Ocorreu um erro inesperado. Tente novamente.',
  };
}

export type SubmitOrderArgs = {
  body: Record<string, unknown>;
  idempotencyKey: string;
};

/**
 * Submissão de encomenda sobre RTK Query (camada única de fetching).
 * Mantém a API usada pelo checkout: `mutateAsync` (rejeita em erro) e `isPending`.
 */
export function useSubmitOrderMutation() {
  const [trigger, result] = apiSlice.useCreateOrderMutation();

  const mutateAsync = useCallback(
    async ({ body, idempotencyKey }: SubmitOrderArgs) => {
      const data = await trigger({
        ...(body as unknown as Record<string, never>),
        idempotencyKey,
      } as Parameters<typeof trigger>[0]).unwrap();
      return data as Order;
    },
    [trigger],
  );

  return {
    mutateAsync,
    isPending: result.isLoading,
    isSuccess: result.isSuccess,
    isError: result.isError,
    error: result.error,
    reset: result.reset,
  };
}
