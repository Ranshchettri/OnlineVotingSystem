# Online Voting System Diagrams

This file contains Mermaid diagrams for the current backend schema and key flows.

## ER Diagram
```mermaid
erDiagram
  USER ||--o{ VOTE : casts
  ELECTION ||--o{ VOTE : receives
  PARTY ||--o{ USER : has_members
  PARTY ||--o{ ELECTION : participates_in
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ ACTIVITY : performs
  USER ||--o{ AUDITLOG : generates
  PARTY ||--o{ ANALYTICS : has_metrics

  USER {
    ObjectId _id
    string fullName
    string email
    string role
    string voterId
    ObjectId partyId
    boolean hasVoted
    ObjectId votedElectionId
    boolean isVerified
    date createdAt
  }

  PARTY {
    ObjectId _id
    string name
    string logo
    string leader
    string status
    boolean isActive
    number currentVotes
    number development
    number goodWork
    number badWork
    date createdAt
  }

  ELECTION {
    ObjectId _id
    string title
    string type
    string status
    date startDate
    date endDate
    boolean isActive
    boolean allowVoting
    number totalVotes
    number turnout
    boolean isEnded
  }

  VOTE {
    ObjectId _id
    ObjectId userId
    ObjectId electionId
    ObjectId partyId
    boolean faceVerified
    boolean otpVerified
    date votedAt
  }

  NOTIFICATION {
    ObjectId _id
    ObjectId userId
    string type
    string title
    string message
    boolean isRead
    date createdAt
  }

  ACTIVITY {
    ObjectId _id
    string action
    string message
    ObjectId userId
    string role
    date createdAt
  }

  AUDITLOG {
    ObjectId _id
    string action
    string user
    string role
    string details
    date timestamp
  }

  ANALYTICS {
    ObjectId _id
    ObjectId partyId
    number development
    number goodWork
    number badWork
    date createdAt
  }
```

## DFD (Level 0)
```mermaid
flowchart LR
  V[Voter] --> SYS[Online Voting System]
  P[Party] --> SYS
  A[Admin] --> SYS
  SYS --> DB[(MongoDB)]
  DB --> SYS
  SYS --> N[Notification Service]
  N --> V
  N --> P
  N --> A
```

## DFD (Level 1)
```mermaid
flowchart LR
  V[Voter] --> P1[1. Authentication]
  P[Party] --> P1
  A[Admin] --> P1
  P1 <--> D1[(Users)]

  V --> P2[2. Vote Casting]
  P2 <--> D2[(Votes)]
  P2 <--> D3[(Elections)]
  P2 <--> D4[(Parties)]

  A --> P3[3. Election Management]
  P3 <--> D3
  P3 <--> D4

  A --> P4[4. Analytics & Monitoring]
  P4 <--> D5[(Analytics)]
  P4 <--> D6[(Activities/AuditLogs)]

  P3 --> P5[5. Notification Engine]
  P4 --> P5
  P5 <--> D7[(Notifications)]
  P5 --> V
  P5 --> P
  P5 --> A
```

## Sequence Diagram (Voter Vote Flow)
```mermaid
sequenceDiagram
  actor V as Voter
  participant FE as Frontend
  participant BE as Backend API
  participant DB as MongoDB
  participant NS as Notification Service

  V->>FE: Login (email + voterId)
  FE->>BE: POST /auth/voter/login
  BE->>DB: Validate voter
  DB-->>BE: voter record
  BE-->>FE: OTP + login step

  V->>FE: Face verify + OTP submit
  FE->>BE: POST /auth/voter/verify-otp
  BE->>DB: Mark session verified
  DB-->>BE: OK
  BE-->>FE: JWT token

  V->>FE: Cast vote
  FE->>BE: POST /votes
  BE->>DB: Insert Vote + Update Election/Party counters
  DB-->>BE: committed
  BE->>NS: Queue notifications
  NS->>DB: Save notification documents
  BE-->>FE: Vote submitted success
```
