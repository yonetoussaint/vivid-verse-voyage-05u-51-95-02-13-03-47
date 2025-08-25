import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw, Share2, MessageCircle, ArrowLeft, Printer, AlertCircle, MapPin, User, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TransactionDetails {
  id: string;
  recipient: string;
  recipientEmail?: string;
  sender: string;
  amount: string;
  amountRecipient: string;
  fee: string;
  total: string;
  date: string;
  status: string;
  reference: string;
  method: string;
  exchangeRate?: string;
  note?: string;
  sentFrom?: string;
  receivedAt?: string;
  timeline: Array<{
    label: string;
    date: string;
    completed: boolean;
  }>;
  trackingUrl: string;
  otpUsed: boolean;
  canRefund: boolean;
  canRepeat: boolean;
  canReport: boolean;
  paymentSourceCardName?: string;
  paymentSourceCardBrand?: string;
  paymentSourceCardLastDigits?: string;
  paymentSource?: string;
}

const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    case 'in_transit':
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function TransferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTransactionDetails(id);
    }
  }, [id]);

  const fetchTransactionDetails = async (transactionId: string) => {
    try {
      setLoading(true);
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', parseInt(transactionId))
        .single();

      if (error) {
        console.error('Error fetching transaction:', error);
        setTransfer(null);
        return;
      }

      if (transaction) {
        // Transform transaction data to match our interface
        const transformedTransfer: TransactionDetails = {
          id: transaction.id.toString(),
          recipient: transaction.item_name?.replace('Transfer to ', '') || 'Unknown Recipient',
          recipientEmail: '', // Not stored in current transaction table
          sender: 'You',
          amount: `$${transaction.paid_amount}`,
          amountRecipient: `$${transaction.item_price || transaction.paid_amount}`, // Assuming same currency for now
          fee: '$2.00', // Default fee since not stored
          total: `$${(transaction.paid_amount + 2).toFixed(2)}`, // Adding default fee
          date: new Date(transaction.created).toLocaleString(),
          status: transaction.payment_status?.toLowerCase() || 'unknown',
          reference: transaction.transaction_id,
          method: transaction.payment_source || 'Unknown',
          exchangeRate: '1 USD = 1 USD', // Default since not stored
          note: transaction.item_number || '',
          sentFrom: 'Online Transfer',
          receivedAt: 'Digital Wallet',
          timeline: [
            { label: 'Payment Initiated', date: new Date(transaction.created).toLocaleString(), completed: true },
            { label: 'Payment Processed', date: new Date(transaction.created).toLocaleString(), completed: transaction.payment_status === 'COMPLETED' },
            { label: 'Transfer Completed', date: new Date(transaction.modified).toLocaleString(), completed: transaction.payment_status === 'COMPLETED' },
          ],
          trackingUrl: `/track-transfer?ref=${transaction.transaction_id}`,
          otpUsed: true,
          canRefund: transaction.payment_status === 'COMPLETED',
          canRepeat: true,
          canReport: true,
          paymentSourceCardName: transaction.payment_source_card_name,
          paymentSourceCardBrand: transaction.payment_source_card_brand,
          paymentSourceCardLastDigits: transaction.payment_source_card_last_digits,
          paymentSource: transaction.payment_source
        };

        setTransfer(transformedTransfer);
      }
    } catch (error) {
      console.error('Failed to fetch transaction details:', error);
      setTransfer(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-2 py-8 text-center text-gray-500">
        Loading transaction details...
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="max-w-2xl mx-auto px-2 py-8 text-center text-gray-500">
        Transaction not found.
        <div>
          <Button className="mt-4" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Transfer Details" showBackButton onBack={() => navigate(-1)} />
      <main className="max-w-2xl mx-auto px-2 py-4 flex flex-col gap-6">
        {/* Basic Details Card */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border bg-gray-100 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">{transfer.recipient}</div>
              {transfer.recipientEmail && <div className="text-xs text-gray-500">{transfer.recipientEmail}</div>}
            </div>
            <Badge className={getStatusBadgeClasses(transfer.status)}>{transfer.status}</Badge>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <div>
              <span className="text-gray-500">Reference:</span> <span className="font-mono">{transfer.reference}</span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span> {transfer.date}
            </div>
          </div>
        </section>

        {/* Amount Breakdown */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-gray-500 text-xs">Amount Sent</div>
            <div className="font-semibold">{transfer.amount}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Recipient Gets</div>
            <div className="font-semibold">{transfer.amountRecipient}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Fee</div>
            <div>{transfer.fee}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Total Charged</div>
            <div>{transfer.total}</div>
          </div>
          {transfer.exchangeRate && (
            <div className="col-span-2 text-xs text-gray-500">
              Exchange Rate: {transfer.exchangeRate}
            </div>
          )}
        </section>

        {/* Timeline */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-1">
          <div className="font-semibold mb-1 flex items-center"><MapPin className="w-4 h-4 mr-1" />Transfer Timeline</div>
          <ol className="relative border-l border-gray-300 ml-3 pl-2">
            {transfer.timeline.map((step: any, idx: number) => (
              <li key={step.label} className="mb-3 last:mb-0">
                <div className="absolute -left-3 top-0 w-5 h-5 rounded-full flex items-center justify-center bg-white border-2"
                  style={{ borderColor: step.completed ? "#22c55e" : "#d1d5db" }}>
                  {step.completed ? (
                    <span className="w-2 h-2 bg-green-500 rounded-full block"></span>
                  ) : (
                    <span className="w-2 h-2 bg-gray-300 rounded-full block"></span>
                  )}
                </div>
                <div className={step.completed ? "text-green-700" : "text-gray-500"}>
                  <div className="text-sm font-medium">{step.label}</div>
                  <div className="text-xs">{step.date}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* More Details */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Sender:</span>
            <span className="ml-1">{transfer.sender}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Payment Method:</span>
            <span className="ml-1">{transfer.method}</span>
          </div>
          {transfer.paymentSourceCardName && (
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Card Holder:</span>
              <span className="ml-1">{transfer.paymentSourceCardName}</span>
            </div>
          )}
          {transfer.paymentSourceCardBrand && transfer.paymentSourceCardLastDigits && (
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Card:</span>
              <span className="ml-1">{transfer.paymentSourceCardBrand} •••• {transfer.paymentSourceCardLastDigits}</span>
            </div>
          )}
          {transfer.sentFrom && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Sent From:</span>
              <span className="ml-1">{transfer.sentFrom}</span>
            </div>
          )}
          {transfer.receivedAt && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Received At:</span>
              <span className="ml-1">{transfer.receivedAt}</span>
            </div>
          )}
          {transfer.otpUsed && (
            <div className="flex items-center gap-2 text-emerald-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Security:</span>
              <span className="ml-1">OTP Verified</span>
            </div>
          )}
          {transfer.note && (
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Note:</span>
              <span className="ml-1">{transfer.note}</span>
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <section className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print</Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-1" />Download Receipt</Button>
          {transfer.canRepeat && (
            <Button variant="outline"><RefreshCcw className="w-4 h-4 mr-1" />Repeat Transfer</Button>
          )}
          <Button variant="outline" onClick={() => navigator.share ? navigator.share({ title: "Transfer Details", text: "See my transfer details." }) : null}>
            <Share2 className="w-4 h-4 mr-1" />Share
          </Button>
          <Button variant="outline" onClick={() => navigate(transfer.trackingUrl)}>
            <MapPin className="w-4 h-4 mr-1" />Track Transfer
          </Button>
          {transfer.canReport && (
            <Button variant="destructive"><AlertCircle className="w-4 h-4 mr-1" />Report a Problem</Button>
          )}
        </section>
      </main>
    </>
  );
}