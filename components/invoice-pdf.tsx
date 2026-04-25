"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceData } from "@/lib/invoiceData";
import { truncateAddress } from "@/lib/invoiceData";

const S = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0a0a0a",
  },

  // ── Section 1: Header ──────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
    letterSpacing: 4,
    marginBottom: 6,
  },
  generatedBy: {
    fontSize: 9,
    color: "#888888",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
  },
  badgeDark: {
    backgroundColor: "#0a0a0a",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 6,
  },
  badgeDarkText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  badgeLight: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeLightText: {
    fontSize: 9,
    color: "#333333",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceNumber: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
    marginBottom: 4,
  },
  issuedDate: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 8,
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusPaidText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#16a34a",
  },
  statusPending: {
    backgroundColor: "#fef9c3",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusPendingText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ca8a04",
  },
  thickDivider: {
    height: 2,
    backgroundColor: "#0a0a0a",
    marginBottom: 20,
  },

  // ── Section 2: Billing Info ────────────────────────────────────
  billingRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  billingCol: {
    flex: 1,
  },
  billingLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  billingName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
    marginBottom: 3,
  },
  billingENS: {
    fontSize: 10,
    color: "#7c3aed",
    marginBottom: 3,
  },
  billingMono: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 3,
  },
  billingText: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 3,
  },
  billingItalic: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    color: "#888888",
    marginBottom: 2,
  },
  thinDivider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginBottom: 20,
  },

  // ── Section 3: Line Items Table ────────────────────────────────
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    letterSpacing: 1,
  },
  tableDataRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableDataRowAlt: {
    backgroundColor: "#fafafa",
  },
  colItem: { flex: 4 },
  colDesc: { flex: 3 },
  colQty: { flex: 1 },
  colUnitPrice: { flex: 2 },
  colTotal: { flex: 2 },
  itemName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
  },
  itemDesc: {
    fontSize: 10,
    color: "#666666",
  },
  itemCenter: {
    fontSize: 10,
    color: "#0a0a0a",
    textAlign: "center",
  },
  itemRight: {
    fontSize: 10,
    color: "#0a0a0a",
    textAlign: "right",
  },
  itemRightBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
    textAlign: "right",
  },

  // ── Section 4: Totals ──────────────────────────────────────────
  totalsOuter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    marginBottom: 20,
  },
  totalsBlock: {
    width: "42%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 10,
    color: "#555555",
  },
  totalsValue: {
    fontSize: 10,
    color: "#0a0a0a",
  },
  totalsMiniDivider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 6,
  },
  totalsBoldLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
  },
  totalsBoldValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
  },
  totalsUSD: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique",
    color: "#888888",
  },

  // ── Section 5: Transaction Details ────────────────────────────
  txBox: {
    backgroundColor: "#f8f8f8",
    borderLeftWidth: 3,
    borderLeftColor: "#7c3aed",
    borderRadius: 4,
    padding: 16,
    marginBottom: 28,
  },
  txBoxTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  txTwoCol: {
    flexDirection: "row",
  },
  txCol: {
    flex: 1,
  },
  txFieldLabel: {
    fontSize: 8,
    color: "#888888",
    marginBottom: 3,
  },
  txFieldValue: {
    fontSize: 9,
    color: "#0a0a0a",
    marginBottom: 10,
    wordBreak: "break-all",
  },
  txFieldValuePurple: {
    fontSize: 9,
    color: "#7c3aed",
    marginBottom: 10,
  },
  // ── Section 6: Footer ──────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 48,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerBrand: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
    marginBottom: 3,
  },
  footerSub: {
    fontSize: 8,
    color: "#888888",
    marginBottom: 3,
  },
  footerENS: {
    fontSize: 8,
    color: "#7c3aed",
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerItalic: {
    fontSize: 8,
    fontFamily: "Helvetica-Oblique",
    color: "#888888",
    marginBottom: 2,
  },
  footerItalicPurple: {
    fontSize: 8,
    fontFamily: "Helvetica-Oblique",
    color: "#7c3aed",
  },
});

