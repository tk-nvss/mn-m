# mlbbtopup.in Service API Guide

This guide shows how to use the mlbbtopup.in Service API to add top-up services to your app. This feature is only for **Members** and **Owners**.

---

## 1. Authentication & Headers

You must authenticate every Service API request.

**Required Headers:**
```http
x-api-key: TK_your_generated_api_key_here
Content-Type: application/json
```

> **Security Note:** We get user details (email, phone, etc.) from the account linked to your API key. You do not need to send them in order requests.

---

## 2. API Endpoints

### 💰 Check Wallet Balance
Check your wallet balance and user profile.
*   **URL:** `/api/service/balance`
*   **Method:** `GET`

### 🔍 Browse Games (List)
Get a list of all games and services.
*   **URL:** `/api/service/games`
*   **Method:** `GET`

### 🎮 Get Game Details (Items & Prices)
Get items and their **member prices** for one game.
*   **URL:** `/api/service/games/{gameSlug}`
*   **Method:** `GET`
*   **Sample Response:**
    ```json
    {
      "success": true,
      "game": {
        "name": "Mobile Legends",
        "slug": "mobile-legends114",
        "items": [
          { "name": "Weekly Diamond Pass", "slug": "weekly-pass816", "price": 165 },
          { "name": "5 Diamonds", "slug": "diamonds-5", "price": 8 }
        ]
      }
    }
    ```

### 🛡️ ID & Region Check
Check Player ID/Zone ID and account region before placing an order.
*   **URL:** `/api/service/validate`
*   **Method:** `POST`
*   **Body:** `{"gameSlug": "...", "playerId": "...", "zoneId": "..."}`

### 🚀 Place Order
Place a top-up order. Funds are deducted first, then the order runs automatically.
*   **URL:** `/api/service/order`
*   **Method:** `POST`
*   **Body:** `{"gameSlug": "...", "itemSlug": "...", "playerId": "...", "zoneId": "..."}`
*   **Note:** If the order fails, the **full amount is refunded** to your wallet right away. The response will include `"status": "failed"` and `"success": false`.

---

## 3. Implementation Flow
1. **List Games**: call `/api/service/games` to find the `gameSlug`.
2. **Get Prices**: call `/api/service/games/{slug}` to get `itemSlug` and the exact price you will be charged.
3. **Verify ID**: call `/api/service/validate` to confirm the user.
4. **Order**: call `/api/service/order` to complete the transaction.
