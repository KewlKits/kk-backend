# kk-backend

## Overview

## Models

### Song
| Property | Type |
| -------- | ---- |

### Party
| Property | Type |
| -------- | ---- |

## Routes

| Method | Endpoint                      | Usage                        | Returns |
| ------ | ----------------------------- | ---------------------------- | ------- |
| GET    | /party                        | get all parties              | Party[] |
| POST   | /party                        | create a new party           | Party   |
| GET    | /party/{partyId}              | get a party by id            | Party   |
| DELETE | /party/{partyId}              | delete a party by id         | Party   |
| PUT    | /party/{partyId}/queue/add    | add a song to the queue      | Party   |
| PUT    | /party/{partyId}/queue/remove | remove a song from the queue | Party   |
| PUT    | /party/{partyId}/queue/move   | move a song within the queue | Party   |
| PUT    | /party/{partyId}/pool/add     | add a song to the pool       | Party   |
| PUT    | /party/{partyId}/pool/remove  | remove a song from the pool  | Party   |
