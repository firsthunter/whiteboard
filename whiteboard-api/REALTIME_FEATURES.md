# Real-Time Features Documentation

## Overview
This document describes the real-time WebSocket implementation for messaging and notifications in the Whiteboard Learning Platform.

## Features Implemented

### 1. Real-Time Messaging System
- **WebSocket Gateway**: `messages.gateway.ts`
- **Namespace**: `/messages`
- **Events**:
  - `register`: Register user to receive messages
  - `sendMessage`: Send a message to another user
  - `typing`: Send typing indicator
  - `markAsRead`: Mark message as read
  - `messageSent`: Emitted when message is sent
  - `messageReceived`: Emitted when message is received
  - `userTyping`: Emitted when user is typing
  - `messageRead`: Emitted when message is read

### 2. Real-Time Notification System
- **WebSocket Gateway**: `notifications.gateway.ts`
- **Namespace**: `/notifications`
- **Events**:
  - `register`: Register user to receive notifications
  - `notification`: Broadcast notification to user

### 3. Notification Types
The system supports the following notification types:
- `MESSAGE` - New message received
- `ASSIGNMENT_CREATED` - New assignment created
- `ASSIGNMENT_UPDATED` - Assignment updated
- `ASSIGNMENT_DUE_SOON` - Assignment due soon reminder
- `SUBMISSION_RECEIVED` - Student submitted assignment (for teachers)
- `SUBMISSION_GRADED` - Assignment graded (for students)
- `ANNOUNCEMENT` - New announcement posted
- `COURSE_UPDATE` - Course information updated
- `ENROLLMENT` - Enrolled in a new course
- `EVENT_REMINDER` - Calendar event reminder
- `GENERAL` - General notifications

## Integration Points

### Teacher Scenarios

#### 1. Creating an Assignment
**Trigger**: Teacher creates a new assignment
**Action**: All enrolled students receive a notification
**Notification Type**: `ASSIGNMENT_CREATED`
**Data**:
```json
{
  "assignmentId": "uuid",
  "courseTitle": "Course Name",
  "dueDate": "2024-12-31T23:59:59Z"
}
```

#### 2. Receiving Student Submissions
**Trigger**: Student submits an assignment
**Action**: Teacher receives a notification
**Notification Type**: `SUBMISSION_RECEIVED`
**Data**:
```json
{
  "submissionId": "uuid",
  "studentName": "John Doe",
  "assignmentTitle": "Assignment 1"
}
```

#### 3. Posting Announcements
**Trigger**: Teacher creates an announcement
**Action**: All enrolled students receive a notification
**Notification Type**: `ANNOUNCEMENT`
**Data**:
```json
{
  "announcementId": "uuid",
  "courseTitle": "Course Name"
}
```

#### 4. Receiving Messages
**Trigger**: Student sends a message to teacher
**Action**: Teacher receives real-time message and notification
**Notification Type**: `MESSAGE`
**WebSocket Event**: `messageReceived`

### Student Scenarios

#### 1. New Assignment Notification
**Trigger**: Teacher creates an assignment
**Action**: Student receives notification with assignment details
**Notification Type**: `ASSIGNMENT_CREATED`

#### 2. Graded Assignment Notification
**Trigger**: Teacher grades a submission
**Action**: Student receives notification with grade
**Notification Type**: `SUBMISSION_GRADED`
**Data**:
```json
{
  "submissionId": "uuid",
  "assignmentTitle": "Assignment 1",
  "grade": 95
}
```

#### 3. New Announcement Notification
**Trigger**: Teacher posts an announcement
**Action**: Student receives notification
**Notification Type**: `ANNOUNCEMENT`

#### 4. Receiving Messages
**Trigger**: Teacher or another student sends a message
**Action**: Student receives real-time message and notification
**Notification Type**: `MESSAGE`
**WebSocket Event**: `messageReceived`

## API Endpoints

### Notifications API
Base URL: `/api/notifications`

#### Get All Notifications
```
GET /notifications?page=1&limit=20
```
**Response**:
```json
{
  "notifications": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "unreadCount": 15
}
```

#### Get Unread Notifications
```
GET /notifications/unread
```

#### Get Unread Count
```
GET /notifications/unread/count
```

#### Mark as Read
```
PATCH /notifications/:id/read
```

#### Mark All as Read
```
PATCH /notifications/read-all
```

#### Delete Notification
```
DELETE /notifications/:id
```

#### Delete All Notifications
```
DELETE /notifications
```

### Messages API
Base URL: `/api/messages`

All existing message endpoints remain the same and now emit WebSocket events.

## WebSocket Connection

