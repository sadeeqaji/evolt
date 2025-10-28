import axios, { AxiosError, AxiosInstance } from 'axios';
import { FastifyInstance } from 'fastify';
import { expiresIn30Minutes } from '../util/util.time.js';
import {
    PaystackInitTransactionPayload,
    BankTransferPayload,
    CardChargePayload,
} from './paystack.types.js';

const PAYSTACK_API_URL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';

export class PaystackService {
    private readonly fastify: FastifyInstance;
    private readonly axiosInstance: AxiosInstance;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
        this.axiosInstance = axios.create({
            baseURL: PAYSTACK_API_URL,
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        });
    }

    /**
     * Internal helper for all Paystack requests
     */
    private async _request<T>(
        method: 'POST' | 'GET',
        endpoint: string,
        data?: any,
    ): Promise<T> {
        try {
            const response = await this.axiosInstance.request<T>({
                method,
                url: endpoint,
                data,
            });
            return response.data;
        } catch (error) {
            this.handleError(error, endpoint);
            throw new Error('Paystack API request failed');
        }
    }

    /**
     * Initialize a transaction
     */
    async initializeTransaction(payload: PaystackInitTransactionPayload) {
        try {
            const res = await this._request<{ data: any }>(
                'POST',
                '/transaction/initialize',
                payload,
            );
            return res.data;
        } catch (error: any) {
            this.fastify.log.error('[Paystack] initializeTransaction failed', error);
            throw error;
        }
    }

    /**
     * Charge card
     */
    async chargeCard(payload: CardChargePayload) {
        try {
            const res = await this._request<{ data: any }>('POST', '/charge', payload);
            return res.data;
        } catch (error: any) {
            this.fastify.log.error('[Paystack] chargeCard failed', error);
            throw error;
        }
    }

    /**
     * Generate virtual bank transfer
     */
    async generateBankTransfer(payload: BankTransferPayload) {
        try {
            const res = await this._request<{ data: any }>('POST', '/charge', {
                ...payload,
                bank_transfer: {
                    account_expires_at: expiresIn30Minutes(),
                },
            });
            return res.data;
        } catch (error: any) {
            this.fastify.log.error('[Paystack] generateBankTransfer failed', error);
            throw error;
        }
    }


    private handleError(error: unknown, endpoint?: string): void {
        if (axios.isAxiosError(error)) {
            const err = error as AxiosError<any>;
            this.fastify.log.error({
                msg: '[Paystack API Error]',
                endpoint,
                status: err.response?.status,
                data: err.response?.data,
            });
            console.error('❌ Paystack API Error:', err.response?.data || err.message);
        } else {
            console.error('❌ Unexpected Paystack Error:', error);
        }
    }
}