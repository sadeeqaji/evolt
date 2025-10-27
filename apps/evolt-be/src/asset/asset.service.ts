import { AzureUtil } from '../util/util.azure.js';
import UtilService from '../util/util.service.js';
import businessService from '../business/business.service.js';
import corporateService from '../corporate/corporate.service.js';
import { v4 as uuidv4 } from 'uuid';
import { ASSET_TYPES, AssetType, AssetDoc } from './asset.type.js';
import { nanoid } from 'nanoid';
import { AssetModel } from './asset.model.js';
import { normalize } from '../util/util.data.js';
import mongoose from 'mongoose';

class AssetService {
  async createAsset(
    userId: mongoose.Types.ObjectId,
    data: Record<string, any>,
    file: { buffer: Buffer },
  ): Promise<AssetDoc> {
    const business = await businessService.getBusinessById(
      '68f6ea30864190a2b5949fbc',
    );
    if (!business) throw new Error('Business profile not found.');

    const normalizedData = {
      assetType: normalize(data.assetType),
      title: normalize(data.title),
      description: normalize(data.description),
      symbol: normalize(data.symbol),
      amount: normalize(data.amount),
      currency: normalize(data.currency),
      yieldRate: normalize(data.yieldRate),
      durationDays: normalize(data.durationDays),
      totalTarget: normalize(data.totalTarget),
      minInvestment: normalize(data.minInvestment),
      maxInvestment: normalize(data.maxInvestment),
      expiryDate: normalize(data.expiryDate),
      corporateId: normalize(data.corporateId),
    };

    const rawType = normalizedData.assetType;
    const assetType =
      typeof rawType === 'string' ? rawType.trim().toLowerCase() : '';

    if (!ASSET_TYPES.includes(assetType as AssetType)) {
      throw new Error(
        `Invalid or missing assetType. Must be one of: ${ASSET_TYPES.join(', ')}`,
      );
    }

    const blobUrl = await AzureUtil.uploadFileFromBuffer(
      file.buffer,
      `assets/${uuidv4()}.pdf`,
    );
    const tokenName = `${assetType}-${nanoid(6)}`;

    const assetPayload: Partial<AssetDoc> = {
      title: normalizedData.title,
      description: normalizedData.description,
      assetType: assetType as AssetType,
      originatorId: business._id as mongoose.Types.ObjectId,
      corporateId: normalizedData.corporateId || null,
      amount: Number(normalizedData.amount),
      currency: normalizedData.currency || 'USD',
      yieldRate: Number(normalizedData.yieldRate) || 0.1,
      durationDays: Number(normalizedData.durationDays) || 90,
      totalTarget:
        Number(normalizedData.totalTarget) || Number(normalizedData.amount),
      expiryDate:
        normalizedData.expiryDate || new Date(Date.now() + 90 * 86400000),
      blobUrl,
      symbol: normalizedData.symbol,
      status: 'pending',
      tokenName,
      userId,
    };

    const asset = await AssetModel.create(assetPayload);

    // Notify corporate
    if (normalizedData.corporateId) {
      const corp = await corporateService.getCorporateById(
        normalizedData.corporateId,
      );
      if (corp) {
        await UtilService.sendEmail(
          corp.email,
          `Verify ${assetType} asset submission`,
          `<p>Hello ${corp.contactPerson || ''},</p>
                     <p>You have a new ${assetType} to verify from ${business.businessName}.</p>`,
        );
      }
    }

    return asset.toObject() as AssetDoc;
  }

  /**
   *  Verify an asset (mark as verified)
   */
  async verifyAsset(id: string, verifier: string): Promise<AssetDoc> {
    const asset = await AssetModel.findById(id);
    if (!asset) throw new Error('Asset not found');

    asset.status = 'verified';
    asset.verifier = verifier;
    await asset.save();
    return asset.toObject() as AssetDoc;
  }

  /**
   * Get all tokenized assets, or filter by type
   */
  async getAssetsByType(assetType: string): Promise<AssetDoc[]> {
    if (!Object.values(ASSET_TYPES).includes(assetType as AssetType)) {
      return await AssetModel.find({ status: 'tokenized' })
        .sort({ createdAt: -1 })
        .lean<AssetDoc[]>();
    }

    return await AssetModel.find({
      assetType,
      status: 'tokenized',
    })
      .sort({ createdAt: -1 })
      .lean<AssetDoc[]>();
  }

  /**
   * Get a single asset by ID (populated)
   */
  async getAssetById(id: string): Promise<AssetDoc | null> {
    const asset = await AssetModel.findById(id)
      .populate({
        path: 'originatorId',
        select: 'businessName logoUrl description',
        model: 'Business',
      })
      .populate({
        path: 'corporateId',
        select: 'name logoUrl description',
        model: 'Corporate',
      })
      .lean<AssetDoc>();

    return asset || null;
  }

  async getAssetsByStatus(
    verified: boolean,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: AssetDoc[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const queryStatus = verified ? 'tokenized' : 'pending';

    const query = { status: queryStatus };
    console.log({ queryStatus });
    const [items, total] = await Promise.all([
      AssetModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<AssetDoc[]>(),
      AssetModel.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Get all verified assets
   */
  async getVerifiedAssets(): Promise<AssetDoc[]> {
    return await AssetModel.find({ status: 'verified' })
      .sort({ createdAt: -1 })
      .lean<AssetDoc[]>();
  }
}

export default new AssetService();
