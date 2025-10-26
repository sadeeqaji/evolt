"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHWBridge } from "@evolt/components/common/HWBridgeClientProvider";
import { TokenAssociateTransaction, AccountId, TokenId } from "@hashgraph/sdk";
import { transactionToBase64String } from "@evolt/lib/utils";

interface UseTokenAssociationResult {
  isTokenAssociated: boolean | null;
  loading: boolean;
  error: string | null;
  handleAssociate: () => Promise<void>;
}

export function useTokenAssociation(
  tokenId?: string
): UseTokenAssociationResult {
  const { sdk, accountId } = useHWBridge();
  const queryClient = useQueryClient();

  const {
    data: isTokenAssociated,
    isLoading,
    error,
  } = useQuery<boolean | null>({
    queryKey: ["token-association", accountId, tokenId],
    queryFn: async () => {
      if (!sdk || !accountId || !tokenId) return null;

      const accountInfo = await sdk.requestAccount(accountId);
      const tokens = accountInfo?.balance?.tokens ?? [];

      return tokens.some((t: { token_id: string }) => t.token_id === tokenId);
    },
    enabled: !!sdk && !!accountId && !!tokenId,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!sdk || !accountId || !tokenId)
        throw new Error("SDK, AccountId, or TokenId missing");
      // console.log({ accountId, tokenId });
      // await sdk.associateTokenToAccount(accountId, tokenId);

      const transaction = new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([TokenId.fromString(tokenId)]);

      await sdk?.dAppConnector.signAndExecuteTransaction({
        signerAccountId: accountId,
        transactionList: transactionToBase64String(transaction),
      });
    },
    onSuccess: async () => {
      console.log("Token associated");
      await queryClient.invalidateQueries({
        queryKey: ["token-association", accountId, tokenId],
      });
    },
    onError: (err: any) => {
      console.error("Error associating token:", err);
    },
  });

  const handleAssociate = async () => {
    await mutation.mutateAsync();
  };

  return {
    isTokenAssociated: isTokenAssociated ?? null,
    loading: isLoading || mutation.isPending,
    error: (error as Error)?.message ?? null,
    handleAssociate,
  };
}
