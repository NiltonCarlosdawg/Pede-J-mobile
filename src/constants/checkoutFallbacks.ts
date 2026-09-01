import type { Address } from "../types";

/** Endereços locais quando a API falha ou não devolve dados (demo/offline). */
export const FALLBACK_ADDRESSES: Address[] = [
  {
    id: "addr-fallback-1",
    label: "Casa",
    address: "Rua das Flores, 123 - Apto 45",
    neighborhood: "Centro",
    city: "Luanda",
    latitude: -8.8399,
    longitude: 13.2894,
    isDefault: true,
  },
  {
    id: "addr-fallback-2",
    label: "Trabalho",
    address: "Av. Kwame Nkrumah, 500 - Sala 201",
    neighborhood: "Kinaxixi",
    city: "Luanda",
    latitude: -8.8147,
    longitude: 13.2319,
    isDefault: false,
  },
];
