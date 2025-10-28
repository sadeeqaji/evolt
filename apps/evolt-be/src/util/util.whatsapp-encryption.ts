import crypto from "crypto";

interface EncryptedRequestBody {
    encrypted_aes_key: string;
    encrypted_flow_data: string;
    initial_vector: string;
}

interface DecryptedData {
    decryptedBody: Record<string, any>;
    aesKeyBuffer: Buffer;
    initialVectorBuffer: Buffer;
}

export class FlowEndpointException extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
    }
}

export const decryptRequestBody = (
    body: EncryptedRequestBody,
    privatePem: string,
    passphrase: string
): DecryptedData => {
    const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;

    const privateKey = crypto.createPrivateKey({ key: privatePem, passphrase });
    let decryptedAesKey: Buffer | null = null;
    try {
        decryptedAesKey = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            Buffer.from(encrypted_aes_key, "base64")
        );
    } catch (error) {
        console.error(error);

        throw new FlowEndpointException(
            421,
            "Failed to decrypt the request. Please verify your private key."
        );
    }

    const flowDataBuffer = Buffer.from(encrypted_flow_data, "base64");
    const initialVectorBuffer = Buffer.from(initial_vector, "base64");

    const TAG_LENGTH = 16;
    const encryptedFlowDataBody = flowDataBuffer.subarray(0, -TAG_LENGTH);
    const encryptedFlowDataTag = flowDataBuffer.subarray(-TAG_LENGTH);

    const decipher = crypto.createDecipheriv(
        "aes-128-gcm",
        decryptedAesKey,
        initialVectorBuffer
    );
    decipher.setAuthTag(encryptedFlowDataTag);

    const decryptedJSONString = Buffer.concat([
        decipher.update(encryptedFlowDataBody),
        decipher.final(),
    ]).toString("utf-8");

    return {
        decryptedBody: JSON.parse(decryptedJSONString),
        aesKeyBuffer: decryptedAesKey,
        initialVectorBuffer,
    };
};

export const encryptResponse = (
    response: Record<string, any>,
    aesKeyBuffer: Buffer,
    initialVectorBuffer: Buffer
): string => {
    const flippedIv: number[] = [];
    for (const [, byte] of initialVectorBuffer.entries()) {
        flippedIv.push(~byte);
    }

    const cipher = crypto.createCipheriv(
        "aes-128-gcm",
        aesKeyBuffer,
        Buffer.from(flippedIv)
    );
    return Buffer.concat([
        cipher.update(JSON.stringify(response), "utf-8"),
        cipher.final(),
        cipher.getAuthTag(),
    ]).toString("base64");
};