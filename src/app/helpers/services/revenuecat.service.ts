import { Injectable } from '@angular/core';
import { Purchases } from '@revenuecat/purchases-js';

@Injectable({
  providedIn: 'root'
})
export class RevenueCatService {
  async initialize() {
    const appUserId = "your-app-user-id"; 
    const publicApiKey = "your-revenuecat-public-api-key";

    try {
      await Purchases.configure({
        apiKey: publicApiKey,
        appUserId: appUserId,
      });
      console.log('RevenueCat configured successfully');
    } catch (e) {
      console.error('Error configuring RevenueCat', e);
    }
  }
}
