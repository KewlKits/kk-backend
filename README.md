# kk-backend

## Overview

## Models

### Song
| Property      | Type     |
| ------------- | -------- |
| id            | ObjectId |
| uri           | String   |
| title         | String   |
| artist        | String   |
| album         | String   |
| albumArtURL   | String   |
| createdAt     | Date     |

### Party
| Property   | Type     |
| ---------- | -------- |
| id         | ObjectId |
| name       | String   |
| location   | Number[] |
| pool       | Song[]   |
| queue      | Song[]   |
| createdAt  | Date     |


## Routes
| Method | Endpoint                      | Usage                        | Returns |
| ------ | ----------------------------- | ---------------------------- | ------- |
| GET    | /party                        | get all parties              | Party[] |
| POST   | /party                        | create a new party           | Party   |
| GET    | /party/{partyId}              | get a party by id            | Party   |
| DELETE | /party/{partyId}              | delete a party by id         | Party   |
| PUT    | /party/{partyId}/pool/add     | add a song to the pool       | Party   |
| PUT    | /party/{partyId}/pool/remove  | remove a song from the pool  | Party   |
| PUT    | /party/{partyId}/queue/add    | add a song to the queue      | Party   |
| PUT    | /party/{partyId}/queue/remove | remove a song from the queue | Party   |
| PUT    | /party/{partyId}/queue/move   | move a song within the queue | Party   |

### Get All Parties
#### Endpoint
GET /party

#### Header Fields
None

### Create a Party
#### Endpoint
POST /party

#### Header Fields
| Header Field | Value                                     |
| ------------ | ----------------------------------------- |
| name         | name of party                             |
| longitude    | longitudinal component of GPS coordinates |
| latitude     | latitudinal component of GPS coordinates  |

### Get a Party
#### Endpoint
GET /party/{partyId}

#### Header Fields
None

### Delete a Party
#### Endpoint
DELETE /party/{partyId}

#### Header Fields
None

### Add to Pool
#### Endpoint
PUT /party/{partyId}/pool/add

#### Header Fields
| Header Field  | Value                     |
| ------------- | ------------------------- |
| uri           | Spotify URI               |
| title         | track title               |
| artist        | track artist              |
| album         | track album               |
| albumArtURL   | Spotify URL for album art |

### Remove from Pool
#### Endpoint
PUT /party/{partyId}/pool/remove

#### Header Fields
| Header Field | Value             |
| ------------ | ----------------- |
| song_id      | id of song object |
