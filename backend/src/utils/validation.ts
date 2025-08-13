import Joi from "joi";

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    businessName: Joi.string().min(2).max(100).required(),
    businessType: Joi.string()
      .valid("retail", "restaurant", "ecommerce", "services", "other")
      .required(), // TODO: Add more business types
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const paymentSchemas = {
  create: Joi.object({
    amount: Joi.string()
      .pattern(/^\d+(\.\d{1,6})?$/)
      .required(),
    currency: Joi.string().valid("USDC").required(),
    merchantReference: Joi.string().max(100).optional(),
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid("pending", "confirming", "completed", "failed", "expired")
      .required(),
    transactionHash: Joi.string()
      .pattern(/^0x[a-fA-F0-9]{64}$/)
      .optional(),
  }),
};

export const merchantSchemas = {
  updateProfile: Joi.object({
    businessName: Joi.string().min(2).max(100).optional(),
    businessType: Joi.string()
      .valid("retail", "restaurant", "ecommerce", "services", "other")
      .optional(),
    walletAddress: Joi.string()
      .pattern(/^0x[a-fA-F0-9]{40}$/)
      .optional(),
    settlementAddress: Joi.string()
      .pattern(/^0x[a-fA-F0-9]{40}$/)
      .optional(),
    webhookUrl: Joi.string().uri().optional(),
  }),

  webhookSettings: Joi.object({
    webhookUrl: Joi.string().uri().required(),
  }),
};
