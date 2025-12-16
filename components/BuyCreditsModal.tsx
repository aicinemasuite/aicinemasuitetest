import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Button } from './Button';
import { addCredits } from '../services/supabaseClient';

interface BuyCreditsModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentCredits: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({
  onClose,
  onSuccess,
  currentCredits
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const packages = [
    {
      credits: 50,
      price: 299,
      pricePerCredit: '₹5.98',
      popular: true,
      description: 'Perfect for small projects'
    },
    {
      credits: 150,
      price: 799,
      pricePerCredit: '₹5.33',
      popular: false,
      description: 'Best value for regular users'
    },
    {
      credits: 500,
      price: 2499,
      pricePerCredit: '₹5.00',
      popular: false,
      description: 'For professional studios'
    }
  ];

  const handlePurchase = async (credits: number, priceInPaise: number) => {
    setIsProcessing(true);

    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKeyId) {
        alert('Payment gateway not configured. Please contact support.');
        setIsProcessing(false);
        return;
      }

      // Create order ID (in production, this should come from your backend)
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const options = {
        key: razorpayKeyId,
        amount: priceInPaise,
        currency: 'INR',
        name: 'AICINEMASUITE.COM',
        description: `Purchase ${credits} Credits`,
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&h=100&fit=crop',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment and add credits
            const success = await addCredits(
              credits,
              response.razorpay_payment_id,
              response.razorpay_order_id || orderId
            );

            if (success) {
              alert(`Success! ${credits} credits added to your account.`);
              onSuccess();
              onClose();
            } else {
              alert('Payment successful but credit update failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
            }
          } catch (error) {
            console.error('Error processing payment:', error);
            alert('Error processing payment. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#D97706' // Amber color to match app theme
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert('Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Error initializing payment:', error);
      alert('Error initializing payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl relative overflow-hidden">

        {/* Decorative Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-8 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-amber-600/20 rounded-full flex items-center justify-center">
                  <ICONS.Zap size={24} className="text-amber-500"/>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white cinematic-font">Buy Credits</h2>
                  <p className="text-sm text-zinc-400">Power your creative projects</p>
                </div>
              </div>
              <div className="bg-zinc-950 px-4 py-2 rounded-lg inline-flex items-center gap-2 mt-4">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Current Balance:</span>
                <span className="text-lg font-bold text-amber-500">{currentCredits} Credits</span>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <ICONS.X size={24}/>
            </button>
          </div>
        </div>

        {/* Packages */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative bg-zinc-950 border rounded-xl p-6 transition-all hover:border-amber-500/50 ${
                  pkg.popular ? 'border-amber-600 shadow-lg shadow-amber-900/20' : 'border-zinc-800'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-white mb-2">{pkg.credits}</div>
                  <div className="text-zinc-500 text-sm uppercase tracking-wider">Credits</div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-amber-500 mb-1">₹{pkg.price}</div>
                  <div className="text-xs text-zinc-500">{pkg.pricePerCredit} per credit</div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-zinc-400 text-center">{pkg.description}</p>
                </div>

                <Button
                  variant={pkg.popular ? 'accent' : 'secondary'}
                  className="w-full"
                  onClick={() => handlePurchase(pkg.credits, pkg.price * 100)}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                >
                  Purchase Now
                </Button>
              </div>
            ))}
          </div>

          {/* What You Get */}
          <div className="mt-8 bg-zinc-950/50 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <ICONS.ShieldCheck size={18} className="text-green-500" />
              What You Get
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-400">
              <div className="flex items-start gap-2">
                <ICONS.Check size={16} className="text-green-500 mt-0.5 shrink-0"/>
                <span>1 Credit = 1 AI Image Generation</span>
              </div>
              <div className="flex items-start gap-2">
                <ICONS.Check size={16} className="text-green-500 mt-0.5 shrink-0"/>
                <span>HD Quality Cinematic Visuals</span>
              </div>
              <div className="flex items-start gap-2">
                <ICONS.Check size={16} className="text-green-500 mt-0.5 shrink-0"/>
                <span>No Expiration - Use Anytime</span>
              </div>
              <div className="flex items-start gap-2">
                <ICONS.Check size={16} className="text-green-500 mt-0.5 shrink-0"/>
                <span>Priority Processing</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ICONS.ShieldCheck size={14} />
            <span>Secure payment powered by Razorpay (Test Mode)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
