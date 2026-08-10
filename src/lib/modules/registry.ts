import type { ModuleKey } from "@/types/database";

export const MODULE_KEYS: ModuleKey[] = [
  "kitchen_display",
  "inventory",
  "crm_loyalty",
  "tables",
  "cash_register",
  "mercadopago",
  "kitchen_printing",
];

/** What an owner sees on /panel/no-disponible when a module is off. */
export const MODULE_LABELS: Record<ModuleKey, string> = {
  kitchen_display: "Pantalla de cocina",
  inventory: "Stock",
  crm_loyalty: "Clientes",
  tables: "Mesas y salón",
  cash_register: "Caja",
  mercadopago: "MercadoPago",
  kitchen_printing: "Impresión en cocina",
};
