"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { AlertCircle, Check } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { formatMoney, parseMoneyToCents } from "@/lib/money";
import type { FulfillmentType } from "@/lib/orders/status";
import type { DeliveryZoneSnapshot, MenuSnapshot } from "@/lib/pricing";
import { priceOrder } from "@/lib/pricing";
import type { CartLine } from "@/stores/cart";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;
type PaymentMethod = "cash" | "transfer";

interface CheckoutSettings {
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  cashEnabled: boolean;
  transferEnabled: boolean;
  transferAlias: string | null;
  transferCbu: string | null;
  transferHolder: string | null;
}

export function CheckoutSheet({
  open,
  onOpenChange,
  businessSlug,
  currency,
  settings,
  zones,
  snapshot,
  lines,
  fulfillment,
  onFulfillmentChange,
  deliveryZoneId,
  onDeliveryZoneChange,
  onOrderCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessSlug: string;
  currency: string;
  settings: CheckoutSettings;
  zones: DeliveryZoneSnapshot[];
  snapshot: MenuSnapshot;
  lines: CartLine[];
  fulfillment: FulfillmentType;
  onFulfillmentChange: (value: FulfillmentType) => void;
  deliveryZoneId: string | null;
  onDeliveryZoneChange: (value: string | null) => void;
  onOrderCreated: (result: { orderId: string; code: string; waUrl: string }) => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressReference, setAddressReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    settings.cashEnabled ? "cash" : "transfer",
  );
  const [cashChangeFor, setCashChangeFor] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const priced = useMemo(
    () =>
      priceOrder(
        {
          lines: lines.map((l) => ({
            lineId: l.lineId,
            productId: l.productId,
            quantity: l.quantity,
            optionIds: l.optionIds,
            notes: l.notes,
          })),
          fulfillment,
          deliveryZoneId,
        },
        snapshot,
      ),
    [lines, fulfillment, deliveryZoneId, snapshot],
  );

  const STEP_TITLES: Record<Step, string> = {
    1: "¿Cómo lo recibís?",
    2: "Tus datos",
    3: "Forma de pago",
    4: "Últimos detalles",
  };

  const canLeaveStep1 = fulfillment === "pickup" || (fulfillment === "delivery" && Boolean(deliveryZoneId));
  const canLeaveStep2 =
    customerName.trim().length >= 2 &&
    customerPhone.trim().length >= 6 &&
    (fulfillment === "pickup" || address.trim().length >= 3);

  async function submit() {
    if (!priced.ok) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug,
          fulfillment,
          deliveryZoneId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          address: fulfillment === "delivery" ? address.trim() : null,
          addressReference: fulfillment === "delivery" ? addressReference.trim() || null : null,
          paymentMethod,
          cashChangeForCents: paymentMethod === "cash" ? parseMoneyToCents(cashChangeFor) : null,
          notes: notes.trim() || null,
          idempotencyKey,
          lines: lines.map((l) => ({
            lineId: l.lineId,
            productId: l.productId,
            quantity: l.quantity,
            optionIds: l.optionIds,
            notes: l.notes || null,
          })),
        }),
      });

      const data = (await response.json()) as {
        orderId?: string;
        code?: string;
        waUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.orderId || !data.code || !data.waUrl) {
        setSubmitError(data.error ?? "No pudimos confirmar el pedido. Probá de nuevo.");
        return;
      }

      onOrderCreated({ orderId: data.orderId, code: data.code, waUrl: data.waUrl });
    } catch {
      setSubmitError("No hay conexión. Revisá tu internet y volvé a intentar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setStep(1);
        onOpenChange(next);
      }}
      title={STEP_TITLES[step]}
      description={`Paso ${step} de 4`}
      footer={
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)} disabled={submitting}>
              Atrás
            </Button>
          )}
          {step < 4 ? (
            <Button
              block
              disabled={(step === 1 && !canLeaveStep1) || (step === 2 && !canLeaveStep2)}
              onClick={() => setStep((s) => (s + 1) as Step)}
            >
              Continuar
            </Button>
          ) : (
            <Button block disabled={submitting || !priced.ok} onClick={submit}>
              {submitting
                ? "Confirmando…"
                : priced.ok
                  ? `Confirmar pedido — ${formatMoney(priced.order.totalCents, { currency })}`
                  : "Revisá tu pedido"}
            </Button>
          )}
        </div>
      }
    >
      {step === 1 && (
        <div className="space-y-5">
          <RadioGroup.Root
            value={fulfillment}
            onValueChange={(v) => onFulfillmentChange(v as FulfillmentType)}
            className="grid grid-cols-2 gap-2"
          >
            {settings.deliveryEnabled && (
              <RadioGroup.Item
                value="delivery"
                className="min-h-touch rounded-lg border border-ink-200 text-sm font-medium text-ink-900 data-[state=checked]:border-brand data-[state=checked]:bg-brand-soft"
              >
                Delivery
              </RadioGroup.Item>
            )}
            {settings.pickupEnabled && (
              <RadioGroup.Item
                value="pickup"
                className="min-h-touch rounded-lg border border-ink-200 text-sm font-medium text-ink-900 data-[state=checked]:border-brand data-[state=checked]:bg-brand-soft"
              >
                Retiro en el local
              </RadioGroup.Item>
            )}
          </RadioGroup.Root>

          {fulfillment === "delivery" && (
            <div>
              <p className="mb-2 text-sm font-medium text-ink-900">Zona de entrega</p>
              <RadioGroup.Root
                value={deliveryZoneId ?? ""}
                onValueChange={onDeliveryZoneChange}
                className="space-y-2"
              >
                {zones.map((zone) => (
                  <RadioGroup.Item
                    key={zone.id}
                    value={zone.id}
                    className="flex w-full min-h-touch items-center justify-between rounded-lg border border-ink-200 px-3 text-left text-sm data-[state=checked]:border-brand data-[state=checked]:bg-brand-soft"
                  >
                    <span className="text-ink-900">{zone.name}</span>
                    <span className="font-mono text-ink-500">
                      +{formatMoney(zone.feeCents, { currency })}
                    </span>
                  </RadioGroup.Item>
                ))}
              </RadioGroup.Root>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Field label="Nombre" required>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoFocus />
          </Field>
          <Field label="Teléfono" required hint="Por si el local necesita ubicarte.">
            <Input
              type="tel"
              inputMode="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="381 123 4567"
            />
          </Field>
          {fulfillment === "delivery" && (
            <>
              <Field label="Dirección" required>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle y número" />
              </Field>
              <Field label="Referencia" hint="Timbre, piso, entre calles…">
                <Input value={addressReference} onChange={(e) => setAddressReference(e.target.value)} />
              </Field>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <RadioGroup.Root
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            className="grid grid-cols-2 gap-2"
          >
            {settings.cashEnabled && (
              <RadioGroup.Item
                value="cash"
                className="min-h-touch rounded-lg border border-ink-200 text-sm font-medium text-ink-900 data-[state=checked]:border-brand data-[state=checked]:bg-brand-soft"
              >
                Efectivo
              </RadioGroup.Item>
            )}
            {settings.transferEnabled && (
              <RadioGroup.Item
                value="transfer"
                className="min-h-touch rounded-lg border border-ink-200 text-sm font-medium text-ink-900 data-[state=checked]:border-brand data-[state=checked]:bg-brand-soft"
              >
                Transferencia
              </RadioGroup.Item>
            )}
          </RadioGroup.Root>

          {paymentMethod === "cash" && (
            <Field label="¿Con cuánto abonás?" hint="Opcional, para llevarte el vuelto justo.">
              <Input
                inputMode="decimal"
                value={cashChangeFor}
                onChange={(e) => setCashChangeFor(e.target.value)}
                placeholder="Ej: 20000"
              />
            </Field>
          )}

          {paymentMethod === "transfer" && (settings.transferAlias || settings.transferCbu) && (
            <div className="rounded-lg bg-ink-50 p-3 text-sm">
              <p className="font-medium text-ink-900">Datos para transferir</p>
              {settings.transferAlias && (
                <p className="mt-1 font-mono text-ink-700">{settings.transferAlias}</p>
              )}
              {settings.transferCbu && <p className="font-mono text-ink-700">{settings.transferCbu}</p>}
              {settings.transferHolder && (
                <p className="mt-1 text-xs text-ink-500">{settings.transferHolder}</p>
              )}
              <p className="mt-2 text-xs text-ink-500">
                Mandá el comprobante junto con el pedido por WhatsApp.
              </p>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <Field label="Aclaraciones para la cocina" hint="Alergias, sin sal, lo que necesites avisar.">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} />
          </Field>

          {priced.ok ? (
            <div className="space-y-1 rounded-lg bg-ink-50 p-3 text-sm">
              <div className="flex justify-between text-ink-500">
                <span>Subtotal</span>
                <span className="font-mono">{formatMoney(priced.order.subtotalCents, { currency })}</span>
              </div>
              {priced.order.deliveryFeeCents > 0 && (
                <div className="flex justify-between text-ink-500">
                  <span>Envío</span>
                  <span className="font-mono">{formatMoney(priced.order.deliveryFeeCents, { currency })}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-ink-200 pt-1 font-semibold text-ink-900">
                <span>Total</span>
                <span className="font-mono">{formatMoney(priced.order.totalCents, { currency })}</span>
              </div>
            </div>
          ) : (
            <p className={cn("flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger")}>
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {priced.errors[0]?.message ?? "Revisá tu pedido antes de confirmar."}
            </p>
          )}

          {submitError && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {submitError}
            </p>
          )}

          <p className="flex items-start gap-2 text-xs text-ink-500">
            <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Al confirmar, te vamos a llevar a WhatsApp con el pedido ya armado para que lo envíes
            al local.
          </p>
        </div>
      )}
    </Sheet>
  );
}
