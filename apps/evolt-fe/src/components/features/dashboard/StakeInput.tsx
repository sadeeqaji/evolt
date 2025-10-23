import React from "react";

interface StakeInputProps {
  availableBalance: number;
  currency: string;
  tokenPair: string;
  amount: string;
  min: number;
  max: number;
  onAmountChange: (value: string) => void;
}

export const StakeInput: React.FC<StakeInputProps> = ({
  availableBalance,
  currency,
  tokenPair,
  amount,
  onAmountChange,
  min,
  max,
}) => {
  const handleMaxClick = () => {
    onAmountChange(availableBalance.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (/^\d*\.?\d*$/.test(value)) {
      onAmountChange(value);
    }
  };

  return (
    <div className="bg-[#131316] border border-[#2D2D33] rounded-2xl p-4 sm:p-5 w-full  font-sans">
      <div className="flex justify-between items-center mb-3">
        <label
          htmlFor="stake-amount"
          className="text-gray-200 font-medium text-base"
        >
          Amount to Stake
        </label>
        <button
          onClick={handleMaxClick}
          className="bg-[#5850F1] hover:opacity-90 transition-opacity text-white font-semibold py-2 px-5 rounded-lg text-sm"
        >
          MAX
        </button>
      </div>

      <div className="bg-[#1C1C21] rounded-lg p-3.5 flex items-center focus-within:ring-2 focus-within:ring-[#5850F1] transition-shadow duration-200">
        <span className="text-gray-400 font-medium text-base pr-3 mr-3 border-r border-gray-600">
          {tokenPair}
        </span>
        <input
          id="stake-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleChange}
          placeholder="0.00"
          className="bg-transparent border-none outline-none text-white w-full font-medium text-lg leading-none"
        />
      </div>

      <p className="text-right mt-2 text-gray-400 text-sm">
        Avl: {availableBalance.toFixed(2)} {currency}
      </p>
    </div>
  );
};