### Authentication
WebSocket connections require JWT authentication. Include the token in:
1. **Authorization header**: `Bearer <token>`
2. **Auth object**: `{ auth: { token: '<token>' } }`
3. **Query parameter**: `?token=<token>`

### Connection Examples

#### JavaScript/TypeScript Client
```typescript
import { io } from 'socket.io-client';

// Connect to notifications
const notificationSocket = io('http://localhost:3000/notifications', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Register for notifications
notificationSocket.emit('register', { userId: 'user-id' });

// Listen for notifications
notificationSocket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // Display notification to user
});

// Connect to messages
const messageSocket = io('http://localhost:3000/messages', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Register for messages
messageSocket.emit('register', { userId: 'user-id' });

// Send message
messageSocket.emit('sendMessage', {
  senderId: 'sender-id',
  receiverId: 'receiver-id',
  content: 'Hello!'
});

// Receive messages
messageSocket.on('messageReceived', (message) => {
  console.log('New message:', message);
});

// Typing indicator
messageSocket.emit('typing', {
  senderId: 'sender-id',
  receiverId: 'receiver-id',
  isTyping: true
});

// Listen for typing
messageSocket.on('userTyping', ({ userId, isTyping }) => {
  console.log(`User ${userId} is ${isTyping ? 'typing' : 'stopped typing'}`);
});
```

## Database Schema

### Notification Model
```prisma
model Notification {
  id        String           @id @default(uuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String           @db.Text
  data      Json?
  isRead    Boolean          @default(false)
  readAt    DateTime?
  createdAt DateTime         @default(now())

  @@index([userId, isRead])
  @@map("notifications")
}

enum NotificationType {
  MESSAGE
  ASSIGNMENT_CREATED
  ASSIGNMENT_UPDATED
  ASSIGNMENT_DUE_SOON
  SUBMISSION_RECEIVED
  SUBMISSION_GRADED
  ANNOUNCEMENT
  COURSE_UPDATE
  ENROLLMENT
  EVENT_REMINDER
  GENERAL
}
```

## Testing the Implementation

### Test WebSocket Connection
1. Start the backend server:
```bash
cd whiteboard-api
npm run start:dev
```

2. Use a WebSocket client (e.g., Postman, wscat) to connect:
```bash
wscat -c ws://localhost:3000/notifications -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. Send register event:
```json
{"event": "register", "data": {"userId": "your-user-id"}}
```

### Test Notifications Flow

#### As Teacher:
1. Login as teacher
2. Create a new assignment
3. Check that all students receive notifications
4. When students submit, verify teacher receives notification
5. Grade a submission and verify student receives notification

#### As Student:
1. Login as student
2. Verify you receive notification when teacher creates assignment
3. Submit assignment
4. Verify you receive notification when graded
5. Check notification when teacher posts announcement

### Test Real-Time Messaging
1. Open two browser tabs with different users
2. Send message from one user
3. Verify other user receives message instantly
4. Test typing indicators
5. Test read receipts

## Performance Considerations

1. **Connection Management**: WebSocket connections are stored in memory. For production with multiple servers, use Redis adapter:
```typescript
import { RedisIoAdapter } from '@nestjs/platform-socket.io';
```

2. **Notification Batching**: When creating notifications for many users (e.g., entire class), use `createMany` to batch database operations.

3. **Connection Limits**: Monitor active WebSocket connections and implement connection pooling if needed.

## Security

1. **Authentication**: All WebSocket connections require JWT authentication
2. **Authorization**: Users can only receive notifications/messages intended for them
3. **Rate Limiting**: Consider implementing rate limiting for WebSocket events
4. **Input Validation**: All incoming WebSocket data is validated

## Future Enhancements

1. **Push Notifications**: Integrate with Firebase Cloud Messaging (FCM) for mobile push notifications
2. **Email Notifications**: Send email for critical notifications when user is offline
3. **Notification Preferences**: Allow users to customize which notifications they receive
4. **Message Attachments**: Support file attachments in real-time messages
5. **Group Chat**: Support group messaging for courses
6. **Voice/Video**: Integrate WebRTC for voice/video calls
7. **Read Status**: Track message delivery and read status
8. **Message Search**: Implement full-text search for messages
9. **Notification Center**: Build a comprehensive notification center UI
10. **Analytics**: Track notification delivery rates and user engagement

## Troubleshooting

### WebSocket Connection Issues
- Verify JWT token is valid
- Check CORS configuration
- Ensure server is running on correct port
- Check firewall settings

### Notifications Not Received
- Verify user is connected to WebSocket
- Check database for notification record
- Verify notification service is injected correctly
- Check console for errors

### Messages Not Delivered
- Verify both users are connected
- Check message service integration
- Verify receiver ID is correct
- Check WebSocket namespace

## Support
For issues or questions, please check the logs or contact the development team.
