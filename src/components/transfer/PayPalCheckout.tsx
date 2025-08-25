import React, { useState } from "react";
import {
    PayPalScriptProvider,
    usePayPalCardFields,
    PayPalCardFieldsProvider,
    PayPalButtons,
    PayPalNameField,
    PayPalNumberField,
    PayPalExpiryField,
    PayPalCVVField,
} from "@paypal/react-paypal-js";

interface PayPalCheckoutProps {
  transferAmount?: string;
  userEmail?: string;
  userName?: string;
  onFormValidation?: (isValid: boolean) => void;
  onEmailCapture?: (email: string) => void;
  onPaymentSuccess?: (orderDetails: any) => void;
  onPaymentError?: (message: string) => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  transferAmount,
  userEmail,
  userName,
  onFormValidation,
  onEmailCapture,
  onPaymentSuccess,
  onPaymentError
}) => {
    const [isPaying, setIsPaying] = useState(false);
    const initialOptions = {
        clientId: "AU23YbLMTqxG3iSvnhcWtix6rGN14uw3axYJgrDe8VqUVng8XiQmmeiaxJWbnpbZP_f4--RTg146F1Mj",
        "enable-funding": "venmo",
        "disable-funding": "",
        "buyer-country": "US",
        currency: "USD",
        "data-page-type": "product-details",
        components: "buttons,card-fields",
        "data-sdk-integration-source": "developer-studio",
    };

    async function createOrder() {
        try {
            // Use your backend endpoints
            const API_BASE_URL = "https://paypal-integration-4lq6.onrender.com";
            
            // Ensure the amount is properly formatted and uses the actual transfer amount
            const formattedAmount = transferAmount && transferAmount !== '' && transferAmount !== '0' 
                ? parseFloat(transferAmount).toFixed(2) 
                : "100.00";
            
            console.log('PayPal createOrder - transferAmount:', transferAmount);
            console.log('PayPal createOrder - formattedAmount:', formattedAmount);
            
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cart: {
                        amount: formattedAmount,
                        currency: "USD"
                    },
                    payer: {
                        email: userEmail,
                        name: userName
                    }
                }),
            });

            const orderData = await response.json();

            if (orderData.id) {
                return orderData.id;
            } else {
                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);

                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error(error);
            onPaymentError?.(`Could not initiate PayPal Checkout...${error}`);
            return `Could not initiate PayPal Checkout...${error}`;
        }
    }

    async function onApprove(data: any, actions?: any) {
        try {
            // Use your backend capture endpoint
            const API_BASE_URL = "https://paypal-integration-4lq6.onrender.com";
            const response = await fetch(`${API_BASE_URL}/api/orders/${data.orderID}/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const orderData = await response.json();
            const transaction =
                orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
                orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
            const errorDetail = orderData?.details?.[0];

            if (errorDetail || !transaction || transaction.status === "DECLINED") {
                let errorMessage;
                if (transaction) {
                    errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
                } else if (errorDetail) {
                    errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
                } else {
                    errorMessage = JSON.stringify(orderData);
                }

                throw new Error(errorMessage);
            } else {
                console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));
                setIsPaying(false); // Reset paying state on success

                // Dispatch payment success event for the parent component
                const paymentSuccessEvent = new CustomEvent('paymentSuccess', {
                    detail: { orderDetails: orderData }
                });
                window.dispatchEvent(paymentSuccessEvent);

                onPaymentSuccess?.(orderData);
            }
        } catch (error) {
            console.error("Payment capture error:", error);
            setIsPaying(false); // Reset paying state on error

            // Dispatch payment error event
            const paymentErrorEvent = new CustomEvent('paymentError', {
                detail: { message: `Payment processing failed: ${error.toString()}` }
            });
            window.dispatchEvent(paymentErrorEvent);

            onPaymentError?.(`Sorry, your transaction could not be processed...${error}`);
        }
    }

    function onError(error) {
        console.error("PayPal error:", error);
        setIsPaying(false); // Reset paying state on error

        // Dispatch payment error event
        const paymentErrorEvent = new CustomEvent('paymentError', {
            detail: { message: `PayPal error: ${error.toString()}` }
        });
        window.dispatchEvent(paymentErrorEvent);

        onPaymentError?.("An error occurred with PayPal. Please try again.");
    }

    return (
        <div className="w-full">
            <PayPalScriptProvider options={initialOptions}>
                {/* Credit Card Fields */}
                <div>
                    <PayPalCardFieldsProvider
    createOrder={createOrder}
    onApprove={onApprove}
    onError={onError}
    style={{
        input: {
            "font-size": "16px",
            "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            "color": "#111827"
        }
    }}
>
                           <div className="mb-4 -mx-2">
    <div className="relative mb-0 "> {/* Negative vertical margin */}
        <PayPalNumberField />
    </div>

    <div className="grid grid-cols-2 gap-0 "> {/* Increased negative margin */}
        <div className="relative">
            <PayPalExpiryField />
        </div>
        <div className="relative">
            <PayPalCVVField />
        </div>
    </div>
</div>

                            {/* Accepted Cards Section */}
                            <div className="mb-8">
                                <p className="text-center text-sm text-gray-500 mb-4">Accepted payment methods</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {/* Visa */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-5 flex items-center justify-center">
                                                <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
                                                    <path d="M8.94 1.442L7.314 6.41H5.85L4.884 2.736c-.06-.236-.112-.322-.294-.422C4.322 2.194 3.85 2.062 3.43 1.962l.032-.152h2.466c.314 0 .596.21.668.574l.612 3.25L8.51 1.442h1.43zm5.732 3.304c.008-1.286-1.776-1.356-1.764-1.93.004-.174.17-.36.534-.406.18-.024.678-.042 1.242.218l.222-1.038c-.302-.11-.692-.216-1.176-.216-1.244 0-2.12.662-2.128 1.61-.008.702.626 1.094 1.104 1.326.492.238.658.39.656.602-.004.326-.39.47-.752.476-.632.01-1-.17-1.294-.306l-.228 1.066c.294.136.838.254 1.402.26 1.322 0 2.186-.652 2.182-1.662zm3.164 1.664H19l-1.258-4.968h-1.148c-.266 0-.492.154-.592.392L14.534 6.41h1.432l.284-.786h1.752l.164.786zm-1.524-1.86l.718-1.98.412 1.98h-1.13zM11.47 1.442L10.334 6.41H8.966l1.136-4.968h1.368z" fill="#1434CB"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">Visa</span>
                                        </div>
                                    </div>

                                    {/* Mastercard */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-5 flex items-center justify-center">
                                                <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                                                    <circle cx="7" cy="6" r="5" fill="#EB001B"/>
                                                    <circle cx="13" cy="6" r="5" fill="#F79E1B"/>
                                                    <path d="M10 2.5c1.26 1.4 1.26 3.6 0 5-1.26 1.4-1.26 3.6 0 5" fill="#FF5F00"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">Mastercard</span>
                                        </div>
                                    </div>

                                    {/* American Express */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-5 flex items-center justify-center">
                                                <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                                                    <rect width="20" height="12" rx="2" fill="#006FCF"/>
                                                    <text x="10" y="8" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">AMEX</text>
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">Amex</span>
                                        </div>
                                    </div>

                                    {/* Discover */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-5 flex items-center justify-center">
                                                <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                                                    <rect width="20" height="12" rx="2" fill="#FF6000"/>
                                                    <ellipse cx="14" cy="6" rx="6" ry="6" fill="#FFAA00"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">Discover</span>
                                        </div>
                                    </div>

                                    {/* Diners Club */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-5 flex items-center justify-center">
                                                <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                                                    <rect width="20" height="12" rx="2" fill="#0079BE"/>
                                                    <circle cx="6" cy="6" r="3" fill="none" stroke="white" strokeWidth="1"/>
                                                    <circle cx="14" cy="6" r="3" fill="none" stroke="white" strokeWidth="1"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">Diners</span>
                                        </div>
                                    </div>

                                    {/* JCB */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-5 flex items-center justify-center">
                                                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                                                    <rect width="16" height="10" rx="1" fill="#0E4C96"/>
                                                    <text x="8" y="7" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">JCB</text>
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">JCB</span>
                                        </div>
                                    </div>

                                    {/* PayPal */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-5 flex items-center justify-center">
                                                <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                                                    <path d="M6.908 1.5c1.463 0 2.234.632 2.234 1.895 0 1.263-.771 1.895-2.234 1.895H5.263L6.908 1.5zm1.184 4.632c1.463 0 2.234.632 2.234 1.895S9.555 9.922 8.092 9.922H6.447L8.092 6.132z" fill="#003087"/>
                                                    <path d="M13.816 1.5c1.463 0 2.234.632 2.234 1.895 0 1.263-.771 1.895-2.234 1.895h-1.645L13.816 1.5zm1.184 4.632c1.463 0 2.234.632 2.234 1.895S16.463 9.922 15 9.922h-1.645L15 6.132z" fill="#0070BA"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">PayPal</span>
                                        </div>
                                    </div>

                                    {/* Apple Pay */}
                                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-5 flex items-center justify-center">
                                                <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                                                    <path d="M3.5 6c0-1.8 1.46-3.25 3.25-3.25.34 0 .67.05.98.15.73-1.1 1.96-1.9 3.37-1.9.14 0 .28.01.42.02C12.39 2.5 13.5 4.12 13.5 6s-1.11 3.5-1.98 5.02c-.14.01-.28.02-.42.02-1.41 0-2.64-.8-3.37-1.9-.31.1-.64.15-.98.15C4.96 9.25 3.5 7.8 3.5 6z" fill="#000"/>
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">Apple Pay</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        <SubmitPayment
                            isPaying={isPaying}
                            setIsPaying={setIsPaying}
                        />
                    </PayPalCardFieldsProvider>
                </div>
            </PayPalScriptProvider>
        </div>
    );
};

const SubmitPayment = ({ isPaying, setIsPaying }) => {
    const { cardFieldsForm } = usePayPalCardFields();

    const handleClick = async () => {
        if (!cardFieldsForm) {
            const childErrorMessage =
                "Unable to find any child components in the <PayPalCardFieldsProvider />";
            throw new Error(childErrorMessage);
        }

        const formState = await cardFieldsForm.getState();

        if (!formState.isFormValid) {
            // Dispatch payment error event instead of using alert
            const paymentErrorEvent = new CustomEvent('paymentError', {
                detail: { message: 'The payment form is invalid. Please check all fields and try again.' }
            });
            window.dispatchEvent(paymentErrorEvent);
            return;
        }

        setIsPaying(true);

        // Dispatch form validation and enable continue button
        const validationEvent = new CustomEvent('paymentFormValidation', {
            detail: { isValid: true }
        });
        window.dispatchEvent(validationEvent);

        cardFieldsForm.submit()
            .then(() => {
                // Payment submitted successfully, but we'll wait for onApprove to reset isPaying
                console.log("Payment form submitted successfully");
            })
            .catch((err) => {
                console.error("Payment submission error:", err);
                setIsPaying(false);

                // Dispatch payment error event
                const paymentErrorEvent = new CustomEvent('paymentError', {
                    detail: { message: `Payment form submission failed: ${err.toString()}` }
                });
                window.dispatchEvent(paymentErrorEvent);

                // Dispatch form validation to disable continue button
                const errorValidationEvent = new CustomEvent('paymentFormValidation', {
                    detail: { isValid: false }
                });
                window.dispatchEvent(errorValidationEvent);
            });
    };

    // Export the handleClick function for external use and set initial form validation
    React.useEffect(() => {
        const handleExternalSubmit = () => {
            handleClick();
        };

        // Set initial form validation to true so continue button is enabled
        const initialValidationEvent = new CustomEvent('paymentFormValidation', {
            detail: { isValid: true }
        });
        window.dispatchEvent(initialValidationEvent);

        window.addEventListener('submitPayPalPayment', handleExternalSubmit);
        return () => window.removeEventListener('submitPayPalPayment', handleExternalSubmit);
    }, []);

    return null; // Remove the pay now button
};

export default PayPalCheckout;