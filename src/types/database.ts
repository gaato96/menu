/**
 * Database types, matching supabase/migrations.
 *
 * Hand-authored on purpose: `supabase gen types` shells out to Docker, which is
 * not available on this machine. The shape mirrors what the CLI emits, so
 * `npm run db:types` is a drop-in replacement once Docker is around.
 *
 * Every row shape is declared with `type`, never `interface`. supabase-js
 * constrains tables to `Record<string, unknown>`, and interfaces do not get an
 * implicit index signature — using one silently resolves the Insert type to
 * `never` and every `.insert()` call fails to type-check for no visible reason.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

/* --------------------------------------------------------------------------
   Column unions.

   These columns are `text` + CHECK in Postgres rather than Postgres ENUMs, so
   that adding 'dine_in' when the tables module ships is a one-line migration.
   The trade-off is that the type safety lives here instead of being generated.
   Keep in sync with the CHECK constraints.
-------------------------------------------------------------------------- */

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "in_kitchen"
  | "on_the_way"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export type FulfillmentType = "delivery" | "pickup";
export type PaymentMethod = "cash" | "transfer";
export type PaymentStatus = "pending" | "paid" | "failed";
export type StaffRole = "superadmin" | "owner" | "manager" | "cashier";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "suspended";
export type BusinessStatus = "active" | "suspended";
export type SelectionType = "single" | "multiple";
export type ModuleKey =
  | "crm_loyalty"
  | "mercadopago"
  | "kitchen_printing"
  | "kitchen_display"
  | "inventory"
  | "tables";

type Business = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  cover_image_url: string | null;
  brand_color: string;
  whatsapp_phone: string;
  address: string | null;
  timezone: string;
  currency: string;
  is_open_manual: boolean;
  status: BusinessStatus;
  created_at: string;
  updated_at: string;
};

type BusinessSettings = {
  business_id: string;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  min_order_cents: number;
  cash_enabled: boolean;
  transfer_enabled: boolean;
  transfer_alias: string | null;
  transfer_cbu: string | null;
  transfer_holder: string | null;
  prep_time_minutes: number;
  catalog_view_enabled: boolean;
  updated_at: string;
};

