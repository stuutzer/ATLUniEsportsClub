"use client";

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

export interface InvoiceData {
  invoiceNumber: string;
  agentName: string;
  userName: string;
  merchantName: string;
  itemName: string;
  amount: string;
  token: string;
  networkFee: string;
  total: string;
  txHash: string;
  timestamp: string;
  status: "CONFIRMED" | "PENDING";
  // Compliance / authorization metadata. Optional so older callers still work.
  credentialId?: string;
  credentialSignature?: string;
  signatureType?: "eip-712" | "mock";
  policyLimitUsd?: number;
  authorizedFor?: string;
}

const S = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 40,
    paddingBottom: 70,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#7c3aed",
  },
  logoSub: {
    fontSize: 9,
    color: "#999999",
    marginTop: 3,
  },
  invoiceRight: {
    alignItems: "flex-end",
  },
  invoiceLabel: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#cccccc",
    letterSpacing: 2,
  },
  invoiceNum: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#333333",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 16,
  },
  twoCol: {
    flexDirection: "row",
  },
  col: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#999999",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  primaryText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  secondaryText: {
    fontSize: 9,
    color: "#777777",
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f5f3ff",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#7c3aed",
    letterSpacing: 0.8,
  },
  tableDataRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cellDesc: {
    flex: 3,
  },
  cellAmount: {
    flex: 1,
    alignItems: "flex-end",
  },
  itemText: {
    fontSize: 10,
    color: "#1a1a1a",
  },
  amountText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  feeContainer: {
    paddingHorizontal: 10,
    marginTop: 6,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  feeLabel: {
    fontSize: 9,
    color: "#999999",
  },
  feeValue: {
    fontSize: 9,
    color: "#666666",
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f5f3ff",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#7c3aed",
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#7c3aed",
  },
  totalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#7c3aed",
  },
  txContainer: {
    marginTop: 14,
  },
  txBox: {
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#eeeeee",
    marginTop: 5,
  },
  txText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#555555",
    wordBreak: "break-all",
  },
  statusBlock: {
    marginTop: 16,
    borderRadius: 6,
    overflow: "hidden",
  },
  statusBlockConfirmed: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statusBlockPending: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statusDotConfirmed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16a34a",
    marginRight: 10,
  },
  statusDotPending: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d97706",
    marginRight: 10,
  },
  statusTextBlock: {
    flex: 1,
  },
  statusHeadingConfirmed: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#15803d",
    letterSpacing: 0.5,
  },
  statusHeadingPending: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#b45309",
    letterSpacing: 0.5,
  },
  statusSubtext: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  statusBadgeConfirmed: {
    backgroundColor: "#16a34a",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  statusBadgePending: {
    backgroundColor: "#d97706",
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  statusBadgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  complianceBlock: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 3,
    borderLeftColor: "#7c3aed",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  complianceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  complianceTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    letterSpacing: 1.2,
  },
  complianceBadgeReal: {
    backgroundColor: "#16a34a",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  complianceBadgeDemo: {
    backgroundColor: "#d97706",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  complianceBadgeText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  complianceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  complianceLabel: {
    fontSize: 8,
    color: "#9ca3af",
    width: "35%",
  },
  complianceValue: {
    fontSize: 8,
    color: "#1f2937",
    fontFamily: "Helvetica",
    flex: 1,
    textAlign: "right",
  },
  complianceMono: {
    fontSize: 8,
    color: "#1f2937",
    fontFamily: "Courier",
    flex: 1,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    fontSize: 8,
    color: "#bbbbbb",
  },
  footerRight: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#7c3aed",
  },
});

