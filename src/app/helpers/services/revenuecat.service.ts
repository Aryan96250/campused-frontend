// import { Injectable } from '@angular/core';
// import {
//   Purchases,
//   PurchasesConfiguration,
//   CustomerInfo,
//   StoreProduct,
// } from '@revenuecat/purchases-js';

// @Injectable({
//   providedIn: 'root'
// })
// export class RevenuecatService {
//   private isConfigured = false;

//   // Initialize RevenueCat once
//   initRevenueCat(userId: string) {
//     if (this.isConfigured) return;

//     const config: PurchasesConfiguration = {
//       apiKey: 'YOUR_PUBLIC_WEB_API_KEY', // From RevenueCat dashboard → Projects → API Keys → Public Web key
//       appUserId: userId, // Your internal user ID (can be random if unauthenticated)
//     };

//     Purchases.configure(config);
//     this.isConfigured = true;
//     console.log('RevenueCat initialized for', userId);
//   }

//   async getOfferings() {
//     try {
//       const offerings = await Purchases.getOfferings();
//       return offerings.current?.availablePackages ?? [];
//     } catch (error) {
//       console.error('Error fetching offerings:', error);
//       return [];
//     }
//   }

//   async purchaseProduct(productIdentifier: string) {
//     try {
//       const result = await Purchases.purchaseProduct(productIdentifier);
//       console.log('Purchase success:', result);
//       return result.customerInfo;
//     } catch (error) {
//       console.error('Purchase failed:', error);
//       throw error;
//     }
//   }

//   async getCustomerInfo(): Promise<CustomerInfo | null> {
//     try {
//       return await Purchases.getCustomerInfo();
//     } catch (error) {
//       console.error('Error fetching customer info:', error);
//       return null;
//     }
//   }

//   async restorePurchases() {
//     try {
//       const info = await Purchases.restoreTransactions();
//       console.log('Restored purchases:', info);
//       return info;
//     } catch (error) {
//       console.error('Error restoring purchases:', error);
//       return null;
//     }
//   }
// }
