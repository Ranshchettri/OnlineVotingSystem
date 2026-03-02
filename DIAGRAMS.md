# System Diagrams (Quick Access)

Diagrams are available in two places:

1. `DIAGRAMS.md` (this file, root)
2. `docs/SYSTEM_DIAGRAMS.md` (detailed documentation)

## ER Diagram
```mermaid
erDiagram
  USER ||--o{ VOTE : casts
  ELECTION ||--o{ VOTE : receives
  PARTY ||--o{ USER : has_members
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ ACTIVITY : performs
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
  }

  ELECTION {
    ObjectId _id
    string title
    string type
    string status
    date startDate
    date endDate
    number totalVotes
  }

  VOTE {
    ObjectId _id
    ObjectId userId
    ObjectId electionId
    ObjectId partyId
    date votedAt
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

## Sequence (Vote Flow)
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
  BE->>DB: Verify session
  DB-->>BE: OK
  BE-->>FE: JWT token

  V->>FE: Cast vote
  FE->>BE: POST /votes
  BE->>DB: Insert vote + update counters
  DB-->>BE: committed
  BE->>NS: Push notifications
  NS->>DB: Save notifications
  BE-->>FE: Vote submitted success
```