type Subscription = {
  business_id: string;
  plan: string;
  status: SubscriptionStatus;
  current_period_end: string | null;
  monthly_amount_cents: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type BusinessModule = {
  business_id: string;
  module_key: ModuleKey;
  enabled: boolean;
  enabled_at: string;
};

type BusinessHours = {
  id: string;
  business_id: string;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
};

type Profile = {
  id: string;
  business_id: string | null;
  role: StaffRole;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Category = {
  id: string;
  business_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Product = {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price_cents: number;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** null = not tracked. Inventory module only; see D.2 migration. */
  stock_quantity: number | null;
  low_stock_threshold: number;
};

type OptionGroup = {
  id: string;
  business_id: string;
  product_id: string;
  name: string;
  selection_type: SelectionType;
  is_required: boolean;
  min_select: number;
  max_select: number | null;
  sort_order: number;
};

type ProductOption = {
  id: string;
  business_id: string;
  option_group_id: string;
  name: string;
  price_delta_cents: number;
  is_available: boolean;
  sort_order: number;
};

type DeliveryZone = {
  id: string;
  business_id: string;
  name: string;
  fee_cents: number;
  is_active: boolean;
  sort_order: number;
};

type Order = {
  id: string;
  business_id: string;
  code: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  customer_name: string;
  customer_phone: string;
  address: string | null;
  address_reference: string | null;
  delivery_zone_id: string | null;
  payment_method: PaymentMethod;
  cash_change_for_cents: number | null;
  notes: string | null;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  whatsapp_opened_at: string | null;
  idempotency_key: string;
  cancel_reason: string | null;
  created_at: string;
  status_changed_at: string;
  customer_id: string | null;
  payment_status: PaymentStatus;
  external_payment_id: string | null;
  table_id: string | null;
  /** Exactly-once marker for the inventory trigger. See D.2 migration. */
  stock_applied: boolean;
};

type OrderItem = {
  id: string;
  business_id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_base_price_cents: number;
  quantity: number;
  item_notes: string | null;
  line_total_cents: number;
  sort_order: number;
};

type OrderItemOption = {
  id: string;
  business_id: string;
  order_item_id: string;
  option_id: string | null;
  group_name: string;
  option_name: string;
  price_delta_cents: number;
};

type OrderStatusEvent = {
  id: string;
  business_id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  created_at: string;
};

/**
 * Present in the schema but unreachable from any client: RLS is enabled with no
 * policies, so only next_order_code() (SECURITY DEFINER) can touch it. Typed
 * here so the RLS suite can assert that denial rather than assume it.
 */
type OrderCounter = {
  business_id: string;
  business_date: string;
  last_number: number;
};

type PushSubscriptionRow = {
  id: string;
  business_id: string;
  profile_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
};

type Customer = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  /** Generated column: right(regexp_replace(phone, '\D', '', 'g'), 8). */
  phone_key: string;
  created_at: string;
  updated_at: string;
};

type CustomerStats = {
  customer_id: string;
  business_id: string;
  name: string;
  phone: string;
  completed_orders: number;
  total_spent_cents: number;
  last_order_at: string | null;
};

/** Columns with database defaults are optional on insert. */
type Insertable<T, Required extends keyof T> = Pick<T, Required> & Partial<Omit<T, Required>>;

type TableShape<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      businesses: TableShape<
        Business,
        Insertable<Business, "slug" | "name" | "whatsapp_phone">,
        Partial<Business>
      >;
      business_settings: TableShape<
        BusinessSettings,
        Insertable<BusinessSettings, "business_id">,
        Partial<BusinessSettings>
      >;
      subscriptions: TableShape<
        Subscription,
        Insertable<Subscription, "business_id">,
        Partial<Subscription>
      >;
      business_modules: TableShape<
        BusinessModule,
        Insertable<BusinessModule, "business_id" | "module_key">,
        Partial<BusinessModule>
      >;
      business_hours: TableShape<
        BusinessHours,
        Insertable<BusinessHours, "business_id" | "day_of_week" | "opens_at" | "closes_at">,
        Partial<BusinessHours>
      >;
      profiles: TableShape<Profile, Insertable<Profile, "id" | "role">, Partial<Profile>>;
      categories: TableShape<
        Category,
        Insertable<Category, "business_id" | "name">,
        Partial<Category>
      >;
      products: TableShape<
        Product,
        Insertable<Product, "business_id" | "category_id" | "name" | "base_price_cents">,
        Partial<Product>
      >;
      option_groups: TableShape<
        OptionGroup,
        Insertable<OptionGroup, "business_id" | "product_id" | "name" | "selection_type">,
        Partial<OptionGroup>
      >;
      options: TableShape<
        ProductOption,
        Insertable<ProductOption, "business_id" | "option_group_id" | "name">,
        Partial<ProductOption>
      >;
      delivery_zones: TableShape<
        DeliveryZone,
        Insertable<DeliveryZone, "business_id" | "name">,
        Partial<DeliveryZone>
      >;
      orders: TableShape<
        Order,
        Insertable<
          Order,
          | "business_id"
          | "code"
          | "fulfillment_type"
          | "customer_name"
          | "customer_phone"
          | "payment_method"
          | "subtotal_cents"
          | "total_cents"
          | "idempotency_key"
        >,
        Partial<Order>
      >;
      order_items: TableShape<
        OrderItem,
        Insertable<
          OrderItem,
          | "business_id"
          | "order_id"
          | "product_name"
          | "unit_base_price_cents"
          | "quantity"
          | "line_total_cents"
        >,
        Partial<OrderItem>
      >;
      order_item_options: TableShape<
        OrderItemOption,
        Insertable<
          OrderItemOption,
          "business_id" | "order_item_id" | "group_name" | "option_name"
        >,
        Partial<OrderItemOption>
      >;
      order_status_events: TableShape<
        OrderStatusEvent,
        Insertable<OrderStatusEvent, "business_id" | "order_id" | "to_status">,
        Partial<OrderStatusEvent>
      >;
      order_counters: TableShape<
        OrderCounter,
        Insertable<OrderCounter, "business_id" | "business_date">,
        Partial<OrderCounter>
      >;
      push_subscriptions: TableShape<
        PushSubscriptionRow,
        Insertable<
          PushSubscriptionRow,
          "business_id" | "profile_id" | "endpoint" | "p256dh" | "auth"
        >,
        Partial<PushSubscriptionRow>
      >;
      customers: TableShape<
        Customer,
        Insertable<Customer, "business_id" | "name" | "phone">,
        Partial<Customer>
      >;
    };
    Views: {
      customer_stats: { Row: CustomerStats; Relationships: [] };
    };
    Functions: {
      next_order_code: { Args: { p_business_id: string }; Returns: string };
      business_is_servable: { Args: { p_business_id: string }; Returns: boolean };
      order_status_rank: { Args: { p_status: string }; Returns: number };
      create_priced_order: { Args: { p_business_id: string; p_order: Json }; Returns: Json };
      upsert_push_subscription: {
        Args: {
          p_business_id: string;
          p_profile_id: string;
          p_endpoint: string;
          p_p256dh: string;
          p_auth: string;
          p_user_agent: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];
