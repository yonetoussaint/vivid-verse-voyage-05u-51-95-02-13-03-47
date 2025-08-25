
import React from 'react';
import { TransferData } from '@/components/desktop/DesktopMultiStepTransferPage';
import TransferTypeSelector from '@/components/transfer/TransferTypeSelector';
import StepOneTransfer from '@/components/transfer/StepOneTransfer';
import StepOneLocalTransfer from '@/components/transfer/StepOneLocalTransfer';
import StepOnePointFiveTransfer from '@/components/transfer/StepOnePointFiveTransfer';
import StepTwoTransfer from '@/components/transfer/StepTwoTransfer';
import StepTwoPointFiveTransfer from '@/components/transfer/StepTwoPointFiveTransfer';
import TransferSummary from '@/components/transfer/TransferSummary';
import PaymentMethodSelection from '@/components/transfer/PaymentMethodSelection';
import PaymentMethodSelector from '@/components/transfer/PaymentMethodSelector';
import TransferReceipt from '@/components/transfer/TransferReceipt';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface DesktopStepContentProps {
  currentStep: number;
  transferData: TransferData;
  updateTransferData: (data: Partial<TransferData>) => void;
  onPaymentSubmit: () => void;
  isPaymentLoading: boolean;
  isPaymentFormValid: boolean;
  setIsPaymentFormValid: (isValid: boolean) => void;
  transactionId: string;
  userEmail: string;
  receiptRef: React.RefObject<HTMLDivElement>;
  generateReceiptImage: () => void;
  setCurrentStep: (step: number) => void;
}

const DesktopStepContent: React.FC<DesktopStepContentProps> = ({
  currentStep,
  transferData,
  updateTransferData,
  onPaymentSubmit,
  isPaymentLoading,
  isPaymentFormValid,
  setIsPaymentFormValid,
  transactionId,
  userEmail,
  receiptRef,
  generateReceiptImage,
  setCurrentStep
}) => {
  const navigate = useNavigate();

  switch (currentStep) {
    case 1:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Send Money</h2>
            <p className="text-muted-foreground">Enter the amount you want to send</p>
          </div>

          <TransferTypeSelector
            transferType={transferData.transferType || 'international'}
            onTransferTypeChange={(type) => updateTransferData({ transferType: type })}
            disableNavigation={true}
          />

          {transferData.transferType === 'national' ? (
            <StepOneLocalTransfer
              amount={transferData.amount}
              onAmountChange={(amount) => updateTransferData({ amount })}
            />
          ) : (
            <StepOneTransfer
              amount={transferData.amount}
              onAmountChange={(amount) => updateTransferData({ amount })}
            />
          )}
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Transfer Details</h2>
            <p className="text-muted-foreground">Choose transfer details</p>
          </div>

          <StepOnePointFiveTransfer
            transferDetails={transferData.transferDetails}
            onTransferDetailsChange={(transferDetails) => updateTransferData({ transferDetails })}
          />
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Recipient Details</h2>
            <p className="text-muted-foreground">Who are you sending ${transferData.amount} to?</p>
          </div>

          <StepTwoTransfer
            receiverDetails={transferData.receiverDetails}
            onDetailsChange={(receiverDetails) => updateTransferData({ receiverDetails })}
            transferDetails={transferData.transferDetails}
          />
        </div>
      );

    case 4:
      // Skip location selection for MonCash/NatCash and go directly to review
      if (transferData.transferDetails.deliveryMethod === 'moncash' || transferData.transferDetails.deliveryMethod === 'natcash') {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Review Transfer</h2>
              <p className="text-muted-foreground">Please review your transfer details</p>
            </div>

            <TransferSummary
              transferData={transferData}
            />
          </div>
        );
      }
      // For cash pickup, show location selection
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Pickup Location</h2>
            <p className="text-muted-foreground">Where should they pick up the money?</p>
          </div>

          <StepTwoPointFiveTransfer
            receiverDetails={transferData.receiverDetails}
            onDetailsChange={(receiverDetails) => updateTransferData({ receiverDetails })}
          />
        </div>
      );

    case 5:
      // If digital wallet, this becomes payment method selection
      // If cash pickup, this is review step (after location selection in step 4)
      const isDigitalWallet = transferData.transferDetails.deliveryMethod === 'moncash' || transferData.transferDetails.deliveryMethod === 'natcash';
      
      if (isDigitalWallet) {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Select Payment Method</h2>
              <p className="text-muted-foreground">Choose how you'd like to pay</p>
            </div>

            <PaymentMethodSelection
              selectedMethod={transferData.selectedPaymentMethod || 'credit-card'}
              onMethodSelect={(method) => updateTransferData({ selectedPaymentMethod: method })}
              transferType={transferData.transferType}
            />
          </div>
        );
      } else {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Review Transfer</h2>
              <p className="text-muted-foreground">Please review your transfer details</p>
            </div>

            <TransferSummary
              transferData={transferData}
            />
          </div>
        );
      }

    case 6:
      const isDigitalWalletStep6 = transferData.transferDetails.deliveryMethod === 'moncash' || transferData.transferDetails.deliveryMethod === 'natcash';
      
      if (isDigitalWalletStep6) {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment</h2>
              <p className="text-muted-foreground">Complete your payment</p>
            </div>

            <PaymentMethodSelector
              transferData={transferData}
              onPaymentSubmit={onPaymentSubmit}
              isPaymentLoading={isPaymentLoading}
              isPaymentFormValid={isPaymentFormValid}
              setIsPaymentFormValid={setIsPaymentFormValid}
            />
          </div>
        );
      } else {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Select Payment Method</h2>
              <p className="text-muted-foreground">Choose how you'd like to pay</p>
            </div>

            <PaymentMethodSelection
              selectedMethod={transferData.selectedPaymentMethod || 'credit-card'}
              onMethodSelect={(method) => updateTransferData({ selectedPaymentMethod: method })}
              transferType={transferData.transferType}
            />
          </div>
        );
      }

    case 7:
      // Complete Payment Step
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment</h2>
            <p className="text-muted-foreground">Complete your payment</p>
          </div>

          <PaymentMethodSelector
            transferData={transferData}
            onPaymentSubmit={onPaymentSubmit}
            isPaymentLoading={isPaymentLoading}
            isPaymentFormValid={isPaymentFormValid}
            setIsPaymentFormValid={setIsPaymentFormValid}
          />

          <div className="flex justify-center pt-4">
            <Button
              onClick={onPaymentSubmit}
              disabled={isPaymentLoading}
              className="px-8"
              size="lg"
            >
              {isPaymentLoading ? 'Processing...' : 'Complete Payment'}
            </Button>
          </div>
        </div>
      );

    case 8:
      // Payment Success Step
      return (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground">Your payment has been processed successfully</p>
            <p className="text-sm text-muted-foreground">Transaction ID: {transactionId}</p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => setCurrentStep(9)}
              className="px-8"
              size="lg"
            >
              View Receipt
            </Button>
          </div>
        </div>
      );

    case 9:
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">Transfer Receipt</h2>
            <p className="text-muted-foreground">Your transfer receipt and details</p>
          </div>

          <TransferReceipt
            ref={receiptRef}
            transferData={transferData}
            transactionId={transactionId}
            userEmail={userEmail}
          />

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={generateReceiptImage}
              className="px-8"
            >
              Share Receipt
            </Button>
            <Button
              onClick={() => navigate('/for-you')}
              className="px-8"
            >
              Done
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default DesktopStepContent;
