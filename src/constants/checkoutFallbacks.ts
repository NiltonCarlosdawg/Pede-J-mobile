import type { Address } from "../types";

/** Endereços locais quando a API falha ou não devolve dados (demo/offline). */
export const FALLBACK_ADDRESSES: Address[] = [
  {
    id: "addr-fallback-1",
    label: "Casa",
    address: "Rua das Flores, 123 - Apto 45",
    neighborhood: "Centro",
    city: "Luanda",
    isDefault: true,
  },
  {
    id: "addr-fallback-2",
    label: "Trabalho",
    address: "Av. Kwame Nkrumah, 500 - Sala 201",
    neighborhood: "Kinaxixi",
    city: "Luanda",
    isDefault: false,
  },
];
