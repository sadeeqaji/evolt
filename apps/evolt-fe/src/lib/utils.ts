import { Transaction } from "@hashgraph/sdk";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transactionToBase64String<T extends Transaction>(
  transaction: T
): string {
  const transactionBytes = transaction.toBytes();
  return Buffer.from(transactionBytes).toString("base64");
}
