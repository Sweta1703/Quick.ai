import React, { Component } from "react";
import { PricingTable } from "@clerk/react";
import { Check } from "lucide-react";

class PricingErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Gracefully handle Clerk Billing disabled in development/dashboard
    console.warn("Clerk PricingTable could not be rendered (Billing is disabled in Clerk dashboard). Displaying fallback pricing cards.", error?.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const FallbackPricingCards = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Ideal for exploring AI content creation tools",
      features: [
        "Up to 100 Article & Blog generations",
        "Up to 10 Image generations",
        "Background & object removal",
        "Basic resume review",
        "Standard generation speed",
      ],
      popular: false,
      buttonText: "Current Plan",
    },
    {
      name: "Premium",
      price: "$19",
      period: "per month",
      description: "For professionals who need unlimited high-speed AI tools",
      features: [
        "Unlimited Article & Blog generations",
        "Unlimited high-resolution images",
        "Priority background & object removal",
        "Detailed in-depth resume feedback",
        "Fastest AI model response times",
        "Priority 24/7 customer support",
      ],
      popular: true,
      buttonText: "Upgrade to Premium",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`relative p-8 rounded-2xl border transition-all duration-300 ${
            plan.popular
              ? "border-[#8E37EB] shadow-xl bg-gradient-to-b from-white to-purple-50/30"
              : "border-gray-200 bg-white shadow-sm"
          }`}
        >
          {plan.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </span>
          )}
          <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
            <span className="text-sm text-gray-500">/ {plan.period}</span>
          </div>

          <ul className="mt-6 space-y-3">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="w-4 h-4 text-[#8E37EB] shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            className={`w-full mt-8 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
              plan.popular
                ? "bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white shadow-md hover:opacity-90"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {plan.buttonText}
          </button>
        </div>
      ))}
    </div>
  );
};

const Plan = () => {
  return (
    <div className="max-w-4xl mx-auto z-20 my-24 px-4">
      <div className="text-center">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          Choose your plan
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto mt-2">
          Start for free and scale up as you grow. Find the perfect plan for
          your content creation needs.
        </p>
        <div className="mt-12">
          <PricingErrorBoundary fallback={<FallbackPricingCards />}>
            <PricingTable />
          </PricingErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Plan;
