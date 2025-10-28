
export interface DecryptRequestBody {
    encrypted_aes_key: string;
    encrypted_flow_data: string;
    initial_vector: string;
}

interface DecryptRequestResult {
    decryptedBody: Record<string, unknown>;
    aesKeyBuffer: Buffer;
    initialVectorBuffer: Buffer;
}

export interface DecryptedResponse {
    action: string;
    data: {
        phoneNumber: string;
        pin: number;
        newPin: number;
        confirmPin: number;
        oldPin: number
    };
    flow_token: string;
    screen: string;
}