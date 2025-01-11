interface PriceDisplayProps {
  price: number;
}

export const PriceDisplay = ({ price }: PriceDisplayProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-lg font-semibold">Translation Price: ${price}</p>
    </div>
  );
};