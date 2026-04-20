import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to calculate BMI and its status.
 * Optimized for performance by using memoized logic.
 */
export function useBMI(weightKg: string | undefined, heightCm: string | undefined) {
  const [bmi, setBmi] = useState<string | null>(null);
  const [status, setStatus] = useState<{ status: string; colorClass: string; textColorClass: string } | null>(null);

  const calculateStatus = useCallback((bmiVal: number) => {
    if (bmiVal < 18.5) {
      return { status: "Underweight", colorClass: "bg-blue-100 dark:bg-blue-800/30", textColorClass: "text-blue-700 dark:text-blue-300" };
    } else if (bmiVal < 25) {
      return { status: "Normal", colorClass: "bg-green-100 dark:bg-green-800/30", textColorClass: "text-green-700 dark:text-green-300" };
    } else if (bmiVal < 30) {
      return { status: "Overweight", colorClass: "bg-yellow-100 dark:bg-yellow-800/30", textColorClass: "text-yellow-700 dark:text-yellow-300" };
    } else {
      return { status: "Obese", colorClass: "bg-red-100 dark:bg-red-800/30", textColorClass: "text-red-700 dark:text-red-300" };
    }
  }, []);

  useEffect(() => {
    const w = parseFloat(weightKg || '0');
    const h = parseFloat(heightCm || '0');
    
    if (w > 0 && h > 10) { // Height must be significant
      const hM = h / 100;
      const bmiVal = w / (hM * hM);
      setBmi(bmiVal.toFixed(2));
      setStatus(calculateStatus(bmiVal));
    } else {
      setBmi(null);
      setStatus(null);
    }
  }, [weightKg, heightCm, calculateStatus]);

  return { bmi, status };
}