export function InvoicePDF({ data }: { data: InvoiceData }) {
  const networkShort = data.network.split(" (")[0];

  return (
    <Document
      title={`AgentCart ${data.invoiceNumber}`}
      author="AgentCart AI Agent"
    >
      <Page size="A4" style={S.page}>

        {/* ── Section 1: Header ── */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.invoiceTitle}>INVOICE</Text>
            <Text style={S.generatedBy}>Generated by AgentCart AI Agent</Text>
            <View style={S.badgeRow}>
              <View style={S.badgeDark}>
                <Text style={S.badgeDarkText}>agentcart.eth</Text>
              </View>
              <View style={S.badgeLight}>
                <Text style={S.badgeLightText}>{networkShort}</Text>
              </View>
            </View>
          </View>
          <View style={S.headerRight}>
            <Text style={S.invoiceNumber}>{data.invoiceNumber}</Text>
            <Text style={S.issuedDate}>{data.issuedDate}</Text>
            {data.status === "PAID" ? (
              <View style={S.statusPaid}>
                <Text style={S.statusPaidText}>PAID</Text>
              </View>
            ) : (
              <View style={S.statusPending}>
                <Text style={S.statusPendingText}>PENDING</Text>
              </View>
            )}
          </View>
        </View>
        <View style={S.thickDivider} />

        {/* ── Section 2: Billing Info ── */}
        <View style={S.billingRow}>
          <View style={S.billingCol}>
            <Text style={S.billingLabel}>BILLED TO</Text>
            <Text style={S.billingName}>{data.userName}</Text>
            <Text style={S.billingENS}>{data.userENS}</Text>
            <Text style={S.billingMono}>{truncateAddress(data.userWallet)}</Text>
            <Text style={S.billingText}>{data.userLocation}</Text>
          </View>
          <View style={S.billingCol}>
            <Text style={S.billingLabel}>BILLED FROM</Text>
            <Text style={S.billingName}>{data.merchantName}</Text>
            <Text style={S.billingText}>{data.merchantWebsite}</Text>
            <Text style={S.billingMono}>{truncateAddress(data.merchantWallet)}</Text>
          </View>
          <View style={S.billingCol}>
            <Text style={S.billingLabel}>PAYMENT METHOD</Text>
            <Text style={[S.billingName, { fontSize: 10 }]}>{networkShort}</Text>
            <Text style={S.billingText}>{data.token}</Text>
            <Text style={S.billingItalic}>Processed autonomously</Text>
            <Text style={S.billingItalic}>by AI Agent</Text>
          </View>
        </View>
        <View style={S.thinDivider} />

        {/* ── Section 3: Line Items Table ── */}
        <View style={S.tableHeaderRow}>
          <View style={S.colItem}>
            <Text style={S.tableHeaderText}>ITEM</Text>
          </View>
          <View style={S.colDesc}>
            <Text style={S.tableHeaderText}>DESCRIPTION</Text>
          </View>
          <View style={S.colQty}>
            <Text style={[S.tableHeaderText, { textAlign: "center" }]}>QTY</Text>
          </View>
          <View style={S.colUnitPrice}>
            <Text style={[S.tableHeaderText, { textAlign: "right" }]}>UNIT PRICE</Text>
          </View>
          <View style={S.colTotal}>
            <Text style={[S.tableHeaderText, { textAlign: "right" }]}>TOTAL</Text>
          </View>
        </View>

        {data.items.map((item, i) => (
          <View
            key={i}
            style={[S.tableDataRow, i % 2 !== 0 ? S.tableDataRowAlt : {}]}
          >
            <View style={S.colItem}>
              <Text style={S.itemName}>{item.name}</Text>
            </View>
            <View style={S.colDesc}>
              <Text style={S.itemDesc}>{item.description}</Text>
            </View>
            <View style={S.colQty}>
              <Text style={S.itemCenter}>{item.quantity}</Text>
            </View>
            <View style={S.colUnitPrice}>
              <Text style={S.itemRight}>{item.unitPrice}</Text>
            </View>
            <View style={S.colTotal}>
              <Text style={S.itemRightBold}>{item.total}</Text>
            </View>
          </View>
        ))}

        {/* ── Section 4: Totals ── */}
        <View style={S.totalsOuter}>
          <View style={S.totalsBlock}>
            <View style={S.totalsRow}>
              <Text style={S.totalsLabel}>Subtotal</Text>
              <Text style={S.totalsValue}>{data.subtotal}</Text>
            </View>
            <View style={S.totalsRow}>
              <Text style={S.totalsLabel}>Network Fee (Gas)</Text>
              <Text style={S.totalsValue}>{data.networkFee}</Text>
            </View>
            <View style={S.totalsMiniDivider} />
            <View style={S.totalsRow}>
              <Text style={S.totalsBoldLabel}>TOTAL</Text>
              <Text style={S.totalsBoldValue}>{data.total}</Text>
            </View>
            <View style={[S.totalsRow, { justifyContent: "flex-end" }]}>
              <Text style={S.totalsUSD}>{data.totalUSD}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 5: Transaction Details ── */}
        <View style={S.txBox}>
          <Text style={S.txBoxTitle}>BLOCKCHAIN TRANSACTION DETAILS</Text>
          <View style={S.txTwoCol}>
            <View style={S.txCol}>
              <Text style={S.txFieldLabel}>Transaction Hash</Text>
              <Text style={S.txFieldValue}>
                {data.txHash.slice(0, Math.ceil(data.txHash.length / 2))}
              </Text>
              <Text style={[S.txFieldValue, { marginTop: -6 }]}>
                {data.txHash.slice(Math.ceil(data.txHash.length / 2))}
              </Text>
              <Text style={S.txFieldLabel}>Block Number</Text>
              <Text style={S.txFieldValue}>{data.blockNumber}</Text>
            </View>
            <View style={S.txCol}>
              <Text style={S.txFieldLabel}>Network</Text>
              <Text style={S.txFieldValue}>{data.network}</Text>
              <Text style={S.txFieldLabel}>Agent Identity</Text>
              <Text style={S.txFieldValuePurple}>{data.agentName}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 6: Footer ── */}
        {/* ── Section 6: Footer ── */}
        <View style={S.footer}>
          <View>
            <Text style={S.footerBrand}>AgentCart</Text>
            <Text style={S.footerSub}>AI-Powered Autonomous Shopping</Text>
            <Text style={S.footerENS}>agentcart.eth</Text>
          </View>
          <View style={S.footerRight}>
            <Text style={S.footerItalic}>This invoice was generated autonomously</Text>
            <Text style={S.footerItalic}>by an AI agent on behalf of the user.</Text>
            <Text style={S.footerItalicPurple}>No human interaction required.</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