export function InvoicePDF({ data }: { data: InvoiceData }) {
  return (
    <Document
      title={`AgentCart Invoice #INV-${data.invoiceNumber}`}
      author="AgentCart AI Agent"
    >
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.logoText}>AgentCart</Text>
            <Text style={S.logoSub}>AI-Powered Web3 Commerce</Text>
          </View>
          <View style={S.invoiceRight}>
            <Text style={S.invoiceLabel}>INVOICE</Text>
            <Text style={S.invoiceNum}>#INV-{data.invoiceNumber}</Text>
          </View>
        </View>

        <View style={S.divider} />

        {/* From / To */}
        <View style={S.twoCol}>
          <View style={S.col}>
            <Text style={S.sectionLabel}>FROM</Text>
            <Text style={S.primaryText}>{data.agentName}</Text>
            <Text style={S.secondaryText}>Authorized AI Agent</Text>
          </View>
          <View style={S.col}>
            <Text style={S.sectionLabel}>TO</Text>
            <Text style={S.primaryText}>{data.userName}</Text>
            <Text style={S.secondaryText}>Customer</Text>
          </View>
        </View>

        {/* Merchant + Date */}
        <View style={S.infoRow}>
          <View style={S.col}>
            <Text style={S.sectionLabel}>MERCHANT</Text>
            <Text style={S.primaryText}>{data.merchantName}</Text>
          </View>
          <View style={S.col}>
            <Text style={S.sectionLabel}>DATE</Text>
            <Text style={S.primaryText}>{data.timestamp}</Text>
          </View>
        </View>

        <View style={S.divider} />

        {/* Items table */}
        <View style={S.tableHeaderRow}>
          <View style={S.cellDesc}>
            <Text style={S.tableHeaderCell}>DESCRIPTION</Text>
          </View>
          <View style={S.cellAmount}>
            <Text style={S.tableHeaderCell}>AMOUNT</Text>
          </View>
        </View>

        <View style={S.tableDataRow}>
          <View style={S.cellDesc}>
            <Text style={S.itemText}>{data.itemName}</Text>
          </View>
          <View style={S.cellAmount}>
            <Text style={S.amountText}>
              {data.amount} {data.token}
            </Text>
          </View>
        </View>

        {/* Fees */}
        <View style={S.feeContainer}>
          <View style={S.feeRow}>
            <Text style={S.feeLabel}>Network Fee</Text>
            <Text style={S.feeValue}>
              {data.networkFee} {data.token}
            </Text>
          </View>
        </View>

        <View style={S.divider} />

        {/* Total */}
        <View style={S.totalBox}>
          <Text style={S.totalLabel}>TOTAL</Text>
          <Text style={S.totalValue}>
            {data.total} {data.token}
          </Text>
        </View>

        {/* Transaction hash */}
        <View style={S.txContainer}>
          <Text style={S.sectionLabel}>TRANSACTION HASH</Text>
          <View style={S.txBox}>
            <Text style={S.txText}>{data.txHash}</Text>
          </View>
        </View>

        {/* Payment status block */}
        {data.status === "CONFIRMED" ? (
          <View style={S.statusBlockConfirmed}>
            <View style={S.statusDotConfirmed} />
            <View style={S.statusTextBlock}>
              <Text style={S.statusHeadingConfirmed}>Payment Confirmed</Text>
              <Text style={S.statusSubtext}>
                Transaction verified and recorded on-chain
              </Text>
            </View>
          </View>
        ) : (
          <View style={S.statusBlockPending}>
            <View style={S.statusDotPending} />
            <View style={S.statusTextBlock}>
              <Text style={S.statusHeadingPending}>Payment Pending</Text>
              <Text style={S.statusSubtext}>
                Awaiting on-chain confirmation
              </Text>
            </View>
            <View style={S.statusBadgePending}>
              <Text style={S.statusBadgeText}>PENDING</Text>
            </View>
          </View>
        )}

        {/* Compliance / authorization block */}
        {data.credentialId && (
          <View style={S.complianceBlock}>
            <View style={S.complianceHeader}>
              <Text style={S.complianceTitle}>AGENT AUTHORIZATION</Text>
              <View
                style={
                  data.signatureType === "eip-712"
                    ? S.complianceBadgeReal
                    : S.complianceBadgeDemo
                }
              >
                <Text style={S.complianceBadgeText}>
                  {data.signatureType === "eip-712" ? "EIP-712 SIGNED" : "DEMO SIGNATURE"}
                </Text>
              </View>
            </View>
            <View style={S.complianceRow}>
              <Text style={S.complianceLabel}>Credential ID</Text>
              <Text style={S.complianceMono}>{data.credentialId}</Text>
            </View>
            {data.authorizedFor && (
              <View style={S.complianceRow}>
                <Text style={S.complianceLabel}>Authorized For</Text>
                <Text style={S.complianceValue}>{data.authorizedFor}</Text>
              </View>
            )}
            {typeof data.policyLimitUsd === "number" && (
              <View style={S.complianceRow}>
                <Text style={S.complianceLabel}>Per-Tx Policy Limit</Text>
                <Text style={S.complianceValue}>${data.policyLimitUsd.toFixed(2)} USD</Text>
              </View>
            )}
            {data.credentialSignature && (
              <View style={S.complianceRow}>
                <Text style={S.complianceLabel}>Signature</Text>
                <Text style={S.complianceMono}>
                  {data.credentialSignature.slice(0, 28)}…
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={S.footer}>
          <Text style={S.footerLeft}>
            Generated autonomously by AgentCart AI Agent
          </Text>
          <Text style={S.footerRight}>agentcart.eth</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadInvoice(
  data: InvoiceData,
  txId: string
): Promise<void> {
  const { pdf } = await import("@react-pdf/renderer");
  const blob = await pdf(<InvoicePDF data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const sanitize = (s: string) =>
    s.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  a.download = `${sanitize(data.itemName)}_${sanitize(data.timestamp)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
