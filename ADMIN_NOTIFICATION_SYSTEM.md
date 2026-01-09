# Admin Notification System

## Overview
Professional admin notification management system allowing administrators to create and send notifications to users.

## Features

### 1. Notification Creation & Sending
- **Location**: `/admin/notifications/create`
- **Access**: Admin dashboard → Notifications → "Send Notification" button

### 2. Send Modes
- **Broadcast**: Send to all active users
- **Selected Users**: Choose specific users from searchable list

### 3. Notification Types
- **System**: System updates and maintenance
- **Announcement**: Important announcements
- **Investment**: Investment-related updates
- **Profit**: Profit distribution notices
- **Wallet**: Wallet transactions

### 4. Priority Levels
- **Low**: Standard notifications
- **Normal**: Regular priority
- **High**: Important notices
- **Urgent**: Critical alerts

### 5. Quick Templates
Pre-built templates for common notifications:
1. System Maintenance
2. New Feature Announcement
3. Profit Distribution
4. Investment Opportunity
5. Security Alert

### 6. User Selection Features
- Search users by name or email
- Select all / Clear selection
- View user status (Active/Inactive)
- Shows number of selected users
- Avatar display with user initials

### 7. Preview & Send
- Preview notification before sending
- Shows recipient count
- Confirms successful delivery
- Automatic form reset after sending

## Technical Implementation

### Frontend Components
**Pages:**
- `/admin/notifications/page.tsx` - Notifications list
- `/admin/notifications/create/page.tsx` - Create & send interface

**Services:**
- `notification.service.ts`:
  - `broadcastNotification()` - Send to all users
  - `sendToUsers()` - Send to specific users
  - `getStatistics()` - Get notification stats
  
- `user.service.ts`:
  - `getAllUsers()` - Fetch users for selection

### Backend APIs
**Endpoints:**
- `POST /v1/admin/notifications/broadcast` - Broadcast to all
- `POST /v1/admin/notifications/send` - Send to specific users
- `GET /v1/admin/notifications/statistics` - Get statistics

**Controller:**
- `NotificationController.php`:
  - `broadcast(Request $request)` - Line 222
  - `sendToUsers(Request $request)` - Line 263
  - `statistics()` - Admin notification stats

### Routes
**Admin Routes** (`api/routes/api.php`):
```php
Route::prefix('notifications')->group(function () {
    Route::post('/broadcast', [NotificationController::class, 'broadcast']);
    Route::post('/send', [NotificationController::class, 'sendToUsers']);
    Route::get('/statistics', [NotificationController::class, 'statistics']);
});
```

## How to Use

### Broadcast Notification
1. Navigate to `/admin/notifications`
2. Click "Send Notification" button
3. Fill in Title and Message
4. Select Type and Priority
5. Keep "Broadcast to All" mode selected
6. Click "Preview" to review
7. Click "Send Notification"

### Send to Specific Users
1. Navigate to `/admin/notifications/create`
2. Select "Selected Users" tab
3. Click "Select Users" button
4. Search and select users
5. Fill in notification details
6. Use template if needed
7. Preview and send

### Using Templates
1. Click any template card in the "Quick Templates" section
2. Template title, message, type, and priority will auto-fill
3. Modify as needed
4. Preview and send

## Validation
- Title: Required (max 255 characters)
- Message: Required (max 1000 characters)
- Type: Required (one of 5 types)
- Priority: Required (one of 4 levels)
- Users: At least 1 user required for "Selected" mode

## Success Messages
- "Notification sent successfully to X user(s)!"
- Auto-dismisses after 5 seconds
- Form automatically resets

## Error Handling
- API errors displayed in alert banner
- Form validation prevents empty submissions
- Network error handling
- Loading states during send operations

## Statistics Display
- Total users count
- Active users count
- Displays in broadcast mode header

## Status
✅ All TypeScript errors resolved
✅ Backend routes configured
✅ Frontend-backend integration complete
✅ User selection with search working
✅ Templates functional
✅ Preview system operational
✅ Send functionality ready

## Notes
- Only admin users can access this feature
- Inactive users can be selected but may not receive notifications
- Notifications appear in user's notification center
- Email notifications depend on user preferences
- All notifications are logged in the database
