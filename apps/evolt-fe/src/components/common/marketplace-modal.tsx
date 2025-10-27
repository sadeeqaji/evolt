"use client";

import { useState } from "react";
import { X, MessageCircle, Smartphone, ArrowLeft } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "../ui/button";

interface MarketplaceModalProps {
  onClose: () => void;
}

export function MarketplaceModal({ onClose }: MarketplaceModalProps) {
  const [selectedOption, setSelectedOption] = useState<
    "app" | "whatsapp" | null
  >(null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-primary/90 px-8 py-8 relative">
          <button
            onClick={selectedOption ? () => setSelectedOption(null) : onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={selectedOption ? "Go back" : "Close modal"}
          >
            {selectedOption ? (
              <ArrowLeft className="w-6 h-6 text-white" />
            ) : (
              <X className="w-6 h-6 text-white" />
            )}
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to Evolt AI
          </h2>
          <p className="text-primary-foreground/90">{`Choose how you'd like to interact with our marketplace`}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Main Options View */}
          {!selectedOption && (
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
              {/* Option 1: Continue in App */}
              <button
                onClick={() => setSelectedOption("app")}
                className="group relative p-6 rounded-xl border-2 border-slate-200 bg-white hover:border-primary hover:bg-primary/5 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Smartphone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Continue in App
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Explore the full marketplace experience directly in our app
                    with all features available
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-200 w-full">
                    <span className="text-primary font-semibold text-sm">
                      Get Started →
                    </span>
                  </div>
                </div>
              </button>

              {/* Option 2: WhatsApp QR Code */}
              <button
                onClick={() => setSelectedOption("whatsapp")}
                className="group relative p-6 rounded-xl border-2 border-slate-200 bg-white hover:border-primary hover:bg-primary/5 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Use on WhatsApp
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Scan the QR code to access Evolt AI directly through
                    WhatsApp
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-200 w-full">
                    <span className="text-primary font-semibold text-sm">
                      Scan QR Code →
                    </span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {selectedOption === "app" && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-8">
                <div className="inline-flex p-4 bg-primary/10 rounded-full mb-6">
                  <Smartphone className="w-12 h-12 text-primary" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">
                  Continue in App
                </h4>
                <p className="text-slate-600">
                  Get full access to all marketplace features
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors mb-4"
              >
                Continue to Marketplace
              </button>
            </div>
          )}

          {selectedOption === "whatsapp" && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-8">
                <h4 className="text-2xl font-bold text-slate-900 mb-2">
                  Scan with your phone
                </h4>
                <p className="text-slate-600">
                  Use your phone camera or WhatsApp to scan
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-slate-200 mb-8">
                <QRCodeCanvas
                  imageSettings={{
                    src: "/whatsApp.webp",
                    height: 50,
                    width: 50,
                    excavate: true,
                  }}
                  value="https://wa.me/2349139932585?text=Hello%20Evolt%20AI"
                  size={200}
                  level="H"
                />
              </div>
              <Button
                variant="link"
                onClick={() => {
                  window.open(
                    "https://wa.me/2349139932585?text=Hello%20Evolt%20AI",
                    "_blank"
                  );
                }}
              >
                Open WhatsApp
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
          <p className="text-xs text-slate-600 text-center">
            Both options provide full access to Evolt marketplace features
          </p>
        </div>
      </div>
    </div>
  );
}
