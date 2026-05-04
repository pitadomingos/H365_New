import { useState, useMemo, useCallback } from 'react';

/**
 * Hook to handle clinical vitals calculations and status interpretations.
 */
export function useVitals() {
  const calculateBmi = useCallback((weightKg: string, heightCm: string) => {
    const w = parseFloat(weightKg || '0');
    const h = parseFloat(heightCm || '0');
    
    if (w > 0 && h > 0) {
      const hM = h / 100;
      const bmiVal = w / (hM * hM);
      const bmiStr = bmiVal.toFixed(1);
      
      let status = "N/A";
      let colorClass = "bg-gray-100 text-gray-800";
      
      if (bmiVal < 18.5) {
        status = "Underweight";
        colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      } else if (bmiVal < 25) {
        status = "Normal";
        colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      } else if (bmiVal < 30) {
        status = "Overweight";
        colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      } else {
        status = "Obese";
        colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      }
      
      return { value: bmiStr, status, colorClass };
    }
    return { value: null, status: "N/A", colorClass: "bg-gray-100 text-gray-800" };
  }, []);

  const calculateBpStatus = useCallback((bp: string) => {
    if (!bp || !bp.includes('/')) {
      return { status: "N/A", colorClass: "bg-gray-100 text-gray-800" };
    }
    
    const parts = bp.split('/');
    const systolic = parseInt(parts[0], 10);
    const diastolic = parseInt(parts[1], 10);

    if (isNaN(systolic) || isNaN(diastolic)) {
      return { status: "Invalid", colorClass: "bg-gray-100 text-gray-800" };
    }

    if (systolic >= 180 || diastolic >= 120) {
      return { status: "Crisis", colorClass: "bg-red-200 text-red-900 animate-pulse font-bold" };
    } else if (systolic >= 140 || diastolic >= 90) {
      return { status: "Stage 2 HTN", colorClass: "bg-red-100 text-red-700" };
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      return { status: "Stage 1 HTN", colorClass: "bg-orange-100 text-orange-700" };
    } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
      return { status: "Elevated", colorClass: "bg-yellow-100 text-yellow-700" };
    } else if (systolic < 120 && diastolic < 80) {
      return { status: "Normal", colorClass: "bg-green-100 text-green-700" };
    } else if (systolic < 90 || diastolic < 60) {
      return { status: "Hypotension", colorClass: "bg-blue-100 text-blue-700" };
    }
    
    return { status: "N/A", colorClass: "bg-gray-100 text-gray-800" };
  }, []);

  return { calculateBmi, calculateBpStatus };
}
